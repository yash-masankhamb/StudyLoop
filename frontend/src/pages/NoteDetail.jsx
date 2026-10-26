import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import StatusBadge from '../components/StatusBadge';
import styles from '../styles/NoteDetail.module.css';

export default function NoteDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch(`/notes/${id}`)
      .then((data) => setNote(data.note))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!window.confirm('Delete this note? This cannot be undone.')) return;
    try {
      await apiFetch(`/notes/${id}`, { method: 'DELETE' });
      navigate('/my-notes');
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} />;
  if (!note) return <ErrorBanner message="Note not found." />;

  const isAuthor = user && user.id === note.author_id;

  return (
    <article className={styles.article}>
      <Link to="/notes" className={styles.back}>← Back to notes</Link>

      <header className={styles.header}>
        <h1>{note.title}</h1>
        <div className={styles.meta}>
          <span>by {note.author_name}</span>
          <span>·</span>
          <span>{new Date(note.created_at).toLocaleDateString()}</span>
          <span>·</span>
          <span className={styles.subject}>{note.subject}</span>
          {note.status !== 'approved' && <StatusBadge status={note.status} />}
        </div>
      </header>

      {note.rejection_reason && (
        <div className={styles.rejectionNotice}>
          <strong>Rejection reason:</strong> {note.rejection_reason}
        </div>
      )}

      <div className={styles.content}>
        {note.content}
      </div>

      {isAuthor && (
        <div className={styles.actions}>
          <button className="btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      )}
    </article>
  );
}
