import { useState } from 'react';
import { X } from 'lucide-react';
import styles from '../styles/ErrorBanner.module.css';

export default function ErrorBanner({ message, onDismiss }) {
  const [visible, setVisible] = useState(true);

  if (!message || !visible) return null;

  function dismiss() {
    setVisible(false);
    onDismiss?.();
  }

  return (
    <div className={styles.banner} role="alert">
      <span>{message}</span>
      <button className={styles.close} onClick={dismiss} aria-label="Dismiss error">
        <X size={16} />
      </button>
    </div>
  );
}
