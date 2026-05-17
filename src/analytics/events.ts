// src/analytics/events.ts

export const AnalyticsEvents = {
    SESSION_STARTED: 'session_started',
  
    CHALLENGE_VIEWED: 'challenge_viewed',
    CHALLENGE_STARTED: 'challenge_started',
    CHALLENGE_COMPLETED: 'challenge_completed',
    CHALLENGE_REPLAYED: 'challenge_replayed',
  
    EXECUTION_STARTED: 'execution_started',

    EXECUTION_PAUSED: 'execution_paused',
    EXECUTION_RESUMED: 'execution_resumed',
    EXECUTION_STOPPED: 'execution_stopped',

    EXECUTION_STEPPED: 'execution_stepped',
    EXECUTION_REWOUND: 'execution_rewound',

    EXECUTION_SPEED_CHANGED: 'execution_speed_changed',
  
    VALIDATION_FAILED: 'validation_failed',
    RUNTIME_ERROR: 'runtime_error',
  
    HINT_USED: 'hint_used',
  
    REPEATED_RETRY: 'repeated_retry',
    QUIT_MID_PROBLEM: 'quit_mid_problem',

    PROGRAM_RESET: 'program_reset',
    PROGRAM_CLEARED: 'program_cleared',

    TUTORIAL_STARTED: 'tutorial_started',
    TUTORIAL_COMPLETED: 'tutorial_completed',

    CHALLENGE_OPTIMIZED: 'challenge_optimized',
    HINTLESS_COMPLETION: 'hintless_completion',
    FIRST_COMPLETION: 'first_completion',
  } as const;