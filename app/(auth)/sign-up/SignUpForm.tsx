'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Field, Input, Textarea } from '../../../components/ui/Field';
import { auth } from '../../../lib/api/auth';
import { ApiError } from '../../../lib/api/client';
import { config } from '../../../lib/config';
import styles from './form.module.css';

export function SignUpForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const data = new FormData(event.currentTarget);
    const goal = String(data.get('goal') ?? '').trim();
    const password = String(data.get('password') ?? '');

    if (password.length < 10) {
      setError('Your password needs to be at least ten characters.');
      return;
    }
    if (goal.length < 3) {
      setError('Tell us what you want to understand, in your own words.');
      return;
    }

    setSubmitting(true);
    try {
      await auth.signUp({
        email: String(data.get('email') ?? '').trim(),
        password,
        displayName: String(data.get('displayName') ?? '').trim() || undefined,
        goal,
        consentLevel: data.get('quotes') === 'on' ? 'research_full' : 'research_no_quotes',
        consentDocumentVersion: config.consentDocumentVersion,
      });
      router.replace('/');
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : 'We could not reach HiLabs. Check your connection and try again.',
      );
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <Field
        id="goal"
        label="What do you want to understand?"
        hint="A question or a goal, in your own words. Not a subject, and not a course."
      >
        <Textarea
          id="goal"
          name="goal"
          rows={3}
          required
          placeholder="Why do fixes at work so often make things worse?"
        />
      </Field>

      <Field id="email" label="Email">
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>

      <Field
        id="password"
        label="Password"
        hint="At least ten characters. Length is the only rule."
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={10}
          required
        />
      </Field>

      <Field id="displayName" label="What should we call you?" hint="Optional.">
        <Input id="displayName" name="displayName" type="text" autoComplete="given-name" />
      </Field>

      <label className={styles.check} htmlFor="quotes">
        <input id="quotes" name="quotes" type="checkbox" defaultChecked />
        <span>
          Researchers may quote short pieces of my writing in the published findings, without my
          name. You can say no and still take part.
        </span>
      </label>

      <p className={styles.consent}>
        By creating an account you agree to the{' '}
        {config.consentDocumentUrl ? (
          <a href={config.consentDocumentUrl}>consent document</a>
        ) : (
          <span className={styles.placeholder} title="To be written before the cohort opens">
            [CONSENT DOCUMENT]
          </span>
        )}
        , which explains what is collected, who sees it, and how to leave and delete everything.
      </p>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Creating your account…' : 'Create my account'}
      </Button>

      <p className={styles.alt}>
        Already have an account? <Link href="/sign-in">Sign in</Link>
      </p>
    </form>
  );
}
