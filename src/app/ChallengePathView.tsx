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

import { FeedbackCard } from './FeedbackCard';
import { SupportCard } from './SupportCard';

import { useEffect, useRef } from 'react';

import { 
  trackFeedbackCardOpened,
  trackFeedbackSubmitted,
  trackFeedbackMoodSelected,
  
  trackSupportCardClicked,
  trackSupportCardViewed
 } from '../analytics/integrations/storeAnalytics';

import { submitFeedback } from '../utils/feedbackTracter';

import { soundManager } from '../audio/soundManager';
import enterChallengeMp3 from '../assets/sounds/enterChallenge.mp3';
import backMp3 from '../assets/sounds/back.mp3';

export function ChallengePathView() {

  const feedbackTrackedRef = useRef(false);
  const supportTrackedRef = useRef(false);

  const { trainId } = useParams<{ trainId: string }>();

  const challenges = challengesByTrain[trainId || 'array-train'] || [];
  const {
    isChallengeCompleted,
    checkpointFeedback,
    setCheckpointMood,
    submitCheckpointFeedback,
  } = useGameStore();

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

  const getChallengeStars =
    useGameStore((s) => s.getChallengeStars);

  const totalStars = challenges.reduce((total, challenge) => {
    const stars = getChallengeStars(challenge.id);
  
    return (
      total +
      (stars.speed ? 1 : 0) +
      (stars.noHints ? 1 : 0) +
      (stars.optimal ? 1 : 0)
    );
  }, 0);
  
  const LEVELS = [
    {
      title: 'Trainee Passenger',
      threshold: 0,
    },
    {
      title: 'Naive Conductor',
      threshold: 3,
    },
    {
      title: 'Ticket Inspector',
      threshold: 15,
    },
    {
      title: 'Route Dispatcher',
      threshold: 30,
    },
    {
      title: 'Master Rail Architect',
      threshold: 42,
    },
  ];
  
  const currentLevel =
    [...LEVELS]
      .reverse()
      .find(level => totalStars >= level.threshold)!;
  
  const currentLevelIndex =
    LEVELS.findIndex(
      level => level.title === currentLevel.title
    );
  
  const nextLevel =
    LEVELS[currentLevelIndex + 1] ?? null;
  
  const progressToNextLevel = nextLevel
    ? (
        ((totalStars - currentLevel.threshold) /
          (nextLevel.threshold -
            currentLevel.threshold)) *
        100
      )
    : 100;

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
  const handleCheckpointSubmit = (
    note: string
  ) => {
    const mood =
      checkpointFeedback.mood ??
      'unknown';

    trackFeedbackSubmitted({
      challengeId:
        challenges[lastCompletedIndex]?.id,
  
      concepts:
        challenges[lastCompletedIndex]
          ?.concepts,
  
      mood:
        checkpointFeedback.mood ??
        'unknown',
  
      checkpointIndex: 5,
  
      completedChallenges:
        completedCount,
  
      hasNote: note.trim().length > 0,
  
      noteLength:
        note.trim().length,
    });

    submitFeedback({
      challengeId:
        challenges[lastCompletedIndex]?.id,
  
      mood,
  
      note,
  
      completedChallenges:
        completedCount,
    })
  
    submitCheckpointFeedback(note);
  };

  const handleMoodSelect = (
    mood: 'good' | 'need_improvement' | 'bad'
  ) => {
    trackFeedbackMoodSelected({
      challengeId:
        challenges[lastCompletedIndex]?.id,
  
      concepts:
        challenges[lastCompletedIndex]
          ?.concepts,
  
      mood,
  
      checkpointIndex: 5,
    });
  
    setCheckpointMood(mood);
  };

  const shouldShowCheckpoint =
    completedCount >= 3
  const shouldShowSupportCard =
    completedCount >= 8;

  const handleSupportClick = (
    previouslySupported: boolean
  ) => {
    trackSupportCardClicked({
      challengeId:
        challenges[lastCompletedIndex]?.id,

      concepts:
        challenges[lastCompletedIndex]
          ?.concepts,

      completedChallenges:
        completedCount,

      previouslySupported,
    });
  };
  useEffect(() => {
    soundManager.register('enter', enterChallengeMp3)
    soundManager.register('back', backMp3)
  }, [])

    useEffect(() => {
      if (
        shouldShowCheckpoint &&
        !feedbackTrackedRef.current
      ) {
        feedbackTrackedRef.current = true;
    
        trackFeedbackCardOpened({
          challengeId: challenges[lastCompletedIndex]?.id,
    
          concepts:
            challenges[lastCompletedIndex]
              ?.concepts,
    
          checkpointIndex: 5,
        });
      }
    }, [
      shouldShowCheckpoint,
      challenges,
      lastCompletedIndex,
    ]);
    useEffect(() => {
      if (
        shouldShowSupportCard &&
        !supportTrackedRef.current
      ) {
        supportTrackedRef.current = true;
    
        trackSupportCardViewed({
          challengeId:
            challenges[lastCompletedIndex]?.id,
    
          concepts:
            challenges[lastCompletedIndex]
              ?.concepts,
    
          completedChallenges:
            completedCount,
        });
      }
    }, [
      shouldShowSupportCard,
      challenges,
      lastCompletedIndex,
      completedCount,
    ]);
  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 relative">
      <button
        onClick={() => {
          soundManager.play('back');
        
          navigate('/');
        }}
        className="absolute top-4 left-4 text-gray-400 hover:text-white"
        >
        ← Back to Station
        </button>
        <div className="absolute top-4 right-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 min-w-[180px] shadow-lg">
            
            <div className="flex justify-between items-center">
              <span className="text-yellow-400 text-[10px] font-bold">
                ⭐ {totalStars}
              </span>

              <span className="text-[10px] text-gray-400">
                Rank
              </span>
            </div>

            <div className="text-white font-semibold text-xs">
              {currentLevel.title}
            </div>
            <div className="mt-2 relative h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 transition-all duration-500"
                style={{
                  width: `${progressToNextLevel}%`,
                }}
              />

              {nextLevel && (
                <div className="absolute inset-0 flex items-center justify-end pr-2 text-[10px] text-white">
                  {totalStars} / {nextLevel.threshold}
                </div>
              )}
            </div>
            
          </div>
        </div>
      <div className="max-w-xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2 text-center">
          Array Express
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

            const stars = getChallengeStars(challenge.id);

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
                  onClick={() => {
                    if (!isUnlocked) return;
                
                    soundManager.play('enter');
                
                    navigate(`/train/${trainId}/challenge/${challenge.id}`);
                  }}
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

                {/* Conductor Checkpoint */}
                {index === 5 && shouldShowCheckpoint && (
                  <div className="absolute right-full mr-4 sm:mr-6 top-1/2 -translate-y-1/2">
                    <FeedbackCard
                      expanded={!!checkpointFeedback.mood}
                      submitted={checkpointFeedback.submitted}
                      selectedMood={checkpointFeedback.mood}
                      onMoodSelect={handleMoodSelect}
                      onSubmit={handleCheckpointSubmit}
                    />
                  </div>
                )}

                {/* Support Development Card */}
                {index === 10 && shouldShowSupportCard && (
                  <div className="absolute right-full mr-4 sm:mr-6 top-1/2 -translate-y-1/2">
                    <SupportCard
                      onSupportClick={
                        handleSupportClick
                      }
                    />
                  </div>
                )}
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
                  {isUnlocked && (
                    <div className="flex gap-2 mt-1 text-xs">
                      <span
                        title="Completed within time"
                        className={
                          stars.speed
                            ? ''
                            : 'opacity-30'
                        }
                      >
                        ⭐
                      </span>

                      <span
                        title="No hints used"
                        className={
                          stars.noHints
                            ? ''
                            : 'opacity-30'
                        }
                      >
                        ⭐
                      </span>

                      <span
                        title="Optimal solution"
                        className={
                          stars.optimal
                            ? ''
                            : 'opacity-30'
                        }
                      >
                        ⭐
                      </span>
                    </div>
                  )}
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
