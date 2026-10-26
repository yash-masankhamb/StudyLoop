import { useState } from 'react';
import { isStandaloneMode, resetMockStorage } from '../api/client';
import { RotateCcw } from 'lucide-react';
import styles from '../styles/DemoBanner.module.css';

export default function DemoBanner() {
  const [visible, setVisible] = useState(true);

  if (!isStandaloneMode() || !visible) return null;

  function handleReset() {
    if (window.confirm('Reset mock database to initial seed notes and cards?')) {
      resetMockStorage();
      window.location.reload();
    }
  }

  return (
    <div className={styles.pill} title="Operating standalone with local mock data">
      <div className={styles.indicator} />
      <span className={styles.label}>Standalone Mode</span>
      <button className={styles.btn} onClick={handleReset} title="Reset to sample data">
        <RotateCcw size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />
        Reset data
      </button>
      <button
        className={styles.btn}
        onClick={() => setVisible(false)}
        style={{ padding: '3px 6px' }}
        title="Hide indicator"
      >
        ✕
      </button>
    </div>
  );
}
