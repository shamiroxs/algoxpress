/**
 * Challenge definition types
 */

import type { Instruction } from '../instructions/types';
import type { InstructionType } from '../instructions/types';
import type { PointerTarget } from '../instructions/types';

export interface InstructionCapabilities {
  /** Which pointers are available in this challenge */
  allowedPointers: PointerTarget[];

  /** Instructions user can place */
  allowedInstructions: InstructionType[];

  /**
   * Extra instructions shown for inspiration.
   * These are UI-visible but still must be allowed to be used.
   */
  suggestedInstructions?: InstructionType[];
}

export const Difficulty = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
} as const;

export type Difficulty = typeof Difficulty[keyof typeof Difficulty];

export interface Challenge {
  id: string;
  title: string;
  description: string;
  hints: string[];
  difficulty: Difficulty;
  initialArray: number[];
  targetArray: number[];
  maxSteps?: number; // Optional optimization goal
  initialPointers?: {
    MOCO?: number;
    CHOCO?: number;
  };
  clipboard?: boolean ;
  initialHand?: number | null;
  instructions: Instruction[]; // Starting instructions (can be empty)
  unlocked: boolean;
  capabilities: InstructionCapabilities;
}

export interface ChallengeProgress {
  challengeId: string;
  completed: boolean;
  bestStepCount?: number;
  completedAt?: number;
}

