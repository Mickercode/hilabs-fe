import Link from 'next/link';
import { Callout } from '../../components/ui/Callout';
import { PageHeader } from '../../components/ui/PageHeader';
import { STEPS } from '../../lib/steps';
import styles from './page.module.css';

export default function JourneyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Your journey"
        title="Four steps. One loop. Built around you."
        lead="What you make shapes what comes next. Each step adds to your portfolio, and the portfolio is what decides where you go after it."
      />

      <ol className={styles.steps}>
        {STEPS.map((step) => (
          <li key={step.href}>
            <Link href={step.href} className={styles.step}>
              <span className={styles.n}>{step.n}</span>
              <span className={styles.text}>
                <span className={styles.name}>{step.name}</span>
                <span className={styles.line}>{step.line}</span>
              </span>
              <span className={styles.arrow} aria-hidden="true">
                →
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <Callout>
        Nothing here reports a score, a type or a ranking of you. You see your own work, the
        feedback on it, and how it changed.
      </Callout>
    </>
  );
}
