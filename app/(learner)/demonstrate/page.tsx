import type { Metadata } from 'next';
import { Callout } from '../../../components/ui/Callout';
import { PageHeader } from '../../../components/ui/PageHeader';
import styles from '../shared.module.css';

export const metadata: Metadata = { title: 'Demonstrate' };

export default function DemonstratePage() {
  return (
    <>
      <PageHeader
        eyebrow="04 Demonstrate"
        title="Leave with proof, not a promise"
        lead="Every draft, revision and project you write is kept here with its date. Nothing is overwritten, so you can see how your thinking changed."
      />

      <Callout>
        You can download or delete all of it at any time, and nothing is shared with anyone
        without your explicit consent.
      </Callout>

      <p className={styles.note}>
        Your portfolio fills as you work. There is nothing in it yet.
      </p>
    </>
  );
}
