import type { ComponentProps, ReactNode } from 'react';
import styles from './Field.module.css';

interface FieldProps {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
}

export function Field({ id, label, hint, error, children }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      {hint ? (
        <p className={styles.hint} id={hintId}>
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p className={styles.error} id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Input(props: ComponentProps<'input'>) {
  return <input className={styles.input} {...props} />;
}

export function Textarea(props: ComponentProps<'textarea'>) {
  return <textarea className={styles.textarea} {...props} />;
}
