import type { ReactNode } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { requireAccount } from '../../lib/session';

/**
 * The journey is only meaningful signed in, and the data behind it is a person's own writing.
 * Checking here means every page under this layout is covered, rather than each one remembering.
 */
export default async function LearnerLayout({ children }: { children: ReactNode }) {
  const account = await requireAccount();

  return <AppShell account={account}>{children}</AppShell>;
}
