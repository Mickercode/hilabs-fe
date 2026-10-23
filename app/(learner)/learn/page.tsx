import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Callout } from '../../../components/ui/Callout';
import { PageHeader } from '../../../components/ui/PageHeader';
import { serverApi } from '../../../lib/api/server';
import type { Resource } from '../../../types/api';
import styles from './page.module.css';

export const metadata: Metadata = { title: 'Learn' };

export default function LearnPage() {
  return (
    <>
      <PageHeader
        eyebrow="02 Learn"
        title="Learn the way apprentices do"
        lead="Watch people who do this work think out loud. Study the cases they worked through, and what they noticed that you did not. Nothing here is marked."
      />

      <Callout>
        There are no exercises in this step on purpose. Judgment is picked up by being near it,
        before anyone explains it.
      </Callout>

      <Suspense fallback={<p className={styles.empty}>Loading the library…</p>}>
        <ResourceList />
      </Suspense>
    </>
  );
}

async function ResourceList() {
  let resources: Resource[];
  try {
    resources = await serverApi.get<Resource[]>('/library/resources?phase=osmotic');
  } catch {
    return <p className={styles.empty}>The API is not reachable, so the library cannot be listed.</p>;
  }

  if (resources.length === 0) {
    return (
      <p className={styles.empty}>
        No osmotic material has been added to the library yet. It is being recorded with
        practitioners.
      </p>
    );
  }

  return (
    <ul className={styles.list}>
      {resources.map((resource) => (
        <li key={resource.id} className={styles.item}>
          <div className={styles.meta}>
            <span className={styles.format}>{resource.format}</span>
            {resource.is_practitioner ? <span className={styles.badge}>Practitioner</span> : null}
            {resource.duration_minutes ? <span>{resource.duration_minutes} min</span> : null}
          </div>
          <a className={styles.title} href={resource.url} target="_blank" rel="noreferrer">
            {resource.title}
          </a>
          <p className={styles.source}>
            {resource.author ? `${resource.author} · ` : ''}
            {resource.source} · {resource.licence}
            {resource.has_transcript ? ' · transcript' : ''}
            {resource.has_audio_only ? ' · audio' : ''}
          </p>
        </li>
      ))}
    </ul>
  );
}
