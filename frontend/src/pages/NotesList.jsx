import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';
import styles from '../styles/NotesList.module.css';

export default function NotesList() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/notes')
      .then((data) => setNotes(data.notes))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1>Notes</h1>
      <p className={styles.subtitle}>Browse approved study notes from teachers and students.</p>

      <ErrorBanner message={error} onDismiss={() => setError('')} />

      {notes.length === 0 ? (
        <EmptyState message="No notes have been published yet." />
      ) : (
        <ul className={styles.list}>
          {notes.map((note) => (
            <li key={note.id}>
              <Link to={`/notes/${note.id}`} className={styles.row}>
                <div className={styles.rowMain}>
                  <span className={styles.title}>{note.title}</span>
                  <span className={styles.meta}>
                    by {note.author_name} · {new Date(note.created_at).toLocaleDateString()}
                  </span>
                </div>
                <span className={styles.subject}>{note.subject}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
