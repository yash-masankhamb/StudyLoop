import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';
import styles from '../styles/SetsList.module.css';

export default function SetsList() {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/sets')
      .then((data) => setSets(data.sets))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1>Flashcard Sets</h1>
      <p className={styles.subtitle}>Pick a set and start reviewing.</p>

      <ErrorBanner message={error} onDismiss={() => setError('')} />

      {sets.length === 0 ? (
        <EmptyState message="No flashcard sets have been published yet." />
      ) : (
        <ul className={styles.list}>
          {sets.map((set) => (
            <li key={set.id}>
              <Link to={`/sets/${set.id}`} className={styles.row}>
                <div className={styles.rowMain}>
                  <span className={styles.title}>{set.title}</span>
                  <span className={styles.meta}>
                    by {set.author_name} · {set.card_count} card{set.card_count !== 1 ? 's' : ''}
                  </span>
                </div>
                <span className={styles.subject}>{set.subject}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
