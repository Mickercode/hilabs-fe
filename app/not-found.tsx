import { ButtonLink } from '../components/ui/Button';
import styles from './status.module.css';

export default function NotFound() {
  return (
    <div className={styles.status}>
      <h1 className={styles.title}>There is nothing here.</h1>
      <p className={styles.body}>
        The page you are looking for has moved, or never existed.
      </p>
      <ButtonLink href="/">Back to your journey</ButtonLink>
    </div>
  );
}
