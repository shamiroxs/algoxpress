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
      mood,
      note,
      completedChallenges,
      clientVersion,
    } = body || {};

    // Minimal validation
    if (
      !anonymousUserId ||
      !mood
    ) {
      return new Response(null, {
        status: 400,
      });
    }

    await pool.query(
      `
      INSERT INTO feedback_submissions (
        anonymous_user_id,
        challenge_id,
        mood,
        note,
        completed_challenges,
        client_version
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        anonymousUserId,

        challengeId || null,

        mood,

        note || null,

        completedChallenges ?? null,

        clientVersion || null,
      ]
    );

    return new Response(null, {
      status: 204,
    });
  } catch {
    // Never break frontend UX
    return new Response(null, {
      status: 204,
    });
  }
}