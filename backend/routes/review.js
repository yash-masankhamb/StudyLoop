const express = require('express');
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

// All review routes require teacher role
router.use(verifyToken);
router.use(requireRole('teacher'));

// ─── GET /api/review/pending ────────────────────────────────────────────────
router.get('/pending', async (req, res) => {
  try {
    // Pending Notes
    const [pendingNotes] = await db.query(`
      SELECT n.id, n.title, n.subject, n.content, n.author_id, n.status, n.created_at,
             u.name AS author_name
      FROM notes n
      JOIN users u ON n.author_id = u.id
      WHERE n.status = 'pending'
      ORDER BY n.created_at ASC
    `);

    // Pending Sets with card count
    const [pendingSets] = await db.query(`
      SELECT s.id, s.title, s.subject, s.author_id, s.status, s.created_at,
             u.name AS author_name,
             COUNT(c.id) AS card_count
      FROM sets s
      JOIN users u ON s.author_id = u.id
      LEFT JOIN cards c ON s.id = c.set_id
      WHERE s.status = 'pending'
      GROUP BY s.id, s.title, s.subject, s.author_id, s.status, s.created_at, u.name
      ORDER BY s.created_at ASC
    `);

    return res.status(200).json({
      notes: pendingNotes,
      sets: pendingSets,
    });
  } catch (err) {
    console.error('GET /review/pending error:', err);
    return res.status(500).json({ error: 'Server error fetching pending items' });
  }
});

// ─── PATCH /api/review/notes/:id ────────────────────────────────────────────
router.patch('/notes/:id', async (req, res) => {
  try {
    const { status, rejection_reason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected' });
    }

    if (status === 'rejected' && !rejection_reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    // Check note exists
    const [notes] = await db.query('SELECT id FROM notes WHERE id = ?', [req.params.id]);
    if (notes.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Update the note
    await db.query(
      'UPDATE notes SET status = ?, rejection_reason = ?, reviewed_by = ? WHERE id = ?',
      [status, status === 'rejected' ? rejection_reason : null, req.user.id, req.params.id]
    );

    return res.status(200).json({
      note: {
        id: Number(req.params.id),
        status,
        reviewed_by: req.user.id,
      },
    });
  } catch (err) {
    console.error('PATCH /review/notes/:id error:', err);
    return res.status(500).json({ error: 'Server error reviewing note' });
  }
});

// ─── PATCH /api/review/sets/:id ─────────────────────────────────────────────
router.patch('/sets/:id', async (req, res) => {
  try {
    const { status, rejection_reason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected' });
    }

    if (status === 'rejected' && !rejection_reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    // Check set exists
    const [sets] = await db.query('SELECT id FROM sets WHERE id = ?', [req.params.id]);
    if (sets.length === 0) {
      return res.status(404).json({ error: 'Set not found' });
    }

    // Update the set
    await db.query(
      'UPDATE sets SET status = ?, rejection_reason = ?, reviewed_by = ? WHERE id = ?',
      [status, status === 'rejected' ? rejection_reason : null, req.user.id, req.params.id]
    );

    return res.status(200).json({
      set: {
        id: Number(req.params.id),
        status,
        reviewed_by: req.user.id,
        rejection_reason: status === 'rejected' ? rejection_reason : null,
      },
    });
  } catch (err) {
    console.error('PATCH /review/sets/:id error:', err);
    return res.status(500).json({ error: 'Server error reviewing set' });
  }
});

module.exports = router;
