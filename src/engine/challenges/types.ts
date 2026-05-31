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

export const ConceptTag = {
  COPY: 'COPY',
  SWAP: 'SWAP',
  POINTER_MOVEMENT: 'POINTER_MOVEMENT',
  CONDITIONALS: 'CONDITIONALS',
  LINEAR_SCAN: 'LINEAR_SCAN',
  TWO_POINTERS: 'TWO_POINTERS',
  THREE_POINTERS: 'THREE_POINTERS',
  PARTITIONING: 'PARTITIONING',
  STABLE_PARTITION: 'STABLE_PARTITION',
  BUBBLE_SORT_PASS: 'BUBBLE_SORT_PASS',
  ARRAY_ROTATION: 'ARRAY_ROTATION',
  REVERSAL: 'REVERSAL',
  SEARCH: 'SEARCH',
  MAXIMUM_SELECTION: 'MAXIMUM_SELECTION',
  DUPLICATE_DETECTION: 'DUPLICATE_DETECTION',
  SORT_VALIDATION: 'SORT_VALIDATION',
  WIGGLE_PATTERN: 'WIGGLE_PATTERN',
  DUTCH_FLAG: 'DUTCH_FLAG',
  NEXT_PERMUTATION: 'NEXT_PERMUTATION',
  NESTED_SCAN: 'NESTED_SCAN'
} as const;

export type ConceptTag =
  typeof ConceptTag[keyof typeof ConceptTag];

export const AlgorithmPattern = {
  SEQUENTIAL: 'SEQUENTIAL',
  LOOPING: 'LOOPING',
  TWO_POINTER: 'TWO_POINTER',
  PARTITION: 'PARTITION',
  GREEDY: 'GREEDY',
  IN_PLACE: 'IN_PLACE',
} as const;

export type AlgorithmPattern =
  typeof AlgorithmPattern[keyof typeof AlgorithmPattern];

export interface Challenge {
  id: string;
  title: string;
  description: string;
  hints: string[];
  explanation?: string; 
  difficulty: Difficulty;
  initialArray: number[];
  targetArray: number[];
  extraArray?: number[];
  maxSteps?: number; // Optional optimization goal
  starRequirements?: {
    speedSeconds?: number;
  };
  initialPointers?: {
    MOCO?: number;
    CHOCO?: number;
    LOCO?: number;
  };
  clipboard?: boolean ;
  initialHand?: number | null;
  instructions: Instruction[]; // Starting instructions (can be empty)
  unlocked: boolean;
  capabilities: InstructionCapabilities;

  concepts: ConceptTag[];

  learningObjectives?: string[];
  pattern?: AlgorithmPattern;
}

export interface ChallengeProgress {
  challengeId: string;
  completed: boolean;
  bestStepCount?: number;
  completedAt?: number;
}

