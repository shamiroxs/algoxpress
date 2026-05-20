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

export function trackTutorialStarted() {
  trackEvent(AnalyticsEvents.TUTORIAL_STARTED, {
    category: 'exploration',

    challengeId: 'challenge-0',

    metadata: {
      tutorial: true,
    },
  });
}

export function trackTutorialCompleted() {
  trackEvent(AnalyticsEvents.TUTORIAL_COMPLETED, {
    category: 'learning',

    challengeId: 'challenge-0',

    metadata: {
      tutorial: true,
    },
  });
}

export function trackFirstCompletion(
  payload: BasePayload
) {
  trackEvent(AnalyticsEvents.FIRST_COMPLETION, {
    category: 'learning',

    challengeId: payload.challengeId,
    concepts: payload.concepts,

    metadata: {
      firstCompletion: true,
    },
  });
}
export function trackFeedbackCardOpened(
  payload: BasePayload & {
    checkpointIndex?: number;
  }
) {
  trackEvent(
    AnalyticsEvents.FEEDBACK_CARD_OPENED,
    {
      category: 'feedback',

      challengeId: payload.challengeId,
      concepts: payload.concepts,

      metadata: {
        checkpointIndex:
          payload.checkpointIndex,
      },
    }
  );
}

export function trackFeedbackSubmitted(
  payload: BasePayload & {
    mood: string;

    checkpointIndex?: number;

    completedChallenges?: number;

    hasNote?: boolean;

    noteLength?: number;
  }
) {
  trackEvent(
    AnalyticsEvents.FEEDBACK_SUBMITTED,
    {
      category: 'feedback',

      challengeId: payload.challengeId,
      concepts: payload.concepts,

      metadata: {
        mood: payload.mood,

        checkpointIndex:
          payload.checkpointIndex,

        completedChallenges:
          payload.completedChallenges,

        hasNote: payload.hasNote,

        noteLength:
          payload.noteLength,
      },
    }
  );
}

export function trackFeedbackMoodSelected(
  payload: BasePayload & {
    mood: 'good' | 'need_improvement' | 'bad';

    checkpointIndex?: number;
  }
) {
  trackEvent(
    AnalyticsEvents.FEEDBACK_MOOD_SELECTED,
    {
      category: 'feedback',

      challengeId: payload.challengeId,
      concepts: payload.concepts,

      metadata: {
        mood: payload.mood,

        checkpointIndex:
          payload.checkpointIndex,
      },
    }
  );
}

export function trackSupportCardViewed(
  payload: BasePayload & {
    completedChallenges?: number;
  }
) {
  trackEvent(
    AnalyticsEvents.SUPPORT_CARD_VIEWED,
    {
      category: 'feedback',

      challengeId: payload.challengeId,
      concepts: payload.concepts,

      metadata: {
        completedChallenges:
          payload.completedChallenges,
      },
    }
  );
}

export function trackSupportCardClicked(
  payload: BasePayload & {
    completedChallenges?: number;

    previouslySupported?: boolean;
  }
) {
  trackEvent(
    AnalyticsEvents.SUPPORT_CARD_CLICKED,
    {
      category: 'feedback',

      challengeId: payload.challengeId,
      concepts: payload.concepts,

      metadata: {
        completedChallenges:
          payload.completedChallenges,

        previouslySupported:
          payload.previouslySupported,
      },
    }
  );
}

export function trackReportCardOpened(
  payload: BasePayload & {
    source?: 'workspace';
  }
) {
  trackEvent(
    AnalyticsEvents.REPORT_CARD_OPENED,
    {
      category: 'feedback',

      challengeId: payload.challengeId,
      concepts: payload.concepts,

      metadata: {
        source: payload.source,
      },
    }
  );
}

export function trackReportSubmitted(
  payload: BasePayload & {
    reportLength?: number;

    hasText?: boolean;

    source?: 'workspace';
  }
) {
  trackEvent(
    AnalyticsEvents.REPORT_SUBMITTED,
    {
      category: 'feedback',

      challengeId: payload.challengeId,
      concepts: payload.concepts,

      metadata: {
        reportLength:
          payload.reportLength,

        hasText:
          payload.hasText,

        source:
          payload.source,
      },
    }
  );
}