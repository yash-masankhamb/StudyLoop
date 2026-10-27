require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

// ─── Middlewares ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

// ─── Route Mounts ────────────────────────────────────────────────────────────
app.use('/api', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/sets', require('./routes/sets'));
app.use('/api/review', require('./routes/review'));

// ─── 404 handler for API routes ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` });
});

// ─── Start server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`StudyLoop backend listening on http://localhost:${PORT}`);
});
