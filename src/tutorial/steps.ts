// src/tutorial/steps.ts

import { TutorialStepId } from './types';
import type { TutorialStepContent } from './types';
export const TUTORIAL_STEPS: TutorialStepContent[] = [
  {
    id: TutorialStepId.WELCOME,
    title: 'Welcome aboard! 🚂',
    text: 'You`re the train conductor',
  },
  {
    id: TutorialStepId.CHALLENGE_EXPLAINED,
    title: 'Your job',
    text: 'This panel describes the request',
  },
  {
    id: TutorialStepId.VISUALIZATION_EXPLAINED,
    title: 'Your train car',
    text: 'Watch MOCO work here.',
  },
  {
    id: TutorialStepId.PALETTE_EXPLAINED,
    title: 'MOCOs action cards',
    text: 'These are the actions MOCO can perform.',
  },
  {
    id: TutorialStepId.PALETTE_HELP_EXPLAINED,
    title: 'Need help?',
    text: 'Tap the ⓘ icon to see what each card does',
  },
  {
    id: TutorialStepId.PROGRAM_AREA_EXPLAINED,
    title: 'Build your program',
    text: 'Drag action cards here to build plan for MOCO',
  },
  
  {
    id: TutorialStepId.PICK_EXPLAINED,
    title: 'Your first instruction',
    text: 'Drag PICK to your program',
  },
  {
    id: TutorialStepId.HAND_EXPLAINED,
    title: 'The Hand',
    text: 'Now MOCO has a value',
  },
  {
    id: TutorialStepId.MOVE_EXPLAINED,
    title: 'Walk to another seat',
    text: 'MOVE_RIGHT tells MOCO to move right side',
  },
  {
    id: TutorialStepId.PUT_EXPLAINED,
    title: 'Place the value',
    text: 'PUT places the value into the current seat',
  },
  {
    id: TutorialStepId.RUN_EXECUTION,
    title: 'See your plan in action',
    text: 'Run or step through your orders',
  },
];

/** Explicit tutorial order */
export const TUTORIAL_STEP_ORDER: TutorialStepId[] =
  TUTORIAL_STEPS.map((s) => s.id);
