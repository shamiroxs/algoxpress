// src/tutorial/steps.ts

import { TutorialStepId } from './types';
import type { TutorialStepContent } from './types';

import { InlineInstructionIcon } from './InlineInstructionIcon';
import { InstructionType } from '../engine/instructions/types';
import { Play, StepForward } from 'lucide-react';

export const TUTORIAL_STEPS: TutorialStepContent[] = [
  {
    id: TutorialStepId.WELCOME,
    title: 'Welcome aboard! 🚂',
    text: 'You`re the train conductor',
  },
  {
    id: TutorialStepId.CHALLENGE_PANEL,
    title: 'See job',
    text: 'Click here to see your job',
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
    id: TutorialStepId.PALETTE_HELP_OPENED,
    title: 'Card details',
    text: 'Here you can see the use of each cards',
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
    text: (
      <>
        Press <span
                className="
                  inline-flex items-center justify-center
                  w-5 h-5 mx-1
                  rounded-full
                  bg-green-600 text-white
                  align-middle
                "
              >
      <Play size={14} fill="currentColor" className="inline mx-1 text-white" />
    </span>
        or step with <span
                className="
                  inline-flex items-center justify-center
                  w-5 h-5 mx-1
                  rounded-full
                  bg-gray-700 text-white
                  align-middle
                "
              >
                <StepForward size={14} className="inline mx-1" />
              </span>
      </>
    ),
  },
];

/** Explicit tutorial order */
export const TUTORIAL_STEP_ORDER: TutorialStepId[] =
  TUTORIAL_STEPS.map((s) => s.id);
