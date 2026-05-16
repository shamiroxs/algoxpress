// src/analytics/idle.ts

import { trackEvent } from './track';

let idleTimer: number | undefined;

const IDLE_LIMIT = 1000 * 60 * 2;

let hasTriggeredIdle = false;

export function setupIdleTracking() {
  const resetTimer = () => {
    clearTimeout(idleTimer);

    hasTriggeredIdle = false;

    idleTimer = window.setTimeout(() => {
      if (hasTriggeredIdle) {
        return;
      }

      hasTriggeredIdle = true;

      trackEvent('long_idle_time', {
        category: 'friction',

        metadata: {
          idleDurationMs: IDLE_LIMIT,
        },

        /*

        challengeId:
            store.currentChallenge?.id,

        concepts:
            store.currentChallenge?.concepts,

        metadata: {
            idleDurationMs: IDLE_LIMIT,

            hasValidationError:
            !!store.executionError,

            isExecuting:
            store.isExecuting,
      */
      });
    }, IDLE_LIMIT);
  };

  [
    'mousemove',
    'mousedown',
    'keydown',
    'touchstart',
  ].forEach((event) => {
    window.addEventListener(event, resetTimer);
  });

  resetTimer();
}