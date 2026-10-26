import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import DemoBanner from './components/DemoBanner';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import NotesList from './pages/NotesList';
import NoteDetail from './pages/NoteDetail';
import CreateNote from './pages/CreateNote';
import MyNotes from './pages/MyNotes';
import SetsList from './pages/SetsList';
import SetDetail from './pages/SetDetail';
import CreateSet from './pages/CreateSet';
import ReviewDashboard from './pages/ReviewDashboard';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public auth pages — no nav bar */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Everything else gets the Layout shell (nav + main wrapper) */}
          <Route element={<Layout />}>
            {/* Public */}
            <Route path="/" element={<Navigate to="/notes" replace />} />
            <Route path="/notes" element={<NotesList />} />
            <Route path="/notes/:id" element={<NoteDetail />} />
            <Route path="/sets" element={<SetsList />} />
            <Route path="/sets/:id" element={<SetDetail />} />

            {/* Authenticated */}
            <Route
              path="/notes/new"
              element={
                <ProtectedRoute>
                  <CreateNote />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-notes"
              element={
                <ProtectedRoute>
                  <MyNotes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sets/new"
              element={
                <ProtectedRoute>
                  <CreateSet />
                </ProtectedRoute>
              }
            />

            {/* Teacher only */}
            <Route
              path="/review"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <ReviewDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <DemoBanner />
      </AuthProvider>
    </BrowserRouter>
  );
}
