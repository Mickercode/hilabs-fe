import { cookies } from 'next/headers';
import { config } from '../config';
import { request, type RequestOptions } from './request';

export { ApiError } from './request';

/**
 * The server client, for server components and route handlers.
 *
 * A server component has no browser cookie jar, so the incoming request's cookies are forwarded
 * by hand. Without this a signed-in learner would look signed out to every page rendered on the
 * server.
 */
async function serverRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const jar = await cookies();
  const cookieHeader = jar
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  return request<T>(path, {
    ...options,
    // Absolute: a server fetch has no origin of its own, and does not go through the rewrite.
    base: `${config.apiOrigin}/api/v1`,
    headers: { ...options.headers, ...(cookieHeader ? { cookie: cookieHeader } : {}) },
  });
}

export const serverApi = {
  get: <T>(path: string, options?: RequestOptions) =>
    serverRequest<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    serverRequest<T>(path, { ...options, method: 'POST', body }),
};
