import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { Logo } from '../../components/layout/Logo';
import { currentAccount } from '../../lib/session';
import styles from './layout.module.css';

export default async function AuthLayout({ children }: { children: ReactNode }) {
  // Someone already signed in has no business on these pages.
  if (await currentAccount()) {
    redirect('/');
  }

  return (
    <div className={styles.page}>
      <Link href="/" className={styles.brand} aria-label="HiLabs">
        <Logo size={34} />
        <span className={styles.word}>
          <b>Hi</b>
          <i>Labs</i>
        </span>
      </Link>
      <div className={styles.panel}>{children}</div>
    </div>
  );
}
