import { api } from './client';

export interface CurrentAccount {
  accountId: string;
  kind: 'learner' | 'researcher' | 'rater' | 'admin';
  learnerId: string | null;
  email: string;
}

export interface SignUpInput {
  email: string;
  password: string;
  displayName?: string;
  goal: string;
  consentLevel: 'research_full' | 'research_no_quotes';
  consentDocumentVersion: string;
}

export const auth = {
  signUp: (input: SignUpInput) => api.post<{ account: CurrentAccount }>('/auth/sign-up', input),
  signIn: (email: string, password: string) =>
    api.post<{ account: CurrentAccount }>('/auth/sign-in', { email, password }),
  signOut: () => api.post<void>('/auth/sign-out'),
  me: () => api.get<CurrentAccount>('/auth/me'),
};
