import { motion } from 'framer-motion';
import { useGameStore } from '../orchestrator/store';
import { useCurrentChallenge } from '../orchestrator/selectors';
import { useEffect } from 'react';

export function SuccessOverlay() {
  const challenge = useCurrentChallenge();
  const dismissSuccessHint = useGameStore((s) => s.dismissSuccessHint);
  const setCurrentChallenge = useGameStore((s) => s.setCurrentChallenge);

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
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
      onClick={dismissSuccessHint}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative bg-gray-900 rounded-xl p-6 sm:p-8 w-[80%] sm:w-[92%] max-w-xl border border-green-600"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lm sm:text-2xl font-bold text-green-400 mb-2">
            <strong>{challenge.title}</strong> ✔
        </h2>

        <p className="text-xs sm:text-base text-gray-300 mb-6">
            Your presence is requested in the next compartment.
        </p>

        {/* Footer buttons */}
        <div className="flex justify-between items-center mt-8">
          {/* Back = close overlay */}
          <button
            onClick={dismissSuccessHint}
            className="text-xs sm:text-base text-gray-400 hover:text-white"
          >
            ← Back
          </button>

          {/* Continue */}
          <button
            onClick={() => setCurrentChallenge(null)}
            className="text-xs sm:text-base text-green-400 hover:text-green-300 font-semibold"
          >
            Continue to next compartment →
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
