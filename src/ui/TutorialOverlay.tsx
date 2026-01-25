import { useGameStore } from '../orchestrator/store';
import { useEffect, useRef, useState } from 'react';
import { runExecution } from '../orchestrator/controller';
import { usePlayerInstructions } from '../orchestrator/selectors';

import {
  useIsTutorialActive,
  useTutorialStepContent,
  useTutorialBlocksUI,
  useTutorialBehavior,
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
  } = useGameStore();

  const [isBottom, setIsBottom] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!isTutorialActive || !blocksUI) return;
  
    setIsVisible(false);
  
    // Hide step 2 seconds before auto-complete
    const hideTimeoutId = setTimeout(() => {
      setIsVisible(true);
    }, 1500); 
  
    // Auto-complete tutorial
    const completeTimeoutId = setTimeout(() => {
      maybeCompleteTutorial('AUTO');
    }, 4500);
  
    return () => {
      clearTimeout(hideTimeoutId);
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

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportMiddle = window.innerHeight / 2;

      // No scroll OR above middle → bottom
      if (scrollY === 0 || scrollY <= viewportMiddle) {
        setIsBottom(true);
      } else {
        setIsBottom(false);
      }
    };

    handleScroll(); // run once on mount (handles "no scroll")

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isTutorialActive || isExecuting || !isVisible) return null;

  const stepId = step?.id;

  const showNextButton =
    stepId === TutorialStepId.CHALLENGE_EXPLAINED ||
    stepId === TutorialStepId.VISUALIZATION_EXPLAINED ||
    stepId === TutorialStepId.PALETTE_EXPLAINED ||
    stepId === TutorialStepId.PALETTE_HELP_EXPLAINED ||
    stepId === TutorialStepId.PROGRAM_AREA_EXPLAINED;
    
  const handleNext = () => {
    maybeCompleteTutorial('ANY_CONTROL');
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
              ? 'bg-black/50 backdrop-blur-sm'
              : 'bg-black/25'
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
          animate-in fade-in slide-in-from-bottom-4 duration-300
          ${isBottom ? 'bottom-6 border-t' : 'top-6 border-b'}
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

      
    </div>
  );
}
