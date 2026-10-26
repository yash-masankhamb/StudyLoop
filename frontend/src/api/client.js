import { handleMockRequest, resetMockStorage, initMockStorage } from './mockServer';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// By default, standalone mock is enabled unless explicitly disabled via VITE_USE_MOCK=false
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// Initialize seed data immediately for standalone mode
initMockStorage();

export { resetMockStorage };

export function isStandaloneMode() {
  return USE_MOCK;
}

export async function apiFetch(path, options = {}) {
  // If mock mode is active, handle client-side
  if (USE_MOCK) {
    return handleMockRequest(path, options);
  }

  // Otherwise, attempt real backend request
  const token = localStorage.getItem('token');

  try {
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
      if (res.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      const err = new Error(data?.error || `Request failed (${res.status})`);
      err.status = res.status;
      throw err;
    }

    return data;
  } catch (err) {
    // If backend connection was refused (server not running), fallback to mock mode
    if (err.name === 'TypeError' || err.message?.includes('fetch')) {
      console.warn(`[StudyLoop] Backend not reachable at ${BASE}. Falling back to standalone mock mode.`);
      return handleMockRequest(path, options);
    }
    throw err;
  }
}
