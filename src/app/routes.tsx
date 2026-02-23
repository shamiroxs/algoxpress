import { Routes as RouterRoutes, Route, Navigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { challenges } from '../engine/challenges/challenges';
import { useGameStore } from '../orchestrator/store';
import { GameView } from './GameView';
import { ChallengePathView } from './ChallengePathView';

function ChallengeRoute() {
  const { id } = useParams<{ id: string }>();
  const { selectChallenge, setCurrentChallenge, currentChallenge, setChallenges } = useGameStore();

  useEffect(() => {
    setChallenges(challenges);
  }, [setChallenges]);

  useEffect(() => {
    if (id) {
      selectChallenge(id);
    }
  
    return () => {
      setCurrentChallenge(null);
    };
  }, [id, selectChallenge, setCurrentChallenge]);

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

