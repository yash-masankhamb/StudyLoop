import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorBanner from '../components/ErrorBanner';
import styles from '../styles/Login.module.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/notes');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1>Welcome back</h1>
        <p className={styles.subtitle}>Sign in to keep studying.</p>

        <ErrorBanner message={error} onDismiss={() => setError('')} />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@school.edu"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          required
        />

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>

        <p className={styles.footer}>
          No account yet? <Link to="/register">Create one</Link>
        </p>

        <div className={styles.demoBox}>
          <span className={styles.demoTitle}>Quick standalone test:</span>
          <div className={styles.demoButtons}>
            <button
              type="button"
              className={styles.demoBtn}
              onClick={() => {
                setEmail('student@school.edu');
                setPassword('password123');
              }}
            >
              Fill Student (Aisha)
            </button>
            <button
              type="button"
              className={styles.demoBtn}
              onClick={() => {
                setEmail('teacher@school.edu');
                setPassword('password123');
              }}
            >
              Fill Teacher (Ms. Rivera)
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
