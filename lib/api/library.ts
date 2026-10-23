import type { Resource } from '../../types/api';
import { api } from './client';

export interface LibraryQuery {
  phase?: 'osmotic' | 'tailored' | 'either';
  concept?: string;
  practitionerOnly?: boolean;
  lowBandwidthOnly?: boolean;
}

export const library = {
  list: (query: LibraryQuery = {}) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) params.set(key, String(value));
    }
    const qs = params.toString();
    // The library changes rarely, so it is worth caching for a minute.
    return api.get<Resource[]>(`/library/resources${qs ? `?${qs}` : ''}`, { revalidate: 60 });
  },
};
