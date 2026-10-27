const express = require('express');
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// ─── GET /api/notes ──────────────────────────────────────────────────────────
// Public — returns all approved notes, newest first
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT n.id, n.title, n.subject, n.content, n.author_id, n.status, n.created_at,
             u.name AS author_name
      FROM notes n
      JOIN users u ON n.author_id = u.id
      WHERE n.status = 'approved'
      ORDER BY n.created_at DESC
    `);

    return res.status(200).json({ notes: rows });
  } catch (err) {
    console.error('GET /notes error:', err);
    return res.status(500).json({ error: 'Server error fetching notes' });
  }
});

// ─── GET /api/notes/mine ────────────────────────────────────────────────────
// IMPORTANT: Must be declared BEFORE /:id to avoid "mine" being treated as an id
router.get('/mine', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, title, subject, content, author_id, status, rejection_reason, created_at, updated_at
      FROM notes
      WHERE author_id = ?
      ORDER BY created_at DESC
    `, [req.user.id]);

    return res.status(200).json({ notes: rows });
  } catch (err) {
    console.error('GET /notes/mine error:', err);
    return res.status(500).json({ error: 'Server error fetching your notes' });
  }
});

// ─── GET /api/notes/:id ─────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT n.id, n.title, n.subject, n.content, n.author_id, n.status, n.rejection_reason,
             n.created_at, n.updated_at, u.name AS author_name
      FROM notes n
      JOIN users u ON n.author_id = u.id
      WHERE n.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    return res.status(200).json({ note: rows[0] });
  } catch (err) {
    console.error('GET /notes/:id error:', err);
    return res.status(500).json({ error: 'Server error fetching note' });
  }
});

// ─── POST /api/notes ─────────────────────────────────────────────────────────
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, subject, content } = req.body;

    if (!title || !subject || !content) {
      return res.status(400).json({ error: 'Title, subject, and content are required' });
    }

    // Teachers get auto-approved, students go to pending
    const status = req.user.role === 'teacher' ? 'approved' : 'pending';

    const [result] = await db.query(
      'INSERT INTO notes (title, subject, content, author_id, status) VALUES (?, ?, ?, ?, ?)',
      [title, subject, content, req.user.id, status]
    );

    const [newNote] = await db.query(
      'SELECT id, title, subject, content, author_id, status, created_at FROM notes WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({ note: newNote[0] });
  } catch (err) {
    console.error('POST /notes error:', err);
    return res.status(500).json({ error: 'Server error creating note' });
  }
});

// ─── DELETE /api/notes/:id ───────────────────────────────────────────────────
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    // Check note exists
    const [notes] = await db.query('SELECT id, author_id FROM notes WHERE id = ?', [req.params.id]);

    if (notes.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Only the author can delete
    if (notes[0].author_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this note' });
    }

    await db.query('DELETE FROM notes WHERE id = ?', [req.params.id]);

    return res.status(200).json({ message: 'Note deleted' });
  } catch (err) {
    console.error('DELETE /notes/:id error:', err);
    return res.status(500).json({ error: 'Server error deleting note' });
  }
});

module.exports = router;
