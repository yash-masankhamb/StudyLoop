import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import ErrorBanner from '../components/ErrorBanner';
import styles from '../styles/CreateNote.module.css';

export default function CreateNote() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await apiFetch('/notes', {
        method: 'POST',
        body: JSON.stringify({ title, subject, content }),
      });
      navigate('/my-notes');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <h1>Create a note</h1>
      <p className={styles.subtitle}>Share your study material with the community.</p>

      <ErrorBanner message={error} onDismiss={() => setError('')} />

      <form className={styles.form} onSubmit={handleSubmit}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Intro to Photosynthesis"
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

        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your notes here…"
          rows={10}
          required
        />

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Publishing…' : 'Publish note'}
        </button>
      </form>
    </div>
  );
}
