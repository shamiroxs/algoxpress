import { getAnonymousUserId }
  from './anonymousIdentity';

const REPORT_ENDPOINT =
  import.meta.env
    .VITE_REPORT_ENDPOINT ||
  'https://algoxpress.vercel.app/api/report';

export type ReportSubmission = {
  challengeId?: string;

  report: string;

  concepts?: string[];

  source?: 'workspace';

  completedChallenges?: number;
};

export function submitReport(
  report: ReportSubmission
): void {
  try {
    const payload = {
      anonymousUserId:
        getAnonymousUserId(),

      challengeId:
        report.challengeId,

      report:
        report.report.trim(),

      concepts:
        report.concepts || [],

      source:
        report.source || 'workspace',

      completedChallenges:
        report.completedChallenges,

      clientVersion:
        import.meta.env
          .VITE_APP_VERSION || 'dev',
    };

    fetch(REPORT_ENDPOINT, {
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
    // Never break gameplay
  }
}