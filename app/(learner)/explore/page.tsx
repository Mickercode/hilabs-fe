import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Callout } from '../../../components/ui/Callout';
import { Card, CardBody, CardTitle } from '../../../components/ui/Card';
import { PageHeader } from '../../../components/ui/PageHeader';
import { api } from '../../../lib/api/client';
import styles from './page.module.css';

export const metadata: Metadata = { title: 'Explore' };

interface Challenge {
  id: string;
  code: string;
  title: string;
  body: string;
  gim_domain: string | null;
  tier: number;
}

/**
 * The page shell prerenders; only the list waits on the API. Keeping the async work in its own
 * component is what lets the rest of the page be served instantly from the static shell.
 */
export default function ExplorePage() {
  return (
    <>
      <PageHeader
        eyebrow="01 Explore"
        title="Start with a question, not a course"
        lead="Six short challenges, one in each kind of thinking. Try each once. After that, go deeper wherever you want to, and leave the rest."
      />

      <Callout>
        Nothing here is graded, and nothing is forced. Going deeper is a choice, and choosing not
        to is not a gap.
      </Callout>

      <Suspense fallback={<p className={styles.empty}>Loading the challenges…</p>}>
        <ChallengeList />
      </Suspense>
    </>
  );
}

async function ChallengeList() {
  let challenges: Challenge[];
  try {
    const all = await api.get<Challenge[]>('/discovery/challenges');
    challenges = all.filter((challenge) => challenge.tier === 0);
  } catch {
    return (
      <p className={styles.empty}>
        The API is not reachable, so the challenges cannot be listed. Start it with{' '}
        <code>npm run start:dev</code> in the backend repository.
      </p>
    );
  }

  if (challenges.length === 0) {
    return <p className={styles.empty}>The challenges have not been loaded into the library yet.</p>;
  }

  return (
    <ul className={styles.grid}>
      {challenges.map((challenge) => (
        <li key={challenge.id}>
          <Card>
            <span className={styles.code}>
              {challenge.code}
              {challenge.gim_domain ? ` · ${challenge.gim_domain}` : ''}
            </span>
            <CardTitle>{challenge.title}</CardTitle>
            <CardBody>{challenge.body}</CardBody>
          </Card>
        </li>
      ))}
    </ul>
  );
}
