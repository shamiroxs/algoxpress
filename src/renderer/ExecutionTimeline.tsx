/**
 * Execution timeline visualization
 * Shows current instruction and step count
 */

import { motion } from 'framer-motion';
import type { Instruction } from '../engine/instructions/types';
import { useGameStore } from '../orchestrator/store';

interface ExecutionTimelineProps {
  currentLine: number;
  totalLines: number;
  stepCount: number;
  currentInstruction: Instruction | null;
}

export function ExecutionTimeline({
  currentLine,
  totalLines,
  stepCount,
}: ExecutionTimelineProps) {
  const validationResult = useGameStore((s) => s.validationResult);
  const successHintDismissed = useGameStore((s) => s.successHintDismissed);

  const rewindHintShown = useGameStore((s) => s.rewindHintShown);

  const showSuccessHint =
    validationResult?.success &&
    !rewindHintShown &&
    !successHintDismissed;
  
  return (   
    <div className="execution-timeline bg-gray-900 rounded-lg px-4">
      <div className="flex items-center justify-between">
        <div className="text-xs sm:text-sm text-gray-400">
          Step:{' '} 
          <span className="text-white font-semibold">{stepCount}</span>
        </div>
        <div className="text-xs sm:text-sm text-gray-400">
          Line:{' '}
          <span className="text-white font-semibold">
            {currentLine + 1}
          </span>{' '}
          / {totalLines}
        </div>
      </div>

      {showSuccessHint && (
        <motion.div
          className="mt-1 sm:mt-3 bg-green-900/30 border border-green-500 rounded p-2 sm:p-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-xs sm:text-sm text-green-300">
            You can replay the last few steps to see how you cleared.
          </div>
        </motion.div>
      )}
    </div>
  );
}
