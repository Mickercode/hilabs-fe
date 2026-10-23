import type { Metadata } from 'next';
import { PageHeader } from '../../../components/ui/PageHeader';
import { SignInForm } from './SignInForm';

export const metadata: Metadata = { title: 'Sign in' };

/**
 * Only a path within this app is accepted as a destination. Taking the value as given would let
 * a crafted link send someone to another site straight after they sign in, with the sign-in page
 * lending it credibility.
 */
function safeNext(value: string | string[] | undefined): string {
  const next = Array.isArray(value) ? value[0] : value;
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return '/';
  }
  return next;
}

export default async function SignInPage({ searchParams }: PageProps<'/sign-in'>) {
  const params = await searchParams;

  return (
    <>
      <PageHeader eyebrow="Welcome back" title="Sign in" />
      <SignInForm next={safeNext(params.next)} />
    </>
  );
}
