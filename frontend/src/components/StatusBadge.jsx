import styles from '../styles/StatusBadge.module.css';

const labels = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`${styles.badge} ${styles[status]}`}>
      {labels[status] || status}
    </span>
  );
}
