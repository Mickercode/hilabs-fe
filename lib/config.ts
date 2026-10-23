/**
 * Runtime configuration for the learner app.
 *
 * Only NEXT_PUBLIC_* values reach the browser. Nothing secret belongs here: this repo is public
 * and the bundle is readable by anyone.
 */
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1',
  marketingUrl: process.env.NEXT_PUBLIC_MARKETING_URL ?? '/',

  /**
   * The version of the consent document a learner agrees to at sign-up, recorded against their
   * consent event so the pilot can show what was in force when each row was written.
   *
   * The document itself does not exist yet. It has to, before the cohort opens: nothing may be
   * collected about a person before they have been told what is collected and why. The sign-up
   * form marks the link as unwritten rather than pretending otherwise.
   */
  consentDocumentVersion: process.env.NEXT_PUBLIC_CONSENT_VERSION ?? 'consent-v1-draft',
  consentDocumentUrl: process.env.NEXT_PUBLIC_CONSENT_URL ?? null,
} as const;
