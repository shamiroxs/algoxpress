/**
 * Controller for execution pipeline
 * Handles Step/Run/Rewind operations
 */

import { useGameStore } from './store';
import { executeStep, rewindStep } from '../interpreter/vm';
import type { ExecutionResult } from '../interpreter/vm';
import { validateChallenge as validateChallengeFn } from '../engine/validator/validator';
//import { trackChallengeCompletion } from '../utils/completionTracter';

import {
  trackExecutionStarted,
  trackExecutionStepped,
  trackExecutionRewound,
  trackRuntimeError,
  trackValidationFailed,
  trackChallengeCompleted,
} from '../analytics/integrations/controllerAnalytics';

import {
  createExecutionMetrics,
  buildExecutionSummary,
} from '../analytics/helpers/executionMetrics';

let runInterval: number | null = null;

let executionMetrics =
  createExecutionMetrics();

/**
 * Execute single step
 * Used both by the Step button and the Run loop.
 */
export function executeSingleStep(
  manual = true
): void {
  const store = useGameStore.getState();
  const state = store.executionState;

  store.maybeCompleteTutorial('RUN_CLICK');
  store.maybeCompleteTutorial('ANY_CONTROL');


  if (!state) {

    if (
      manual &&
      executionMetrics.startedAt === null &&
      store.currentChallenge
    ) {
      executionMetrics.startedAt = Date.now();
    
      trackExecutionStarted({
        challengeId: store.currentChallenge.id,
        concepts: store.currentChallenge.concepts,
    
        instructionCount:
          store.executionState?.instructions.length ?? 0,
    
        executionMode: 'step',
      });
    }
    // Nothing to execute yet
    store.setExecutionError('No execution state available');
    return;
  }

  // Ensure we are not in a paused state when stepping
  store.setIsPaused(false);

  // Execute step directly
  const result: ExecutionResult = executeStep(state);

  if (result.success) {
    store.setExecutionState(result.state);
    store.setExecutionError(null, null);

    if (store.currentChallenge) {
      if (manual) {
        executionMetrics.manualStepCount += 1;
    
        trackExecutionStepped({
          challengeId: store.currentChallenge.id,
          concepts: store.currentChallenge.concepts,
    
          currentStep: result.state.stepCount,
    
          manual: true,
        });
      } else {
        executionMetrics.autoplayStepCount += 1;
      }
    }

    // Check if challenge is completed
    if (result.completed || result.state.currentLine >= result.state.instructions.length) {
      stopExecution();
      validateChallenge();
    }
  } else {
    // Check if error is pointer out of bounds - if so, validate challenge instead
    const errorMessage = result.error || '';
    const isPointerOutOfBounds = 
      errorMessage.includes('Pointer is not on a valid seat.') ||
      errorMessage.includes('Cannot move right: pointer already at end') ||
      errorMessage.includes('Cannot move left: pointer already at start') ||
      errorMessage.includes('Cannot move right. This is the last seat.') ||
      errorMessage.includes('Cannot move left. This is the first seat.') ||
      errorMessage.includes('Cannot swap seats here. There is no adjacent seat.');
    
      if (isPointerOutOfBounds) {
        // Temporarily update state to perform validation
        store.setExecutionState(result.state);
  
        const validationResult = store.currentChallenge && store.executionState
          ? validateChallengeFn(store.currentChallenge, store.executionState)
          : null;
  
        if (validationResult?.success) {
          // Challenge actually completed despite pointer error
          stopExecution();
          store.setExecutionError(null, null);
          store.setValidationResult(validationResult);
          if (store.currentChallenge && store.executionState) {
            store.markChallengeCompleted(
              store.currentChallenge.id,
              store.executionState.stepCount
            );
          }
        } else {
          // Challenge not correct → show error
          store.setExecutionError(result.error || 'Execution failed', result.errorContext ?? null);
          stopExecution();
        }
  
      } else {
        // Other errors → just show error
        if (store.currentChallenge) {
          executionMetrics.runtimeErrorCount += 1;

          trackRuntimeError({
            challengeId: store.currentChallenge.id,
            concepts: store.currentChallenge.concepts,
        
            errorType: result.error || 'UnknownError',
        
            step: result.state.stepCount,
          });
        }
        store.setExecutionError(result.error || 'Execution failed', result.errorContext ?? null);
        stopExecution();
      }
    }
}

/**
 * Run execution continuously
 */
export function runExecution(): void {

  const store = useGameStore.getState();

  store.maybeCompleteTutorial('RUN_CLICK');
  store.maybeCompleteTutorial('ANY_CONTROL');


  if (store.isExecuting && !store.isPaused) {
    return; // Already running
  }

  store.setIsExecuting(true);
  store.setIsPaused(false);
  store.setExecutionError(null);

  if (store.currentChallenge) {
    executionMetrics.startedAt = Date.now();
  
    executionMetrics.autoplayRuns += 1;
  
    trackExecutionStarted({
      challengeId: store.currentChallenge.id,
      concepts: store.currentChallenge.concepts,
  
      instructionCount:
        store.executionState?.instructions.length ?? 0,
  
      executionMode: 'autoplay',
    });
  }

  const speed = store.getExecutionInterval();

  // Execute steps at interval
  runInterval = window.setInterval(() => {
    const currentStore = useGameStore.getState();
    if (!currentStore.isExecuting || currentStore.isPaused) {
      stopExecution();
      return;
    }

    executeSingleStep(false);
  }, speed);
}

/**
 * Pause execution
 */
export function pauseExecution(): void {
  const store = useGameStore.getState();
  executionMetrics.pauseCount += 1;
  store.setIsPaused(true);
}

/**
 * Resume execution
 */
export function resumeExecution(): void {
  const store = useGameStore.getState();
  
  if (store.isExecuting && store.isPaused) {
    store.setIsPaused(false);
    runExecution();
  }
}

/**
 * Stop execution
 */
export function stopExecution(): void {
  if (runInterval !== null) {
    clearInterval(runInterval);
    runInterval = null;
  }

  const store = useGameStore.getState();
  store.setIsExecuting(false);
  store.setIsPaused(false);
}

/**
 * Rewind one step
 */
export function rewindSingleStep(): void {
  const store = useGameStore.getState();
  const state = store.executionState;

  if (!state) {
    return;
  }

  // Use synchronous rewind for now (can be moved to worker if needed)
  const newState = rewindStep(state);
  if (newState) {
    store.setExecutionState(newState);
    store.setExecutionError(null);

    if (store.currentChallenge) {
      executionMetrics.rewindCount += 1;
    
      trackExecutionRewound({
        challengeId: store.currentChallenge.id,
        concepts: store.currentChallenge.concepts,
    
        rewindDistance: 1,
      });
    }
  }
}

/**
 * Validate challenge completion
 */
export function validateChallenge(): void {
  const store = useGameStore.getState();
  
  // Use the current execution state from the store, not the engine's stale state
  if (!store.currentChallenge || !store.executionState) {
    return;
  }
  
  // Validate using the current execution state from the store
  const result = validateChallengeFn(store.currentChallenge, store.executionState);
  store.setValidationResult(result);

  if (
    result &&
    !result.success &&
    store.currentChallenge
  ) {

    executionMetrics.validationFailureCount += 1;

    trackValidationFailed({
      challengeId: store.currentChallenge.id,
      concepts: store.currentChallenge.concepts,
  
      mismatchCount:
        result.mismatches?.length ?? 0,
    });
  }

  if (result?.success) {

    store.maybeCompleteTutorial('RUN_CLICK');
    store.maybeCompleteTutorial('ANY_CONTROL');

    
    // Mark challenge as completed in store
    store.markChallengeCompleted(
      store.currentChallenge.id,
      result.stepCount
    );
    
    /*
    trackChallengeCompletion({
      challengeId: store.currentChallenge.id,
      stepCount: result.stepCount,
      instructionCount: store.executionState.instructions.length,
      executionMode: store.isExecuting ? 'run' : 'step',
    });*/
    executionMetrics.completedAt = Date.now();

    const summary =
  buildExecutionSummary(
    executionMetrics
  );

  trackChallengeCompleted({
    challengeId: store.currentChallenge.id,
    concepts: store.currentChallenge.concepts,

    instructionCount:
      store.executionState.instructions.length,

    stepCount:
      result.stepCount,

    ...summary,
  });
  }
}

/**
 * Reset execution to initial state
 */
export function resetExecution(): void {
  stopExecution();
  const store = useGameStore.getState();
  store.resetChallenge();
}