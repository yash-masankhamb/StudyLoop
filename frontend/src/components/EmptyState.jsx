import { BookOpen } from 'lucide-react';

export default function EmptyState({ message = 'Nothing here yet.' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      color: 'var(--text-secondary)',
    }}>
      <BookOpen size={56} strokeWidth={1.2} />
      <p style={{ marginTop: '1rem', fontSize: '1.05rem' }}>{message}</p>
    </div>
  );
}
