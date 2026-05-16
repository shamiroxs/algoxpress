// src/analytics/posthog.ts

import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;

const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

export function initializeAnalytics() {
  if (!POSTHOG_KEY) {
    console.warn('[Analytics] Missing PostHog key');
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,

    capture_pageview: false,
    capture_pageleave: true,

    persistence: 'localStorage',

    autocapture: false,

    session_recording: {
      maskAllInputs: true,
      recordCrossOriginIframes: false,
    },

    loaded: (ph) => {
        if (isDev) {
          ph.debug();
  
          console.log('[Analytics] PostHog initialized');
        }
  
        // Global behavioral context
        ph.register({
          platform: 'web',
  
          environment: isProd ? 'production' : 'development',
  
          analyticsVersion: 'v1',
  
          orchestrationMode: 'execution-engine',
        });
      },
  });
}

export default posthog;