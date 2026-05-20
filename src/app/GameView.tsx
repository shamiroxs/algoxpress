/**
 * Main game view
 * Game-style layout with HUD, modes, and viewport-locked UI
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { Bug } from "lucide-react";

import {
  trackReportCardOpened,
  trackReportSubmitted,
} from '../analytics/integrations/storeAnalytics';

import { submitReport } from '../utils/reportTracker';

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
  useLocoPointer,
  useExtraArrayState,
} from '../orchestrator/selectors';

import { useGameStore } from '../orchestrator/store';

import { ChallengePanel } from '../ui/ChallengePanel';
import { DesktopTopBar } from './TopBar/DesktopTopBar';
import { MobileTopBar } from './TopBar/MobileTopBar';
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
  TouchSensor,
} from '@dnd-kit/core';

import { createInstruction } from '../engine/instructions/factory';
import { InstructionType } from '../engine/instructions/types';
import type { Instruction } from '../engine/instructions/types';
import { useIsTutorialActive, useTutorialHighlight } from '../tutorial/selectors';

import { useMediaQuery } from '../hooks/useMediaQuery';

import {
  createLabel,
  createJump,
  createIfEnd,
  createIfMeet,
} from '../engine/instructions/factory';

import {
  rectIntersection,
} from '@dnd-kit/core';
import type { CollisionDetection } from '@dnd-kit/core';

import { useTutorialStepId } from '../tutorial/selectors';
import { TutorialStepId } from '../tutorial/types';

type DragItem =
  | {
      source: 'PALETTE';
      instructionType: InstructionType;
      pointer: 'MOCO' | 'CHOCO' | 'LOCO';
      isGlobal?: boolean;
    }
  | { source: 'PROGRAM'; instructionId: string }
  | { source: 'IF_BODY'; instructionId: string; parentIfId: string };

type InsertPreview = { id: string; position: 'above' | 'below' } | null;

const collisionDetection: CollisionDetection = (args) => {
  // 1️⃣ Prefer child instructions inside IF bodies
  const childHits = rectIntersection({
    ...args,
    droppableContainers: args.droppableContainers.filter(
      (c) =>
        !c.id.toString().startsWith('IF_BODY_') &&
        c.data.current?.source === 'IF_BODY'
    ),
  });

  if (childHits.length > 0) return childHits;

   // 2️⃣ Then allow IF_BODY container as fallback
   const ifBodyHits = rectIntersection({
    ...args,
    droppableContainers: args.droppableContainers.filter((c) =>
      c.id.toString().startsWith('IF_BODY_')
    ),
  });

  if (ifBodyHits.length > 0) return ifBodyHits;

  // 2️⃣ Prefer PROGRAM instructions
  const programInstructionHits = rectIntersection({
    ...args,
    droppableContainers: args.droppableContainers.filter(
      (c) =>
        c.data.current?.source === 'PROGRAM'
    ),
  });

  if (programInstructionHits.length > 0) return programInstructionHits;

  const programHits = rectIntersection({
    ...args,
    droppableContainers: args.droppableContainers.filter(
      (c) => c.id === 'PROGRAM_DROPZONE'
    ),
  });

  if (programHits.length > 0) return programHits;

  // 3️⃣ Final fallback
  return closestCenter(args);
};

/** ---------- Label helpers ---------- */
function collectAllLabelNames(instructions: Instruction[]): Set<string> {
  const labels = new Set<string>();

  const walk = (list: Instruction[]) => {
    for (const inst of list) {
      if (inst.type === InstructionType.LABEL && 'labelName' in inst) {
        labels.add(inst.labelName);
      }
      if ('body' in inst && Array.isArray(inst.body)) {
        walk(inst.body);
      }
    }
  };

  walk(instructions);
  return labels;
}

function generateUniqueLabelName(instructions: Instruction[]): string {
  const existing = collectAllLabelNames(instructions);
  let n = 1;
  while (existing.has(`label${n}`)) n++;
  return `label${n}`;
}

function createInstructionFromPaletteDrop(
  instructionType: InstructionType,
  pointer: 'MOCO' | 'CHOCO' | 'LOCO',
  instructions: Instruction[]
): Instruction {
  const labelName = generateUniqueLabelName(instructions);

  switch (instructionType) {
    case InstructionType.LABEL:
      return createLabel(labelName);

    case InstructionType.JUMP:
      return createJump(labelName);

    case InstructionType.IF_END:
      return createIfEnd(pointer, labelName);

    case InstructionType.IF_MEET:
      return createIfMeet(labelName);

    default:
      return createInstruction(instructionType, pointer);
  }
}

function getPointerClientY(event: DragEndEvent | DragOverEvent): number {
  const e = event.activatorEvent;
  if (!e) return 0;

  if (e instanceof MouseEvent) return e.clientY;
  if (e instanceof TouchEvent && e.touches[0]) return e.touches[0].clientY;
  return 0;
}

function isAllowedInIfBody(inst: Instruction | InstructionType): boolean {
  const type = typeof inst === 'string' ? inst : inst.type;
  return type !== InstructionType.LABEL;
}

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
  [InstructionType.IF_EVEN]: '☯',
  [InstructionType.JUMP]: '↰',
  [InstructionType.LABEL]: '🏷️',
  [InstructionType.SWAP]: '⇄',
  [InstructionType.SWAP_WITH_NEXT]: '→←',
  [InstructionType.SWAP_WITH]: '⇄',
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
  { type: InstructionType.IF_EVEN, label: 'IFEven', description: 'If current value % 2 === 0' },
  { type: InstructionType.SET_POINTER, label: 'GotoSeat', description: 'Set pointer to index' },
  { type: InstructionType.SET_VALUE, label: 'SetValue', description: 'Set pointer to index' },
  { type: InstructionType.JUMP, label: 'Jump', description: 'Jump to label' },
  { type: InstructionType.LABEL, label: 'Label', description: 'Define a label' },
  { type: InstructionType.SWAP, label: 'Swap', description: 'Swap moco and choco value' },
  { type: InstructionType.SWAP_WITH_NEXT, label: 'SwapNext', description: 'Swap current with next element' },
  { type: InstructionType.SWAP_WITH, label: 'Swap*', description: 'Swap loco value with moco or choco' },
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
  pointer: 'MOCO' | 'CHOCO' | 'LOCO';
  isGlobal?: boolean;
}) {
  const skin = isGlobal
    ? 'bg-purple-900 border-purple-400'
    : pointer === 'MOCO'
    ? 'bg-blue-900 border-blue-400'
    : pointer === 'CHOCO'? 'bg-red-900 border-red-400'
    : 'bg-yellow-900 border-yellow-400';

  return (
    <div
      className={`
        relative aspect-square 
        w-12 sm:w-16
        rounded-lg sm:rounded-xl border-2
        flex flex-col items-center justify-center
        text-white
        scale-110 rotate-3
        shadow-2xl
        ring-2 ring-yellow-400
        ${skin}
      `}
    >
      <div className="text-lg sm:text-3xl">
        {INSTRUCTION_ICONS[instructionType]}
      </div>
      <div className="mt-1 text-[10px] sm:text-xs font-semibold">
        {getInstructionLabel(instructionType)}
      </div>
    </div>
  );
}

export function GameView() {
  const { trainId } = useParams<{ trainId: string }>();
  const navigate = useNavigate();

  /** ---------- GLOBAL STATE ---------- */
  const challenge = useCurrentChallenge();
  const playerInstructions = usePlayerInstructions();
  const executionError = useExecutionError();
  const executionErrorContext = useExecutionErrorContext();
  const validationResult = useGameStore((s) => s.validationResult);
  //const isExecuting = useGameStore((s) => s.isExecuting);
  const successHintDismissed = useGameStore((s) => s.successHintDismissed);

  const isTutorialActive = useIsTutorialActive();
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  /** ---------- LOCAL UI STATE ---------- */
  const [mode, setMode] = useState<'PLAY' | 'READ'>('PLAY');

  /** ---------- GAME DATA ---------- */
  const array = useArrayState();
  const extraArray = useExtraArrayState();
  const rawMocoPointer = useMocoPointer();
  const rawChocoPointer = useChocoPointer();
  const rawLocoPointer = useLocoPointer();
  const hand = useHand();
  const currentLine = useCurrentLine();
  const stepCount = useStepCount();
  const currentInstruction = useCurrentInstruction();

  if (!challenge) return null;

  const allowedPointers = challenge.capabilities.allowedPointers;
  const mocoPointer = allowedPointers.includes('MOCO') ? rawMocoPointer : undefined;
  const chocoPointer = allowedPointers.includes('CHOCO') ? rawChocoPointer : undefined;
  const locoPointer = allowedPointers.includes('LOCO') ? rawLocoPointer : undefined;
  const hasExtraArray = !!extraArray;

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
    currentInstruction?.type === InstructionType.IF_EVEN ||
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

  const totalLines = playerInstructions.length;

  const [insertPreview, setInsertPreview] = useState<InsertPreview>(null);
const [activeDragItem, setActiveDragItem] = useState<DragItem | null>(null);
const [layoutVersion, setLayoutVersion] = useState(0);
const bumpLayout = () => setLayoutVersion(v => v + 1);

const [showReportCard, setShowReportCard] = useState(false);
const [reportText, setReportText] = useState('');
const [reportSubmitted, setReportSubmitted] = useState(false);


const addInstruction = useGameStore((s) => s.addInstruction);
const removeInstruction = useGameStore((s) => s.removeInstruction);
const updateInstruction = useGameStore((s) => s.updateInstruction);
const reorderInstructions = useGameStore((s) => s.reorderInstructions);
const tutorialStep = useTutorialStepId();

const instructionOrderSignature = useMemo(
  () => playerInstructions.map((i) => i.id).join('|'),
  [playerInstructions]
);

const handleOpenReportCard = () => {
  const opening = !showReportCard;

  setShowReportCard(opening);

  if (opening) {
    trackReportCardOpened({
      challengeId: challenge.id,
      concepts: challenge.concepts,
      source: 'workspace',
    });
  }

  if (reportSubmitted) {
    setReportSubmitted(false);
  }
};

useLayoutEffect(() => {
  if (activeDragItem) return;
  setLayoutVersion((v) => v + 1);
}, [instructionOrderSignature]); // after render, before paint

useEffect(() => {
  if (
    tutorialStep === TutorialStepId.VISUALIZATION_EXPLAINED &&
    mode === 'READ'
  ) {
    setMode('PLAY');
  }
}, [tutorialStep, mode]);

useEffect(() => {
  let timer: ReturnType<typeof setTimeout> | null = null;

  console.log(successHintDismissed)
  if (validationResult?.success && !successHintDismissed && !isTutorialActive) {
    timer = setTimeout(() => {
      setShowSuccessOverlay(true);
    }, 2000); // 3 seconds
  } else {
    // reset if success disappears or conditions change
    setShowSuccessOverlay(false);
  }

  return () => {
    if (timer) clearTimeout(timer);
  };
}, [validationResult?.success, successHintDismissed, isTutorialActive]);

/** program rects for accurate insert preview */
const programContainerRef = useRef<HTMLDivElement | null>(null);
const programRects = useRef<Map<string, DOMRect>>(new Map());
const ifBodyRects = useRef<Map<string, Map<string, DOMRect>>>(new Map());

const sensors = useSensors(
  useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  useSensor(TouchSensor, {
    activationConstraint: { delay: 150, tolerance: 5 },
  })
);

// Helper to check what should be blurred
const blurTargets = {
  // WELCOME: entire background blurred
  isFullBlur: tutorialStep === TutorialStepId.WELCOME,
  
  // CHALLENGE_PANEL, PALETTE_EXPLAINED, PALETTE_HELP_EXPLAINED: main area blurred
  isMainAreaBlur: [
    TutorialStepId.CHALLENGE_PANEL,
    TutorialStepId.PALETTE_EXPLAINED,
    TutorialStepId.PALETTE_HELP_EXPLAINED
  ].includes(tutorialStep as any),

  // VISUALIZATION_EXPLAINED, PROGRAM_AREA_EXPLAINED: top bar blurred
  isTopBarBlur: [
    TutorialStepId.VISUALIZATION_EXPLAINED,
    TutorialStepId.PROGRAM_AREA_EXPLAINED,
    TutorialStepId.CHALLENGE_EXPLAINED
  ].includes(tutorialStep as any)
};

  function getInsertIndex(
    event: DragEndEvent | DragOverEvent,
    overInstructionId: string,
    instructions: Instruction[],
    rectMap: Map<string, DOMRect>
  ) {
    const hoverIndex = instructions.findIndex((i) => i.id === overInstructionId);
    if (hoverIndex === -1) return instructions.length;

    const rect = rectMap.get(overInstructionId);
    if (!rect) return hoverIndex;

    const pointerY = getPointerClientY(event);
    const midpoint = rect.top + rect.height / 2;

    return pointerY > midpoint ? hoverIndex + 1 : hoverIndex;
  }

  const onDragStart = (event: DragStartEvent) => {
    setActiveDragItem(event.active.data.current as DragItem);
    setInsertPreview(null);
  };

  const onDragOver = (event: DragOverEvent) => {
    const activeData = event.active.data.current as DragItem | undefined;
    const over = event.over;
    if (!activeData) return;

    const pointerY = getPointerClientY(event);

    if (!over) {
      if (playerInstructions.length === 0) {
        if (insertPreview !== null) setInsertPreview(null);
        return;
      }
  
      const firstId = playerInstructions[0].id;
      const lastId = playerInstructions[playerInstructions.length - 1].id;
  
      const firstRect = programRects.current.get(firstId);
      const lastRect = programRects.current.get(lastId);
  
      if (firstRect && pointerY < firstRect.top) {
        setInsertPreview({ id: firstId, position: 'above' });
        return;
      }
  
      if (lastRect && pointerY > lastRect.bottom) {
        setInsertPreview({ id: lastId, position: 'below' });
        return;
      }
  
      // if not clearly above first or below last, do nothing
      return;
    }

    if (over.id === 'PROGRAM_DROPZONE') {
      // no preview if empty
      if (playerInstructions.length === 0) {
        if (insertPreview !== null) setInsertPreview(null);
        return;
      }
    
      
    
      const firstId = playerInstructions[0].id;
      const lastId = playerInstructions[playerInstructions.length - 1].id;
    
      const firstRect = programRects.current.get(firstId);
      const lastRect = programRects.current.get(lastId);
    
      // If pointer is above first instruction => insert at start
      if (firstRect && pointerY < firstRect.top) {
        setInsertPreview({ id: firstId, position: 'above' });
        return;
      }
    
      // If pointer is below last instruction => insert at end
      if (lastRect && pointerY > lastRect.bottom) {
        setInsertPreview({ id: lastId, position: 'below' });
        return;
      }
    
      // Otherwise default to end (feels natural)
      setInsertPreview({ id: lastId, position: 'below' });
      return;
    }    

    const overData = over.data.current as
      | { source: 'PROGRAM'; instructionId: string }
      | { source: 'IF_BODY'; instructionId: string; parentIfId: string }
      | undefined;

    const isInsert =
      activeData.source === 'PALETTE' ||
      activeData.source === 'IF_BODY' ||
      activeData.source === 'PROGRAM';

    if (!isInsert || !overData) {
      if (insertPreview !== null) {
        setInsertPreview(null);
        setLayoutVersion((v) => v + 1);
      }
      return;
    }

    let rect: DOMRect | undefined;

    if (overData.source === 'PROGRAM') {
      rect = programRects.current.get(overData.instructionId);
    } else if (overData.source === 'IF_BODY') {
      rect =
        ifBodyRects.current.get(overData.parentIfId)?.get(overData.instructionId);
    }

    if (!rect) return;

    const position = pointerY > rect.top + rect.height / 2 + 1 ? 'below' : 'above';

    if (
      insertPreview &&
      insertPreview.id === overData.instructionId &&
      insertPreview.position === position
    ) {
      return;
    }

    setInsertPreview({ id: overData.instructionId, position });
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    const activeData = active.data.current as DragItem | undefined;
    if (!activeData) {
      setInsertPreview(null);
      setActiveDragItem(null);
      return;
    }

    if (!over) {
      // PALETTE → PROGRAM using preview even when over=null
      if (activeData.source === 'PALETTE' && insertPreview) {
        const inst = createInstructionFromPaletteDrop(
          activeData.instructionType,
          activeData.pointer,
          playerInstructions
        );

        if (playerInstructions.length === 0) {
          addInstruction(inst);
        } else {
          const hoverIndex = playerInstructions.findIndex(
            (i) => i.id === insertPreview.id
          );

          let insertIndex =
            insertPreview.position === 'below' ? hoverIndex + 1 : hoverIndex;

          insertIndex = Math.max(0, Math.min(insertIndex, playerInstructions.length));

          addInstruction(inst, insertIndex);
        }

        setInsertPreview(null);
        setActiveDragItem(null);
        setLayoutVersion((v) => v + 1);
        return;
      }

      // dropped outside
      if (activeData.source === 'PROGRAM') {
        removeInstruction(activeData.instructionId);
      }
      setInsertPreview(null);
      setActiveDragItem(null);
      setLayoutVersion((v) => v + 1);
      return;
    }

    const overData = over.data.current as
      | { source: 'PROGRAM'; instructionId: string }
      | { source: 'IF_BODY'; instructionId: string; parentIfId: string }
      | undefined;

    /* ─────────────────────────────────────────────
       PALETTE → IF_BODY
    ───────────────────────────────────────────── */
    if (activeData.source === 'PALETTE' && overData?.source === 'IF_BODY') {
      const parentIf = playerInstructions.find((i) => i.id === overData.parentIfId);
      if (!parentIf || !('body' in parentIf)) return;

      if (!isAllowedInIfBody(activeData.instructionType)) return;

      const rects = ifBodyRects.current.get(overData.parentIfId) ?? new Map();

      const insertIndex = getInsertIndex(
        event,
        overData.instructionId,
        parentIf.body,
        rects
      );

      const newInstruction = createInstructionFromPaletteDrop(
        activeData.instructionType,
        activeData.pointer,
        playerInstructions
      );

      const newBody = [...parentIf.body];
      newBody.splice(insertIndex, 0, newInstruction);

      updateInstruction(parentIf.id, { ...parentIf, body: newBody });

      setInsertPreview(null);
      setActiveDragItem(null);
      setLayoutVersion((v) => v + 1);
      return;
    }

    /* ─────────────────────────────────────────────
       PALETTE → PROGRAM
    ───────────────────────────────────────────── */
    if (activeData.source === 'PALETTE') {
      if (over.id === 'PROGRAM_DROPZONE') {
        const inst = createInstructionFromPaletteDrop(
          activeData.instructionType,
          activeData.pointer,
          playerInstructions
        );
        // If list empty, just append
        if (playerInstructions.length === 0) {
          addInstruction(inst);
        } else if (insertPreview) {
          // Use preview to compute index
          const hoverIndex = playerInstructions.findIndex(
            (i) => i.id === insertPreview.id
          );

          let insertIndex =
            insertPreview.position === 'below' ? hoverIndex + 1 : hoverIndex;

          // clamp safety
          insertIndex = Math.max(0, Math.min(insertIndex, playerInstructions.length));

          addInstruction(inst, insertIndex);
        } else {
          // fallback: append
          addInstruction(inst);
        }

        setInsertPreview(null);
        setActiveDragItem(null);
        setLayoutVersion((v) => v + 1);
        return;
      }

      if (overData?.source === 'PROGRAM') {
        const insertIndex = getInsertIndex(
          event,
          overData.instructionId,
          playerInstructions,
          programRects.current
        );

        const inst = createInstructionFromPaletteDrop(
          activeData.instructionType,
          activeData.pointer,
          playerInstructions
        );

        addInstruction(inst, insertIndex);
        setInsertPreview(null);
        setActiveDragItem(null);
        setLayoutVersion((v) => v + 1);
        return;
      }
    }

    /* ─────────────────────────────────────────────
       PROGRAM → IF_BODY
    ───────────────────────────────────────────── */
    if (activeData.source === 'PROGRAM' && overData?.source === 'IF_BODY') {
      const parentIf = playerInstructions.find((i) => i.id === overData.parentIfId);
      if (!parentIf || !('body' in parentIf)) return;

      const inst = playerInstructions.find((i) => i.id === activeData.instructionId);
      if (!inst) return;

      if (!isAllowedInIfBody(inst)) return;

      removeInstruction(inst.id);

      const rects = ifBodyRects.current.get(overData.parentIfId) ?? new Map();
      const insertIndex = getInsertIndex(event, overData.instructionId, parentIf.body, rects);

      const newBody = [...parentIf.body];
      newBody.splice(insertIndex, 0, inst);

      updateInstruction(parentIf.id, { ...parentIf, body: newBody });

      setInsertPreview(null);
      setActiveDragItem(null);
      setLayoutVersion((v) => v + 1);
      return;
    }

    /* ─────────────────────────────────────────────
       IF_BODY → PROGRAM
    ───────────────────────────────────────────── */
    if (
      activeData.source === 'IF_BODY' &&
      (over.id === 'PROGRAM_DROPZONE' || overData?.source === 'PROGRAM')
    ) {
      const parentIf = playerInstructions.find((i) => i.id === activeData.parentIfId);
      if (!parentIf || !('body' in parentIf)) return;

      const inst = parentIf.body.find((i) => i.id === activeData.instructionId);
      if (!inst) return;

      // remove from IF body
      updateInstruction(parentIf.id, {
        ...parentIf,
        body: parentIf.body.filter((i) => i.id !== inst.id),
      });

      const insertIndex =
        overData?.source === 'PROGRAM'
          ? getInsertIndex(event, overData.instructionId, playerInstructions, programRects.current)
          : playerInstructions.length;

      addInstruction(inst, insertIndex);

      setInsertPreview(null);
      setActiveDragItem(null);
      setLayoutVersion((v) => v + 1);
      return;
    }

    /* ─────────────────────────────────────────────
       IF_BODY → IF_BODY (same parent reorder)
    ───────────────────────────────────────────── */
    if (
      activeData.source === 'IF_BODY' &&
      overData?.source === 'IF_BODY' &&
      activeData.parentIfId === overData.parentIfId
    ) {
      const parentIf = playerInstructions.find((i) => i.id === activeData.parentIfId);
      if (!parentIf || !('body' in parentIf)) return;

      const from = parentIf.body.findIndex((i) => i.id === activeData.instructionId);
      const to = parentIf.body.findIndex((i) => i.id === overData.instructionId);

      if (from !== to) {
        const newBody = [...parentIf.body];
        const [moved] = newBody.splice(from, 1);
        newBody.splice(to, 0, moved);

        updateInstruction(parentIf.id, { ...parentIf, body: newBody });
      }

      setInsertPreview(null);
      setActiveDragItem(null);
      setLayoutVersion((v) => v + 1);
      return;
    }

    /* ─────────────────────────────────────────────
       PROGRAM → PROGRAM reorder
    ───────────────────────────────────────────── */
    if (activeData.source === 'PROGRAM' && overData?.source === 'PROGRAM') {
      const from = playerInstructions.findIndex((i) => i.id === activeData.instructionId);
      const to = playerInstructions.findIndex((i) => i.id === overData.instructionId);

      if (from !== to) reorderInstructions(from, to);

      setInsertPreview(null);
      setActiveDragItem(null);
      setLayoutVersion((v) => v + 1);
      return;
    }

    /* ─────────────────────────────────────────────
       PROGRAM → outside → delete
    ───────────────────────────────────────────── */
    if (activeData.source === 'PROGRAM') {
      const droppedInsideProgram =
        over.id === 'PROGRAM_DROPZONE' ||
        overData?.source === 'PROGRAM' ||
        overData?.source === 'IF_BODY';

      if (!droppedInsideProgram) {
        removeInstruction(activeData.instructionId);
      }
    }

    setInsertPreview(null);
    setActiveDragItem(null);
    setLayoutVersion((v) => v + 1);
  };

  const onDragCancel = () => {
    setInsertPreview(null);
    setActiveDragItem(null);
    setLayoutVersion((v) => v + 1);
  };

  
  const isDesktop = useMediaQuery('(min-width: 640px)');
  
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
  <div
    className="origin-center"
    style={{
      width: '100vw',
      height: '100vh',
      maxWidth: '100%',
      maxHeight: '100%',
    }}
  >
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
    <div className="h-full w-full overflow-y-auto bg-gray-900 text-white">
      {/* ================= SUCCESS OVERLAY ================= */}
      {showSuccessOverlay && <SuccessOverlay />}

      {/* ================= TOP BAR (HUD) — DESKTOP ================= */}
      <div className={`transition-all duration-500 ${
        (blurTargets.isFullBlur || blurTargets.isTopBarBlur) && isTutorialActive ? 'blur-md pointer-events-none' : ''
      }`}>
      {isDesktop ? (
        <DesktopTopBar
          challengeTitle={challenge.title}
          mode={mode}
          onToggleChallenge={toggleChallengePanel}
          onBack={() => navigate(`/train/${trainId}`)}
        />
      ) : (
        <MobileTopBar
          challengeTitle={challenge.title}
          mode={mode}
          onToggleChallenge={toggleChallengePanel}
          onBack={() => navigate(`/train/${trainId}`)}
        />
      )}
      </div>

      {/* ================= MAIN AREA ================= */}
      <div className={`relative h-[calc(100vh-12rem)] flex transition-all duration-500 ${
        (blurTargets.isFullBlur || blurTargets.isMainAreaBlur) && isTutorialActive ? 'blur-md pointer-events-none' : ''
      }`}>
        {/* ===== Visualization (2/3) ===== */}
        <div
          className={`w-2/3 px-2 py-4 sm:p-6 transition-opacity duration-200 
            ${mode === 'READ' ? 'opacity-30 pointer-events-none' : ''}
          `}
        >
          <div
            className={
              useTutorialHighlight('TIMELINE')
                ? 'ring-2 ring-yellow-400 rounded-lg'
                : ''
            }
          >
          <div
            className={`relative flex items-center justify-center
              ${
                challenge.clipboard === false ? 'mb-4 sm:mb-6' : 'mb-2 sm:mb-3'
              }
            `}
          >
            {/* LEFT SIDE */}
            <div className="absolute left-0">
              {/* Report Button */}
              {isDesktop ? (
                <button
                  type="button"
                  onClick={handleOpenReportCard}
                  className="
                    flex items-center gap-1
                    px-1.5 py-0.8 sm:px-2 sm:py-1
                    rounded sm:rounded-md
                    border border-orange-500/40
                    bg-orange-500/10
                    text-orange-300
                    hover:bg-orange-500/20
                    transition-colors
                    text-[8px] sm:text-[10px]
                    font-medium
                  "
                >
                  <Bug className="w-3 h-3 text-orange-300" /> Report
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenReportCard}
                  className="
                    flex items-center gap-1
                    px-1 py-0.8
                    rounded sm:rounded-md                   
                    transition-colors
                    text-[10px] sm:text-xs
                    font-medium
                  "
                >
                  <Bug className="w-3 h-3 text-orange-300" />
                </button>
              )}

              {/* Floating Report Card */}
              <AnimatePresence>
                {showReportCard && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    className="
                      absolute left-0 top-6 sm:top-10
                      z-50
                      w-28 sm:w-52
                      rounded-xl sm:rounded-2xl
                      border border-gray-700
                      bg-gray-800/95
                      p-2 sm:p-4
                      shadow-2xl
                      backdrop-blur-md
                    "
                  >
                    {!reportSubmitted ? (
                      <>
                        {/* Header */}
                        <div>
                          <p className="text-[7px] sm:text-[11px] font-semibold uppercase tracking-[0.12em] text-orange-300">
                            Challenge Report
                          </p>

                          <p className="mt-0.8 sm:mt-1 text-[7px] sm:text-sm text-gray-200 leading-relaxed">
                            Found an issue?
                          </p>
                        </div>

                        {/* Textarea */}
                        <div className="mt-1.5 sm:mt-3">
                          <textarea
                            value={reportText}
                            onChange={(e) => setReportText(e.target.value)}
                            placeholder="Describe the issue..."
                            rows={2}
                            className="
                              w-full resize-none rounded-lg sm:rounded-xl
                              border border-gray-700
                              bg-gray-900/60
                              px-2 py-2
                              text-[7px] sm:text-sm text-white
                              placeholder:text-gray-500
                              outline-none
                              transition-colors
                              focus:border-orange-500
                            "
                          />
                        </div>

                        {/* Actions */}
                        <div className="mt-1.5 sm:mt-3 flex gap-1 sm:gap-2">
                          <button
                            onClick={() => {
                              setShowReportCard(false);
                              setReportText('');
                            }}
                            className="
                              flex-1 rounded-md sm:rounded-lg
                              border border-gray-600
                              bg-gray-700/40
                              px-1 py-0.8 sm:px-1.8 sm:py-1
                              text-[8px] sm:text-xs
                              text-gray-300
                              hover:bg-gray-700/70
                              transition-colors
                            "
                          >
                            Cancel
                          </button>

                          <button
                            onClick={() => {
                              trackReportSubmitted({
                                challengeId: challenge.id,
                                concepts: challenge.concepts,
                            
                                reportLength: reportText.trim().length,
                            
                                hasText:
                                  reportText.trim().length > 0,
                            
                                source: 'workspace',
                              });
                            
                              submitReport({
                                challengeId: challenge.id,
                              
                                report: reportText,
                              
                                concepts: challenge.concepts,
                              
                                source: 'workspace',
                              });
                            
                              setReportSubmitted(true);
                            
                              setTimeout(() => {
                                setShowReportCard(false);
                                setReportText('');
                              }, 1400);
                            }}
                            className="
                              flex-1 rounded-md sm:rounded-lg
                              bg-orange-500
                              px-1 py-0.8 sm:px-1.8 sm:py-1
                              text-[8px] sm:text-sm
                              font-medium text-white
                              hover:bg-orange-400
                              transition-colors
                            "
                          >
                            Send
                          </button>
                        </div>
                      </>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="
                          rounded-lg sm:rounded-xl
                          border border-emerald-500/30
                          bg-emerald-500/10
                          p-1 sm:p-3
                        "
                      >
                        <p className="text-[8px] sm:text-sm font-semibold text-emerald-300">
                          ✓ Report received
                        </p>

                        <p className="mt-0.5 sm:mt-1 text-[7px] sm:text-xs text-emerald-100/80">
                          Thank you for helping..
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CENTER TITLE */}
            <h3 className="text-white font-semibold text-sm sm:text-base">
              Workspace
            </h3>
          </div>
          {/* Hand */}
          {challenge.clipboard !== false && (
            <div className="rounded">
              <div className="mb-0.5 sm:mb-1.5 flex justify-center">
                <HandView
                  value={hand}
                  isActive={isHandActive}
                  arrayLength={array.length}
                  errorContext={executionErrorContext ?? undefined}
                />
              </div>
              <div className="mb-3 sm:mb-4 text-[10px] sm:text-xs text-gray-400">
                Clipboard
              </div>
            </div>
          )}
          {/* EXTRA ARRAY (Source Array) */}
          {extraArray && (
            <>
              <div className="text-xs sm:text-sm text-gray-400 mb-1">
                Tickets
              </div>
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
              
              <ArrayView
                array={extraArray}
                mocoPointer={mocoPointer}
                chocoPointer={chocoPointer}
                // 👈 LOCO not here
                errorContext={executionErrorContext ?? undefined}
                mismatchIndexes={validationResult?.mismatches ?? []}

              />
            <div className="text-xs sm:text-sm text-gray-400 mb-1">
              Boarding Order
            </div>
          </>
          )}
          {/* Pointers */}
          {array.length > 0 && (
            <PointerView
              arrayLength={array.length}
              mocoPointer={hasExtraArray ? undefined : mocoPointer}
              chocoPointer={hasExtraArray ? undefined : chocoPointer}
              locoPointer={locoPointer}
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
          <div className="flex justify-center my-2">
            <ArrayView
              array={array}
              mocoPointer={hasExtraArray ? undefined : mocoPointer}
              chocoPointer={hasExtraArray ? undefined : chocoPointer}
              locoPointer={locoPointer}
              errorContext={executionErrorContext ?? undefined}
              mismatchIndexes={validationResult?.mismatches ?? []}
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
          {executionError && !isTutorialActive && (
            <div className="mt-2 sm:mt-4 bg-red-900/30 border border-red-500 rounded p-2 sm:p-3">
              <div className="text-xs sm:text-sm font-semibold text-red-300">
                Execution Error
              </div>
              <div className="text-xs sm:text-sm text-red-200">{executionError}</div>
            </div>
          )}

          {/* Validation Result (FAILED ONLY) */}
          {validationResult && !validationResult.success && !isTutorialActive && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded bg-red-900/30 border border-red-500"
            >
              <div className="font-semibold text-red-300">
                ✗ Mismatch Found
              </div>

              <div className="text-sm text-gray-300 mt-1">
                {validationResult.message}
              </div>

              <div className="text-xs text-gray-400 mt-1">
                Steps: {validationResult.stepCount}
                {challenge.maxSteps && (
                  <span className={validationResult.optimized ? '' : 'text-yellow-400'}>
                    {' '}({validationResult.optimized ? 'Optimized' : 'Not optimized'})
                  </span>
                )}
              </div>
            </motion.div>
          )}

          {/* Controls */}
          <div className="flex justify-center mt-3">
            <ControlBar />
          </div>
          </div>
        </div>

        {/* ===== Program Container (1/3) ===== */}
        <div ref={programContainerRef} className="w-1/3 border-l border-gray-700 bg-gray-850 p-3">
          
          {/* Program instructions live here */}
          <div className="flex-1 overflow-y-auto">
            <ProgramContainer
                insertPreview={insertPreview}
                activeDragItem={activeDragItem}
                layoutVersion={layoutVersion}
                programRects={programRects}
                ifBodyRects={ifBodyRects}
                bumpLayout={bumpLayout}
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
              className="absolute top-0 left-0 w-full sm:w-2/3 h-full bg-gray-900 z-30 border-r border-gray-700"
            >
              <div className="h-full overflow-y-auto p-6">
                <ChallengePanel />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <TutorialOverlay />
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
