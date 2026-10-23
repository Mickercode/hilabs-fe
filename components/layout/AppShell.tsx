import Link from 'next/link';
import type { ReactNode } from 'react';
import type { CurrentAccount } from '../../lib/api/auth';
import { AppNav } from './AppNav';
import { Logo } from './Logo';
import { SignOutButton } from './SignOutButton';
import styles from './AppShell.module.css';

export function AppShell({
  children,
  account,
}: {
  children: ReactNode;
  account: CurrentAccount;
}) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.bar}>
          <Link href="/" className={styles.brand} aria-label="HiLabs home">
            <Logo size={30} />
            <span className={styles.word}>
              <b>Hi</b>
              <i>Labs</i>
            </span>
          </Link>
          <div className={styles.navSlot}>
            <AppNav />
          </div>
          <SignOutButton email={account.email} />
        </div>
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          Your work is yours. You can download or delete everything at any time.
        </div>
      </footer>
    </div>
  );
}
