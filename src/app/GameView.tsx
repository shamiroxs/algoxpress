/**
 * Main game view
 * Game-style layout with HUD, modes, and viewport-locked UI
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
import { InstructionPalette } from '../ui/InstructionPalette/InstructionPalette';
import { ProgramContainer } from "../ui/ProgramContainer/ProgramContainer"
import { ControlBar } from '../ui/ControlBar';
import { TutorialOverlay } from '../ui/TutorialOverlay';
import { SuccessOverlay } from '../ui/SuccessOverlay';

import { ArrayView } from '../renderer/ArrayView';
import { PointerView } from '../renderer/PointerView';
import { ExecutionTimeline } from '../renderer/ExecutionTimeline';
import { HandView } from '../renderer/HandView';

import { useMemo } from 'react';

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

import { createInstruction } from '../engine/instructions/factory';
import { InstructionType } from '../engine/instructions/types';
import type { Instruction } from '../engine/instructions/types';
import { useIsTutorialActive, useTutorialHighlight } from '../tutorial/selectors';

import { useIsPortrait } from '../hooks/useIsPortrait';

type DragItem =
  | {
      source: 'PALETTE';
      instructionType: InstructionType;
      pointer: 'MOCO' | 'CHOCO';
      isGlobal?: boolean;
    }
  | { source: 'PROGRAM'; instructionId: string }
  | { source: 'IF_BODY'; instructionId: string; parentIfId: string };

type InsertPreview = { id: string; position: 'above' | 'below' } | null;

const INSTRUCTION_ICONS: Record<InstructionType, string> = {
  [InstructionType.MOVE_LEFT]: '←',
  [InstructionType.MOVE_RIGHT]: '→',
  [InstructionType.MOVE_TO_END]: '→→',
  [InstructionType.PICK]: '🔗',
  [InstructionType.PUT]: '📋',
  [InstructionType.SET_POINTER]: '💺',
  [InstructionType.SET_VALUE]: '✍🏻',
  [InstructionType.IF_GREATER]: '>',
  [InstructionType.IF_LESS]: '<',
  [InstructionType.IF_EQUAL]: '=',
  [InstructionType.IF_NOT_EQUAL]: '!=',
  [InstructionType.IF_END]: '🏁',
  [InstructionType.IF_MEET]: '🤝',
  [InstructionType.JUMP]: '↰',
  [InstructionType.LABEL]: '🏷️',
  [InstructionType.SWAP]: '⇄',
  [InstructionType.SWAP_WITH_NEXT]: '→←',
  [InstructionType.INCREMENT_VALUE]: '➕',
  [InstructionType.DECREMENT_VALUE]: '➖',
  [InstructionType.WAIT]: '⏳',
};

const instructionTemplates = [
  { type: InstructionType.MOVE_LEFT, label: 'Left', description: 'Move pointer left (pointer -= 1)' },
  { type: InstructionType.MOVE_RIGHT, label: 'Right', description: 'Move pointer right (pointer += 1)' },
  { type: InstructionType.PICK, label: 'Copy', description: 'Copy value at pointer' },
  { type: InstructionType.PUT, label: 'Paste', description: 'Paste value at pointer' },
  { type: InstructionType.MOVE_TO_END, label: 'ToEnd', description: 'Move pointer to end (pointer = length - 1)' },
  { type: InstructionType.IF_GREATER, label: 'IFGreat', description: 'If hand > current value' },
  { type: InstructionType.IF_LESS, label: 'IFLess', description: 'If hand < current value' },
  { type: InstructionType.IF_EQUAL, label: 'IFEqual', description: 'If hand === current value' },
  { type: InstructionType.IF_NOT_EQUAL, label: 'IFNotEqual', description: 'If hand !== current value' },
  { 
    type: InstructionType.IF_END, 
    label: 'IFEnd', 
    description: 'If pointer == length - 1, jump to label' 
  },  
  { type: InstructionType.SET_POINTER, label: 'GotoSeat', description: 'Set pointer to index' },
  { type: InstructionType.SET_VALUE, label: 'SetValue', description: 'Set pointer to index' },
  { type: InstructionType.JUMP, label: 'Jump', description: 'Jump to label' },
  { type: InstructionType.LABEL, label: 'Label', description: 'Define a label' },
  { type: InstructionType.SWAP, label: 'Swap', description: 'Swap moco and choco value' },
  { type: InstructionType.SWAP_WITH_NEXT, label: 'SwapNext', description: 'Swap current with next element' },
  { type: InstructionType.IF_MEET, label: 'IFMeet', description: 'Jump if moco == choco' },
  { type: InstructionType.INCREMENT_VALUE, label: 'Value +', description: 'Increment value at pointer' },
  { type: InstructionType.DECREMENT_VALUE, label: 'Value -', description: 'Decrement value at pointer' },
  { type: InstructionType.WAIT, label: 'Wait', description: 'Wait (no operation)' },
];

function getInstructionLabel(type: InstructionType): string {
  return (
    instructionTemplates.find(t => t.type === type)?.label ?? type
  );
}

function PaletteDragPreview({
  instructionType,
  pointer,
  isGlobal,
}: {
  instructionType: InstructionType;
  pointer: 'MOCO' | 'CHOCO';
  isGlobal?: boolean;
}) {
  const skin = isGlobal
    ? 'bg-purple-900 border-purple-400'
    : pointer === 'MOCO'
    ? 'bg-blue-900 border-blue-400'
    : 'bg-red-900 border-red-400';

  return (
    <div
      className={`
        relative aspect-square w-20
        rounded-xl border-2
        flex flex-col items-center justify-center
        text-white
        scale-110 rotate-3
        shadow-2xl
        ring-2 ring-yellow-400
        ${skin}
      `}
    >
      <div className="text-xl sm:text-3xl">
        {INSTRUCTION_ICONS[instructionType]}
      </div>
      <div className="mt-1 text-xs font-semibold">
        {getInstructionLabel(instructionType)}
      </div>
    </div>
  );
}

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

function useViewportSize() {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return size;
}

export function GameView() {
  const navigate = useNavigate();

  /** ---------- GLOBAL STATE ---------- */
  const challenge = useCurrentChallenge();
  const instructions = usePlayerInstructions();
  const executionError = useExecutionError();
  const executionErrorContext = useExecutionErrorContext();
  const validationResult = useGameStore((s) => s.validationResult);
  //const isExecuting = useGameStore((s) => s.isExecuting);
  const successHintDismissed = useGameStore((s) => s.successHintDismissed);

  const isTutorialActive = useIsTutorialActive();
  const isPortrait = useIsPortrait();
  const highlightTimeline = useTutorialHighlight('TIMELINE');

  /** ---------- LOCAL UI STATE ---------- */
  const [mode, setMode] = useState<'PLAY' | 'READ'>('PLAY');

  /** ---------- GAME DATA ---------- */
  const array = useArrayState();
  const rawMocoPointer = useMocoPointer();
  const rawChocoPointer = useChocoPointer();
  const hand = useHand();
  const currentLine = useCurrentLine();
  const stepCount = useStepCount();
  const currentInstruction = useCurrentInstruction();

  if (!challenge) return null;

  const allowedPointers = challenge.capabilities.allowedPointers;
  const mocoPointer = allowedPointers.includes('MOCO') ? rawMocoPointer : undefined;
  const chocoPointer = allowedPointers.includes('CHOCO') ? rawChocoPointer : undefined;

  /** ---------- INSTRUCTION FLAGS ---------- */
  const isHandActive =
    currentInstruction?.type === InstructionType.PICK ||
    currentInstruction?.type === InstructionType.PUT;

  const handAction: 'PICK' | 'PUT' | null =
    currentInstruction?.type === InstructionType.PICK
      ? 'PICK'
      : currentInstruction?.type === InstructionType.PUT
      ? 'PUT'
      : null;

  const activePointer = currentInstruction?.target ?? null;

  const isIfInstruction =
    currentInstruction?.type === InstructionType.IF_LESS ||
    currentInstruction?.type === InstructionType.IF_GREATER ||
    currentInstruction?.type === InstructionType.IF_EQUAL ||
    currentInstruction?.type === InstructionType.IF_NOT_EQUAL;

  const isSwap = currentInstruction?.type === InstructionType.SWAP;

  const isMove =
    currentInstruction?.type === InstructionType.MOVE_LEFT ||
    currentInstruction?.type === InstructionType.MOVE_RIGHT;

  const moveAction: 'LEFT' | 'RIGHT' | null =
    currentInstruction?.type === InstructionType.MOVE_LEFT
      ? 'LEFT'
      : currentInstruction?.type === InstructionType.MOVE_RIGHT
      ? 'RIGHT'
      : null;

  /** ---------- UI HANDLERS ---------- */
  const toggleChallengePanel = () => {
    setMode((m) => (m === 'PLAY' ? 'READ' : 'PLAY'));
  };

  const totalLines = instructions.length;

  const [insertPreview, setInsertPreview] = useState<InsertPreview>(null);
const [activeDragItem, setActiveDragItem] = useState<DragItem | null>(null);
const [layoutVersion, setLayoutVersion] = useState(0);

const addInstruction = useGameStore((s) => s.addInstruction);
const updateInstruction = useGameStore((s) => s.updateInstruction);
const setPlayerInstructions = useGameStore((s) => s.setPlayerInstructions);

const { w, h } = useViewportSize();
const scale = Math.min(w / GAME_WIDTH, h / GAME_HEIGHT);


const sensors = useSensors(
  useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
);

const instructionIndexById = useMemo(() => {
  const map = new Map<string, number>();
  instructions.forEach((i, idx) => map.set(i.id, idx));
  return map;
}, [instructions]);

const computeAboveBelow = (e: DragOverEvent): 'above' | 'below' => {
  const clientY =
    e.activatorEvent instanceof MouseEvent
      ? e.activatorEvent.clientY
      : e.activatorEvent instanceof TouchEvent && e.activatorEvent.touches[0]
      ? e.activatorEvent.touches[0].clientY
      : 0;

  const rect = e.over?.rect;
  if (!rect) return 'below';
  return clientY < rect.top + rect.height / 2 ? 'above' : 'below';
};

  const parseDragItem = (data: any): DragItem | null => {
    if (!data) return null;
    if (data.source === 'PALETTE') return data;
    if (data.source === 'PROGRAM') return data;
    if (data.source === 'IF_BODY') return data;
    return null;
  };

  const isIfContainer = (inst: Instruction) =>
    inst.type === InstructionType.IF_GREATER ||
    inst.type === InstructionType.IF_LESS ||
    inst.type === InstructionType.IF_EQUAL ||
    inst.type === InstructionType.IF_NOT_EQUAL;

  const isAllowedInIfBody = (type: InstructionType) => type !== InstructionType.LABEL;

  const onDragStart = (e: DragStartEvent) => {
    const item = parseDragItem(e.active.data.current);
    setActiveDragItem(item);
    setInsertPreview(null);
  };

  const onDragOver = (e: DragOverEvent) => {
    if (!activeDragItem || !e.over) {
      setInsertPreview(null);
      return;
    }

    const overId = String(e.over.id);

    if (overId.startsWith('IF_BODY_')) {
      setInsertPreview(null);
      return;
    }

    if (overId !== 'PROGRAM_DROPZONE') {
      const pos = computeAboveBelow(e);
      setInsertPreview({ id: overId, position: pos });
      return;
    }

    setInsertPreview(null);
  };

  const onDragEnd = (e: DragEndEvent) => {
    const item = activeDragItem;
    setActiveDragItem(null);

    if (!item || !e.over) {
      setInsertPreview(null);
      return;
    }

    const overId = String(e.over.id);

    // drop into IF body
    if (overId.startsWith('IF_BODY_')) {
      const parentIfId = overId.replace('IF_BODY_', '');
      const parentIf = instructions.find((i) => i.id === parentIfId);

      if (!parentIf || !isIfContainer(parentIf)) {
        setInsertPreview(null);
        return;
      }

      if (item.source === 'PALETTE') {
        if (!isAllowedInIfBody(item.instructionType)) return;

        const newInst = createInstruction(item.instructionType, item.pointer);
        updateInstruction(parentIfId, { ...parentIf, body: [...parentIf.body, newInst] });
        setLayoutVersion((v) => v + 1);
        setInsertPreview(null);
        return;
      }

      setInsertPreview(null);
      return;
    }

    // drop on instruction line
    if (overId !== 'PROGRAM_DROPZONE') {
      const overIndex = instructionIndexById.get(overId);
      if (overIndex == null) return;

      const pos = insertPreview?.id === overId ? insertPreview.position : 'below';
      const insertIndex = pos === 'above' ? overIndex : overIndex + 1;

      if (item.source === 'PALETTE') {
        const newInst = createInstruction(item.instructionType, item.pointer);
        addInstruction(newInst, insertIndex);
        setLayoutVersion((v) => v + 1);
        setInsertPreview(null);
        return;
      }

      if (item.source === 'PROGRAM') {
        const fromIndex = instructionIndexById.get(item.instructionId);
        if (fromIndex == null) return;

        const toIndex = insertIndex > fromIndex ? insertIndex - 1 : insertIndex;
        const next = arrayMove(instructions, fromIndex, Math.max(0, Math.min(toIndex, instructions.length - 1)));
        setPlayerInstructions(next);
        setLayoutVersion((v) => v + 1);
        setInsertPreview(null);
        return;
      }
    }

    // drop at end
    if (overId === 'PROGRAM_DROPZONE') {
      if (item.source === 'PALETTE') {
        const newInst = createInstruction(item.instructionType, item.pointer);
        addInstruction(newInst);
        setLayoutVersion((v) => v + 1);
        setInsertPreview(null);
        return;
      }
    }

    setInsertPreview(null);
  };
  function RotateDeviceOverlay() {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center text-white">
        <div className="text-center px-6">
          <div className="text-6xl mb-4">📱↔️</div>
          <div className="text-xl font-semibold">
            Rotate your device
          </div>
          <div className="text-sm text-gray-400 mt-2">
            This game is played in landscape mode
          </div>
        </div>
      </div>
    );
  }  

  if (isPortrait) {
    return <RotateDeviceOverlay />;
  }
  
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
    <div
      style={{
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      }}
    >
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
    <div className="h-full w-full overflow-hidden bg-gray-900 text-white">
      {/* ================= SUCCESS OVERLAY ================= */}
      {validationResult?.success && 
        !successHintDismissed && 
        !isTutorialActive && (
        <SuccessOverlay />
      )}

      {/* ================= TOP BAR (HUD) ================= */}
      <div className="h-30 relative flex items-center justify-between px-4 bg-gray-800 border-b border-gray-700 z-20">
        
        <button
            onClick={(e) => {
              e.stopPropagation();
              navigate('/');
            }}
            className="absolute top-4 left-4 text-gray-400 hover:text-white"
          >
            ← Back to Station
        </button>

        {/* LEFT : Challenge Dropdown */}
        <div
          className="absolute left-0 w-1/2 flex items-center justify-center gap-3 cursor-pointer select-none"
          onClick={toggleChallengePanel}
        >

          <div className="flex items-center gap-2">
            <span className="font-semibold">{challenge.title}</span>
            <motion.span
              animate={{ rotate: mode === 'READ' ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              ▼
            </motion.span>
          </div>
        </div>

        {/* RIGHT : Action Cards */}
        <div className="ml-auto h-full flex items-center">
          <InstructionPalette />
        </div>
      </div>

      {/* ================= MAIN AREA ================= */}
      <div className="relative h-[calc(100%-4rem)] flex">
        {/* ===== Visualization (2/3) ===== */}
        <div
          className={`w-2/3 p-6 transition-opacity duration-200 
            ${mode === 'READ' ? 'opacity-30 pointer-events-none' : ''}
            ${highlightTimeline ? 'ring-2 ring-yellow-400' : ''}
          `}
        >
          <h3 className="text-white font-semibold mb-4">
                Workspace
          </h3>
          {/* Hand */}
          <div className="mb-4 flex justify-center">
            <HandView
              value={hand}
              isActive={isHandActive}
              arrayLength={array.length}
            />
          </div>

          {/* Pointers */}
          {array.length > 0 && (
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
          )}

          {/* Array */}
          <div className="flex justify-center my-6">
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

          {/* Error */}
          {executionError && (
            <div className="mt-4 bg-red-900/30 border border-red-500 rounded p-3">
              <div className="text-sm font-semibold text-red-300">
                Execution Error
              </div>
              <div className="text-sm text-red-200">{executionError}</div>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-center">
            <ControlBar />
          </div>
        </div>

        {/* ===== Program Container (1/3) ===== */}
        <div className="w-1/3 border-l border-gray-700 bg-gray-850 p-4">
          <TutorialOverlay />
          {/* Program instructions live here */}
          <div className="mt-2 flex-1 overflow-y-auto">
            <ProgramContainer
                insertPreview={insertPreview}
                activeDragItem={activeDragItem}
                layoutVersion={layoutVersion}
              />
          </div>
        </div>

        {/* ================= CHALLENGE PANEL OVERLAY ================= */}
        <AnimatePresence>
          {mode === 'READ' && (
            <motion.div
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="absolute top-0 left-0 w-2/3 h-full bg-gray-900 z-30 border-r border-gray-700"
            >
              <div className="h-full overflow-y-auto p-6">
                <ChallengePanel />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <DragOverlay>
        {activeDragItem?.source === 'PALETTE' ? (
          <div className="pointer-events-none">
            <PaletteDragPreview
              instructionType={activeDragItem.instructionType}
              pointer={activeDragItem.pointer}
              isGlobal={activeDragItem.isGlobal}
            />
          </div>
        ) : null}
      </DragOverlay>
    </div>
    </DndContext>
    </div>
  </div>
  );
}
