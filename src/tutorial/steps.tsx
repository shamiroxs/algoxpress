// src/tutorial/steps.ts

import { TutorialStepId } from './types';
import type { TutorialStepContent } from './types';

import { InlineInstructionIcon } from './InlineInstructionIcon';
import { InstructionType } from '../engine/instructions/types';

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
    title: 'Live Workspace',
    text: 'Watch MOCO work here.',
  },
  {
    id: TutorialStepId.PROGRAM_AREA_EXPLAINED,
    title: 'Your Workspace',
    text: 'Drag action cards here to tell MOCO what to do.',
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
    id: TutorialStepId.PICK_EXPLAINED,
    title: 'Your first instruction',
    text: (
      <>
        Drag <InlineInstructionIcon type={InstructionType.PICK} /> to your workspace
      </>
    ),
  },
  {
    id: TutorialStepId.HAND_EXPLAINED,
    title: 'Good job!',
    text: 'Now MOCO carries a value',
  },
  {
    id: TutorialStepId.MOVE_EXPLAINED,
    title: 'Walk to another seat',
    text: (
      <>
        <InlineInstructionIcon type={InstructionType.MOVE_RIGHT} /> tells MOCO to move right
      </>
    ),
  },
  {
    id: TutorialStepId.PUT_EXPLAINED,
    title: 'Change the value',
    text: (
      <>
        Use <InlineInstructionIcon type={InstructionType.PUT} /> to change the value
      </>
    ),
  },
  {
    id: TutorialStepId.RUN_EXECUTION,
    title: 'Run your orders',
    text: 'Press Run, (or Step one at a time)',
  },
];

/** Explicit tutorial order */
export const TUTORIAL_STEP_ORDER: TutorialStepId[] =
  TUTORIAL_STEPS.map((s) => s.id);
