import { config } from '../config';
import type { ApiErrorBody } from '../../types/api';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly body?: ApiErrorBody,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  body?: unknown;
  headers?: Record<string, string>;
  /** Seconds to cache in the Next data cache. Omit for no caching. */
  revalidate?: number;
}

/**
 * The core request. Neither the browser client nor the server client is exported from here, so
 * nothing imports `next/headers` into a client component by accident.
 *
 * Errors come back as ApiError carrying the API's own message, so a screen can say what actually
 * went wrong rather than "something went wrong". A 401 means no session, a 403 means the session
 * exists but the thing is not theirs, and a 422 usually means the database refused a write that
 * would break a research invariant.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, revalidate, headers, ...rest } = options;

  const response = await fetch(`${config.apiUrl}${path}`, {
    ...rest,
    headers: {
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      ...headers,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    ...(revalidate === undefined ? { cache: 'no-store' } : { next: { revalidate } }),
  });

  if (!response.ok) {
    let parsed: ApiErrorBody | undefined;
    try {
      parsed = (await response.json()) as ApiErrorBody;
    } catch {
      parsed = undefined;
    }

    const message = Array.isArray(parsed?.message)
      ? parsed.message.join(', ')
      : (parsed?.message ?? `Request failed with ${response.status}`);

    throw new ApiError(response.status, message, parsed);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
