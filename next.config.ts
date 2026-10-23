import type { NextConfig } from 'next';

/**
 * The API is served through this app's own origin.
 *
 * The browser must not talk to the API directly. Cookies are scoped to a host, so a session set
 * by the API on its own host is never sent back to the app on another one — signing in appeared
 * to work and then bounced the learner straight back to the sign-in page. Proxying means the
 * session cookie is first-party on the app's origin, and there is no CORS to configure.
 *
 * Server components still reach the API directly, and forward the cookie by hand. See
 * lib/api/server.ts.
 */
const apiOrigin = process.env.API_ORIGIN ?? 'http://127.0.0.1:3000';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,

  async rewrites() {
    return [{ source: '/api/:path*', destination: `${apiOrigin}/api/:path*` }];
  },
};

export default nextConfig;
