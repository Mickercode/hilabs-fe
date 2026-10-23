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

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Seconds to cache in the Next data cache. Omit for no caching. */
  revalidate?: number;
}

/**
 * One place that talks to the API.
 *
 * Errors come back as ApiError with the status and the API's own message, so a screen can say
 * what actually went wrong instead of "something went wrong". The API's error shape is defined
 * by its exception filter, and a 422 usually means the database refused a write that would
 * break a research invariant.
 */
async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
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

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  del: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
