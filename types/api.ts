/**
 * The shapes the API returns.
 *
 * Field names are snake_case because they come straight from the database, which owns the
 * schema. Mapping them to camelCase here would add a layer that silently drifts the first time
 * a column is added, so the seam stays visible instead.
 */

export type Phase = 'discovery' | 'osmotic' | 'tailored' | 'assessment';

export type SupportLevel =
  | 'none'
  | 'companion_hints'
  | 'companion_explanation'
  | 'human_help'
  | 'unknown';

export interface Learner {
  id: string;
  goal: string;
  joined_at: string;
  /** Present for research tooling only. A learner-facing view must never read this. */
  study_arm: string | null;
}

export interface JourneyStep {
  id: string;
  learner_id: string;
  phase: Phase;
  gim_domain: string | null;
  task_id: string | null;
  resource_id: string | null;
  chosen_by_learner: boolean;
  started_at: string;
  ended_at: string | null;
}

export interface WorkSample {
  id: string;
  learner_id: string;
  task_id: string;
  content: string;
  version: number;
  support_level: SupportLevel;
  created_at: string;
}

export interface Resource {
  id: string;
  title: string;
  author: string | null;
  source: string;
  url: string;
  licence: string;
  concepts: string[];
  format: 'video' | 'audio' | 'text' | 'interactive' | 'dataset';
  duration_minutes: number | null;
  is_practitioner: boolean;
  has_audio_only: boolean;
  has_transcript: boolean;
}

export interface ApiErrorBody {
  statusCode: number;
  error: string;
  message: string | string[];
  path: string;
  timestamp: string;
}
