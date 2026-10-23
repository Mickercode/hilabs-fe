import type { ReactNode } from 'react';
import styles from './Callout.module.css';

/**
 * A quiet note, not an alert. HiLabs never shouts at a learner, and never implies they have
 * done something wrong by exploring.
 */
export function Callout({ children }: { children: ReactNode }) {
  return (
    <aside className={styles.callout}>
      <span className={styles.dot} aria-hidden="true" />
      <div className={styles.body}>{children}</div>
    </aside>
  );
}
