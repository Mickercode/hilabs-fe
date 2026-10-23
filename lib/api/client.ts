import { request, type RequestOptions } from './request';

export { ApiError } from './request';

/**
 * The browser client. `credentials: 'include'` so the session cookie travels with the request;
 * the cookie is httpOnly, so JavaScript never sees the token itself.
 */
function browserRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return request<T>(path, { ...options, credentials: 'include' });
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    browserRequest<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    browserRequest<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    browserRequest<T>(path, { ...options, method: 'PATCH', body }),
  del: <T>(path: string, options?: RequestOptions) =>
    browserRequest<T>(path, { ...options, method: 'DELETE' }),
};
