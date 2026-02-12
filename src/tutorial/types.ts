// src/tutorial/types.ts

import { InstructionType } from '../engine/instructions/types';

/** All possible tutorial step IDs */
export const TutorialStepId = {
    WELCOME: 'WELCOME',
    CHALLENGE_EXPLAINED: 'CHALLENGE_EXPLAINED',
    CHALLENGE_PANEL: 'CHALLENGE_PANEL',
    VISUALIZATION_EXPLAINED: 'VISUALIZATION_EXPLAINED',

    PALETTE_EXPLAINED: 'PALETTE_EXPLAINED',
    PALETTE_HELP_EXPLAINED: 'PALETTE_HELP_EXPLAINED',
    PROGRAM_AREA_EXPLAINED: 'PROGRAM_AREA_EXPLAINED',
  
    PICK_EXPLAINED: 'PICK_EXPLAINED',
    HAND_EXPLAINED: 'HAND_EXPLAINED',
    MOVE_EXPLAINED: 'MOVE_EXPLAINED',
    PUT_EXPLAINED: 'PUT_EXPLAINED',
    RUN_EXECUTION: 'RUN_EXECUTION',
  } as const;
  
  export type TutorialStepId =
    typeof TutorialStepId[keyof typeof TutorialStepId];
  
  /** Where the tutorial is visually focused */
  export type TutorialScope =
    | 'WELCOME'
    | 'CHALLENGE_PANEL'
    | 'CONTROL_BAR'
    | 'INSTRUCTION_PALETTE'
    | 'TIMELINE'
    | 'HAND';
  
  /** What user action can complete a tutorial step */
  export type TutorialTrigger =
    | 'SCROLL'
    | 'RUN_CLICK'
    | 'STEP_CLICK'
    | 'ANY_CONTROL'
    | 'INSTRUCTION_CLICK'
    | 'AUTO';
  
  /** Visual emphasis hints (non-behavioral) */
  export interface TutorialHighlight {
    scope: TutorialScope;
    control?: 'RUN' | 'STEP' | 'REWIND' | 'RESET' | 'HELP' | 'PROGRAM';
    instructionType?: InstructionType;
    targetIndex?: number; // for array-level tutorials later
  }
  
  export type TutorialOverlayPosition =
  | 'CENTER'
  | 'TOP'
  | 'BOTTOM';
  
  /** Behavior configuration per tutorial step */
  export interface TutorialStepBehavior {
    autoRun?: boolean;
    blocksUI?: boolean;
    highlight?: TutorialHighlight;
    completesOn?: TutorialTrigger;
    position?: TutorialOverlayPosition; 
  }
  
  /** Content shown in TutorialOverlay */
  export interface TutorialStepContent {
    id: TutorialStepId;
    title: string;
    text: React.ReactNode;
  }
  