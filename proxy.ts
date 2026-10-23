import { NextResponse, type NextRequest } from 'next/server';

/**
 * The route gate.
 *
 * It has to run here rather than in a layout. With Cache Components the static shell is sent
 * with a 200 before the dynamic part streams, so a `redirect()` inside the layout arrives after
 * the page HTML has already gone out — a signed-out visitor receives the app shell and is then
 * moved on. Proxy runs before anything renders, so an unauthenticated request gets a real 307.
 *
 * This only checks that a session cookie is present. Whether it is still valid is the API's
 * answer, and the layout's `requireAccount()` handles an expired one. Validating here would mean
 * an API call on every navigation, including every prefetch.
 */
const SESSION_COOKIE = 'hilabs_session';
const SIGNED_OUT_ONLY = new Set(['/sign-in', '/sign-up']);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);
  const isSignedOutOnly = SIGNED_OUT_ONLY.has(pathname);

  if (!hasSession && !isSignedOutOnly) {
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    // Where they were heading, so they can be returned there after signing in.
    if (pathname !== '/') {
      url.searchParams.set('next', pathname);
    }
    return NextResponse.redirect(url);
  }

  if (hasSession && isSignedOutOnly) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Everything except Next's own assets and the files served from public/.
  // `api` is excluded: those requests are proxied to the API, and redirecting them would send
  // the sign-in request itself to the sign-in page.
  matcher: ['/((?!api|_next/static|_next/image|icon.svg|favicon.ico).*)'],
};
