import { getAnonymousUserId }
  from './anonymousIdentity';

const FEEDBACK_ENDPOINT =
  import.meta.env
    .VITE_FEEDBACK_ENDPOINT ||
  'https://algoxpress.vercel.app/api/feedback';

export type FeedbackSubmission = {
  challengeId?: string;

  mood:
    | 'good'
    | 'need_improvement'
    | 'bad'
    | 'unknown';

  note?: string;

  completedChallenges?: number;
};

export function submitFeedback(
  feedback: FeedbackSubmission
): void {
  try {
    const payload = {
      anonymousUserId:
        getAnonymousUserId(),

      challengeId:
        feedback.challengeId,

      mood: feedback.mood,

      note:
        feedback.note?.trim() || null,

      completedChallenges:
        feedback.completedChallenges,

      clientVersion:
        import.meta.env
          .VITE_APP_VERSION || 'dev',
    };

    fetch(FEEDBACK_ENDPOINT, {
      method: 'POST',

      headers: {
        'Content-Type':
          'application/json',
      },

      body: JSON.stringify(payload),
    }).catch(() => {
      // Silent failure
    });
  } catch {
    // Never crash gameplay
  }
}