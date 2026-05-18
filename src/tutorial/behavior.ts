// src/tutorial/behavior.ts

import type { TutorialStepBehavior } from './types';
import {
    TutorialStepId,
  } from './types';
import { InstructionType } from '../engine/instructions/types';
 
  export const TUTORIAL_STEP_BEHAVIOR: Record<
  TutorialStepId,
  TutorialStepBehavior
> = {
  [TutorialStepId.WELCOME]: {
    blocksUI: true,
    completesOn: 'AUTO',
    position: 'CENTER',
  },
  [TutorialStepId.CHALLENGE_PANEL]: {
    highlight: {
      scope: 'CHALLENGE_PANEL',
    },
    completesOn: 'ANY_CONTROL',
    position: 'BOTTOM',
  },
  [TutorialStepId.CHALLENGE_EXPLAINED]: {
    highlight: {
      scope: 'WELCOME',
    },
    completesOn: 'ANY_CONTROL',
    position: 'TOP',
  },
  
  [TutorialStepId.VISUALIZATION_EXPLAINED]: {
    highlight: {
      scope: 'TIMELINE',
    },
    completesOn: 'ANY_CONTROL',
    position: 'TOP',
  },
  [TutorialStepId.PALETTE_EXPLAINED]: {
    highlight: {
      scope: 'INSTRUCTION_PALETTE',
    },
    completesOn: 'ANY_CONTROL',
    position: 'BOTTOM',
  },
  
  [TutorialStepId.PALETTE_HELP_EXPLAINED]: {
    highlight: {
      scope: 'INSTRUCTION_PALETTE',
      control: 'HELP',
    },
    completesOn: 'ANY_CONTROL',
    position: 'BOTTOM',
  },
  
  [TutorialStepId.PROGRAM_AREA_EXPLAINED]: {
    highlight: {
      scope: 'INSTRUCTION_PALETTE',
      control: 'PROGRAM',
    },
    completesOn: 'ANY_CONTROL',
    position: 'TOP',
  },
  
  [TutorialStepId.PICK_EXPLAINED]: {
    highlight: {
      scope: 'INSTRUCTION_PALETTE',
      instructionType: InstructionType.PICK,
    },
    completesOn: 'AUTO',
    position: 'BOTTOM',
  },

  [TutorialStepId.HAND_EXPLAINED]: {
    autoRun: true,
    blocksUI: true,
    highlight: {
      scope: 'HAND',
    },
    
    completesOn: 'AUTO',
    position: 'BOTTOM',
  },

  [TutorialStepId.MOVE_EXPLAINED]: {
    autoRun: true,
    highlight: {
      scope: 'INSTRUCTION_PALETTE',
      instructionType: InstructionType.MOVE_RIGHT,
    },
    completesOn: 'AUTO',
    position: 'BOTTOM',
  },

  [TutorialStepId.PUT_EXPLAINED]: {
    autoRun: true,
    highlight: {
      scope: 'INSTRUCTION_PALETTE',
      instructionType: InstructionType.PUT,
    },
    completesOn: 'AUTO',
    position: 'BOTTOM',
  },

  [TutorialStepId.RUN_EXECUTION]: {
    highlight: {
      scope: 'CONTROL_BAR',
      control: 'RUN',
    },
    completesOn: 'RUN_CLICK',
    position: 'TOP',
  },
};

  