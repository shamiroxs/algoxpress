// src/analytics/track.ts

import posthog from './posthog';

import { getAnonymousUserId } from './session';
import { getSessionId } from './context';

import type { AnalyticsPayload } from './types';

export function trackEvent(
  event: string,
  payload: AnalyticsPayload
) {
  try {
    posthog.capture(event, {
      anonymousUserId: getAnonymousUserId(),

      gameplaySessionId: getSessionId(),

      timestamp: new Date().toISOString(),

      ...payload,
    });
  } catch (error) {
    console.error('[Analytics]', error);
  }
}