# StudyLoop

A collaborative study platform where teachers and students share notes, create flashcard sets, and review each other's content.

## Project structure

```
StudyLoop/
├── frontend/             # React + Vite (Person B)
├── FRONTEND_PLAN.md      # Day-by-day frontend implementation plan & UI rules
├── BACKEND_CONTRACT.md   # API contract & schema — the single source of truth for Person A
└── README.md
```

## Quick start

### Frontend

```bash
cd frontend
cp .env.example .env       # set VITE_API_URL
npm install
npm run dev                 # runs on http://localhost:5173
```

### Backend

```bash
cd backend
cp .env.example .env       # set DB creds, JWT_SECRET, FRONTEND_URL
npm install
node server.js             # runs on http://localhost:3001
```

## Environment variables

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3001/api` |

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `DB_HOST` | MySQL host |
| `DB_USER` | MySQL user |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | Database name (`studyloop`) |
| `DB_PORT` | MySQL port (3306) |
| `JWT_SECRET` | Secret for signing JWTs |
| `PORT` | Server port (3001) |
| `FRONTEND_URL` | Frontend origin for CORS |

## API reference

See [`BACKEND_CONTRACT.md`](BACKEND_CONTRACT.md) for the complete API specification including:
- All endpoints, request/response shapes, and status codes
- Database schema (SQL)
- Middleware reference
- Business rules

## Design system

- **Fonts:** Urbanist (headings/UI) + Source Serif 4 (body)
- **Colors:** Warm ivory backgrounds, deep forest green accent (`#2D6A4F`)
- **Layout:** Stacked list rows (not card grids), single-column detail pages
- See `frontend/src/styles/global.css` for all design tokens
