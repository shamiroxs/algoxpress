// src/analytics/integrations/controllerAnalytics.ts

import { trackEvent } from '../track';
import { AnalyticsEvents } from '../events';

type BasePayload = {
  challengeId?: string;
  concepts?: string[];
};

export function trackExecutionStarted(
  payload: BasePayload & {
    instructionCount: number;
    executionMode: 'step' | 'autoplay';
  }
) {
  trackEvent(AnalyticsEvents.EXECUTION_STARTED, {
    category: 'execution',

    challengeId: payload.challengeId,
    concepts: payload.concepts,

    metadata: {
      instructionCount: payload.instructionCount,
      executionMode: payload.executionMode,
    },
  });
}

export function trackExecutionStepped(
  payload: BasePayload & {
    currentStep: number;
    manual: boolean;
  }
) {
  // IMPORTANT:
  // Ignore autoplay frame spam

  if (!payload.manual) {
    return;
  }

  trackEvent(AnalyticsEvents.EXECUTION_STEPPED, {
    category: 'execution',

    challengeId: payload.challengeId,
    concepts: payload.concepts,

    metadata: {
      currentStep: payload.currentStep,
    },
  });
}

export function trackExecutionRewound(
  payload: BasePayload & {
    rewindDistance: number;
  }
) {
  trackEvent(AnalyticsEvents.EXECUTION_REWOUND, {
    category: 'execution',

    challengeId: payload.challengeId,
    concepts: payload.concepts,

    metadata: {
      rewindDistance: payload.rewindDistance,
    },
  });
}

export function trackRuntimeError(
  payload: BasePayload & {
    errorType: string;
    step?: number;
  }
) {
  trackEvent(AnalyticsEvents.RUNTIME_ERROR, {
    category: 'friction',

    challengeId: payload.challengeId,
    concepts: payload.concepts,

    metadata: {
      errorType: payload.errorType,
      step: payload.step,
    },
  });
}

export function trackValidationFailed(
  payload: BasePayload & {
    mismatchCount?: number;
  }
) {
  trackEvent(AnalyticsEvents.VALIDATION_FAILED, {
    category: 'friction',

    challengeId: payload.challengeId,
    concepts: payload.concepts,

    metadata: {
      mismatchCount: payload.mismatchCount,
    },
  });
}

export function trackChallengeCompleted(
  payload: BasePayload & {
    durationMs?: number;

    rewindCount?: number;

    manualStepCount?: number;

    autoplayRuns?: number;

    instructionCount?: number;

    stepCount?: number;

    executionMode?: 'step' | 'autoplay' | 'mixed';
  }
) {
  trackEvent(AnalyticsEvents.CHALLENGE_COMPLETED, {
    category: 'learning',

    challengeId: payload.challengeId,
    concepts: payload.concepts,

    metadata: {
        durationMs: payload.durationMs,
      
        rewindCount: payload.rewindCount,
      
        manualStepCount: payload.manualStepCount,
      
        autoplayRuns: payload.autoplayRuns,
      
        instructionCount: payload.instructionCount,
      
        stepCount: payload.stepCount,
      
        executionMode: payload.executionMode,
      },
  });
}

export function trackExecutionPaused(
  payload: BasePayload & {
    currentStep?: number;
    executionMode?: 'step' | 'autoplay';
  }
) {
  trackEvent(AnalyticsEvents.EXECUTION_PAUSED, {
    category: 'execution',

    challengeId: payload.challengeId,
    concepts: payload.concepts,

    metadata: {
      currentStep: payload.currentStep,
      executionMode: payload.executionMode,
    },
  });
}

export function trackExecutionResumed(
  payload: BasePayload & {
    currentStep?: number;
    executionMode?: 'step' | 'autoplay';
  }
) {
  trackEvent(AnalyticsEvents.EXECUTION_RESUMED, {
    category: 'execution',

    challengeId: payload.challengeId,
    concepts: payload.concepts,

    metadata: {
      currentStep: payload.currentStep,
      executionMode: payload.executionMode,
    },
  });
}

export function trackExecutionStopped(
  payload: BasePayload & {
    currentStep?: number;
    reason:
      | 'manual'
      | 'completed'
      | 'runtime_error'
      | 'validation_failed'
      | 'reset';
  }
) {
  trackEvent(AnalyticsEvents.EXECUTION_STOPPED, {
    category: 'execution',

    challengeId: payload.challengeId,
    concepts: payload.concepts,

    metadata: {
      currentStep: payload.currentStep,
      reason: payload.reason,
    },
  });
}

export function trackExecutionSpeedChanged(
  payload: BasePayload & {
    previousSpeed: number;
    newSpeed: number;
  }
) {
  trackEvent(
    AnalyticsEvents.EXECUTION_SPEED_CHANGED,
    {
      category: 'execution',

      challengeId: payload.challengeId,
      concepts: payload.concepts,

      metadata: {
        previousSpeed:
          payload.previousSpeed,

        newSpeed:
          payload.newSpeed,
      },
    }
  );
}

export function trackChallengeOptimized(
  payload: BasePayload & {
    stepCount: number;
    maxSteps: number;
  }
) {
  trackEvent(AnalyticsEvents.CHALLENGE_OPTIMIZED, {
    category: 'learning',

    challengeId: payload.challengeId,
    concepts: payload.concepts,

    metadata: {
      stepCount: payload.stepCount,
      maxSteps: payload.maxSteps,

      optimizationMargin:
        payload.maxSteps - payload.stepCount,
    },
  });
}

export function trackHintlessCompletion(
  payload: BasePayload
) {
  trackEvent(
    AnalyticsEvents.HINTLESS_COMPLETION,
    {
      category: 'learning',

      challengeId: payload.challengeId,
      concepts: payload.concepts,

      metadata: {
        hintless: true,
      },
    }
  );
}
