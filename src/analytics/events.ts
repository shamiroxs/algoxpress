// src/analytics/events.ts

export const AnalyticsEvents = {
    SESSION_STARTED: 'session_started',
  
    CHALLENGE_VIEWED: 'challenge_viewed',
    CHALLENGE_STARTED: 'challenge_started',
    CHALLENGE_COMPLETED: 'challenge_completed',
    CHALLENGE_REPLAYED: 'challenge_replayed',
  
    EXECUTION_STARTED: 'execution_started',
    EXECUTION_STEPPED: 'execution_stepped',
    EXECUTION_REWOUND: 'execution_rewound',
  
    VALIDATION_FAILED: 'validation_failed',
    RUNTIME_ERROR: 'runtime_error',
  
    HINT_USED: 'hint_used',
  
    REPEATED_RETRY: 'repeated_retry',
    QUIT_MID_PROBLEM: 'quit_mid_problem',
  } as const;