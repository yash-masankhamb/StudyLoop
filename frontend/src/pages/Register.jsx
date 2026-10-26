import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorBanner from '../components/ErrorBanner';
import styles from '../styles/Register.module.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(name, email, password, role);
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
        <h1>Create your account</h1>
        <p className={styles.subtitle}>Join as a student or teacher.</p>

        <ErrorBanner message={error} onDismiss={() => setError('')} />

        <label htmlFor="name">Full name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          required
        />

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
          placeholder="At least 6 characters"
          minLength={6}
          required
        />

        <div className={styles.roleContainer}>
          <label className={styles.roleLabel}>I am a…</label>
          <div className={styles.roleGrid}>
            <button
              type="button"
              className={`${styles.roleCard} ${role === 'student' ? styles.roleCardActive : ''}`}
              onClick={() => setRole('student')}
            >
              <div className={styles.roleRadioIndicator}>
                <div className={styles.roleRadioDot} />
              </div>
              <div className={styles.roleInfo}>
                <span className={styles.roleTitle}>Student</span>
                <span className={styles.roleDesc}>Study notes & flashcards</span>
              </div>
            </button>

            <button
              type="button"
              className={`${styles.roleCard} ${role === 'teacher' ? styles.roleCardActive : ''}`}
              onClick={() => setRole('teacher')}
            >
              <div className={styles.roleRadioIndicator}>
                <div className={styles.roleRadioDot} />
              </div>
              <div className={styles.roleInfo}>
                <span className={styles.roleTitle}>Teacher</span>
                <span className={styles.roleDesc}>Publish & review content</span>
              </div>
            </button>
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>

        <p className={styles.footer}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
