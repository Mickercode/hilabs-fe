import type { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  /** A quiet surface for secondary content. */
  muted?: boolean;
}

export function Card({ children, muted = false }: CardProps) {
  return <div className={[styles.card, muted ? styles.muted : ''].join(' ')}>{children}</div>;
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h3 className={styles.title}>{children}</h3>;
}

export function CardBody({ children }: { children: ReactNode }) {
  return <p className={styles.body}>{children}</p>;
}
