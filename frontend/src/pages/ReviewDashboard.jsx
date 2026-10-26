import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { apiFetch } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';
import styles from '../styles/ReviewDashboard.module.css';

export default function ReviewDashboard() {
  const [notes, setNotes] = useState([]);
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectingId, setRejectingId] = useState(null); // 'note-5' or 'set-2'
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    apiFetch('/review/pending')
      .then((data) => {
        setNotes(data.notes || []);
        setSets(data.sets || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function approve(type, id) {
    try {
      await apiFetch(`/review/${type}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'approved' }),
      });
      // Optimistic removal
      if (type === 'notes') setNotes((prev) => prev.filter((n) => n.id !== id));
      else setSets((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  async function reject(type, id) {
    if (!rejectReason.trim()) {
      setError('Please provide a reason for rejection.');
      return;
    }
    try {
      await apiFetch(`/review/${type}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'rejected', rejection_reason: rejectReason }),
      });
      if (type === 'notes') setNotes((prev) => prev.filter((n) => n.id !== id));
      else setSets((prev) => prev.filter((s) => s.id !== id));
      setRejectingId(null);
      setRejectReason('');
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <LoadingSpinner />;

  const empty = notes.length === 0 && sets.length === 0;

  return (
    <div className={styles.page}>
      <h1>Review queue</h1>
      <p className={styles.subtitle}>Approve or reject pending submissions.</p>

      <ErrorBanner message={error} onDismiss={() => setError('')} />

      {empty ? (
        <EmptyState message="Nothing to review right now." />
      ) : (
        <>
          {notes.length > 0 && (
            <section className={styles.section}>
              <h2>Pending Notes ({notes.length})</h2>
              {notes.map((note) => {
                const key = `note-${note.id}`;
                return (
                  <div key={key} className={styles.item}>
                    <div className={styles.itemHeader}>
                      <div>
                        <span className={styles.itemTitle}>{note.title}</span>
                        <span className={styles.itemMeta}>
                          by {note.author_name} · {new Date(note.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <span className={styles.itemSubject}>{note.subject}</span>
                    </div>
                    <p className={styles.preview}>
                      {note.content?.slice(0, 200)}{note.content?.length > 200 ? '…' : ''}
                    </p>
                    <div className={styles.itemActions}>
                      <button className={styles.approveBtn} onClick={() => approve('notes', note.id)}>
                        <Check size={15} /> Approve
                      </button>
                      <button
                        className={styles.rejectBtn}
                        onClick={() => setRejectingId(rejectingId === key ? null : key)}
                      >
                        <X size={15} /> Reject
                      </button>
                    </div>
                    {rejectingId === key && (
                      <div className={styles.rejectForm}>
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Reason for rejection…"
                          rows={3}
                        />
                        <button className="btn-danger" onClick={() => reject('notes', note.id)}>
                          Confirm rejection
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </section>
          )}

          {sets.length > 0 && (
            <section className={styles.section}>
              <h2>Pending Sets ({sets.length})</h2>
              {sets.map((set) => {
                const key = `set-${set.id}`;
                return (
                  <div key={key} className={styles.item}>
                    <div className={styles.itemHeader}>
                      <div>
                        <span className={styles.itemTitle}>{set.title}</span>
                        <span className={styles.itemMeta}>
                          by {set.author_name} · {set.card_count} cards
                        </span>
                      </div>
                      <span className={styles.itemSubject}>{set.subject}</span>
                    </div>
                    <div className={styles.itemActions}>
                      <button className={styles.approveBtn} onClick={() => approve('sets', set.id)}>
                        <Check size={15} /> Approve
                      </button>
                      <button
                        className={styles.rejectBtn}
                        onClick={() => setRejectingId(rejectingId === key ? null : key)}
                      >
                        <X size={15} /> Reject
                      </button>
                    </div>
                    {rejectingId === key && (
                      <div className={styles.rejectForm}>
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Reason for rejection…"
                          rows={3}
                        />
                        <button className="btn-danger" onClick={() => reject('sets', set.id)}>
                          Confirm rejection
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </section>
          )}
        </>
      )}
    </div>
  );
}
