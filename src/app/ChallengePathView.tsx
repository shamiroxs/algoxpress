/**
 * Duolingo-style vertical challenge path
 * Level 1 at the top, progressing downward
 */

//import { challenges } from '../engine/challenges/challenges';
import { useGameStore } from '../orchestrator/store';
import { useNavigate } from 'react-router-dom';
import { Difficulty } from '../engine/challenges/types';
import { motion } from 'framer-motion';
import clsx from 'clsx';

import { useParams } from 'react-router-dom';
import { challengesByTrain } from '../engine/challenges';

export function ChallengePathView() {
  const { trainId } = useParams<{ trainId: string }>();

  const challenges = challengesByTrain[trainId || 'array-train'] || [];
  const { isChallengeCompleted } = useGameStore();

  const navigate = useNavigate();

  const getNodeColor = (
    difficulty: Difficulty,
    unlocked: boolean,
    completed: boolean,
    index: number
  ) => {
    // Option A: completed challenge
    if (completed) return 'bg-indigo-500';

    // Locked challenge
    if (!unlocked) return 'bg-gray-700';

    // Tutorial
    if (index === 0) return 'bg-cyan-600'

    // Unlocked but not completed
    switch (difficulty) {
      case Difficulty.EASY:
        return 'bg-green-500';
      case Difficulty.MEDIUM:
        return 'bg-yellow-500';
      case Difficulty.HARD:
        return 'bg-red-500';
    }
  };

  const nextChallengeIndex = challenges.findIndex(
    c => c.unlocked && !isChallengeCompleted(c.id)
  );
  
  const completedIndexes = challenges
  .map((c, i) => (isChallengeCompleted(c.id) ? i : -1))
  .filter(i => i !== -1);

  const lastCompletedIndex =
    completedIndexes.length > 0
      ? Math.max(...completedIndexes)
      : -1;

  // Percentage of path completed
  const progressPercent =
    lastCompletedIndex >= 0
      ? ((lastCompletedIndex + 1) / challenges.length) * 100
      : 0;

  const maxUnlockedBase = 3;

  // Number of completed challenges
  const completedCount = completedIndexes.length;

  // Sliding window end index
  const dynamicUnlockLimit = maxUnlockedBase + completedCount - 1;

  const unlockedPercent = Math.min(
    ((dynamicUnlockLimit + 1) / challenges.length) * 100, 
    100
  );

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 relative">
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 text-gray-400 hover:text-white"
        >
        ← Back to Station
        </button>
      <div className="max-w-xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2 text-center">
          Algorithm Express
        </h1>
        <p className="text-gray-400 mb-12 text-center">
          Enter into your compartment
        </p>

        <div className="relative flex flex-col items-center">
          {/* 1. Base Dashed Line (Visible only for locked nodes) */}
          <div 
            className="absolute top-0 bottom-0 border-l-[3px] sm:border-l-[4px] border-dashed border-gray-700" 
          />
          
          {/* 2. Unlocked Path Overlay (Solid Gray covering dashes) */}
          <div
            className="absolute top-0 w-[3px] sm:w-[4px] bg-gray-600 transition-all duration-500"
            style={{ 
              height: `${unlockedPercent}%`, 
            }}
          />

          {/* 3. Completed Path Overlay (Solid Indigo) */}
          <div
            className="absolute top-0 w-[3px] sm:w-[4px] bg-indigo-500 transition-all duration-500"
            style={{ 
              height: `${progressPercent}%`,
              transition: 'height 0.4s ease-out',
            }}
          />

          {challenges.map((challenge, index) => {
            const isNext = index === nextChallengeIndex;

            const isCompleted = isChallengeCompleted(challenge.id);

            // Hard lock (never unlock if false)
            const isHardLocked = !challenge.unlocked;

            // Dynamic unlock window
            const isWithinWindow = index <= dynamicUnlockLimit;

            // Final unlock state
            const isUnlocked = !isHardLocked && isWithinWindow;

            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, scale: 0.5, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 200, 
                  damping: 15, 
                  delay: index * 0.08 
                }}
                className="relative z-10 flex flex-col items-center mb-10 sm:mb-16 overflow-visible"
              >
                
                {/* Node */}
                <motion.button
                  disabled={!isUnlocked}
                  onClick={() =>
                    isUnlocked && navigate(`/train/${trainId}/challenge/${challenge.id}`)
                  }
                  animate={
                    isNext
                      ? {
                          scale: [1, 1.15, 1],
                          boxShadow: [
                            '0 0 0px rgba(99,102,241,0)',
                            '0 0 25px rgba(99,102,241,0.8)',
                            '0 0 0px rgba(99,102,241,0)',
                          ],
                        }
                      : {}
                  }
                  transition={
                    isNext
                      ? {
                          repeat: Infinity,
                          duration: 1.5,
                          ease: 'easeInOut',
                        }
                      : {}
                  }
                  className={clsx(
                    'w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center',
                    'text-white font-bold shadow-lg',
                    isUnlocked && 'hover:scale-105',
                    getNodeColor(
                      challenge.difficulty,
                      isUnlocked,
                      isCompleted,
                      index
                    )
                  )}
                >
                  {index}
                </motion.button>


                {/* Title */}
                <div className="absolute left-14 sm:left-20 top-1/2 -translate-y-1/2 w-64 text-left whitespace-normal">
                  <p
                    className={clsx(
                      'font-semibold text-sm sm:text-base',
                      isUnlocked
                        ? 'text-white'
                        : 'text-gray-500'
                    )}
                  >
                    {challenge.title}
                  </p>
                </div>

                {/* Status indicators */}
                {!isUnlocked && (
                  <div className="absolute -bottom-6 text-gray-500 text-xs">
                    🔒 Locked
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
