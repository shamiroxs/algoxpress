// src/analytics/integrations/storeAnalytics.ts

import { trackEvent } from '../track';
import { AnalyticsEvents } from '../events';

import { ConceptTag } from '../../engine/challenges/types';

type BasePayload = {
  challengeId?: string;
  concepts?: ConceptTag[];
};

export function trackChallengeViewed(
  payload: BasePayload
) {
  trackEvent(AnalyticsEvents.CHALLENGE_VIEWED, {
    category: 'exploration',

    challengeId: payload.challengeId,
    concepts: payload.concepts,
  });
}

export function trackChallengeStarted(
  payload: BasePayload
) {
  trackEvent(AnalyticsEvents.CHALLENGE_STARTED, {
    category: 'learning',

    challengeId: payload.challengeId,
    concepts: payload.concepts,
  });
}

export function trackInstructionAdded(
  payload: BasePayload & {
    instructionType: string;
  }
) {
  trackEvent('instruction_added', {
    category: 'construction',

    challengeId: payload.challengeId,
    concepts: payload.concepts,

    metadata: {
      instructionType: payload.instructionType,
    },
  });
}

export function trackInstructionRemoved(
  payload: BasePayload & {
    instructionType: string;
  }
) {
  trackEvent('instruction_removed', {
    category: 'construction',

    challengeId: payload.challengeId,
    concepts: payload.concepts,

    metadata: {
      instructionType: payload.instructionType,
    },
  });
}

export function trackHintUsed(
  payload: BasePayload & {
    hintIndex?: number;
  }
) {
  trackEvent(AnalyticsEvents.HINT_USED, {
    category: 'learning',

    challengeId: payload.challengeId,
    concepts: payload.concepts,

    metadata: {
      hintIndex: payload.hintIndex,
    },
  });
}

export function trackRepeatedRetry(
  payload: BasePayload & {
    retryCount: number;
  }
) {
  trackEvent(AnalyticsEvents.REPEATED_RETRY, {
    category: 'friction',

    challengeId: payload.challengeId,
    concepts: payload.concepts,

    metadata: {
      retryCount: payload.retryCount,
    },
  });
}

export function trackChallengeReplayed(
  payload: BasePayload
) {
  trackEvent(AnalyticsEvents.CHALLENGE_REPLAYED, {
    category: 'learning',

    challengeId: payload.challengeId,
    concepts: payload.concepts,
  });
}

export function trackQuitMidProblem(
  payload: BasePayload & {
    progressPercent?: number;
  }
) {
  trackEvent(AnalyticsEvents.QUIT_MID_PROBLEM, {
    category: 'friction',

    challengeId: payload.challengeId,
    concepts: payload.concepts,

    metadata: {
      progressPercent: payload.progressPercent,
    },
  });
}