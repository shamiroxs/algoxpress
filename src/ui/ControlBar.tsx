/**
 * Control bar for execution controls
 * Step, Run, Pause, Rewind, Reset
 */

import {
  executeSingleStep,
  runExecution,
  pauseExecution,
  rewindSingleStep,
  resetExecution,
} from '../orchestrator/controller';
import { useGameStore } from '../orchestrator/store';
import { useIsExecuting, useIsPaused } from '../orchestrator/selectors';
import {
  useTutorialHighlight,
  useTutorialCompletesOn,
  useIsTutorialActive,
} from '../tutorial/selectors';

import {
  Play,
  Pause,
  StepBack,
  StepForward,
  RotateCcw,
} from 'lucide-react';

export function ControlBar() {
  const executionSpeed = useGameStore((s) => s.executionSpeed);
  const cycleExecutionSpeed = useGameStore((s) => s.cycleExecutionSpeed);

  const isExecuting = useIsExecuting();
  const isPaused = useIsPaused();

  const {
    endTutorial,
    maybeCompleteTutorial,
    dismissSuccessHint,
    setScrollToChallengeOnSuccess,
    validationResult,
    successHintDismissed,
    rewindHintShown,
    markRewindHintShown,
  } = useGameStore();

  const isActive = useIsTutorialActive();

  const highlightRun =
    useTutorialHighlight('CONTROL_BAR', { control: 'RUN' }) && isActive;

  const completesOnRun = useTutorialCompletesOn('RUN_CLICK');

  const highlightRewind =
    validationResult?.success &&
    !rewindHintShown &&
    !successHintDismissed;

  const onAnyControlClick = () => {
    if (validationResult?.success) {
      dismissSuccessHint();
    }
  };

  const onStep = () => {
    onAnyControlClick();
    setScrollToChallengeOnSuccess(true);
    executeSingleStep();
    endTutorial();
  };

  const onRun = () => {
    onAnyControlClick();
    setScrollToChallengeOnSuccess(true);
    runExecution();

    if (completesOnRun) {
      maybeCompleteTutorial('RUN_CLICK');
      endTutorial();
    }
  };

  const onPause = () => {
    onAnyControlClick();
    pauseExecution();
  };

  const onRewind = () => {
    onAnyControlClick();
    markRewindHintShown();
    setScrollToChallengeOnSuccess(false);
    rewindSingleStep();
  };

  const onReset = () => {
    onAnyControlClick();
    setScrollToChallengeOnSuccess(true);
    resetExecution();
  };

  const secondaryBtn =
    'w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ' +
    'bg-gray-700 hover:bg-gray-600 text-white text-sm ' +
    'disabled:opacity-40 disabled:cursor-not-allowed transition';

  const retrySecondaryBtn =
    'w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ' +
    'bg-gray-800 hover:bg-gray-700 text-white text-sm ' +
    'disabled:opacity-40 disabled:cursor-not-allowed transition';

    return (
      <div
        className="
          flex items-center
          bg-gray-900/90
          rounded-full
          px-4 py-2
          shadow-lg
          w-full max-w-xl
        "
      >
        {/* LEFT: Speed */}
        <div className="flex-1 flex justify-start">
          <button
            onClick={cycleExecutionSpeed}
            disabled={isExecuting && !isPaused}
            className="
              px-3 py-1
              rounded-full
              text-xs font-semibold
              bg-gray-800 text-gray-200
              hover:bg-gray-700
              disabled:opacity-40
            "
            title="Execution speed"
          >
            {executionSpeed}×
          </button>
        </div>
  
        {/* CENTER: Transport controls */}
        <div className="flex items-center gap-3 justify-center">
          {/* Rewind */}
          <button
            onClick={onRewind}
            disabled={isExecuting && !isPaused}
            className={`
              ${secondaryBtn}
              ${highlightRewind ? 'ring-2 ring-green-400 animate-pulse' : ''}
            `}
          >
            <StepBack size={18} />
          </button>
  
          {/* Play / Pause */}
          {!isExecuting || isPaused ? (
            <button
              onClick={onRun}
              className={`
                w-12 h-12
                rounded-full
                flex items-center justify-center
                bg-green-600 hover:bg-green-500
                text-white text-xl font-bold
                transition
                ${highlightRun ? 'ring-2 ring-green-400 animate-pulse' : ''}
              `}
            >
              <Play size={24} fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={onPause}
              className="
                w-12 h-12
                rounded-full
                flex items-center justify-center
                bg-yellow-500 hover:bg-yellow-400
                text-white text-xl font-bold
                transition
              "
            >
              <Pause size={24} />
            </button>
          )}
  
          {/* Step */}
          <button
            onClick={onStep}
            disabled={isExecuting && !isPaused}
            className={`
              ${secondaryBtn}
              ${highlightRun ? 'ring-2 ring-green-400 animate-pulse' : ''}
            `}
          >
            <StepForward size={18} />
          </button>
        </div>
  
        {/* RIGHT: Reset */}
        <div className="flex-1 flex justify-end">
          <button onClick={onReset} className={retrySecondaryBtn}>
            <RotateCcw size={18} />
          </button>
        </div>
      </div>
    );
}
