import { redirect } from 'next/navigation';
import { ApiError, serverApi } from './api/server';
import type { CurrentAccount } from './api/auth';

/**
 * The account behind the current request, or null if there is no session.
 *
 * Returns null on 401 rather than throwing, so a page can decide what to do. Any other failure
 * still throws: "the API is down" and "you are signed out" are different problems and should not
 * look the same to a learner.
 */
export async function currentAccount(): Promise<CurrentAccount | null> {
  try {
    return await serverApi.get<CurrentAccount>('/auth/me');
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

/** For pages that only make sense signed in. */
export async function requireAccount(): Promise<CurrentAccount> {
  const account = await currentAccount();
  if (!account) {
    redirect('/sign-in');
  }
  return account;
}
