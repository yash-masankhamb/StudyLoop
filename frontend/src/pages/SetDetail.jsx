import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';
import styles from '../styles/SetDetail.module.css';

export default function SetDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [set, setSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    apiFetch(`/sets/${id}`)
      .then((data) => setSet(data.set))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  function goNext() {
    if (!set) return;
    setFlipped(false);
    setCurrentIndex((i) => (i + 1) % set.cards.length);
  }

  function goPrev() {
    if (!set) return;
    setFlipped(false);
    setCurrentIndex((i) => (i - 1 + set.cards.length) % set.cards.length);
  }

  async function handleDelete() {
    if (!window.confirm('Delete this set and all its cards? This cannot be undone.')) return;
    try {
      await apiFetch(`/sets/${id}`, { method: 'DELETE' });
      navigate('/sets');
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} />;
  if (!set) return <ErrorBanner message="Set not found." />;

  const card = set.cards?.[currentIndex];
  const isAuthor = user && user.id === set.author_id;

  return (
    <div className={styles.page}>
      <Link to="/sets" className={styles.back}>← Back to sets</Link>

      <h1>{set.title}</h1>
      <p className={styles.meta}>
        {set.subject} · by {set.author_name} · {set.cards?.length || 0} cards
      </p>

      {!set.cards || set.cards.length === 0 ? (
        <EmptyState message="This set has no cards yet." />
      ) : (
        <>
          <div className={styles.cardContainer}>
            <div
              className={`${styles.card} ${flipped ? styles.flipped : ''}`}
              onClick={() => setFlipped((f) => !f)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setFlipped((f) => !f)}
            >
              <div className={styles.cardFront}>
                <span className={styles.cardLabel}>Front</span>
                <p>{card.front}</p>
              </div>
              <div className={styles.cardBack}>
                <span className={styles.cardLabel}>Back</span>
                <p>{card.back}</p>
              </div>
            </div>
          </div>

          <div className={styles.controls}>
            <button className="btn-secondary" onClick={goPrev} aria-label="Previous card">
              <ChevronLeft size={18} />
            </button>
            <span className={styles.counter}>
              {currentIndex + 1} / {set.cards.length}
            </span>
            <button className="btn-secondary" onClick={goNext} aria-label="Next card">
              <ChevronRight size={18} />
            </button>
          </div>

          <p className={styles.flipHint}>Click the card to flip it</p>
        </>
      )}

      {isAuthor && (
        <div className={styles.actions}>
          <button className="btn-danger" onClick={handleDelete}>Delete set</button>
        </div>
      )}
    </div>
  );
}
