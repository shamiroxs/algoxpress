// paletteConfig.ts
import { InstructionType } from '../../engine/instructions/types';

export interface PaletteInstructionConfig {
  type: InstructionType;
  label: string;
  description?: string;
  pointer?: 'MOCO' | 'CHOCO' | 'LOCO';
  category: 'Movement' | 'Action' | 'Control' | 'Value' | 'Misc';
}

export const PALETTE_CONFIG: PaletteInstructionConfig[] = [
  // ─── Movement ────────────────────────────────
  {
    type: InstructionType.MOVE_LEFT,
    label: 'Move Left',
    pointer: 'MOCO',
    category: 'Movement',
  },
  {
    type: InstructionType.MOVE_RIGHT,
    label: 'Move Right',
    pointer: 'MOCO',
    category: 'Movement',
  },
  {
    type: InstructionType.MOVE_TO_END,
    label: 'Move To End',
    pointer: 'MOCO',
    category: 'Movement',
  },

  // ─── Actions ─────────────────────────────────
  {
    type: InstructionType.PICK,
    label: 'Pick',
    pointer: 'MOCO',
    category: 'Action',
  },
  {
    type: InstructionType.PUT,
    label: 'Put',
    pointer: 'MOCO',
    category: 'Action',
  },
  {
    type: InstructionType.SWAP,
    label: 'Swap',
    category: 'Action',
  },
  {
    type: InstructionType.SWAP_WITH_NEXT,
    label: 'Swap With Next',
    pointer: 'MOCO',
    category: 'Action',
  },

  // ─── Control ─────────────────────────────────
  {
    type: InstructionType.IF_GREATER,
    label: 'If Greater',
    pointer: 'MOCO',
    category: 'Control',
  },
  {
    type: InstructionType.IF_LESS,
    label: 'If Less',
    pointer: 'MOCO',
    category: 'Control',
  },
  {
    type: InstructionType.IF_EQUAL,
    label: 'If Equal',
    pointer: 'MOCO',
    category: 'Control',
  },
  {
    type: InstructionType.IF_NOT_EQUAL,
    label: 'If Not Equal',
    pointer: 'MOCO',
    category: 'Control',
  },
  {
    type: InstructionType.JUMP,
    label: 'Jump',
    category: 'Control',
  },
  {
    type: InstructionType.LABEL,
    label: 'Label',
    category: 'Control',
  },

  // ─── Value ───────────────────────────────────
  {
    type: InstructionType.INCREMENT_VALUE,
    label: 'Increment',
    pointer: 'MOCO',
    category: 'Value',
  },
  {
    type: InstructionType.DECREMENT_VALUE,
    label: 'Decrement',
    pointer: 'MOCO',
    category: 'Value',
  },
  {
    type: InstructionType.SET_VALUE,
    label: 'Set Value',
    pointer: 'MOCO',
    category: 'Value',
  },

  // ─── Misc ────────────────────────────────────
  {
    type: InstructionType.WAIT,
    label: 'Wait',
    category: 'Misc',
  },
];
