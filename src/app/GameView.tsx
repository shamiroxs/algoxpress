/**
 * Main game view
 * Combines all UI components
 * Supports dual pointers (MOCO / CHOCO)
 */

import { motion } from 'framer-motion';

import {
  useCurrentChallenge,
  usePlayerInstructions,
  useExecutionError,
  useArrayState,
  useMocoPointer,
  useChocoPointer,
  useHand,
  useCurrentLine,
  useStepCount,
  useCurrentInstruction,
  useExecutionErrorContext,
} from '../orchestrator/selectors';

import { useGameStore } from '../orchestrator/store';

import { ChallengePanel } from '../ui/ChallengePanel';
import { InstructionPalette } from '../ui/InstructionPalette';
import { TutorialOverlay } from '../ui/TutorialOverlay';
import { ControlBar } from '../ui/ControlBar';

import { ArrayView } from '../renderer/ArrayView';
import { PointerView } from '../renderer/PointerView';
import { ExecutionTimeline } from '../renderer/ExecutionTimeline';

import { InstructionType } from '../engine/instructions/types';

import { useEffect, useRef, useState } from 'react';

import { HandView } from '../renderer/HandView';
import { useIsTutorialActive, useTutorialBehavior, useTutorialHighlight } from '../tutorial/selectors';
import { SuccessOverlay } from '../ui/SuccessOverlay';
import { useNavigate } from 'react-router-dom';

export function GameView() {
  const isExecuting = useGameStore((s) => s.isExecuting);
  const visualizationRef = useRef<HTMLDivElement | null>(null);
  const successHintDismissed = useGameStore((s) => s.successHintDismissed);
  const resetSuccessHint = useGameStore((s) => s.resetSuccessHint);
  
  const isTutorialActive = useIsTutorialActive();

  const challengeRef = useRef<HTMLDivElement | null>(null);
  const instructionPaletteRef = useRef<HTMLDivElement>(null);
  const behavior = useTutorialBehavior();
  const validationResult = useGameStore((s) => s.validationResult);
  const [isAboveMiddle, setIsAboveMiddle] = useState(true);

  const navigate = useNavigate();

  const scrollToChallengeOnSuccess = useGameStore(
    (s) => s.scrollToChallengeOnSuccess
  );

  //show sucess again
  useEffect(() => {
    if (isExecuting && validationResult?.success) {
      resetSuccessHint();
    }
  }, [isExecuting, validationResult?.success, resetSuccessHint]);
    
  // hide successoverlay if not scroll to top
  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
  
      // If no scroll possible, allow overlay
      if (docHeight <= viewportHeight) {
        setIsAboveMiddle(true);
        return;
      }
  
      const middle = (docHeight - viewportHeight) / 2;
  
      setIsAboveMiddle(scrollY < middle);
    };
  
    onScroll(); // run once on mount
    window.addEventListener('scroll', onScroll, { passive: true });
  
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  
  //show success again

  useEffect(() => {
    if (validationResult?.success) {
      resetSuccessHint();
    }
  }, [validationResult?.success, resetSuccessHint]);

  //scorll to visualizer
  useEffect(() => {
    if (isExecuting && visualizationRef.current) {
      visualizationRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [isExecuting]);
  
  //scroll back to instruction pallete on tutorial
  useEffect(() => {
    if (isExecuting) return;
    if (!isTutorialActive || !behavior?.highlight) return;
  
    let el: HTMLElement | null = null;
  
    switch (behavior.highlight.scope) {
      case 'INSTRUCTION_PALETTE':
        el = instructionPaletteRef.current;
        break;
      case 'WELCOME':
        el = challengeRef.current;
        break;
      case 'TIMELINE':
        el = visualizationRef.current;
        break;
      case 'CONTROL_BAR':
        el = visualizationRef.current;
        break;
    }
  
    if (!el) return;
  
    const timeoutId = setTimeout(() => {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 200);
  
    return () => clearTimeout(timeoutId);
  }, [behavior?.highlight, isTutorialActive, isExecuting]);
  
  //to challenge pannel
  useEffect(() => {
    if (!validationResult || isTutorialActive || !scrollToChallengeOnSuccess) return;
  
    const element = challengeRef.current;
    if (!element) return;
  
    const timeoutId = setTimeout(() => {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 3000);
  
    return () => clearTimeout(timeoutId);
  }, [validationResult?.success, isTutorialActive, scrollToChallengeOnSuccess,]);
  
  const challenge = useCurrentChallenge();
  if (!challenge) return;
  const allowedPointers = challenge.capabilities.allowedPointers;

  const showMoco = allowedPointers.includes('MOCO');
  const showChoco = allowedPointers.includes('CHOCO');

  const instructions = usePlayerInstructions();
  const executionError = useExecutionError();
  const executionErrorContext = useExecutionErrorContext();

  const array = useArrayState();
  const rawMocoPointer = useMocoPointer();
  const rawChocoPointer = useChocoPointer();
  
  const mocoPointer = showMoco ? rawMocoPointer : undefined;
  const chocoPointer = showChoco ? rawChocoPointer : undefined;
  

  const hand = useHand();
  const currentLine = useCurrentLine();
  const stepCount = useStepCount();
  const currentInstruction = useCurrentInstruction();

  const isHandActive =
  currentInstruction?.type === InstructionType.PICK ||
  currentInstruction?.type === InstructionType.PUT;

  const handAction: 'PICK' | 'PUT' | null =
  currentInstruction?.type === InstructionType.PICK
    ? 'PICK'
    : currentInstruction?.type === InstructionType.PUT
    ? 'PUT'
    : null;

    const activePointer =
    currentInstruction?.target ?? null;

    const isIfInstruction =
    currentInstruction?.type === InstructionType.IF_LESS ||
    currentInstruction?.type === InstructionType.IF_GREATER ||
    currentInstruction?.type === InstructionType.IF_EQUAL ||
    currentInstruction?.type === InstructionType.IF_NOT_EQUAL;

    const isSwap =
    currentInstruction?.type === InstructionType.SWAP;
    
    const isMove =
    currentInstruction?.type === InstructionType.MOVE_LEFT ||
    currentInstruction?.type === InstructionType.MOVE_RIGHT;  

    const moveAction: 'LEFT' | 'RIGHT' | null =
    currentInstruction?.type === InstructionType.MOVE_LEFT
      ? 'LEFT'
      : currentInstruction?.type === InstructionType.MOVE_RIGHT
      ? 'RIGHT'
      : null;


  if (!challenge) return null;

  const totalLines = instructions.length;

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      {validationResult?.success && 
        !successHintDismissed && 
        !isTutorialActive &&
        isAboveMiddle && (
        <SuccessOverlay />
      )}

      <div className="max-w-7xl mx-auto">

        {/* ================= HEADER ================= */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white mb-2"
            >
              ← Back to Station
            </button>
            <h1 className="text-2xl font-bold text-white">
              {challenge.title}
            </h1>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {/* ================= LEFT ================= */}
          <div ref={challengeRef} className="lg:col-span-1">
          <div
            className={
              useTutorialHighlight('WELCOME')
                ? 'ring-2 ring-yellow-400 rounded-lg'
                : ''
            }
          >
            <ChallengePanel />
          </div>

          </div>

          {/* ================= CENTER ================= */}
          <div className="lg:col-span-1">
            <div ref={visualizationRef} 
              className={`
                bg-gray-800 rounded-lg p-6
                ${useTutorialHighlight('TIMELINE') ? 'ring-2 ring-yellow-400' : ''}
              `}
              >
              <h3 className="text-white font-semibold mb-4">
                Workspace
              </h3>

              {/* Hand */}
              <div className="mb-4 rounded p-3">
                <div className="text-xs text-gray-400 mb-2">
                  Hand
                </div>
                <div className="flex justify-center">
                  <HandView
                    value={hand}
                    isActive={isHandActive}
                    arrayLength={array.length}
                  />
                </div>
              </div>


              {/* Pointers */}
              {array.length > 0 && (
                <div className="mb-4">
                  <PointerView
                    arrayLength={array.length}
                    mocoPointer={mocoPointer}
                    chocoPointer={chocoPointer}
                    errorContext={executionErrorContext ?? undefined}
                    isHandActive={isHandActive}
                    handAction={handAction}
                    moveAction={moveAction}
                    isIfActive={isIfInstruction}
                    isMoveActive={isMove}
                    isSwapActive={isSwap}
                    activePointer={activePointer}
                  />
                </div>
              )}


              {/* Array */}
              <div className="mb-4 flex justify-center">
              <ArrayView
                array={array}
                mocoPointer={mocoPointer}
                chocoPointer={chocoPointer}
                errorContext={executionErrorContext ?? undefined}
              />

              </div>

              {/* Timeline */}
              <ExecutionTimeline
                currentLine={currentLine}
                totalLines={totalLines}
                stepCount={stepCount}
                currentInstruction={currentInstruction}
              />
              {/* ================= ERROR ================= */}
              {executionError && (
                
              <div className="bg-gray-800 rounded-lg p-4">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-900/30 border border-red-500 rounded p-3"
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-sm text-red-300 font-semibold">
                    Execution Error
                  </div>
                  <div className="text-red-200 text-sm mt-1">
                    {executionError}
                  </div>
                </motion.div>
              </div>
              )}
            <ControlBar />
            </div>
          </div>
          
          {/* ================= RIGHT ================= */}
          <div className="lg:col-span-1">
            <div className="space-y-4" ref={instructionPaletteRef}>
              <TutorialOverlay />
              <InstructionPalette />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
