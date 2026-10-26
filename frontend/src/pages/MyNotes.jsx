import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';
import StatusBadge from '../components/StatusBadge';
import styles from '../styles/MyNotes.module.css';

export default function MyNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/notes/mine')
      .then((data) => setNotes(data.notes))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1>My Notes</h1>
      <p className={styles.subtitle}>Track the status of everything you've written.</p>

      <ErrorBanner message={error} onDismiss={() => setError('')} />

      {notes.length === 0 ? (
        <EmptyState message="You haven't created any notes yet." />
      ) : (
        <ul className={styles.list}>
          {notes.map((note) => (
            <li key={note.id}>
              <Link to={`/notes/${note.id}`} className={styles.row}>
                <div className={styles.rowMain}>
                  <span className={styles.title}>{note.title}</span>
                  <span className={styles.meta}>
                    {note.subject} · {new Date(note.created_at).toLocaleDateString()}
                  </span>
                  {note.status === 'rejected' && note.rejection_reason && (
                    <span className={styles.reason}>Reason: {note.rejection_reason}</span>
                  )}
                </div>
                <StatusBadge status={note.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
