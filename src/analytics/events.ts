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

    FEEDBACK_CARD_OPENED: 'feedback_card_opened',
    FEEDBACK_SUBMITTED: 'feedback_submitted',
    FEEDBACK_MOOD_SELECTED: 'feedback_mood_selected',

    SUPPORT_CARD_VIEWED: 'support_card_viewed',
    SUPPORT_CARD_CLICKED: 'support_card_clicked',

    REPORT_CARD_OPENED: 'report_card_opened',
    REPORT_SUBMITTED: 'report_submitted',
  } as const;