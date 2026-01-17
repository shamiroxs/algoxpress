/**
 * Zustand store for game state orchestration
 * Coordinates engine, interpreter, and renderer
 */

import { create } from 'zustand';
import type { Challenge } from '../engine/challenges/types';
import type { ExecutionState } from '../interpreter/executionModel';
import type { ExecutionErrorContext } from '../interpreter/vm';
import type { Instruction } from '../engine/instructions/types';
import type { ValidationResult } from '../engine/validator/validator';
import { GameEngine } from '../engine/engine';

import {
  TutorialStepId,
  type TutorialTrigger,
} from '../tutorial/types';
import { TUTORIAL_STEP_ORDER } from '../tutorial/steps';
import { TUTORIAL_STEP_BEHAVIOR } from '../tutorial/behavior';

const PROGRESS_KEY = 'dsa-buddy-progress';

type StoredProgress = Record<
  string,
  {
    challengeId: string;
    completed: boolean;
    bestStepCount?: number;
    completedAt?: number;
  }
>;

function loadCompletedFromProgress(): Set<string> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return new Set();

    const progress: StoredProgress = JSON.parse(raw);
    return new Set(
      Object.values(progress)
        .filter((p) => p.completed)
        .map((p) => p.challengeId)
    );
  } catch {
    return new Set();
  }
}

function upsertProgressEntry(
  challengeId: string,
  data: {
    challengeId: string;
    completed: boolean;
    bestStepCount?: number;
    completedAt?: number;
  }
) {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    const progress: StoredProgress = raw ? JSON.parse(raw) : {};

    const existing = progress[challengeId];

    progress[challengeId] = {
      challengeId,
      completed: true,

      // keep the BEST (minimum) step count
      bestStepCount:
        existing?.bestStepCount != null && data.bestStepCount != null
          ? Math.min(existing.bestStepCount, data.bestStepCount)
          : data.bestStepCount ?? existing?.bestStepCount,

      // update completion time only on first completion
      completedAt: existing?.completedAt ?? data.completedAt ?? Date.now(),
    };

    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // ignore storage failures
  }
}

function getNextTutorialStep(
  current: TutorialStepId
): TutorialStepId {
  const idx = TUTORIAL_STEP_ORDER.indexOf(current);
  return (
    TUTORIAL_STEP_ORDER[idx + 1] ?? current
  );
}

interface GameState {
  // Challenge state
  currentChallenge: Challenge | null;
  challenges: Challenge[];
  
  // Execution state
  executionState: ExecutionState | null;
  isExecuting: boolean;
  isPaused: boolean;
  executionError: string | null;
  executionErrorContext: ExecutionErrorContext | null;
  
  // Player instructions
  playerInstructions: Instruction[];
  initialInstructions: Instruction[];
  
  // Validation
  validationResult: ValidationResult | null;
  
  // Engine instance
  engine: GameEngine;

  // Tutorial (First-run coach)
  tutorial: {
    isActive: boolean;
    currentStep: TutorialStepId;
  };

  scrollToChallengeOnSuccess: boolean;
  setScrollToChallengeOnSuccess: (v: boolean) => void;

  rewindHintShown: boolean;
  markRewindHintShown: () => void;
  
  startTutorial: () => void;
  nextTutorialStep: () => void;
  endTutorial: () => void;
  maybeCompleteTutorial: (trigger: TutorialTrigger) => void;


  reorderInstructions: (fromIndex: number, toIndex: number) => void;

  clearPlayerInstructions: () => void;
  
  // Actions
  setChallenges: (challenges: Challenge[]) => void;
  selectChallenge: (challengeId: string) => void;
  setCurrentChallenge: (challenge: Challenge | null) => void;
  setPlayerInstructions: (instructions: Instruction[]) => void;
  addInstruction: (instruction: Instruction, index?: number) => void;
  removeInstruction: (instructionId: string) => void;
  updateInstruction: (instructionId: string, instruction: Instruction) => void;
  setExecutionState: (state: ExecutionState | null) => void;
  setIsExecuting: (isExecuting: boolean) => void;
  setIsPaused: (isPaused: boolean) => void;
  setExecutionError: (error: string | null, context?: ExecutionErrorContext | null) => void;
  setValidationResult: (result: ValidationResult | null) => void;
  resetChallenge: () => void;
  initializeChallenge: () => void;

  // Completion state
  completedChallengeIds: Set<string>;
  isChallengeCompleted: (challengeId: string) => boolean;
  markChallengeCompleted: (
    challengeId: string,
    bestStepCount?: number
  ) => void;
  
  successHintDismissed: boolean;
  dismissSuccessHint: () => void;
  resetSuccessHint: () => void;

}

function updateInstructionRecursive(
  instructions: Instruction[],
  instructionId: string,
  updatedInstruction: Instruction
): Instruction[] {
  return instructions.map(inst => {
    if (inst.id === instructionId) return updatedInstruction;
    if ('body' in inst && Array.isArray(inst.body)) {
      return { ...inst, body: updateInstructionRecursive(inst.body, instructionId, updatedInstruction) };
    }
    return inst;
  });
}


export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  currentChallenge: null,
  challenges: [],
  executionState: null,
  isExecuting: false,
  isPaused: false,
  executionError: null,
  executionErrorContext: null,
  playerInstructions: [],
  initialInstructions: [],
  validationResult: null,
  engine: new GameEngine(),
  successHintDismissed: false,

  // Tutorial
  tutorial: {
    isActive: false,
    currentStep: TUTORIAL_STEP_ORDER[0],
  },

  scrollToChallengeOnSuccess: true,
  rewindHintShown: false,

  setScrollToChallengeOnSuccess: (v) =>
  set({ scrollToChallengeOnSuccess: v }),

  markRewindHintShown: () =>
    set({ rewindHintShown: true }),
  
  startTutorial: () =>
    set({
      tutorial: {
        isActive: true,
        currentStep: TUTORIAL_STEP_ORDER[0],
      },
    }),
  
  nextTutorialStep: () =>
    set((state) => {
      if (!state.tutorial.isActive) return state;
   
      return {
        tutorial: {
          ...state.tutorial,
          currentStep: getNextTutorialStep(
            state.tutorial.currentStep
          ),
        },
      };
    }),
  
  
  endTutorial: () =>
    set({
      tutorial: {
        isActive: false,
        currentStep: TUTORIAL_STEP_ORDER[0],
      },
    }),
  
  maybeCompleteTutorial: (trigger) =>
    set((state) => {
      if (!state.tutorial.isActive) return state;
  
      const step = state.tutorial.currentStep;
      const behavior = TUTORIAL_STEP_BEHAVIOR[step];
  
      if (behavior?.completesOn !== trigger) {
        return state;
      }
  
      const nextStep = getNextTutorialStep(step);
  
      // If no more steps, end tutorial
      if (nextStep === step) {
        return {
          tutorial: {
            isActive: false,
            currentStep: step,
          },
        };
      }
  
      const updates: Partial<GameState> = {
        tutorial: {
          ...state.tutorial,
          currentStep: nextStep,
        },
      };
  
      // 🔥 CLEAR PROGRAM WHEN ENTERING PICK_EXPLAINED
      if (nextStep === TutorialStepId.PICK_EXPLAINED) {
        updates.playerInstructions = [];
      }
  
      return updates as GameState;
    }),
  

  // Completion state
  completedChallengeIds: loadCompletedFromProgress(),

  isChallengeCompleted: (challengeId) => {
    return get().completedChallengeIds.has(challengeId);
  },

  markChallengeCompleted: (challengeId, bestStepCount?: number) => {
    set((state) => {
      if (state.completedChallengeIds.has(challengeId)) {
        return state;
      }
  
      const next = new Set(state.completedChallengeIds);
      next.add(challengeId);
  
      upsertProgressEntry(challengeId, {
        challengeId,
        completed: true,
        bestStepCount,
        completedAt: Date.now(),
      });
  
      return { completedChallengeIds: next };
    });
  },
  
  dismissSuccessHint: () =>
    set({ successHintDismissed: true }),
  
  resetSuccessHint: () =>
    set({ successHintDismissed: false }),
  
  reorderInstructions: (fromIndex, toIndex) => {
    const { playerInstructions } = get();
    const updated = [...playerInstructions];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    get().setPlayerInstructions(updated);
  },  

  clearPlayerInstructions: () => {
    const { initialInstructions } = get();
    get().setPlayerInstructions(initialInstructions);
  },
  
  // Actions
  setChallenges: (challenges) => set({ challenges }),
  
  selectChallenge: (challengeId) => {
    const { challenges, completedChallengeIds, engine } = get();
    const challenge = challenges.find((c) => c.id === challengeId);
  
    if (!challenge) return;
  
    const isTutorial =
      challenge.id === 'challenge-0' &&
      !completedChallengeIds.has('challenge-0');
  
    const initialInstructions = challenge.instructions ?? [];

    const executionState = engine.initializeChallenge(
      challenge,
      initialInstructions
    );

    set({
      currentChallenge: challenge,
      playerInstructions: initialInstructions,
      initialInstructions,
      executionState,
      tutorial: {
        isActive: isTutorial,
        currentStep: TUTORIAL_STEP_ORDER[0],
      },
      
      isExecuting: false,
      isPaused: false,
      validationResult: null,
      executionError: null,
      executionErrorContext: null,
      successHintDismissed: false,
      rewindHintShown: false,
    });
  },
  
  
  setCurrentChallenge: (challenge) => set({ currentChallenge: challenge }),
  
  setPlayerInstructions: (instructions) => {
    set({ playerInstructions: instructions });
    // Re-initialize challenge with new instructions
    const { currentChallenge, engine } = get();
    if (currentChallenge) {
      const newState = engine.initializeChallenge(currentChallenge, instructions);
      set({ executionState: newState, validationResult: null, executionError: null, executionErrorContext: null });
    }
  },
  
  addInstruction: (instruction, index) => {
    const {
      playerInstructions,
      tutorial,
      maybeCompleteTutorial,
    } = get();
  
    const newInstructions = [...playerInstructions];
  
    if (index === undefined || index < 0 || index > newInstructions.length) {
      newInstructions.push(instruction);
    } else {
      newInstructions.splice(index, 0, instruction);
    }
  
    // Renumber line numbers if your engine relies on them
    newInstructions.forEach((inst, i) => {
      (inst as any).lineNumber = i;
    });
  
    get().setPlayerInstructions(newInstructions);
  
    if (tutorial.isActive) {
      maybeCompleteTutorial('AUTO');
    }
    
  },
  
  
  
  removeInstruction: (instructionId) => {
    const { playerInstructions } = get();
    const newInstructions = playerInstructions.filter((inst) => inst.id !== instructionId);
    get().setPlayerInstructions(newInstructions);
  },
  
  updateInstruction: (instructionId, instruction) => {
    const { playerInstructions } = get();
    const newInstructions = updateInstructionRecursive(playerInstructions, instructionId, instruction);
    get().setPlayerInstructions(newInstructions);
  },
  
  setExecutionState: (state) => set({ executionState: state }),
  
  setIsExecuting: (isExecuting) => set({ isExecuting }),
  
  setIsPaused: (isPaused) => set({ isPaused }),

  setExecutionError: (
    error: string | null,
    context: ExecutionErrorContext | null = null
  ) =>
    set({
      executionError: error,
      executionErrorContext: context,
    }),
  
  
  setValidationResult: (result) => set({ validationResult: result }),
  
  resetChallenge: () => {
    const { engine, currentChallenge } = get();
    if (currentChallenge) {
      const newState = engine.reset();
      if (newState) {
        set({
          executionState: newState,
          validationResult: null,
          executionError: null,
          executionErrorContext: null,
          isExecuting: false,
          isPaused: false,
        });
      }
    }
  },
  
  initializeChallenge: () => {
    const { engine, currentChallenge, playerInstructions } = get();
    if (currentChallenge) {
      const newState = engine.initializeChallenge(currentChallenge, playerInstructions);
      set({
        executionState: newState,
        validationResult: null,
        executionError: null,
        executionErrorContext: null,
        isExecuting: false,
        isPaused: false,
        successHintDismissed: false,
        rewindHintShown: false,
      });
    }
  },
}));

