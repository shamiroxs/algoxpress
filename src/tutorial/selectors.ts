// src/tutorial/selectors.ts

import { useGameStore } from '../orchestrator/store';
import { TUTORIAL_STEP_BEHAVIOR } from './behavior';
import { TUTORIAL_STEPS } from './steps';
import type {
  TutorialScope,
  TutorialTrigger,
} from './types';
import { InstructionType } from '../engine/instructions/types';

export const useTutorialOverlayPosition = () =>
  useTutorialBehavior()?.position ?? 'CENTER';

/** Current tutorial step ID */
export const useTutorialStepId = () =>
  useGameStore((s) => s.tutorial.currentStep);

/** Whether tutorial is active */
export const useIsTutorialActive = () =>
  useGameStore((s) => s.tutorial.isActive);

/** Content for TutorialOverlay */
export const useTutorialStepContent = () => {
  const stepId = useTutorialStepId();
  return TUTORIAL_STEPS.find((s) => s.id === stepId);
};

/** Behavior for current tutorial step */
export const useTutorialBehavior = () => {
  const stepId = useTutorialStepId();
  return TUTORIAL_STEP_BEHAVIOR[stepId];
};

/** Whether UI should be blocked */
export const useTutorialBlocksUI = () =>
  useTutorialBehavior()?.blocksUI ?? false;

/** Highlight helper for renderers / controls */
export const useTutorialHighlight = (
  scope: TutorialScope,
  opts?: {
    control?: string;
    instructionType?: InstructionType;
  }
) => {
  const behavior = useTutorialBehavior();
  if (!behavior?.highlight) return false;

  if (behavior.highlight.scope !== scope) return false;

  if (opts?.control && behavior.highlight.control !== opts.control) {
    return false;
  }
  if (
    opts?.instructionType &&
    behavior.highlight.instructionType !== opts.instructionType
  ) {
    return false;
  }
  return true;
};

/** Check if current step completes on trigger */
export const useTutorialCompletesOn = (
  trigger: TutorialTrigger
) => {
  const behavior = useTutorialBehavior();
  return behavior?.completesOn === trigger;
};
