import type { Metadata } from 'next';
import { PageHeader } from '../../../components/ui/PageHeader';
import { SignUpForm } from './SignUpForm';

export const metadata: Metadata = {
  title: 'Create an account',
  description: 'Start with a question. No grades, no school, no certificates.',
};

export default function SignUpPage() {
  return (
    <>
      <PageHeader
        eyebrow="Join the first cohort"
        title="Start with a question, not a course"
        lead="We ask for no grades, no school and no certificates. Where you've been doesn't limit where you can go."
      />
      <SignUpForm />
    </>
  );
}
