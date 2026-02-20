// src/tutorial/InlineInstructionIcon.tsx
import { InstructionType } from '../engine/instructions/types';

const ICON_LABELS: Record<InstructionType, string> = {
  PICK: 'Copy',
  MOVE_RIGHT: 'Right →',
  PUT: 'Paste',
  MOVE_LEFT: 'MOVE_LEFT',
  MOVE_TO_END: 'MOVE_TO_END',

  SET_VALUE: 'SET_VALUE',
  SET_POINTER: 'SET_POINTER',

  IF_GREATER: 'IF_GREATER',
  IF_LESS: 'IF_LESS',
  IF_EQUAL: 'IF_EQUAL',
  IF_NOT_EQUAL: 'IF_NOT_EQUAL',
  IF_END: 'IF_END',
  IF_MEET: 'IF_MEET',
  IF_EVEN: 'IF_EVEN',

  JUMP: 'JUMP',
  LABEL: 'LABEL',

  SWAP: 'SWAP',
  SWAP_WITH_NEXT: 'SWAP_WITH_NEXT',

  INCREMENT_VALUE: 'INCREMENT_VALUE',
  DECREMENT_VALUE: 'DECREMENT_VALUE',

  WAIT: 'WAIT',
};

export function InlineInstructionIcon({
  type,
}: {
  type: InstructionType;
}) {
  return (
    <span
      className="
        inline-flex items-center
        px-2 py-0.5 mx-1
        rounded-md
        bg-blue-700 text-white
        font-mono text-xs
        align-middle
      "
    >
      {ICON_LABELS[type]}
    </span>
  );
}
