import { motion } from 'framer-motion';
import { useGameStore } from '../orchestrator/store';
import { useCurrentChallenge } from '../orchestrator/selectors';
import { useEffect } from 'react';

export function SuccessOverlay() {
  const challenge = useCurrentChallenge();
  const dismissSuccessHint = useGameStore((s) => s.dismissSuccessHint);
  const setCurrentChallenge = useGameStore((s) => s.setCurrentChallenge);
  const validationResult = useGameStore((s) => s.validationResult);

  if (!challenge) return null;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dismissSuccessHint();
      }
      if (e.key === 'Enter' || e.key === 'NumpadEnter') {
        e.preventDefault();
        setCurrentChallenge(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dismissSuccessHint, setCurrentChallenge]);
  
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
        className="relative bg-gray-900 rounded-xl p-6 sm:p-8 w-[80%] sm:w-[92%] max-w-xl border 
        border-green-600"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lm sm:text-2xl font-bold text-green-400 mb-2">
            <strong>{challenge.title}</strong> ✔
        </h2>

        {/* Validation panel */}
        <div className="rounded-lg bg-white/5 p-4 mb-6 border border-white/10">
          <p className="text-sm text-gray-200">
            {validationResult?.message}
          </p>

          <div className="text-xs sm:text-sm text-gray-400">
            <span>Steps: {validationResult?.stepCount}</span>
            {challenge.maxSteps && (
              <span
                className={
                  validationResult?.optimized
                    ? 'text-green-400'
                    : 'text-yellow-400'
                }
              >
                {' '}
                • {validationResult?.optimized ? 'Optimized ✔' : 'Can be optimized x'}
              </span>
            )}
          </div>
        </div>

        <p className="text-xs sm:text-base text-gray-300 mb-8">
            Your presence is requested in the next compartment.
        </p>

        {/* Footer buttons */}
        <div className="flex justify-between items-center mt-8">
          {/* Back = close overlay */}
          <button
            onClick={dismissSuccessHint}
            className="text-xs sm:text-sm text-gray-400 hover:text-white transition"
          >
            ← Back
          </button>

          {/* Continue */}
          <button
            onClick={() => setCurrentChallenge(null)}
            className="
              rounded-md bg-green-500 px-5 py-2
              text-xs sm:text-sm font-semibold text-black
              hover:bg-green-400 transition
            "
          >
            Continue to next compartment →
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
