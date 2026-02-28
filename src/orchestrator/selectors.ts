/**
 * Zustand selectors for derived state
 */

import { useGameStore } from './store';
import type { Instruction } from '../engine/instructions/types';

/* ===================== CORE ===================== */

export const useCurrentChallenge = () =>
  useGameStore((state) => state.currentChallenge);

export const useChallenges = () =>
  useGameStore((state) => state.challenges);

export const useExecutionState = () =>
  useGameStore((state) => state.executionState);

export const usePlayerInstructions = () =>
  useGameStore((state) => state.playerInstructions);

export const useIsExecuting = () =>
  useGameStore((state) => state.isExecuting);

export const useIsPaused = () =>
  useGameStore((state) => state.isPaused);

export const useExecutionError = () =>
  useGameStore((state) => state.executionError);

export const useExecutionErrorContext = () =>
  useGameStore((s) => s.executionErrorContext);

export const useValidationResult = () =>
  useGameStore((state) => state.validationResult);

/* ===================== EXECUTION ===================== */

export const useCurrentInstruction = (): Instruction | null => {
  return useGameStore((state) => {
    const exec = state.executionState;
    if (!exec || exec.executionStack.length === 0) return null;

    const frame =
      exec.executionStack[exec.executionStack.length - 1];

    if (frame.line >= frame.instructions.length) return null;

    return frame.instructions[frame.line] as Instruction;
  });
};

const EMPTY_ARRAY: number[] = [];

export const useArrayState = (): number[] =>
  useGameStore((state) => state.executionState?.array ?? EMPTY_ARRAY);

export const useExtraArrayState = (): number[] | undefined =>
  useGameStore((state) => state.executionState?.extraArray);

export const useHand = (): number | null =>
  useGameStore((state) => state.executionState?.hand ?? null);

export const useStepCount = (): number =>
  useGameStore((state) => state.executionState?.stepCount ?? 0);

export const useCurrentLine = (): number =>
  useGameStore((state) => state.executionState?.currentLine ?? 0);

/* ===================== POINTERS ===================== */

export const useMocoPointer = (): number =>
  useGameStore((state) => state.executionState?.mocoPointer ?? 0);

export const useChocoPointer = (): number =>
  useGameStore((state) => state.executionState?.chocoPointer ?? 0);

export const useLocoPointer = (): number =>
  useGameStore((state) => state.executionState?.locoPointer ?? 0);
