import type { WorkSample } from '../../types/api';
import { api } from './client';

export const portfolio = {
  listForLearner: (learnerId: string) =>
    api.get<WorkSample[]>(`/portfolio/learners/${learnerId}`),
  listDrafts: (learnerId: string, taskId: string) =>
    api.get<WorkSample[]>(`/portfolio/learners/${learnerId}/tasks/${taskId}`),
};
