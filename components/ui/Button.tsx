import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import styles from './Button.module.css';

type Variant = 'primary' | 'ghost';

interface Common {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

type ButtonProps = Common & Omit<ComponentProps<'button'>, 'className' | 'children'>;
type LinkProps = Common & Omit<ComponentProps<typeof Link>, 'className' | 'children'>;

function classes(variant: Variant, extra?: string) {
  return [styles.button, styles[variant], extra].filter(Boolean).join(' ');
}

export function Button({ variant = 'primary', className, children, ...rest }: ButtonProps) {
  return (
    <button className={classes(variant, className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({ variant = 'primary', className, children, ...rest }: LinkProps) {
  return (
    <Link className={classes(variant, className)} {...rest}>
      {children}
    </Link>
  );
}
