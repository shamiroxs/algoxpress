// src/analytics/posthog.ts

import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;

export function initializeAnalytics() {
  if (!POSTHOG_KEY) {
    console.warn('[Analytics] Missing PostHog key');
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: 'https://app.posthog.com',

    capture_pageview: false,
    capture_pageleave: true,

    persistence: 'localStorage',

    autocapture: false,

    session_recording: {
      maskAllInputs: true,
      recordCrossOriginIframes: false,
    },

    loaded: (ph) => {
      if (import.meta.env.DEV) {
        ph.debug();
      }
    },
  });
}

export default posthog;