import { motion } from 'framer-motion';
import { useGameStore } from '../orchestrator/store';
import { useCurrentChallenge } from '../orchestrator/selectors';
import { useEffect } from 'react';
import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { soundManager } from "../audio/soundManager";
import enterMp3 from '../assets/sounds/enter.mp3';
import backMp3 from '../assets/sounds/back.mp3';

export function SuccessOverlay() {
  const challenge = useCurrentChallenge();
  const dismissSuccessHint = useGameStore((s) => s.dismissSuccessHint);
  const validationResult = useGameStore((s) => s.validationResult);
  const navigate = useNavigate();
    const { trainId } = useParams<{ trainId: string }>();

  const SUCCESS_LINES = [
    'Your presence is requested in the next compartment.',
    'Tickets verified. You may proceed.',
    'The next compartment needs your attention.',
    'Compartment cleared. Advance when ready.',
    'All conditions satisfied. You may advance.',
    'Proceed when ready.',
  ];
  
  const currentCompletionResult =
    useGameStore(
      (s) => s.currentCompletionResult
    );

  const runResult =
    currentCompletionResult ?? {
      speed: false,
      noHints: false,
      optimal: false,
    };

  if (!challenge) return null;

  const successLine = useMemo(() => {
    return SUCCESS_LINES[
      Math.floor(Math.random() * SUCCESS_LINES.length)
    ];
  }, [challenge.id]);
  

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dismissSuccessHint();
      }
      if (e.key === 'Enter' || e.key === 'NumpadEnter') {
        e.preventDefault();
        navigate(`/train/${trainId}`)
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dismissSuccessHint, navigate]);
  
  useEffect(() => {
    soundManager.register('enter', enterMp3)
    soundManager.register('back', backMp3)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center"
      onClick={dismissSuccessHint}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative bg-gray-900 rounded-xl p-4 sm:p-8 w-[88%] sm:w-[92%] max-w-xl border 
        border-green-600"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lm sm:text-2xl font-bold text-green-400 mb-2">
            <strong>{challenge.title}</strong> ✔
        </h2>

        {/* Validation panel */}
        <div className="rounded-lg bg-white/5 p-3 sm:p-4 mb-4 sm:mb-6 border border-white/10">
          <p className="text-xs sm:text-base text-gray-200">
            {validationResult?.message}
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-1 sm:gap-2 text-[10px] sm:text-sm">

              {/* Optimization Badge (Using your "stars.optimal" state if applicable, or validationResult) */}
              {challenge.maxSteps && (
                <span
                  className={`px-1.5 sm:px-2.5 sm:py-1 rounded border flex items-center gap-1.5 font-medium transition-colors ${
                    validationResult?.optimized
                      ? 'bg-green-500/10 border-green-500/30 text-green-400'
                      : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>{validationResult?.optimized ? 'Optimized' : 'Optimized'}</span>
                  <span className="font-bold">{validationResult?.optimized ? '✓' : '✗'}</span>
                </span>
              )}

              {/* Speed Star Badge */}
              <span
                className={`px-1.5 py-1 rounded border flex items-center gap-1.5 font-medium transition-colors ${
                  runResult.speed
                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                    : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Time </span>
                <span className="font-bold">{runResult.speed ? '✓' : '✗'}</span>
              </span>

              {/* No Hints Star Badge */}
              <span
                className={`px-1.5 py-1 rounded border flex items-center gap-1.5 font-medium transition-colors ${
                  runResult.noHints
                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                    : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>No Hints</span>
                <span className="font-bold">{runResult.noHints ? '✓' : '✗'}</span>
              </span>
          </div>
        </div>

        <p className="text-xs sm:text-base text-gray-300 mb-4 sm:mb-8">
          {successLine}
        </p>

        {/* Footer buttons */}
        <div className="flex justify-between items-center mt-4 sm:mt-8">
          {/* Back = close overlay */}
          <button
            onClick={() => {
              soundManager.play('back');
            
              dismissSuccessHint();
            }}
            className="text-xs sm:text-sm text-gray-400 hover:text-white transition"
          >
            ← Back
          </button>

          {/* Continue */}
          <button
            onClick={() => {
              soundManager.play('enter');

              navigate(`/train/${trainId}`);
            }}
            className="
              rounded-md bg-green-500 px-4 py-2
              text-xs sm:text-sm font-semibold text-black
              hover:bg-green-400 transition
            "
          >
            {/* Mobile */}
            <span className="sm:hidden">Continue →</span>

            {/* Desktop */}
            <span className="hidden sm:inline">
              Continue to next compartment →
            </span>
          </button>

        </div>
      </motion.div>
    </motion.div>
  );
}
