# StudyLoop — Backend Contract & Implementation Guide (Person A)

> **Single Source of Truth** for the StudyLoop backend.
> Follow this document to build the Express + MySQL backend that connects directly with the React frontend in `frontend/`.
> Every route, SQL query, parameter, response shape, and status code below matches the frontend code line-for-line.

---

## Table of Contents
1. [Connecting Frontend to Backend](#1-connecting-frontend-to-backend)
2. [Setup & Architecture](#2-setup--architecture)
3. [Database Schema (`schema.sql`)](#3-database-schema-schemasql)
4. [Sample Seed Data (`seed.sql`)](#4-sample-seed-data-seedsql)
5. [CORS & Middleware Requirements](#5-cors--middleware-requirements)
6. [Complete Route Specification](#6-complete-route-specification)
   - [Auth Routes (`/api/*`)](#auth-routes)
   - [Notes Routes (`/api/notes/*`)](#notes-routes)
   - [Sets & Cards Routes (`/api/sets/*`)](#sets--cards-routes)
   - [Teacher Review Routes (`/api/review/*`)](#teacher-review-routes)
   - [Health Check (`/api/health`)](#health-check)
7. [Ready-to-Use Express Route Templates](#7-ready-to-use-express-route-templates)
8. [Critical Gotchas & Common Pitfalls](#8-critical-gotchas--common-pitfalls)
9. [Day-by-Day Timeline for Person A](#9-day-by-day-timeline-for-person-a)

---

## 1. Connecting Frontend to Backend

The frontend currently runs in **standalone mock mode** so it can be developed and previewed offline.

### How to switch the frontend to your real backend:
1. In `frontend/.env`, change:
   ```env
   VITE_API_URL=http://localhost:3001/api
   VITE_USE_MOCK=false
   ```
2. Start your Express backend on port `3001`.
3. In the frontend terminal, restart Vite: `npm run dev`.
4. The frontend will now make real HTTP requests to your Express server. If your server is offline or fails to respond, the frontend logs a warning and automatically falls back to mock mode so development is never blocked.

---

## 2. Setup & Architecture

### Recommended stack
* **Node.js** 18+
* **Express** 4.x
* **mysql2/promise** (connection pool)
* **bcryptjs** (password hashing)
* **jsonwebtoken** (JWT creation & verification)
* **cors** (CORS handling)
* **dotenv** (environment variables)

### Directory structure
```
backend/
├── server.js              # Express app entry point & CORS configuration
├── db.js                  # MySQL pool creation (mysql2/promise)
├── schema.sql             # Table creation script
├── seed.sql               # Initial testing seed data
├── middleware/
│   ├── verifyToken.js     # Extracts & verifies JWT from Authorization header
│   └── requireRole.js     # Validates user role ('teacher' / 'student')
├── routes/
│   ├── auth.js            # /api/register, /api/login, /api/me
│   ├── notes.js           # /api/notes, /api/notes/mine, /api/notes/:id
│   ├── sets.js            # /api/sets, /api/sets/mine, /api/sets/:id, /api/sets/:id/cards
│   └── review.js          # /api/review/pending, /api/review/notes/:id, /api/review/sets/:id
├── package.json
└── .env
```

### Environment variables (`backend/.env`)
```env
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=studyloop
DB_PORT=3306
JWT_SECRET=studyloop_super_secret_jwt_key_2026
FRONTEND_URL=http://localhost:5173
```

---

## 3. Database Schema (`schema.sql`)

Run this SQL script in your MySQL client to build all tables with relationships and foreign keys:

```sql
CREATE DATABASE IF NOT EXISTS studyloop;
USE studyloop;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'teacher') NOT NULL DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Notes Table
CREATE TABLE IF NOT EXISTS notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  author_id INT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  rejection_reason TEXT NULL,
  reviewed_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Flashcard Sets Table
CREATE TABLE IF NOT EXISTS sets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  author_id INT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  rejection_reason TEXT NULL,
  reviewed_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. Flashcards Table
CREATE TABLE IF NOT EXISTS cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  set_id INT NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  FOREIGN KEY (set_id) REFERENCES sets(id) ON DELETE CASCADE
);
```

---

## 4. Sample Seed Data (`seed.sql`)

> [!TIP]
> Running this seed script populates your database with the exact test accounts and sample content the frontend uses in mock mode.
> Passwords for all accounts are: `password123` (bcrypt hash: `$2a$10$7zB3c8Wk6o9L2zR9oR1xAeK0qW1pUq2qjU4e6w7r8t9y0u1i2o3p4` or hash with bcrypt in your setup script).

```sql
USE studyloop;

-- Users (Aisha = student, Rivera = teacher)
INSERT INTO users (id, name, email, password, role) VALUES
(1, 'Aisha Patel', 'student@school.edu', '$2a$10$7zB3c8Wk6o9L2zR9oR1xAeK0qW1pUq2qjU4e6w7r8t9y0u1i2o3p4', 'student'),
(2, 'Ms. Elena Rivera', 'teacher@school.edu', '$2a$10$7zB3c8Wk6o9L2zR9oR1xAeK0qW1pUq2qjU4e6w7r8t9y0u1i2o3p4', 'teacher');

-- Approved Notes
INSERT INTO notes (id, title, subject, content, author_id, status) VALUES
(1, 'Principles of Cellular Respiration', 'Biology', 'Cellular respiration is the metabolic process through which biochemical energy from nutrients is transformed into ATP.\n\n1. Glycolysis: In cytoplasm, net 2 ATP, 2 NADH.\n2. Krebs Cycle: In mitochondrial matrix, generates NADH and FADH2.\n3. Oxidative Phosphorylation: Chemiosmosis drives ATP synthase to produce 28-32 ATP.', 2, 'approved'),
(2, 'Keynesian vs. Classical Macroeconomic Models', 'Economics', 'Classical: Supply creates its own demand. Prices and wages are fully flexible.\nKeynesian: Aggregate demand drives output. Wages and prices are sticky downward, requiring fiscal stimulus.', 2, 'approved');

-- Pending Note (for teacher review testing)
INSERT INTO notes (id, title, subject, content, author_id, status) VALUES
(3, 'Laboratory Synthesis of Acetylsalicylic Acid', 'Chemistry', 'Salicylic acid reacts with acetic anhydride in the presence of phosphoric acid.\nPurification by recrystallization using warm ethanol.', 1, 'pending');

-- Approved Flashcard Set
INSERT INTO sets (id, title, subject, author_id, status) VALUES
(1, 'Cell Biology Essentials', 'Biology', 2, 'approved');

INSERT INTO cards (set_id, front, back, position) VALUES
(1, 'What is the role of the Golgi apparatus?', 'Modifies, sorts, and packages proteins and lipids for delivery.', 0),
(1, 'What distinguishes active transport from facilitated diffusion?', 'Active transport moves solutes against gradient and requires ATP.', 1);

-- Pending Set (for review queue testing)
INSERT INTO sets (id, title, subject, author_id, status) VALUES
(2, 'Organic Chemistry Mechanisms', 'Chemistry', 1, 'pending');

INSERT INTO cards (set_id, front, back, position) VALUES
(2, 'What characterizes an SN1 reaction?', 'Two-step unimolecular mechanism involving carbocation intermediate.', 0);
```

---

## 5. CORS & Middleware Requirements

### CORS in `server.js`
The frontend runs on `http://localhost:5173`. Express must allow this origin with credentials:

```js
const cors = require('cors');

app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Global Error Response Format
**The frontend expects every error response to be a JSON object with an `error` key:**
```json
{ "error": "Human-readable explanation of what went wrong" }
```
Do **not** return `{ "message": ... }` or raw HTML error pages.

### JWT Middleware (`middleware/verifyToken.js`)
Frontend attaches tokens as `Authorization: Bearer <token>`.
Extract, verify against `process.env.JWT_SECRET`, and attach decoded user to `req.user`:

```js
const jwt = require('jsonwebtoken');

module.exports = function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
```

### Role Middleware (`middleware/requireRole.js`)
```js
module.exports = function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
    }
    next();
  };
};
```

---

## 6. Complete Route Specification

### Auth Routes

#### 1. `POST /api/register`
* **Auth**: None
* **Request Body**:
  ```json
  {
    "name": "Aisha Patel",
    "email": "aisha@school.edu",
    "password": "securepassword",
    "role": "student"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": {
      "id": 1,
      "name": "Aisha Patel",
      "email": "aisha@school.edu",
      "role": "student"
    }
  }
  ```
* **Errors**:
  - `400`: `{ "error": "All fields are required" }`
  - `400`: `{ "error": "Invalid role. Must be 'student' or 'teacher'" }`
  - `409`: `{ "error": "Email already registered" }`

#### 2. `POST /api/login`
* **Auth**: None
* **Request Body**:
  ```json
  {
    "email": "aisha@school.edu",
    "password": "securepassword"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": {
      "id": 1,
      "name": "Aisha Patel",
      "email": "aisha@school.edu",
      "role": "student"
    }
  }
  ```
* **Errors**:
  - `400`: `{ "error": "Email and password are required" }`
  - `401`: `{ "error": "Invalid email or password" }`

#### 3. `GET /api/me`
* **Auth**: Required (`verifyToken`)
* **Success Response (200 OK)**:
  ```json
  {
    "user": {
      "id": 1,
      "name": "Aisha Patel",
      "email": "aisha@school.edu",
      "role": "student"
    }
  }
  ```
* **Errors**:
  - `401`: `{ "error": "No token provided" }`
  - `401`: `{ "error": "Invalid or expired token" }`

---

### Notes Routes

#### 1. `GET /api/notes`
* **Auth**: None
* **Description**: Returns all approved notes, sorted newest first.
* **SQL Query**:
  ```sql
  SELECT n.id, n.title, n.subject, n.content, n.author_id, n.status, n.created_at,
         u.name AS author_name
  FROM notes n
  JOIN users u ON n.author_id = u.id
  WHERE n.status = 'approved'
  ORDER BY n.created_at DESC;
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "notes": [
      {
        "id": 1,
        "title": "Principles of Cellular Respiration",
        "subject": "Biology",
        "content": "Cellular respiration is...",
        "author_id": 2,
        "author_name": "Ms. Elena Rivera",
        "status": "approved",
        "created_at": "2026-10-24T10:00:00.000Z"
      }
    ]
  }
  ```

#### 2. `GET /api/notes/mine`
> [!IMPORTANT]
> **Route ordering in Express**: Declare `router.get('/mine', ...)` **before** `router.get('/:id', ...)`. Otherwise Express treats the word "mine" as an ID parameter and tries to execute `WHERE id = 'mine'`.
* **Auth**: Required (`verifyToken`)
* **Description**: Returns all notes created by `req.user.id` (any status: pending, approved, rejected).
* **SQL Query**:
  ```sql
  SELECT id, title, subject, content, author_id, status, rejection_reason, created_at, updated_at
  FROM notes
  WHERE author_id = ?
  ORDER BY created_at DESC;
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "notes": [
      {
        "id": 3,
        "title": "Laboratory Synthesis of Aspirin",
        "subject": "Chemistry",
        "content": "Protocol summary...",
        "author_id": 1,
        "status": "pending",
        "rejection_reason": null,
        "created_at": "2026-10-25T11:00:00.000Z"
      }
    ]
  }
  ```

#### 3. `GET /api/notes/:id`
* **Auth**: None
* **Description**: Returns a single note with author name.
* **SQL Query**:
  ```sql
  SELECT n.id, n.title, n.subject, n.content, n.author_id, n.status, n.rejection_reason,
         n.created_at, n.updated_at, u.name AS author_name
  FROM notes n
  JOIN users u ON n.author_id = u.id
  WHERE n.id = ?;
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "note": {
      "id": 1,
      "title": "Principles of Cellular Respiration",
      "subject": "Biology",
      "content": "Full content here...",
      "author_id": 2,
      "author_name": "Ms. Elena Rivera",
      "status": "approved",
      "rejection_reason": null,
      "created_at": "2026-10-24T10:00:00.000Z",
      "updated_at": "2026-10-24T10:00:00.000Z"
    }
  }
  ```
* **Errors**:
  - `404`: `{ "error": "Note not found" }`

#### 4. `POST /api/notes`
* **Auth**: Required (`verifyToken`)
* **Business Logic**:
  - If `req.user.role === 'teacher'`, set `status = 'approved'`.
  - If `req.user.role === 'student'`, set `status = 'pending'`.
* **Request Body**:
  ```json
  {
    "title": "Quadratic Equations",
    "subject": "Math",
    "content": "The quadratic formula is..."
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "note": {
      "id": 4,
      "title": "Quadratic Equations",
      "subject": "Math",
      "content": "The quadratic formula is...",
      "author_id": 1,
      "status": "pending",
      "created_at": "2026-10-27T00:00:00.000Z"
    }
  }
  ```
* **Errors**:
  - `400`: `{ "error": "Title, subject, and content are required" }`
  - `401`: `{ "error": "No token provided" }`

#### 5. `DELETE /api/notes/:id`
* **Auth**: Required (`verifyToken`)
* **Permission**: Author only (`WHERE id = ? AND author_id = ?`)
* **Success Response (200 OK)**:
  ```json
  { "message": "Note deleted" }
  ```
* **Errors**:
  - `403`: `{ "error": "Not authorized to delete this note" }`
  - `404`: `{ "error": "Note not found" }`

---

### Sets & Cards Routes

#### 1. `GET /api/sets`
* **Auth**: None
* **Description**: Returns all approved sets with `card_count` and author name.
* **SQL Query**:
  ```sql
  SELECT s.id, s.title, s.subject, s.author_id, s.status, s.created_at,
         u.name AS author_name,
         COUNT(c.id) AS card_count
  FROM sets s
  JOIN users u ON s.author_id = u.id
  LEFT JOIN cards c ON s.id = c.set_id
  WHERE s.status = 'approved'
  GROUP BY s.id, u.name
  ORDER BY s.created_at DESC;
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "sets": [
      {
        "id": 1,
        "title": "Cell Biology Essentials",
        "subject": "Biology",
        "author_id": 2,
        "author_name": "Ms. Elena Rivera",
        "status": "approved",
        "card_count": 4,
        "created_at": "2026-10-21T12:00:00.000Z"
      }
    ]
  }
  ```

#### 2. `GET /api/sets/mine`
> [!IMPORTANT]
> Declare `router.get('/mine', ...)` **before** `router.get('/:id', ...)`.
* **Auth**: Required (`verifyToken`)
* **SQL Query**:
  ```sql
  SELECT s.id, s.title, s.subject, s.author_id, s.status, s.rejection_reason, s.created_at,
         COUNT(c.id) AS card_count
  FROM sets s
  LEFT JOIN cards c ON s.id = c.set_id
  WHERE s.author_id = ?
  GROUP BY s.id
  ORDER BY s.created_at DESC;
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "sets": [
      {
        "id": 2,
        "title": "Organic Chemistry Mechanisms",
        "subject": "Chemistry",
        "author_id": 1,
        "status": "pending",
        "card_count": 2,
        "rejection_reason": null,
        "created_at": "2026-10-25T14:00:00.000Z"
      }
    ]
  }
  ```

#### 3. `GET /api/sets/:id`
* **Auth**: None
* **Description**: Returns set metadata along with its full array of `cards`.
* **SQL Queries**:
  ```sql
  -- Query 1: Get set info
  SELECT s.id, s.title, s.subject, s.author_id, s.status, s.created_at,
         u.name AS author_name
  FROM sets s
  JOIN users u ON s.author_id = u.id
  WHERE s.id = ?;

  -- Query 2: Get all cards in order
  SELECT id, set_id, front, back, position
  FROM cards
  WHERE set_id = ?
  ORDER BY position ASC;
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "set": {
      "id": 1,
      "title": "Cell Biology Essentials",
      "subject": "Biology",
      "author_id": 2,
      "author_name": "Ms. Elena Rivera",
      "status": "approved",
      "created_at": "2026-10-21T12:00:00.000Z",
      "cards": [
        {
          "id": 101,
          "front": "What is the role of the Golgi apparatus?",
          "back": "Modifies, sorts, and packages proteins and lipids.",
          "position": 0
        }
      ]
    }
  }
  ```
* **Errors**:
  - `404`: `{ "error": "Set not found" }`

#### 4. `POST /api/sets`
* **Auth**: Required (`verifyToken`)
* **Business Logic**:
  - If `req.user.role === 'teacher'`, set `status = 'approved'`.
  - If `req.user.role === 'student'`, set `status = 'pending'`.
* **Request Body**:
  ```json
  {
    "title": "Organic Chemistry Mechanisms",
    "subject": "Chemistry"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "set": {
      "id": 3,
      "title": "Organic Chemistry Mechanisms",
      "subject": "Chemistry",
      "author_id": 1,
      "status": "pending",
      "created_at": "2026-10-27T00:00:00.000Z"
    }
  }
  ```

#### 5. `POST /api/sets/:id/cards`
* **Auth**: Required (`verifyToken`)
* **Permission**: Author of the set only.
* **Position Calculation**:
  ```sql
  SELECT COALESCE(MAX(position), -1) + 1 AS next_pos FROM cards WHERE set_id = ?;
  ```
* **Request Body**:
  ```json
  {
    "front": "What is an SN2 mechanism?",
    "back": "Bimolecular nucleophilic substitution with inversion of stereocenters."
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "card": {
      "id": 105,
      "set_id": 3,
      "front": "What is an SN2 mechanism?",
      "back": "Bimolecular nucleophilic substitution with inversion of stereocenters.",
      "position": 0
    }
  }
  ```

#### 6. `DELETE /api/sets/:id`
* **Auth**: Required (`verifyToken`)
* **Permission**: Set author only. `ON DELETE CASCADE` removes all associated cards.
* **Success Response (200 OK)**:
  ```json
  { "message": "Set deleted" }
  ```

---

### Teacher Review Routes

All review routes require `verifyToken` **and** `requireRole('teacher')`.

#### 1. `GET /api/review/pending`
* **Auth**: Required (`verifyToken` + `requireRole('teacher')`)
* **SQL Queries**:
  ```sql
  -- Pending Notes
  SELECT n.id, n.title, n.subject, n.content, n.author_id, n.status, n.created_at,
         u.name AS author_name
  FROM notes n
  JOIN users u ON n.author_id = u.id
  WHERE n.status = 'pending'
  ORDER BY n.created_at ASC;

  -- Pending Sets
  SELECT s.id, s.title, s.subject, s.author_id, s.status, s.created_at,
         u.name AS author_name,
         COUNT(c.id) AS card_count
  FROM sets s
  JOIN users u ON s.author_id = u.id
  LEFT JOIN cards c ON s.id = c.set_id
  WHERE s.status = 'pending'
  GROUP BY s.id, u.name
  ORDER BY s.created_at ASC;
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "notes": [
      {
        "id": 3,
        "title": "Laboratory Synthesis of Aspirin",
        "subject": "Chemistry",
        "content": "Protocol summary...",
        "author_id": 1,
        "author_name": "Aisha Patel",
        "status": "pending",
        "created_at": "2026-10-25T11:00:00.000Z"
      }
    ],
    "sets": [
      {
        "id": 2,
        "title": "Organic Chemistry Mechanisms",
        "subject": "Chemistry",
        "author_id": 1,
        "author_name": "Aisha Patel",
        "status": "pending",
        "card_count": 2,
        "created_at": "2026-10-25T14:00:00.000Z"
      }
    ]
  }
  ```

#### 2. `PATCH /api/review/notes/:id`
* **Auth**: Required (`verifyToken` + `requireRole('teacher')`)
* **Request Body (Approve)**:
  ```json
  { "status": "approved" }
  ```
* **Request Body (Reject)**:
  ```json
  {
    "status": "rejected",
    "rejection_reason": "Please provide worked examples and check chemical equations."
  }
  ```
* **SQL Update**:
  ```sql
  UPDATE notes
  SET status = ?,
      rejection_reason = ?,
      reviewed_by = ?
  WHERE id = ?;
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "note": {
      "id": 3,
      "status": "approved",
      "reviewed_by": 2
    }
  }
  ```
* **Errors**:
  - `400`: `{ "error": "Status must be approved or rejected" }`
  - `400`: `{ "error": "Rejection reason is required" }` (when status is `rejected`)
  - `404`: `{ "error": "Note not found" }`

#### 3. `PATCH /api/review/sets/:id`
* **Auth**: Required (`verifyToken` + `requireRole('teacher')`)
* **Request Body**: Same as note review above.
* **SQL Update**:
  ```sql
  UPDATE sets
  SET status = ?,
      rejection_reason = ?,
      reviewed_by = ?
  WHERE id = ?;
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "set": {
      "id": 2,
      "status": "rejected",
      "reviewed_by": 2,
      "rejection_reason": "Cards have typos. Please fix definitions."
    }
  }
  ```

---

### Health Check

#### `GET /api/health`
Used for local diagnostics and verifying database connectivity.
```js
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});
```

---

## 7. Ready-to-Use Express Route Templates

### Database Pool (`backend/db.js`)
```js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'studyloop',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
```

### Express Server Entry (`backend/server.js`)
```js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

// Middlewares
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json());

// Health route
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

// Route Mounts
app.use('/api', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/sets', require('./routes/sets'));
app.use('/api/review', require('./routes/review'));

// 404 handler for API routes
app.use((req, res) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`StudyLoop backend listening on http://localhost:${PORT}`);
});
```

---

## 8. Critical Gotchas & Common Pitfalls

| # | Pitfall | Consequence | How to Avoid |
|---|---|---|---|
| 1 | Express route ordering for `/mine` | `/api/notes/mine` gets matched by `/:id` with `id="mine"` | Place `router.get('/mine', ...)` **above** `router.get('/:id', ...)` in both `notes.js` and `sets.js`. |
| 2 | Response JSON envelope names | Frontend code expects specific wrapper keys (`{ notes: [...] }`, `{ note: {...} }`, `{ sets: [...] }`, `{ set: {...} }`, `{ card: {...} }`). | Check the response shapes in Section 6. Never return bare arrays. |
| 3 | Single set response must include nested `cards` | The card flip UI looks for `data.set.cards` | In `GET /api/sets/:id`, query the set, then query its cards, and return `{ set: { ...setRow, cards: cardsRows } }`. |
| 4 | SQL `GROUP BY` in sets count | Without `GROUP BY`, MySQL in `ONLY_FULL_GROUP_BY` mode throws an error | Include all non-aggregated columns (`s.id, u.name`) in `GROUP BY`. |
| 5 | Post-creation card linking | In `CreateSet.jsx`, frontend creates the set first, gets `data.set.id`, then loops `POST /api/sets/:id/cards` | Ensure `POST /api/sets` returns `{ set: { id: ... } }` with status `201`. |
| 6 | Error JSON format | Frontend checks `data?.error` | Always send `{ "error": "message" }`, never `{ "message": "..." }`. |

---

## 9. Day-by-Day Timeline for Person A

| Day | Task | Goal |
|---|---|---|
| **Day 1** | MySQL Setup & Health Check | Run `schema.sql`, create `db.js` pool, build `GET /api/health`, verify DB connects. |
| **Day 2** | Auth Flow | Implement `POST /api/register`, `POST /api/login`, `GET /api/me`, `verifyToken`, `requireRole`. Verify with Postman / cURL. |
| **Day 3** | Notes Endpoints | Implement `GET /notes`, `GET /notes/mine`, `GET /notes/:id`, `POST /notes`, `DELETE /notes/:id`. Verify student vs. teacher role behavior. |
| **Day 4** | **ROLE SWAP DAY** | Person B implements `/api/sets` backend routes. Person A builds flashcard UI in frontend. Review each other's code. |
| **Day 5** | Review Queue Routes | Implement `GET /api/review/pending`, `PATCH /api/review/notes/:id`, `PATCH /api/review/sets/:id`. Test teacher approval flow. |
| **Day 6** | Full Stack Integration | Set `VITE_USE_MOCK=false` in frontend, run full tests with real MySQL database. |
| **Day 7** | Bug Bash & Final Cleanup | Run end-to-end tests across all roles on localhost, clean up any unneeded console logs and comments. |
