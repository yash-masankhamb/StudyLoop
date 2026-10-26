import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{
      textAlign: 'center',
      padding: '6rem 2rem',
    }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 700, color: 'var(--border)', marginBottom: '0.5rem' }}>
        404
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        This page doesn't exist.
      </p>
      <Link to="/notes" className="btn-primary" style={{
        display: 'inline-block',
        padding: '10px 24px',
        color: 'var(--text-inverse)',
        borderRadius: 'var(--radius-sm)',
        textDecoration: 'none',
      }}>
        Go to Notes
      </Link>
    </div>
  );
}
