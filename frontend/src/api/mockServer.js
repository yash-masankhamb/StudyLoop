import { INITIAL_USERS, INITIAL_NOTES, INITIAL_SETS } from './mockData';

const STORAGE_KEYS = {
  USERS: 'studyloop_mock_users',
  NOTES: 'studyloop_mock_notes',
  SETS: 'studyloop_mock_sets',
  ACTIVE_TOKEN: 'token',
};

// Initialize localStorage with seed data if not present
export function initMockStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTES)) {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(INITIAL_NOTES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETS)) {
    localStorage.setItem(STORAGE_KEYS.SETS, JSON.stringify(INITIAL_SETS));
  }
}

export function resetMockStorage() {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(INITIAL_NOTES));
  localStorage.setItem(STORAGE_KEYS.SETS, JSON.stringify(INITIAL_SETS));
}

function getStored(key) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

function setStored(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

function getCurrentUser() {
  const token = localStorage.getItem(STORAGE_KEYS.ACTIVE_TOKEN);
  if (!token) return null;

  const users = getStored(STORAGE_KEYS.USERS) || INITIAL_USERS;
  // If token is "mock-token-<id>" or matches email
  if (token.startsWith('mock-token-')) {
    const id = Number(token.replace('mock-token-', ''));
    return users.find((u) => u.id === id) || null;
  }
  return users.find((u) => u.email === token) || users[0] || null;
}

// Simulated network delay (80-150ms)
function delay(ms = 100) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function handleMockRequest(path, options = {}) {
  initMockStorage();
  await delay();

  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  const users = getStored(STORAGE_KEYS.USERS) || INITIAL_USERS;
  const notes = getStored(STORAGE_KEYS.NOTES) || INITIAL_NOTES;
  const sets = getStored(STORAGE_KEYS.SETS) || INITIAL_SETS;

  const currentUser = getCurrentUser();

  // ── 1. Auth routes ──
  if (cleanPath === '/login' && method === 'POST') {
    const { email, password } = body;
    if (!email || !password) {
      throw Object.assign(new Error('Email and password are required'), { status: 400 });
    }
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== password) {
      // For convenience during standalone demo, allow any password if user exists,
      // or if not existing, reject
      if (!user) {
        throw Object.assign(new Error('Invalid email or password. Use student@school.edu or teacher@school.edu'), { status: 401 });
      }
    }
    const token = `mock-token-${user.id}`;
    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }

  if (cleanPath === '/register' && method === 'POST') {
    const { name, email, password, role } = body;
    if (!name || !email || !password || !role) {
      throw Object.assign(new Error('All fields are required'), { status: 400 });
    }
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw Object.assign(new Error('Email already registered'), { status: 409 });
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
      role: role === 'teacher' ? 'teacher' : 'student',
      created_at: new Date().toISOString(),
    };
    users.push(newUser);
    setStored(STORAGE_KEYS.USERS, users);

    const token = `mock-token-${newUser.id}`;
    return {
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    };
  }

  if (cleanPath === '/me' && method === 'GET') {
    if (!currentUser) {
      throw Object.assign(new Error('No token provided'), { status: 401 });
    }
    return {
      user: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
      },
    };
  }

  // ── 2. Notes routes ──
  if (cleanPath === '/notes' && method === 'GET') {
    const approved = notes
      .filter((n) => n.status === 'approved')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { notes: approved };
  }

  if (cleanPath === '/notes/mine' && method === 'GET') {
    if (!currentUser) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    const mine = notes
      .filter((n) => n.author_id === currentUser.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { notes: mine };
  }

  const noteDetailMatch = cleanPath.match(/^\/notes\/(\d+)$/);
  if (noteDetailMatch && method === 'GET') {
    const noteId = Number(noteDetailMatch[1]);
    const note = notes.find((n) => n.id === noteId);
    if (!note) throw Object.assign(new Error('Note not found'), { status: 404 });
    return { note };
  }

  if (cleanPath === '/notes' && method === 'POST') {
    if (!currentUser) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    const { title, subject, content } = body;
    if (!title || !subject || !content) {
      throw Object.assign(new Error('Title, subject, and content are required'), { status: 400 });
    }
    const isTeacher = currentUser.role === 'teacher';
    const newNote = {
      id: Date.now(),
      title,
      subject,
      content,
      author_id: currentUser.id,
      author_name: currentUser.name,
      status: isTeacher ? 'approved' : 'pending',
      rejection_reason: null,
      reviewed_by: isTeacher ? currentUser.id : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    notes.unshift(newNote);
    setStored(STORAGE_KEYS.NOTES, notes);
    return { note: newNote };
  }

  if (noteDetailMatch && method === 'DELETE') {
    if (!currentUser) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    const noteId = Number(noteDetailMatch[1]);
    const noteIdx = notes.findIndex((n) => n.id === noteId);
    if (noteIdx === -1) throw Object.assign(new Error('Note not found'), { status: 404 });

    notes.splice(noteIdx, 1);
    setStored(STORAGE_KEYS.NOTES, notes);
    return { message: 'Note deleted' };
  }

  // ── 3. Sets & Cards routes ──
  if (cleanPath === '/sets' && method === 'GET') {
    const approvedSets = sets
      .filter((s) => s.status === 'approved')
      .map((s) => ({
        id: s.id,
        title: s.title,
        subject: s.subject,
        author_name: s.author_name,
        author_id: s.author_id,
        status: s.status,
        card_count: s.cards ? s.cards.length : 0,
        created_at: s.created_at,
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { sets: approvedSets };
  }

  if (cleanPath === '/sets/mine' && method === 'GET') {
    if (!currentUser) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    const mine = sets
      .filter((s) => s.author_id === currentUser.id)
      .map((s) => ({
        id: s.id,
        title: s.title,
        subject: s.subject,
        author_name: s.author_name,
        author_id: s.author_id,
        status: s.status,
        card_count: s.cards ? s.cards.length : 0,
        rejection_reason: s.rejection_reason,
        created_at: s.created_at,
      }));
    return { sets: mine };
  }

  const setDetailMatch = cleanPath.match(/^\/sets\/(\d+)$/);
  if (setDetailMatch && method === 'GET') {
    const setId = Number(setDetailMatch[1]);
    const set = sets.find((s) => s.id === setId);
    if (!set) throw Object.assign(new Error('Set not found'), { status: 404 });
    return { set };
  }

  if (cleanPath === '/sets' && method === 'POST') {
    if (!currentUser) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    const { title, subject } = body;
    if (!title || !subject) {
      throw Object.assign(new Error('Title and subject are required'), { status: 400 });
    }
    const isTeacher = currentUser.role === 'teacher';
    const newSet = {
      id: Date.now(),
      title,
      subject,
      author_id: currentUser.id,
      author_name: currentUser.name,
      status: isTeacher ? 'approved' : 'pending',
      rejection_reason: null,
      reviewed_by: isTeacher ? currentUser.id : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cards: [],
    };
    sets.unshift(newSet);
    setStored(STORAGE_KEYS.SETS, sets);
    return { set: newSet };
  }

  const addCardMatch = cleanPath.match(/^\/sets\/(\d+)\/cards$/);
  if (addCardMatch && method === 'POST') {
    if (!currentUser) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    const setId = Number(addCardMatch[1]);
    const set = sets.find((s) => s.id === setId);
    if (!set) throw Object.assign(new Error('Set not found'), { status: 404 });

    const { front, back } = body;
    const card = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      set_id: setId,
      front,
      back,
      position: set.cards ? set.cards.length : 0,
    };
    if (!set.cards) set.cards = [];
    set.cards.push(card);
    setStored(STORAGE_KEYS.SETS, sets);
    return { card };
  }

  if (setDetailMatch && method === 'DELETE') {
    if (!currentUser) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    const setId = Number(setDetailMatch[1]);
    const setIdx = sets.findIndex((s) => s.id === setId);
    if (setIdx === -1) throw Object.assign(new Error('Set not found'), { status: 404 });

    sets.splice(setIdx, 1);
    setStored(STORAGE_KEYS.SETS, sets);
    return { message: 'Set deleted' };
  }

  // ── 4. Review routes (Teacher only) ──
  if (cleanPath === '/review/pending' && method === 'GET') {
    if (!currentUser || currentUser.role !== 'teacher') {
      throw Object.assign(new Error('Forbidden: Teachers only'), { status: 403 });
    }
    const pendingNotes = notes
      .filter((n) => n.status === 'pending')
      .map((n) => ({
        id: n.id,
        title: n.title,
        subject: n.subject,
        content: n.content,
        author_name: n.author_name,
        author_id: n.author_id,
        status: n.status,
        created_at: n.created_at,
      }));

    const pendingSets = sets
      .filter((s) => s.status === 'pending')
      .map((s) => ({
        id: s.id,
        title: s.title,
        subject: s.subject,
        author_name: s.author_name,
        author_id: s.author_id,
        status: s.status,
        card_count: s.cards ? s.cards.length : 0,
        created_at: s.created_at,
      }));

    return { notes: pendingNotes, sets: pendingSets };
  }

  const reviewNoteMatch = cleanPath.match(/^\/review\/notes\/(\d+)$/);
  if (reviewNoteMatch && method === 'PATCH') {
    if (!currentUser || currentUser.role !== 'teacher') {
      throw Object.assign(new Error('Forbidden: Teachers only'), { status: 403 });
    }
    const noteId = Number(reviewNoteMatch[1]);
    const note = notes.find((n) => n.id === noteId);
    if (!note) throw Object.assign(new Error('Note not found'), { status: 404 });

    const { status, rejection_reason } = body;
    if (status !== 'approved' && status !== 'rejected') {
      throw Object.assign(new Error('Status must be approved or rejected'), { status: 400 });
    }
    if (status === 'rejected' && !rejection_reason) {
      throw Object.assign(new Error('Rejection reason is required'), { status: 400 });
    }

    note.status = status;
    note.rejection_reason = status === 'rejected' ? rejection_reason : null;
    note.reviewed_by = currentUser.id;
    setStored(STORAGE_KEYS.NOTES, notes);
    return { note };
  }

  const reviewSetMatch = cleanPath.match(/^\/review\/sets\/(\d+)$/);
  if (reviewSetMatch && method === 'PATCH') {
    if (!currentUser || currentUser.role !== 'teacher') {
      throw Object.assign(new Error('Forbidden: Teachers only'), { status: 403 });
    }
    const setId = Number(reviewSetMatch[1]);
    const set = sets.find((s) => s.id === setId);
    if (!set) throw Object.assign(new Error('Set not found'), { status: 404 });

    const { status, rejection_reason } = body;
    if (status !== 'approved' && status !== 'rejected') {
      throw Object.assign(new Error('Status must be approved or rejected'), { status: 400 });
    }
    if (status === 'rejected' && !rejection_reason) {
      throw Object.assign(new Error('Rejection reason is required'), { status: 400 });
    }

    set.status = status;
    set.rejection_reason = status === 'rejected' ? rejection_reason : null;
    set.reviewed_by = currentUser.id;
    setStored(STORAGE_KEYS.SETS, sets);
    return { set };
  }

  throw Object.assign(new Error(`Endpoint not found: ${method} ${cleanPath}`), { status: 404 });
}
