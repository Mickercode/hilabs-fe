'use client';

import { useEffect } from 'react';
import { Button } from '../components/ui/Button';
import styles from './status.module.css';

/**
 * Says what went wrong rather than apologising vaguely, and offers the one action that might
 * help. The digest is shown because it is what support would ask for.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={styles.status}>
      <h1 className={styles.title}>That did not load.</h1>
      <p className={styles.body}>
        Nothing you have written has been lost. Trying again usually works; if it keeps
        happening, the reference below will tell us where to look.
      </p>
      {error.digest ? <p className={styles.meta}>Reference: {error.digest}</p> : null}
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
