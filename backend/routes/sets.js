const express = require('express');
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// ─── GET /api/sets ───────────────────────────────────────────────────────────
// Public — returns all approved sets with card_count and author name
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.id, s.title, s.subject, s.author_id, s.status, s.created_at,
             u.name AS author_name,
             COUNT(c.id) AS card_count
      FROM sets s
      JOIN users u ON s.author_id = u.id
      LEFT JOIN cards c ON s.id = c.set_id
      WHERE s.status = 'approved'
      GROUP BY s.id, s.title, s.subject, s.author_id, s.status, s.created_at, u.name
      ORDER BY s.created_at DESC
    `);

    return res.status(200).json({ sets: rows });
  } catch (err) {
    console.error('GET /sets error:', err);
    return res.status(500).json({ error: 'Server error fetching sets' });
  }
});

// ─── GET /api/sets/mine ─────────────────────────────────────────────────────
// IMPORTANT: Must be declared BEFORE /:id to avoid "mine" being treated as an id
router.get('/mine', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.id, s.title, s.subject, s.author_id, s.status, s.rejection_reason, s.created_at,
             COUNT(c.id) AS card_count
      FROM sets s
      LEFT JOIN cards c ON s.id = c.set_id
      WHERE s.author_id = ?
      GROUP BY s.id, s.title, s.subject, s.author_id, s.status, s.rejection_reason, s.created_at
      ORDER BY s.created_at DESC
    `, [req.user.id]);

    return res.status(200).json({ sets: rows });
  } catch (err) {
    console.error('GET /sets/mine error:', err);
    return res.status(500).json({ error: 'Server error fetching your sets' });
  }
});

// ─── GET /api/sets/:id ──────────────────────────────────────────────────────
// Returns set metadata + nested cards array
router.get('/:id', async (req, res) => {
  try {
    // Query 1: Get set info with author name
    const [setRows] = await db.query(`
      SELECT s.id, s.title, s.subject, s.author_id, s.status, s.created_at,
             u.name AS author_name
      FROM sets s
      JOIN users u ON s.author_id = u.id
      WHERE s.id = ?
    `, [req.params.id]);

    if (setRows.length === 0) {
      return res.status(404).json({ error: 'Set not found' });
    }

    // Query 2: Get all cards ordered by position
    const [cardRows] = await db.query(`
      SELECT id, set_id, front, back, position
      FROM cards
      WHERE set_id = ?
      ORDER BY position ASC
    `, [req.params.id]);

    const set = { ...setRows[0], cards: cardRows };

    return res.status(200).json({ set });
  } catch (err) {
    console.error('GET /sets/:id error:', err);
    return res.status(500).json({ error: 'Server error fetching set' });
  }
});

// ─── POST /api/sets ─────────────────────────────────────────────────────────
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, subject } = req.body;

    if (!title || !subject) {
      return res.status(400).json({ error: 'Title and subject are required' });
    }

    // Teachers get auto-approved, students go to pending
    const status = req.user.role === 'teacher' ? 'approved' : 'pending';

    const [result] = await db.query(
      'INSERT INTO sets (title, subject, author_id, status) VALUES (?, ?, ?, ?)',
      [title, subject, req.user.id, status]
    );

    const [newSet] = await db.query(
      'SELECT id, title, subject, author_id, status, created_at FROM sets WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({ set: newSet[0] });
  } catch (err) {
    console.error('POST /sets error:', err);
    return res.status(500).json({ error: 'Server error creating set' });
  }
});

// ─── POST /api/sets/:id/cards ───────────────────────────────────────────────
// Add a card to a set — author only
router.post('/:id/cards', verifyToken, async (req, res) => {
  try {
    const setId = req.params.id;

    // Verify set exists and user is the author
    const [setRows] = await db.query('SELECT id, author_id FROM sets WHERE id = ?', [setId]);

    if (setRows.length === 0) {
      return res.status(404).json({ error: 'Set not found' });
    }

    if (setRows[0].author_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to add cards to this set' });
    }

    const { front, back } = req.body;

    if (!front || !back) {
      return res.status(400).json({ error: 'Front and back are required' });
    }

    // Calculate next position
    const [posRow] = await db.query(
      'SELECT COALESCE(MAX(position), -1) + 1 AS next_pos FROM cards WHERE set_id = ?',
      [setId]
    );
    const position = posRow[0].next_pos;

    const [result] = await db.query(
      'INSERT INTO cards (set_id, front, back, position) VALUES (?, ?, ?, ?)',
      [setId, front, back, position]
    );

    return res.status(201).json({
      card: {
        id: result.insertId,
        set_id: Number(setId),
        front,
        back,
        position,
      },
    });
  } catch (err) {
    console.error('POST /sets/:id/cards error:', err);
    return res.status(500).json({ error: 'Server error adding card' });
  }
});

// ─── DELETE /api/sets/:id ───────────────────────────────────────────────────
// Author only — ON DELETE CASCADE removes all associated cards
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const [sets] = await db.query('SELECT id, author_id FROM sets WHERE id = ?', [req.params.id]);

    if (sets.length === 0) {
      return res.status(404).json({ error: 'Set not found' });
    }

    if (sets[0].author_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this set' });
    }

    await db.query('DELETE FROM sets WHERE id = ?', [req.params.id]);

    return res.status(200).json({ message: 'Set deleted' });
  } catch (err) {
    console.error('DELETE /sets/:id error:', err);
    return res.status(500).json({ error: 'Server error deleting set' });
  }
});

module.exports = router;
