import type { Metadata } from 'next';
import { Callout } from '../../../components/ui/Callout';
import { PageHeader } from '../../../components/ui/PageHeader';
import styles from '../shared.module.css';

export const metadata: Metadata = { title: 'Develop' };

export default function DevelopPage() {
  return (
    <>
      <PageHeader
        eyebrow="03 Develop"
        title="Practise exactly what you need"
        lead="Targeted exercises on the gaps in your own work, with spaced review of the ideas you have met. The companion asks before it tells, and never writes your work for you."
      />

      <Callout>
        This step is built from what you have already written, so it opens once there is work to
        read. Nothing is selected for you before then.
      </Callout>

      <p className={styles.note}>
        The exercises are still being written. They will be matched to how you engage rather than
        to a stated preference, and that matching is the part of the HiLabs thesis we are least
        sure about, so it is logged and analysed rather than claimed.
      </p>
    </>
  );
}
