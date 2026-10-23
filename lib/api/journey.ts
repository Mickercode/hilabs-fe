import type { JourneyStep } from '../../types/api';
import { api } from './client';

export const journey = {
  listForLearner: (learnerId: string) => api.get<JourneyStep[]>(`/journey/learners/${learnerId}`),
  endStep: (stepId: string) => api.patch<JourneyStep>(`/journey/steps/${stepId}/end`),
};
