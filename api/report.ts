import { Pool } from 'pg';

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL,
});

export async function POST(
  req: Request
): Promise<Response> {
  try {
    const body = await req.json();

    const {
      anonymousUserId,
      challengeId,
      report,
      concepts,
      source,
      completedChallenges,
      clientVersion,
    } = body || {};

    // Minimal validation
    if (
      !anonymousUserId ||
      !report
    ) {
      return new Response(null, {
        status: 400,
      });
    }

    await pool.query(
      `
      INSERT INTO challenge_reports (
        anonymous_user_id,
        challenge_id,
        report,
        concepts,
        source,
        completed_challenges,
        client_version
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        anonymousUserId,

        challengeId || null,

        report,

        concepts || [],

        source || 'workspace',

        completedChallenges ?? null,

        clientVersion || null,
      ]
    );

    return new Response(null, {
      status: 204,
    });
  } catch {
    return new Response(null, {
      status: 204,
    });
  }
}