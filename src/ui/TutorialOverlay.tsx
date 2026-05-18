import { useGameStore } from '../orchestrator/store';
import { useEffect, useRef } from 'react';
import { runExecution } from '../orchestrator/controller';
import { usePlayerInstructions } from '../orchestrator/selectors';

import {
  useIsTutorialActive,
  useTutorialStepContent,
  useTutorialBlocksUI,
  useTutorialBehavior,
  useTutorialOverlayPosition,
} from '../tutorial/selectors';
import { TutorialStepId } from '../tutorial/types';

export function TutorialOverlay() {
  
  const isTutorialActive = useIsTutorialActive();
  const isExecuting = useGameStore((s) => s.isExecuting);

  const step = useTutorialStepContent();
  const blocksUI = useTutorialBlocksUI();

  const behavior = useTutorialBehavior();
  const instructions = usePlayerInstructions();

  const prevInstructionsRef = useRef(instructions);
  
  const {
    maybeCompleteTutorial,
    goToTutorialStep 
  } = useGameStore();

  const position = useTutorialOverlayPosition();

  useEffect(() => {
    if (!isTutorialActive || !blocksUI) return;
  
    const stepId = step?.id;
    const timeoutDuration =
    stepId === TutorialStepId.WELCOME
      ? 1200 // shorter first step
      : 3500;

    // Auto-complete tutorial
    const completeTimeoutId = setTimeout(() => {
      maybeCompleteTutorial('AUTO');
    }, timeoutDuration);
  
    return () => {
      clearTimeout(completeTimeoutId);
    };
  }, [isTutorialActive, blocksUI, maybeCompleteTutorial]);
  
  useEffect(() => {
    if (!isTutorialActive) return;
    if (!behavior?.autoRun) return;

    // Run execution only if instructions changed
    if (prevInstructionsRef.current !== instructions) {
      runExecution();
    }

    prevInstructionsRef.current = instructions;
  }, [instructions, behavior?.autoRun, isTutorialActive]);

  if (!isTutorialActive || isExecuting) return null;

  const stepId = step?.id;

  const showNextButton =
    stepId === TutorialStepId.CHALLENGE_EXPLAINED ||
    stepId === TutorialStepId.VISUALIZATION_EXPLAINED ||
    stepId === TutorialStepId.PALETTE_EXPLAINED ||
    stepId === TutorialStepId.PALETTE_HELP_EXPLAINED ||
    stepId === TutorialStepId.PROGRAM_AREA_EXPLAINED;
  const showSkipButton =
    stepId === TutorialStepId.WELCOME ||
    stepId === TutorialStepId.CHALLENGE_PANEL ||
    stepId === TutorialStepId.CHALLENGE_EXPLAINED ||
    stepId === TutorialStepId.VISUALIZATION_EXPLAINED ||
    stepId === TutorialStepId.PROGRAM_AREA_EXPLAINED ||
    stepId === TutorialStepId.PALETTE_EXPLAINED ||
    stepId === TutorialStepId.PALETTE_HELP_EXPLAINED;
    
  const handleNext = () => {
    maybeCompleteTutorial('ANY_CONTROL');
  };

  const handleSkip = () => {
    goToTutorialStep(TutorialStepId.PICK_EXPLAINED);
  };
  const isWelcome = step?.id === TutorialStepId.WELCOME;

  return (
    <div
      className={`fixed inset-0 z-50 ${
        blocksUI ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'
      }`}
    >
      {/* Dark overlay */}
      <div
        className={`
          absolute inset-0
          transition-all duration-300
          ${
            isWelcome
              ? 'bg-black/50'
              : 'bg-transparent'
          }
        `}
      />
      {/* Coach box */}
      <div
        className={`
          absolute left-1/2 -translate-x-1/2 right-0
          w-[92%] sm:w-[60%]
          max-w-none sm:max-w-3xl
          pointer-events-auto
          bg-gradient-to-b from-gray-900 to-gray-950
          ring-1 ring-yellow-400/40
          border-2 border-yellow-400
          px-6 py-4
          flex items-center justify-between
          rounded-2xl
          
          shadow-2xl
          duration-300
          ${
            position === 'BOTTOM'
              ? 'bottom-6 border-t animate-in fade-in slide-in-from-bottom-4'
              : position === 'TOP'
              ? 'top-14 border-b animate-in fade-in slide-in-from-top-4'
              : 'top-1/2 -translate-y-1/2 animate-in fade-in zoom-in-95'
          }
          
        `}
      >
        {/* Speaker */}
        <div className="absolute -top-3 left-6 bg-yellow-400 text-black text-xs font-semibold px-2 py-0.5 rounded">
          Coach
        </div>

        {/* Text */}
        <div className="mx-auto text-center max-w-3xl w-[92%]">
          <h4 className="font-semibold text-white leading-tight text-sm sm:text-base">
            {step?.title}
          </h4>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            {step?.text}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 ml-6 shrink-0">
        {showNextButton && (
          <button
            onClick={handleNext}
            className="
              text-[11px] sm:text-xs
              px-2.5 py-1 sm:px-3
              rounded-md
              bg-yellow-500/90
              text-black
              font-semibold
              hover:bg-yellow-400
              transition
            "
          >
            Next →
          </button>
        )}
      </div>

      </div>
      {/* Skip button */}
      {showSkipButton && (
        <button
          onClick={handleSkip}
          className="
            absolute
            bottom-4
            right-4 sm:right-8

            text-[11px] sm:text-xs
            px-3 py-1.5

            rounded-md
            bg-gray-800/90
            text-gray-200
            font-medium

            border border-gray-600/60

            hover:bg-gray-700
            hover:text-white

            transition
            pointer-events-auto
          "
        >
          Skip tutorial
        </button>
      )}
      
    </div>
  );
}
