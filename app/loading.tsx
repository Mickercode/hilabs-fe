import styles from './status.module.css';

export default function Loading() {
  return (
    <div className={styles.status} role="status" aria-live="polite">
      <p className={styles.body}>Loading…</p>
    </div>
  );
}
