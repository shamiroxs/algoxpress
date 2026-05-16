// src/analytics/types.ts

import { AlgorithmPattern } from "../engine/challenges/types";
export type EventCategory =
  | 'exploration'
  | 'construction'
  | 'execution'
  | 'friction'
  | 'learning'
  | 'system'
  | 'feedback';

export type AnalyticsPayload = {
  category: EventCategory;

  challengeId?: string;
  challengeTitle?: string;

  difficulty?: string;

  concepts?: string[];

  pattern?: AlgorithmPattern;

  learningObjectives?: string[];

  sessionId?: string;

  metadata?: Record<string, unknown>;
};