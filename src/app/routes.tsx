import { Routes as RouterRoutes, Route, Navigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { challenges } from '../engine/challenges/challenges';
import { useGameStore } from '../orchestrator/store';
import { GameView } from './GameView';
import { ChallengePathView } from './ChallengePathView';

function ChallengeRoute() {
  const { id } = useParams<{ id: string }>();
  const { selectChallenge, setCurrentChallenge, currentChallenge, setChallenges, isChallengeCompleted } = useGameStore();

  useEffect(() => {
    setChallenges(challenges);
  }, [setChallenges]);

  const challengeIndex = challenges.findIndex(c => c.id === id);
  const challenge = challenges[challengeIndex];

  // Compute completion state
  const completedIndexes = challenges
    .map((c, i) => (isChallengeCompleted(c.id) ? i : -1))
    .filter(i => i !== -1);

  const completedCount = completedIndexes.length;
  const maxUnlockedBase = 3;
  const dynamicUnlockLimit = maxUnlockedBase + completedCount - 1;

  const isUnlocked =
    challenge &&
    challenge.unlocked &&
    challengeIndex <= dynamicUnlockLimit;

  useEffect(() => {
    if (!id || !isUnlocked) return;

    selectChallenge(id);

    return () => {
      setCurrentChallenge(null);
    };
  }, [id, isUnlocked, selectChallenge, setCurrentChallenge]);

  if (!challenge || !isUnlocked) {
    return <Navigate to="/" replace />;
  }

  if (!currentChallenge) {
    return <div className="text-white p-4">Loading challenge...</div>;
  }

  return <GameView />;
}

export function Routes() {
  return (
    <RouterRoutes>
      <Route path="/" element={<ChallengePathView />} />
      <Route path="/challenge/:id" element={<ChallengeRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </RouterRoutes>
  );
}

