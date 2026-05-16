/**
 * Validates challenge completion
 * Pure logic, no React
 */


import type { Challenge } from '../challenges/types';
import type { ExecutionState } from '../../interpreter/executionModel';

export interface ValidationResult {
  success: boolean;
  message: string;
  stepCount: number;
  optimized: boolean;
  mismatches?: number[];
}

/**
 * Check if challenge is completed
 */
export function validateChallenge(
  challenge: Challenge,
  state: ExecutionState
): ValidationResult {
  // Check if arrays match
  if (state.array.length !== challenge.targetArray.length) {
    return {
      success: false,
      message: 'Array length mismatch',
      stepCount: state.stepCount,
      optimized: false,
    };
  }
  
  const mismatches: number[] = [];

  let firstMismatchMessage = '';

  for (let i = 0; i < state.array.length; i++) {
    if (state.array[i] !== challenge.targetArray[i]) {
      mismatches.push(i);

      // Preserve existing UX-friendly message
      if (!firstMismatchMessage) {
        firstMismatchMessage =
          `Mismatch at seat ${i}: expected ${challenge.targetArray[i]}, got ${state.array[i]}`;
      }
    }
  }

  if (mismatches.length > 0) {
    return {
      success: false,
  
      message: firstMismatchMessage,
      
      stepCount: state.stepCount,
  
      optimized: false,
  
      mismatches,
    };
  }
  /*
  for (let i = 0; i < state.array.length; i++) {
    if (state.array[i] !== challenge.targetArray[i]) {
      return {
        success: false,
        message: `Mismatch at seat ${i}: expected ${challenge.targetArray[i]}, got ${state.array[i]}`,
        stepCount: state.stepCount,
        optimized: false,
      };
    }
  }*/
  
  // Check optimization goal
  const optimized = challenge.maxSteps
    ? state.stepCount <= challenge.maxSteps
    : true;
  
  return {
    success: true,
    message: optimized
      ? '✔ Orders executed with maximum efficiency.'
      : '✔ Orders executed. Try to improve your solution.',
    stepCount: state.stepCount,
    optimized,
  };
}

