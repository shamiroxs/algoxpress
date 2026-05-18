import { motion } from 'framer-motion';
import { useState } from 'react';
import clsx from 'clsx';

type Mood = 'good' | 'need_improvement' | 'bad';

type Props = {
  expanded: boolean;
  submitted: boolean;
  selectedMood?: Mood | null;
  onMoodSelect: (mood: Mood) => void;
  onSubmit: (note: string) => void;
};

export function FeedbackCard({
  expanded,
  submitted,
  selectedMood,
  onMoodSelect,
  onSubmit,
}: Props) {
  const [note, setNote] = useState('');

  // Final submitted state
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          w-32 sm:w-48 rounded-xl sm:rounded-2xl
          border border-emerald-500/30
          bg-emerald-500/10
          p-2 sm:p-4 shadow-lg
          backdrop-blur-sm
        "
      >
        <p className="text-[10px] sm:text-sm font-semibold text-emerald-300">
          ✓ Feedback Recieved
        </p>

        <p className="sm:mt-1 text-[9px] sm:text-xs text-emerald-100/80">
          Thanks, conductor.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        ease: 'easeOut',
      }}
      className="
        w-54 rounded-xl sm:rounded-2xl
        border border-gray-700
        bg-gray-800/95
        p-2 sm:p-4 shadow-xl
        backdrop-blur-sm
      "
    >
      {/* Header */}
      <div>
        <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.1em] sm:tracking-[0.2em] text-indigo-300">
          Checkpoint
        </p>

        <p className="mt-2 text-[10px] sm:text-sm leading-relaxed text-gray-200">
          How’s the journey so far?
        </p>
      </div>

      {/* Mood Buttons */}
      <div className="mt-1 sm:mt-4 flex items-center justify-between gap-1.5 sm:gap-2">
        <button
          onClick={() => onMoodSelect('good')}
          className={clsx(
            'flex-1 rounded-lg sm:rounded-xl border px-1.5 py-1 sm:px-3 sm:py-2 text-base sm:text-xl transition-all',
            selectedMood === 'good'
              ? 'border-green-400 bg-green-500/20'
              : 'border-gray-700 bg-gray-900/40 hover:border-gray-500'
          )}
        >
          🙂
        </button>

        <button
          onClick={() => onMoodSelect('need_improvement')}
          className={clsx(
            'flex-1 rounded-lg sm:rounded-xl border px-1.5 py-1 sm:px-3 sm:py-2 text-base sm:text-xl transition-all',
            selectedMood === 'need_improvement'
              ? 'border-yellow-400 bg-yellow-500/20'
              : 'border-gray-700 bg-gray-900/40 hover:border-gray-500'
          )}
        >
          😐
        </button>

        <button
          onClick={() => onMoodSelect('bad')}
          className={clsx(
            'flex-1 rounded-lg sm:rounded-xl border px-1.5 py-1 sm:px-3 sm:py-2 text-base sm:text-xl transition-all',
            selectedMood === 'bad'
              ? 'border-red-400 bg-red-500/20'
              : 'border-gray-700 bg-gray-900/40 hover:border-gray-500'
          )}
        >
          😵
        </button>
      </div>

      {/* Expanded Section */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
        >
          <div className="mt-2 sm:mt-4">
            <p className="mb-1 sm:mb-2 text-[10px] sm:text-xs text-gray-400">
              How can we improve?
            </p>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional notes..."
              rows={3}
              className="
                w-full resize-none rounded-xl
                border border-gray-700
                bg-gray-900/60
                px-1.5 py-0.5 sm:px-3 sm:py-2 text-[11px] sm:text-sm text-white
                placeholder:text-gray-500
                outline-none transition-colors
                focus:border-indigo-500

                h-8 sm:h-24
              "
            />

            <button
              onClick={() => onSubmit(note)}
              className="
                mt-2 sm:mt-3 w-full rounded-lg sm:rounded-xl
                bg-indigo-500 px-2 py-1 sm:px-4 sm:py-2
                text-xs sm:text-sm font-medium text-white
                transition-colors
                hover:bg-indigo-400
              "
            >
              Send Report
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}