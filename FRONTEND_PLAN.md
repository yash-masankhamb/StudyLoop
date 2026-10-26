# StudyLoop — Frontend Implementation Plan (Person B)

> You own **everything the user sees**. React, routing, auth UI, every page, every interaction.
> Your backend partner (Person A) owns Express, MySQL, JWT, and the API. You two share a strict contract defined in [`BACKEND_CONTRACT.md`](file:///c:/Users/HusainPc/Desktop/StudyLoop/BACKEND_CONTRACT.md).

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 18 (via Vite) |
| Routing | React Router v6 |
| HTTP | `fetch` wrapper — no Axios |
| State | React Context + `useReducer` for auth; local state everywhere else |
| Styling | Plain CSS Modules (`.module.css`) — no Tailwind, no styled-components |
| Fonts | **Urbanist** (headings/UI) + **Source Serif 4** (body/reading) from Google Fonts |
| Icons | Lucide React (tree-shakeable, consistent line style) |

---

## Design system — "Warm Study Hall"

> [!CAUTION]
> **Banned patterns** — violating these makes the app look like every other AI-generated project:
> - ❌ Purple-to-blue neon gradients, ambient soft glows, dark-mode cyber grids
> - ❌ Uniform 3-column card grids with icon + short paragraph
> - ❌ Inter, Roboto, or Poppins
> - ❌ Stock photos of smiling fake teams, generic 3D blobs, fake logo ribbons
> - ❌ Buzzword copy ("Transform your workflow with powerful, intuitive tools")

### Color tokens

```css
:root {
  /* ── Surface ── */
  --bg-primary:    #FAF7F2;   /* warm ivory page background       */
  --bg-secondary:  #F0EBE1;   /* card / sidebar background        */
  --bg-inset:      #E8E2D6;   /* input fields, code blocks        */
  --bg-dark:       #1A1A1A;   /* footer, dark sections            */

  /* ── Text ── */
  --text-primary:  #2C2C2C;   /* main body text                   */
  --text-secondary:#6B6560;   /* captions, timestamps             */
  --text-inverse:  #FAF7F2;   /* text on dark backgrounds         */

  /* ── Accent — deep forest green ── */
  --accent:        #2D6A4F;   /* buttons, links, active states    */
  --accent-hover:  #1B4332;   /* darker on hover                  */
  --accent-light:  #D8F3DC;   /* light tag backgrounds            */

  /* ── Status ── */
  --status-pending:  #E9C46A; /* amber — pending review           */
  --status-approved: #2D6A4F; /* green — approved                 */
  --status-rejected: #C1121F; /* red — rejected                   */

  /* ── Border / dividers ── */
  --border:        #D5CFC4;
  --border-focus:  #2D6A4F;

  /* ── Radius ── */
  --radius-sm:  6px;
  --radius-md:  10px;
  --radius-lg:  16px;
}
```

### Typography

```css
/* Import in index.html <head> */
/* https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,wght@0,400;0,600;1,400&family=Urbanist:wght@400;500;600;700&display=swap */

body {
  font-family: 'Source Serif 4', Georgia, serif;
  font-size: 17px;
  line-height: 1.65;
  color: var(--text-primary);
  background: var(--bg-primary);
}

h1, h2, h3, h4, button, label, nav, th {
  font-family: 'Urbanist', system-ui, sans-serif;
}
```

### Layout philosophy — no card grids

Instead of boring 3×N grids, use:
- **Stacked list rows** for Notes and My Notes (like an email inbox — full width, left-aligned, generous padding)
- **Asymmetric bento layout** for the dashboard / landing (one large featured card + smaller side cards)
- **Single-column focus** for detail pages and forms (max-width 640px, centered)

---

## Folder structure

```
frontend/
├── index.html
├── vite.config.js
├── public/
├── src/
│   ├── main.jsx                  # mount point
│   ├── App.jsx                   # Router + layout shell
│   ├── api/
│   │   └── client.js             # fetch wrapper (base URL, token injection)
│   ├── context/
│   │   └── AuthContext.jsx        # auth provider: login, logout, user, token
│   ├── hooks/
│   │   ├── useAuth.js            # shortcut to AuthContext
│   │   └── useApi.js             # generic fetcher hook (loading, error, data)
│   ├── components/
│   │   ├── Layout.jsx            # top nav + <Outlet />
│   │   ├── Nav.jsx               # role-aware navigation
│   │   ├── ProtectedRoute.jsx    # redirect to /login if no token
│   │   ├── StatusBadge.jsx       # pending / approved / rejected pill
│   │   ├── EmptyState.jsx        # friendly empty-state illustration (SVG, not stock)
│   │   ├── LoadingSpinner.jsx    # simple CSS spinner
│   │   └── ErrorBanner.jsx       # dismissible error bar
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── NotesList.jsx         # GET /api/notes (approved only for students)
│   │   ├── NoteDetail.jsx        # GET /api/notes/:id
│   │   ├── CreateNote.jsx        # POST /api/notes
│   │   ├── MyNotes.jsx           # GET /api/notes/mine
│   │   ├── SetsList.jsx          # GET /api/sets
│   │   ├── SetDetail.jsx         # GET /api/sets/:id  (card flip UI)
│   │   ├── CreateSet.jsx         # POST /api/sets + POST /api/sets/:id/cards
│   │   ├── ReviewDashboard.jsx   # GET /api/review/pending (teacher only)
│   │   └── NotFound.jsx
│   └── styles/
│       ├── global.css            # CSS custom properties, resets, typography
│       ├── Layout.module.css
│       ├── Nav.module.css
│       ├── Login.module.css
│       ├── Register.module.css
│       ├── NotesList.module.css
│       ├── NoteDetail.module.css
│       ├── CreateNote.module.css
│       ├── MyNotes.module.css
│       ├── SetsList.module.css
│       ├── SetDetail.module.css
│       ├── CreateSet.module.css
│       ├── ReviewDashboard.module.css
│       ├── StatusBadge.module.css
│       └── ErrorBanner.module.css
```

---

## Day-by-day breakdown

### Day 1 — Scaffold, routing, local stub

**Goal:** A running Vite app with working routes that show placeholder text on every page.

| # | Task | File(s) | Details |
|---|---|---|---|
| 1 | Add Google Fonts link to `index.html` `<head>` | `index.html` | Urbanist 400–700 + Source Serif 4 400, 600, italic |
| 2 | Install deps: `react-router-dom`, `lucide-react` | terminal | `npm i react-router-dom lucide-react` |
| 3 | Write global CSS reset + custom properties | `styles/global.css` | All `:root` tokens from design system above, box-sizing reset, body font |
| 4 | Create `App.jsx` with `BrowserRouter` and all routes | `App.jsx` | Routes: `/login`, `/register`, `/notes`, `/notes/:id`, `/notes/new`, `/my-notes`, `/sets`, `/sets/:id`, `/sets/new`, `/review` |
| 5 | Create stub pages — each just renders `<h1>Page Name</h1>` | `pages/*.jsx` | Login, Register, NotesList, NoteDetail, CreateNote, MyNotes, SetsList, SetDetail, CreateSet, ReviewDashboard, NotFound |
| 6 | Create `Layout.jsx` with a placeholder nav and `<Outlet/>` | `components/Layout.jsx` | Wrap all routes except login/register in this layout |
| 7 | Run local dev server | terminal | Run `npm run dev` and verify routes work on `http://localhost:5173` |
| 8 | **Together with Person A:** agree on JSON shapes, paste API table into README | `README.md` | Use the contract from `BACKEND_CONTRACT.md` |

**Commit message:** `feat: scaffold frontend with routes and design tokens`

---

### Day 2 — Auth (login, register, protected routes)

**Goal:** A user can register, log in, and see role-appropriate navigation. Unauthenticated users are bounced to `/login`.

| # | Task | File(s) | Details |
|---|---|---|---|
| 1 | Build `api/client.js` fetch wrapper | `api/client.js` | `baseURL` from env var `VITE_API_URL`, auto-attach `Authorization: Bearer <token>`, parse JSON, throw on non-2xx |
| 2 | Build `AuthContext.jsx` | `context/AuthContext.jsx` | State: `{ user, token, loading }`. On mount, check `localStorage` for token, call `GET /api/me` to hydrate user. Expose `login(email, password)`, `register(name, email, password, role)`, `logout()` |
| 3 | Build `ProtectedRoute.jsx` | `components/ProtectedRoute.jsx` | If `!user && !loading` → redirect to `/login`. Optional `allowedRoles` prop. |
| 4 | Build `Nav.jsx` | `components/Nav.jsx` | Links: **Always:** Notes, Sets. **If logged in:** My Notes, Create Note, Create Set. **If teacher:** Review. **Right side:** user name + Logout button, or Login/Register links. |
| 5 | Build `Login.jsx` page | `pages/Login.jsx` | Form: email + password. On submit → `login()`. Show error from API. Link to register. **No gradient hero.** Clean centered single-column form with the ivory background. |
| 6 | Build `Register.jsx` page | `pages/Register.jsx` | Form: name, email, password, role (radio: student / teacher). On submit → `register()`. Show error. Link to login. |
| 7 | Wire up protected routes in `App.jsx` | `App.jsx` | Wrap `/notes/new`, `/my-notes`, `/sets/new`, `/review` in `ProtectedRoute`. `/review` gets `allowedRoles={['teacher']}`. |
| 8 | **Together:** Test end-to-end login flow | — | Register → login → see nav → refresh (token persists) → logout |

**Commit message:** `feat: auth flow — login, register, context, protected routes`

#### `api/client.js` — reference implementation

```js
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }

  return data;
}
```

#### `AuthContext.jsx` — reference implementation

```jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Hydrate user from stored token on mount
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    apiFetch('/me')
      .then(data => setUser(data.user))
      .catch(() => { localStorage.removeItem('token'); setToken(null); })
      .finally(() => setLoading(false));
  }, [token]);

  async function login(email, password) {
    const data = await apiFetch('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
  }

  async function register(name, email, password, role) {
    const data = await apiFetch('/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

---

### Day 3 — Notes pages

**Goal:** Teachers and students can create notes. Teachers see theirs auto-approved. Students see "pending" status. Everyone can browse approved notes.

| # | Task | File(s) | Details |
|---|---|---|---|
| 1 | Build `StatusBadge.jsx` | `components/StatusBadge.jsx` | Takes `status` prop → renders a pill with the matching color token. Use CSS module. |
| 2 | Build `NotesList.jsx` | `pages/NotesList.jsx` | Fetch `GET /api/notes`. Render as **stacked list rows**, not a card grid. Each row: title, author name, subject tag, created date. Click → `/notes/:id`. |
| 3 | Build `NoteDetail.jsx` | `pages/NoteDetail.jsx` | Fetch `GET /api/notes/:id`. Single-column reading layout (max-width 640px). Show title, author, date, full content, subject. |
| 4 | Build `CreateNote.jsx` | `pages/CreateNote.jsx` | Form: title (text), subject (text), content (textarea). Submit → `POST /api/notes`. On success redirect to `/my-notes`. |
| 5 | Build `MyNotes.jsx` | `pages/MyNotes.jsx` | Fetch `GET /api/notes/mine`. Same stacked-row layout as NotesList, but add `StatusBadge` for each note's status. If rejected, show rejection reason. |
| 6 | Build `EmptyState.jsx` | `components/EmptyState.jsx` | A simple inline SVG of an open book or notebook (draw it yourself or use Lucide's `BookOpen` icon at 64px). Text below: "Nothing here yet." |
| 7 | Build `LoadingSpinner.jsx` | `components/LoadingSpinner.jsx` | Pure CSS rotating ring using `--accent` color. |
| 8 | **Together:** Test both roles creating notes | — | Teacher creates → shows as approved. Student creates → shows as pending in My Notes, hidden from public list. |

**Commit message:** `feat: notes — list, detail, create, my-notes with status badges`

#### NotesList row design (not a card grid!)

```
┌─────────────────────────────────────────────────────┐
│  Intro to Photosynthesis             Science        │
│  by Ms. Rivera · Oct 24, 2026                       │
├─────────────────────────────────────────────────────┤
│  Cell Division Explained             Biology        │
│  by Mr. Patel · Oct 23, 2026                        │
└─────────────────────────────────────────────────────┘
```

Each row is full-width, left-aligned, with generous vertical padding (20px). Subject is a small colored tag on the right. Hover: subtle background shift to `--bg-secondary`.

---

### Day 4 — Flashcard sets (swap day — you're now building backend)

> [!IMPORTANT]
> On Day 4 you **swap roles**. You become the backend person for flashcard sets.
> Person A takes over your frontend to build the flashcard UI pages.
> See [`BACKEND_CONTRACT.md`](file:///c:/Users/HusainPc/Desktop/StudyLoop/BACKEND_CONTRACT.md) for the exact routes and SQL you need to build.

**Your backend tasks on Day 4:**
1. `GET /api/sets` — list all approved flashcard sets
2. `GET /api/sets/:id` — single set with its cards
3. `POST /api/sets` — create a new set (teachers: auto-approved, students: pending)
4. `POST /api/sets/:id/cards` — add a card (front/back) to a set you own
5. `GET /api/sets/mine` — your sets with status
6. SQL tables: `sets` and `cards` (see contract)

**What to tell Person A about the flashcard UI you need them to build:**
- `SetsList.jsx` — stacked rows like NotesList (not a card grid!)
- `SetDetail.jsx` — show set title, then a **card flip interaction**: one card visible at a time, click to flip front→back, arrow buttons for next/prev. Avoid carousel libraries — do it with CSS `transform: rotateY(180deg)` and `perspective`.
- `CreateSet.jsx` — form for set title + subject, then a repeatable "add card" section with front/back textareas. Submit creates the set, then POSTs each card.

---

### Day 5 — Review dashboard

**Goal:** Teachers can see all pending notes and sets, approve or reject each one with a reason.

| # | Task | File(s) | Details |
|---|---|---|---|
| 1 | Build `ReviewDashboard.jsx` | `pages/ReviewDashboard.jsx` | Fetch `GET /api/review/pending`. Two sections: "Pending Notes" and "Pending Sets". Each item shows title, author, date, content preview. |
| 2 | Approve button per item | — | Calls `PATCH /api/review/notes/:id` or `PATCH /api/review/sets/:id` with `{ "status": "approved" }`. On success, remove from list with optimistic UI. |
| 3 | Reject flow: reason input | — | Clicking "Reject" expands an inline textarea for `rejection_reason`. Submit calls PATCH with `{ "status": "rejected", "rejection_reason": "..." }`. |
| 4 | Guard the route | `App.jsx` | `ReviewDashboard` is already behind `ProtectedRoute` with `allowedRoles={['teacher']}`. Verify this works — student trying `/review` gets redirected. |
| 5 | **Together:** Test full pending → approved → rejected flow | — | Student creates note → teacher sees it in review → approves it → it appears in public list. Reject one → student sees reason in My Notes. |

**Commit message:** `feat: review dashboard — approve/reject pending content`

#### Review Dashboard layout

```
┌──────────────────────────────────────────────────────┐
│  REVIEW QUEUE                                        │
│                                                      │
│  ── Pending Notes (3) ─────────────────────────────  │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │  "Quadratic Equations"       by Aisha · Oct 25 │  │
│  │  Preview: The quadratic formula is used to...  │  │
│  │                                                │  │
│  │  [ ✓ Approve ]   [ ✗ Reject ▾ ]               │  │
│  │  ┌─ rejection reason ────────────────────────┐ │  │
│  │  │  (textarea appears on Reject click)       │ │  │
│  │  └──────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ── Pending Sets (1) ──────────────────────────────  │
│  ...                                                 │
└──────────────────────────────────────────────────────┘
```

---

### Day 6 — Error handling, polish, edit/delete

| # | Task | File(s) | Details |
|---|---|---|---|
| 1 | Build `ErrorBanner.jsx` | `components/ErrorBanner.jsx` | Dismissible banner at top of page. Red-tinted background (`--status-rejected` at 10% opacity). Shows error message text. |
| 2 | Add error + loading states to every page | all pages | Every page that fetches data should show `LoadingSpinner` while loading and `ErrorBanner` on failure. |
| 3 | Handle 401 globally | `api/client.js` | If any response is 401, clear token + redirect to `/login`. |
| 4 | Handle 403 | pages | Show a "You don't have permission" message instead of the page content. |
| 5 | Edit/delete buttons on notes and sets you own | `NoteDetail.jsx`, `SetDetail.jsx` | Owner sees Edit and Delete buttons. Delete → confirm dialog → `DELETE /api/notes/:id`. Edit → inline form or navigate to edit page. |
| 6 | Integration test with local backend | — | Make sure `VITE_API_URL` points to `http://localhost:3001/api`. Test with Person A's server. |
| 7 | **Together:** Test every feature locally with both roles | — | Run through the complete flow with a student and teacher account on localhost. |

**Commit message:** `feat: error handling, loading states, edit/delete`

---

### Day 7 — Polish, mobile, bug bash

| # | Task | File(s) | Details |
|---|---|---|---|
| 1 | Mobile responsive pass | all `.module.css` | Nav collapses to hamburger menu. Forms go full-width. List rows stack properly. |
| 2 | Final UI polish | — | Consistent spacing, hover states, focus outlines for accessibility, transitions (150ms ease). |
| 3 | README section for frontend | `README.md` | Setup steps, env vars, available scripts. |
| 4 | **Together:** Bug bash, final review, no new features | — | Each person tests the other's work locally. Fix bugs only. |

---

## Routing table

| Path | Page | Auth? | Role? |
|---|---|---|---|
| `/login` | Login | No | — |
| `/register` | Register | No | — |
| `/notes` | NotesList | No | — |
| `/notes/new` | CreateNote | Yes | — |
| `/notes/:id` | NoteDetail | No | — |
| `/my-notes` | MyNotes | Yes | — |
| `/sets` | SetsList | No | — |
| `/sets/new` | CreateSet | Yes | — |
| `/sets/:id` | SetDetail | No | — |
| `/review` | ReviewDashboard | Yes | teacher |
| `*` | NotFound | No | — |

---

## Environment variables

Create `frontend/.env` (gitignored):

```
VITE_API_URL=http://localhost:3001/api
VITE_USE_MOCK=false
```

---

## Key conventions

1. **Every API call** goes through `apiFetch()` — never raw `fetch`.
2. **CSS Modules** for all component styles — no global class names except in `global.css`.
3. **No `useEffect` for form submission** — use event handlers. `useEffect` only for data fetching on mount / param change.
4. **Errors are strings** — store in `useState`, display in `ErrorBanner`. Never swallow errors silently.
5. **Optimistic UI** only for approve/reject actions — everywhere else, wait for the server response.
