import type { Learner } from '../../types/api';
import { api } from './client';

export interface CreateLearnerInput {
  goal: string;
  consentLevel: 'research_full' | 'research_no_quotes';
  consentDocumentVersion: string;
  priorHealthCareExperience?: boolean;
}

export const learners = {
  create: (input: CreateLearnerInput) => api.post<Learner>('/learners', input),
  get: (id: string) => api.get<Learner>(`/learners/${id}`),
  /** Everything recorded about a learner (R21). */
  exportAll: (id: string) => api.get<unknown>(`/learners/${id}/export`),
  requestErasure: (id: string) => api.del<unknown>(`/learners/${id}`),
};
