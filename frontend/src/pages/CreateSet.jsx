import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { apiFetch } from '../api/client';
import ErrorBanner from '../components/ErrorBanner';
import styles from '../styles/CreateSet.module.css';

export default function CreateSet() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [cards, setCards] = useState([{ front: '', back: '' }]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function addCard() {
    setCards((prev) => [...prev, { front: '', back: '' }]);
  }

  function removeCard(index) {
    setCards((prev) => prev.filter((_, i) => i !== index));
  }

  function updateCard(index, field, value) {
    setCards((prev) =>
      prev.map((card, i) => (i === index ? { ...card, [field]: value } : card))
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const validCards = cards.filter((c) => c.front.trim() && c.back.trim());
    if (validCards.length === 0) {
      setError('Add at least one card with both a front and back.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create the set
      const data = await apiFetch('/sets', {
        method: 'POST',
        body: JSON.stringify({ title, subject }),
      });

      // 2. Add each card
      for (const card of validCards) {
        await apiFetch(`/sets/${data.set.id}/cards`, {
          method: 'POST',
          body: JSON.stringify({ front: card.front, back: card.back }),
        });
      }

      navigate('/sets');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <h1>Create a flashcard set</h1>
      <p className={styles.subtitle}>Build a set of cards for others to study.</p>

      <ErrorBanner message={error} onDismiss={() => setError('')} />

      <form className={styles.form} onSubmit={handleSubmit}>
        <label htmlFor="title">Set title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Biology Chapter 3"
          required
        />

        <label htmlFor="subject">Subject</label>
        <input
          id="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Biology"
          required
        />

        <div className={styles.cardsSection}>
          <h2>Cards</h2>

          {cards.map((card, index) => (
            <div key={index} className={styles.cardRow}>
              <div className={styles.cardNumber}>{index + 1}</div>
              <div className={styles.cardFields}>
                <textarea
                  value={card.front}
                  onChange={(e) => updateCard(index, 'front', e.target.value)}
                  placeholder="Front — question or term"
                  rows={2}
                />
                <textarea
                  value={card.back}
                  onChange={(e) => updateCard(index, 'back', e.target.value)}
                  placeholder="Back — answer or definition"
                  rows={2}
                />
              </div>
              {cards.length > 1 && (
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeCard(index)}
                  aria-label="Remove card"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}

          <button type="button" className={`btn-secondary ${styles.addBtn}`} onClick={addCard}>
            <Plus size={16} /> Add card
          </button>
        </div>

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Creating…' : 'Create set'}
        </button>
      </form>
    </div>
  );
}
