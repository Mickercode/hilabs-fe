/**
 * Runtime configuration for the learner app.
 *
 * Only NEXT_PUBLIC_* values reach the browser. Nothing secret belongs here: this repo is public
 * and the bundle is readable by anyone.
 */
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1',
  marketingUrl: process.env.NEXT_PUBLIC_MARKETING_URL ?? '/',
} as const;
