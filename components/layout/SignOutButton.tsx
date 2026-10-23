'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { auth } from '../../lib/api/auth';
import styles from './SignOutButton.module.css';

export function SignOutButton({ email }: { email: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  const signOut = async () => {
    setFailed(false);
    try {
      await auth.signOut();
    } catch {
      setFailed(true);
      return;
    }
    startTransition(() => {
      router.replace('/sign-in');
      router.refresh();
    });
  };

  return (
    <div className={styles.wrap}>
      <span className={styles.email} title={email}>
        {email}
      </span>
      <button className={styles.button} type="button" onClick={signOut} disabled={pending}>
        {failed ? 'Try again' : 'Sign out'}
      </button>
    </div>
  );
}
