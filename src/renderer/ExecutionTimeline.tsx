/**
 * Execution timeline visualization
 * Shows current instruction and step count
 */

import { motion } from 'framer-motion';
import type { Instruction } from '../engine/instructions/types';
import { InstructionType } from '../engine/instructions/types';
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
  currentInstruction,
}: ExecutionTimelineProps) {
  const validationResult = useGameStore((s) => s.validationResult);
  const successHintDismissed = useGameStore((s) => s.successHintDismissed);

  const rewindHintShown = useGameStore((s) => s.rewindHintShown);
  
  const showSuccessHint =
    validationResult?.success &&
    !rewindHintShown &&
    !successHintDismissed;
  
  return (   
    <div className="execution-timeline bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-400">
          Step:{' '} 
          <span className="text-white font-semibold">{stepCount}</span>
        </div>
        <div className="text-sm text-gray-400">
          Line:{' '}
          <span className="text-white font-semibold">
            {currentLine + 1}
          </span>{' '}
          / {totalLines}
        </div>
      </div>

      {currentInstruction && (
        <motion.div
          className="bg-blue-900/30 border border-blue-500 rounded p-3"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-xs text-blue-300 mb-1">
            Current Instruction
          </div>
          <div className="text-white font-mono text-sm">
            {formatInstruction(currentInstruction)}
          </div>
        </motion.div>
      )}

      {showSuccessHint && (
        <motion.div
          className="mt-3 bg-green-900/30 border border-green-500 rounded p-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-sm text-green-300">
            You can replay the last few steps to see how you cleared.
          </div>
        </motion.div>
      )}
    </div>
  );
}

/**
 * Converts instruction into readable string for UI
 */
function formatInstruction(instruction: Instruction): string {
  const pointer =
    (instruction as any).pointer === 'MOCO'
      ? '[MOCO] '
      : (instruction as any).pointer === 'CHOCO'
      ? '[CHOCO] '
      : '';

  switch (instruction.type) {
    case InstructionType.MOVE_LEFT:
      return `${pointer}← Left`;

    case InstructionType.MOVE_RIGHT:
      return `${pointer}Right →`;

    case InstructionType.MOVE_TO_END:
      return `${pointer}ToEnd →→`;

    case InstructionType.SET_POINTER:
      return `${pointer}Goto ${instruction.index}`;

    case InstructionType.SET_VALUE:
      return `${pointer}Set ${instruction.value}`;

    case InstructionType.PICK:
      return `${pointer}Copy`;

    case InstructionType.PUT:
      return `${pointer}Paste`;

    case InstructionType.IF_GREATER:
      return `${pointer}IFGreat`;

    case InstructionType.IF_LESS:
      return `${pointer}IFLess`;

    case InstructionType.IF_EQUAL:
      return `${pointer}IFEqual`;
    case InstructionType.IF_NOT_EQUAL:
      return `${pointer}IFNotEqual`;

    case InstructionType.IF_END:
      return `${pointer}IFEnd ${instruction.label}`;

    case InstructionType.IF_MEET:
      return `${pointer}IFMeet ${instruction.label}`;

    case InstructionType.JUMP:
      return `${pointer}Jump ${instruction.label}`;

    case InstructionType.LABEL:
      return `${instruction.labelName}:`;

    case InstructionType.SWAP:
      return `${pointer}Swap ⇄`;

    case InstructionType.SWAP_WITH_NEXT:
      return `${pointer}SwapNext →←`;

    case InstructionType.INCREMENT_VALUE:
      return `${pointer}Value +`;

    case InstructionType.DECREMENT_VALUE:
      return `${pointer}Value -`;

    case InstructionType.WAIT:
      return `${pointer}Wait`;

    default:
      return 'UNKNOWN';
  }
}
