'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { STEPS } from '../../lib/steps';
import styles from './AppNav.module.css';

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Your journey">
      <ol className={styles.list}>
        {STEPS.map((step) => {
          const active = pathname.startsWith(step.href);
          return (
            <li key={step.href}>
              <Link
                href={step.href}
                className={[styles.link, active ? styles.active : ''].join(' ')}
                aria-current={active ? 'page' : undefined}
              >
                <span className={styles.n}>{step.n}</span>
                <span className={styles.name}>{step.name}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
