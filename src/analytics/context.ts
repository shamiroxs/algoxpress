// src/analytics/context.ts

let sessionId = crypto.randomUUID();

export function getSessionId() {
  return sessionId;
}

export function resetSession() {
  sessionId = crypto.randomUUID();
}