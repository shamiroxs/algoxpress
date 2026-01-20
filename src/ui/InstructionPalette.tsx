/**
 * Instruction palette for building programs
 * Drag-and-drop or click-to-add interface
 */


import { useState } from 'react';
import { useRef, useLayoutEffect, useMemo, useEffect } from 'react';
import { useGameStore } from '../orchestrator/store';
import { InstructionType } from '../engine/instructions/types';
import type { Instruction } from '../engine/instructions/types';
import {
  createInstruction,
  createMoveLeft,
  createMoveRight,
  createMoveToEnd,
  createSetPointer,
  createPick,
  createPut,
  createIfGreater,
  createIfLess,
  createIfEqual,
  createIfNotEqual,
  createIfEnd,
  createIfMeet,
  createJump,
  createLabel,
  createSwap,
  createSwapWithNext,
  createIncrementValue,
  createDecrementValue,
  createWait,
  createSetValue,
} from '../engine/instructions/factory';

import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import type { DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { DragOverlay } from '@dnd-kit/core';

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';

import { useExecutionErrorContext } from '../orchestrator/selectors';

import {
  closestCenter,
  rectIntersection,
} from '@dnd-kit/core';
import type { CollisionDetection } from '@dnd-kit/core';
import { useTutorialBehavior, useTutorialHighlight } from '../tutorial/selectors';

const collisionDetection: CollisionDetection = (args) => {
  // 1️⃣ Prefer child instructions inside IF bodies
  const childHits = rectIntersection({
    ...args,
    droppableContainers: args.droppableContainers.filter(
      c =>
        !c.id.toString().startsWith('IF_BODY_') &&
        c.data.current?.source === 'IF_BODY'
    ),
  });

  if (childHits.length > 0) {
    return childHits;
  }

  // 2️⃣ Then allow IF_BODY container as fallback
  const ifBodyHits = rectIntersection({
    ...args,
    droppableContainers: args.droppableContainers.filter(
      c => c.id.toString().startsWith('IF_BODY_')
    ),
  });

  if (ifBodyHits.length > 0) {
    return ifBodyHits;
  }

  // 3️⃣ Final fallback
  return closestCenter(args);
};

//const pointer: 'MOCO' | 'CHOCO' = 'MOCO';
//const POINTERS: Array<'MOCO' | 'CHOCO'> = ['MOCO', 'CHOCO'];

type DragItem =
  | { source: 'PALETTE'; instructionType: InstructionType; pointer: 'MOCO' | 'CHOCO'; isGlobal?: boolean; }
  | { source: 'PROGRAM'; instructionId: string }
  | { source: 'IF_BODY'; instructionId: string; parentIfId: string };

const instructionTemplates = [
  { type: InstructionType.MOVE_LEFT, label: '← Left', description: 'Move pointer left (pointer -= 1)' },
  { type: InstructionType.MOVE_RIGHT, label: 'Right →', description: 'Move pointer right (pointer += 1)' },
  { type: InstructionType.PICK, label: 'Copy', description: 'Copy value at pointer into memory' },
  { type: InstructionType.PUT, label: 'Paste', description: 'Paste memory value at pointer' },
  { type: InstructionType.MOVE_TO_END, label: 'ToEnd →→', description: 'Move pointer to end (pointer = length - 1)' },
  { type: InstructionType.IF_GREATER, label: 'IFGreat ?', description: 'If hand > current value' },
  { type: InstructionType.IF_LESS, label: 'IFLess ?', description: 'If hand < current value' },
  { type: InstructionType.IF_EQUAL, label: 'IFEqual ?', description: 'If hand === current value' },
  { type: InstructionType.IF_NOT_EQUAL, label: 'IFNotEqual ?', description: 'If hand !== current value' },
  { 
    type: InstructionType.IF_END, 
    label: 'IFEnd ?', 
    description: 'Jump if pointer is at last element' 
  },  
  { type: InstructionType.SET_POINTER, label: 'GotoSeat ↦', description: 'Set pointer to index' },
  { type: InstructionType.SET_VALUE, label: 'SetValue ?', description: 'Set pointer to index' },
  { type: InstructionType.JUMP, label: 'Jump ⟲', description: 'Jump to label' },
  { type: InstructionType.LABEL, label: 'Label', description: 'Define a label' },
  { type: InstructionType.SWAP, label: 'Swap ⇄', description: 'Swap moco and choco value' },
  { type: InstructionType.SWAP_WITH_NEXT, label: 'SwapNext →←', description: 'Swap current with next element' },
  { type: InstructionType.IF_MEET, label: 'IFMeet ?', description: 'Jump if moco === choco' },
  { type: InstructionType.INCREMENT_VALUE, label: 'Value +', description: 'Increment value at pointer' },
  { type: InstructionType.DECREMENT_VALUE, label: 'Value -', description: 'Decrement value at pointer' },
  { type: InstructionType.WAIT, label: 'Wait', description: 'Wait (no operation)' },
];

const globalInstructionTypes: InstructionType[] = [
  InstructionType.SWAP,
  InstructionType.IF_MEET,
  InstructionType.JUMP,
  InstructionType.LABEL,
  InstructionType.WAIT,
];

const OWNER_STYLE_MAP = {
  MOCO: {
    bg: 'bg-blue-700',
    border: 'border-blue-400',
    text: 'text-white',
  },
  CHOCO: {
    bg: 'bg-red-700',
    border: 'border-red-400',
    text: 'text-white',
  },
  BOTH: {
    bg: 'bg-purple-700',
    border: 'border-purple-400',
    text: 'text-white',
  },
} as const;

function getPointerClientY(event: DragEndEvent | DragOverEvent): number {
  const e = event.activatorEvent;

  if (!e) return 0;

  if (e instanceof MouseEvent) {
    return e.clientY;
  }

  if (e instanceof TouchEvent && e.touches[0]) {
    return e.touches[0].clientY;
  }

  return 0;
}

export function InstructionPalette() {
  const { playerInstructions, addInstruction, clearPlayerInstructions, executionState } = useGameStore();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,      // 👈 critical for mobile
        tolerance: 5,
      },
    })
  );
  const behavior = useTutorialBehavior();
  const highlight = behavior?.highlight;

  const tutorialInstruction =
  behavior?.highlight?.instructionType ?? null;

  const restrictToSingleInstruction =
    tutorialInstruction &&
    (
      behavior.highlight?.scope === 'INSTRUCTION_PALETTE'
    );

  const [showHelp, setShowHelp] = useState(false);

  const { reorderInstructions, removeInstruction, updateInstruction } = useGameStore();
  const { currentChallenge } = useGameStore();

  const capabilities = currentChallenge?.capabilities;
  const allowedPointers = capabilities?.allowedPointers ?? ['MOCO', 'CHOCO'];
  const allowedInstructions = new Set(
    capabilities?.allowedInstructions ?? Object.values(InstructionType)
  );

  const pointerInstructionTemplates = instructionTemplates.filter(
    (t) =>
      !globalInstructionTypes.includes(t.type) &&
      allowedInstructions.has(t.type)
  );

  const globalInstructionTemplates = instructionTemplates.filter(
    (t) =>
      globalInstructionTypes.includes(t.type) &&
      allowedInstructions.has(t.type)
  );


  const programContainerRef = useRef<HTMLDivElement | null>(null);

  const [layoutVersion, setLayoutVersion] = useState(0);
  const instructionOrderSignature = useMemo(
    () => playerInstructions.map(i => i.id).join('|'),
    [playerInstructions]
  );  

  useLayoutEffect(() => {
    // Runs after playerInstructions render,
    // before browser paint — DOMRects are ready
    setLayoutVersion(v => v + 1);
  }, [instructionOrderSignature]); 

  // instruction.S → DOMRect
  const programRects = useRef<Map<string, DOMRect>>(new Map());
  const ifBodyRects = useRef<Map<string, Map<string, DOMRect>>>(new Map());
  
  const [insertPreview, setInsertPreview] = useState<{
    id: string;
    position: 'above' | 'below';
  } | null>(null);
  
  const currentInstructionId =
    executionState?.currentInstructionId ?? null;

  // Generate unique label name
  const generateUniqueLabelName = (): string => {
    const existingLabels = new Set<string>();
    playerInstructions.forEach((inst) => {
      if (inst.type === 'LABEL' && 'labelName' in inst) {
        existingLabels.add(inst.labelName);
      }
    });
    
    let counter = 1;
    let labelName = 'label1';
    while (existingLabels.has(labelName)) {
      counter++;
      labelName = `label${counter}`;
    }
    return labelName;
  };
  
  const handleAddInstruction = (type: InstructionType, pointer: 'MOCO' | 'CHOCO') => {
    let instruction: Instruction;
    if (!allowedInstructions.has(type)) return;
    
    // Create instruction with default values (user can edit later)
    switch (type) {
      case InstructionType.MOVE_LEFT:
        instruction = createMoveLeft(pointer);
        break;

      case InstructionType.MOVE_RIGHT:
        instruction = createMoveRight(pointer);
        break;
      case InstructionType.MOVE_TO_END:
        instruction = createMoveToEnd(pointer);
        break;

      case InstructionType.SET_POINTER:
        instruction = createSetPointer(pointer,0);
        break;
      case InstructionType.SET_VALUE:
        instruction = createSetValue(pointer,0);
        break;
      case InstructionType.PICK:
        instruction = createPick(pointer);
        break;
      case InstructionType.PUT:
        instruction = createPut(pointer);
        break;
      case InstructionType.IF_GREATER:
        instruction = createIfGreater(pointer);
        break;
      case InstructionType.IF_LESS:
        instruction = createIfLess(pointer);
        break;
      case InstructionType.IF_EQUAL:
        instruction = createIfEqual(pointer);
        break;
      case InstructionType.IF_NOT_EQUAL:
        instruction = createIfNotEqual(pointer);
        break;
      case InstructionType.IF_END:
        instruction = createIfEnd(pointer, generateUniqueLabelName());
        break;
      case InstructionType.IF_MEET:
        instruction = createIfMeet(generateUniqueLabelName());
        break;
        
      case InstructionType.JUMP:
        instruction = createJump(generateUniqueLabelName());
        break;
      case InstructionType.LABEL:
        instruction = createLabel(generateUniqueLabelName());
        break;
      case InstructionType.SWAP:
        instruction = createSwap();
        break;
      case InstructionType.SWAP_WITH_NEXT:
        instruction = createSwapWithNext(pointer);
        break;
      case InstructionType.INCREMENT_VALUE:
        instruction = createIncrementValue(pointer);
        break;
      case InstructionType.DECREMENT_VALUE:
        instruction = createDecrementValue(pointer);
        break;
      case InstructionType.WAIT:
        instruction = createWait();
        break;
      default:
        return;
    }
    
    addInstruction(instruction);
  };
  const [activeDragItem, setActiveDragItem] = useState<DragItem | null>(null);

  function ProgramDropzone({
    children,
    highlight,
  }: {
    children: React.ReactNode;
    highlight?: boolean;
  }) {
    const { setNodeRef, isOver } = useDroppable({
      id: 'PROGRAM_DROPZONE',
    });
  
    return (
      <div
        ref={setNodeRef}
        className={`flex flex-col min-h-0 space-y-1 flex-1 overflow-y-auto rounded p-1 scrollbar-transparent
          ${
            highlight
              ? 'ring-2 ring-yellow-400'
              : isOver
              ? 'ring-2 ring-green-400'
              : 'ring-2 ring-gray-700'
          }
        `}
      >
        {children}
      </div>
    );
  }
  
  type InstructionOwner = 'MOCO' | 'CHOCO' | 'BOTH';

  function getInstructionOwner(inst: Instruction): InstructionOwner {
    // Global instructions (no target)
    if (!('target' in inst) || inst.target === undefined) {
      return 'BOTH';
    }

    // Pointer-based instructions
    return inst.target;
  }
  
  function getInstructionStyle(inst: Instruction) {
    const owner = getInstructionOwner(inst);
    return OWNER_STYLE_MAP[owner];
  }
  
  
  function DraggablePaletteItem({
    template,
    pointer,
    isGlobal = false,
  }: {
    template: { type: InstructionType; label: string; description: string };
    pointer: 'MOCO' | 'CHOCO';
    isGlobal?: boolean;
  }) {

    const isAllowedByTutorial =
    !restrictToSingleInstruction ||
    template.type === tutorialInstruction;

    const shouldPulse = useTutorialHighlight(
      'INSTRUCTION_PALETTE',
      { instructionType: template.type }
    );
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({
        id: `palette-${pointer}-${template.type}`,
        disabled: !isAllowedByTutorial,
        data: {
          source: 'PALETTE',
          instructionType: template.type,
          pointer,
          isGlobal,
        } satisfies DragItem,
      });
  
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };
  
    // Set button color based on pointer
    const buttonClass = isGlobal
      ? 'bg-purple-700 hover:bg-purple-600 text-white'
      : pointer === 'MOCO'
      ? 'bg-blue-700 hover:bg-blue-600 text-white'
      : 'bg-red-700 hover:bg-red-600 text-white';
    
    const disabledClass = !isAllowedByTutorial
      ? 'opacity-30 cursor-not-allowed'
      : '';
    
    return (
      <button
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={style}
        onClick={() => {
          if (!isAllowedByTutorial) return;
          handleAddInstruction(template.type, pointer);
        }}
        className={`${buttonClass} 
          ${disabledClass}
          ${shouldPulse ? 'animate-pulse ring-2 ring-yellow-400' : ''}
          px-3 py-2 rounded text-sm transition-colors select-none touch-none`
        }
        title={template.description}
      >
        {template.label}
      </button>
    );
  }
  const formatInstruction = (inst: Instruction): string => {
    switch (inst.type) {
      case InstructionType.MOVE_LEFT:
        return '← Left';
      case InstructionType.MOVE_RIGHT:
        return 'Right →';
      case InstructionType.MOVE_TO_END:
        return 'ToEnd →→';
      case InstructionType.SET_POINTER:
        return `Goto ${inst.index}`;
      case InstructionType.SET_VALUE:
        return `Set ${inst.value}`;
      case InstructionType.PICK:
        return 'Copy';
      case InstructionType.PUT:
        return 'Paste';
      case InstructionType.IF_GREATER:
        return 'IFGreat';
      case InstructionType.IF_LESS:
        return 'IFLess';
      case InstructionType.IF_EQUAL:
        return 'IFEqual';
      case InstructionType.IF_NOT_EQUAL:
        return 'IFNotEqual';
      case InstructionType.IF_END:
        return `IFEnd ${inst.label}`;
      case InstructionType.IF_MEET:
        return `IFMeet ${inst.label}`;
    
      case InstructionType.JUMP:
        return `Jump ${inst.label}`;
      case InstructionType.LABEL:
        return `${inst.labelName}:`;
      case InstructionType.SWAP:
        return 'Swap ⇄';
      case InstructionType.SWAP_WITH_NEXT:
        return 'SwapNext →←';
      case InstructionType.INCREMENT_VALUE:
        return 'Value +';
      case InstructionType.DECREMENT_VALUE:
        return 'Value -';
      case InstructionType.WAIT:
        return 'Wait';
      default:
        return 'UNKNOWN';
    }
  };
  
  function FlowchartBlock({
    instruction,
    onEdit,
    parentIfId,
  }: {
    instruction: Instruction;
    lineNumber: number;
    parentIfId?: string;
    onEdit?: () => void; // optional click handler for editing
  }) {
    //const { removeInstruction } = useGameStore();
    const style = getInstructionStyle(instruction);
  
    const hasEditableParameter =
      instruction.type === InstructionType.SET_POINTER ||
      instruction.type === InstructionType.SET_VALUE ||
      instruction.type === InstructionType.LABEL ||
      instruction.type === InstructionType.IF_GREATER ||
      instruction.type === InstructionType.IF_LESS ||
      instruction.type === InstructionType.IF_EQUAL ||
      instruction.type === InstructionType.IF_NOT_EQUAL ||
      instruction.type === InstructionType.IF_END ||
      instruction.type === InstructionType.IF_MEET ||
      instruction.type === InstructionType.JUMP;
  
    return (
      <div
        className={`
          relative
          max-w-sm
          flex items-center justify-between
          px-5 py-0.5
          rounded-lg
          border
          shadow-md
          transition
          ${style.bg}
          ${style.border}
          ${style.text}
          font-mono
          text-sm
          group
          select-none
          touch-none
        `}
      >  
        {/* Instruction text */}
        <div
          className={`
            flex-1
            text-center
            select-none
            ${hasEditableParameter ? 'cursor-pointer hover:opacity-90' : ''}
          `}
          onClick={hasEditableParameter ? onEdit : undefined}
          title={hasEditableParameter ? 'Click to edit' : undefined}
        >
          {formatInstruction(instruction)}
        </div>
        <button
        onClick={() => {
          if (!parentIfId) {
            // top-level
            removeInstruction(instruction.id);
            return;
          }
      
          // nested IF body
          const parentIf = playerInstructions.find(i => i.id === parentIfId);
          if (!parentIf || !('body' in parentIf)) return;
      
          updateInstruction(parentIf.id, {
            ...parentIf,
            body: parentIf.body.filter(child => child.id !== instruction.id),
          });
        }}
        className="absolute right-2 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ×
      </button>
      </div>
    );
  }

  const labelMap = useMemo(() => {
    const map = new Map<string, Instruction>();
    playerInstructions.forEach((inst) => {
      if (inst.type === InstructionType.LABEL && 'labelName' in inst) {
        map.set(inst.labelName, inst);
      }
    });
    return map;
  }, [playerInstructions]);

  const arrows = useMemo(() => {
    const results: Array<{
      from: Instruction;
      to: Instruction;
      color: string;
    }> = [];
  
    for (const inst of playerInstructions) {
      if (!('label' in inst)) continue;
      const target = labelMap.get(inst.label);
      if (!target) continue;
  
      const owner = getInstructionOwner(inst);
      const color =
        owner === 'MOCO'
          ? '#3b82f6'
          : owner === 'CHOCO'
          ? '#ef4444'
          : '#a855f7';
  
      results.push({ from: inst, to: target, color });
    }
  
    return results;
  }, [playerInstructions, labelMap]);
  
  const errorContext = useExecutionErrorContext();

  function SortableInstructionLine({
    instruction,
    index,
    isActive,
    insertPreview,
    parentIfId,
  }: {
    instruction: Instruction;
    index: number;
    isActive: boolean;
    insertPreview: {
      id: string;
      position: 'above' | 'below';
    } | null;
    parentIfId?: string;
  }) {
    const { setNodeRef: setDropRef } = useDroppable({
      id: instruction.id,
    });
    
    const showGapAbove =
      insertPreview?.id === instruction.id &&
      insertPreview.position === 'above';

    const showGapBelow =
      insertPreview?.id === instruction.id &&
      insertPreview.position === 'below';

        
    const rowRef = useRef<HTMLDivElement | null>(null);

    const { updateInstruction, playerInstructions } = useGameStore();
  
    const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: instruction.id,
      data: parentIfId
        ? {
            source: 'IF_BODY',
            instructionId: instruction.id,
            parentIfId,
          }
        : {
            source: 'PROGRAM',
            instructionId: instruction.id,
          },
    });
    
    useLayoutEffect(() => {
      if (!rowRef.current || !programContainerRef.current) return;
    
      const rowRect = rowRef.current.getBoundingClientRect();
      const containerRect =
        programContainerRef.current.getBoundingClientRect();
    
      const relativeRect = {
        top: rowRect.top - containerRect.top,
        left: rowRect.left - containerRect.left,
        right: rowRect.right - containerRect.left,
        height: rowRect.height,
        width: rowRect.width,
      };
    
      if (!parentIfId) {
        programRects.current.set(instruction.id, relativeRect as DOMRect);
      } else {
        if (!ifBodyRects.current.has(parentIfId)) {
          ifBodyRects.current.set(parentIfId, new Map());
        }
        ifBodyRects.current
          .get(parentIfId)!
          .set(instruction.id, relativeRect as DOMRect);
      }
    
      return () => {
        if (!parentIfId) {
          programRects.current.delete(instruction.id);
        } else {
          ifBodyRects.current.get(parentIfId)?.delete(instruction.id);
        }
      };
    }, [instruction.id, parentIfId]);
    
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    const isError =
    (errorContext?.kind === 'INSTRUCTION' || errorContext?.kind === 'POINTER') &&
    currentInstructionId === instruction.id;

  
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
  
    const hasEditableParameter =
      instruction.type === InstructionType.SET_POINTER ||
      instruction.type === InstructionType.SET_VALUE ||
      instruction.type === InstructionType.LABEL ||
      instruction.type === InstructionType.IF_GREATER ||
      instruction.type === InstructionType.IF_LESS ||
      instruction.type === InstructionType.IF_EQUAL ||
      instruction.type === InstructionType.IF_NOT_EQUAL ||
      instruction.type === InstructionType.IF_END ||
      instruction.type === InstructionType.IF_MEET ||
      instruction.type === InstructionType.JUMP;
  
    const handleEdit = () => {
      if (instruction.type === InstructionType.SET_POINTER && 'index' in instruction) {
        setEditValue(instruction.index.toString());
      } else if (instruction.type === InstructionType.SET_VALUE && 'value' in instruction) {
        setEditValue(instruction.value.toString());
      } else if (instruction.type === InstructionType.LABEL && 'labelName' in instruction) {
        setEditValue(instruction.labelName);
      } else if ('label' in instruction) {
        setEditValue(instruction.label);
      } else {
        return;
      }
      setIsEditing(true);
    };

    function collectLabels(instructions: Instruction[], set = new Set<string>()) {
      for (const inst of instructions) {
        if (inst.type === InstructionType.LABEL && 'labelName' in inst) {
          set.add(inst.labelName);
        }
        if ('body' in inst) {
          collectLabels(inst.body, set);
        }
      }
      return set;
    }
    
  
    const handleSave = () => {
      let updatedInstruction: Instruction | null = null;
  
      if (instruction.type === InstructionType.SET_POINTER && 'index' in instruction) {
        const indexValue = parseInt(editValue, 10);
        if (!isNaN(indexValue) && indexValue >= 0) {
          updatedInstruction = { ...instruction, index: indexValue };
        }
      } else if (instruction.type === InstructionType.SET_VALUE && 'value' in instruction) {
        const numberValue = parseInt(editValue, 10);
        if (!isNaN(numberValue) && numberValue >= 0) {
          updatedInstruction = { ...instruction, value: numberValue };
        }
      } else if (instruction.type === InstructionType.LABEL && 'labelName' in instruction) {
        const labelName = editValue.trim();
        if (labelName.length > 0) {
          const existingLabels = collectLabels(playerInstructions);
          existingLabels.delete(instruction.labelName);

          if (!existingLabels.has(labelName)) {
            updatedInstruction = { ...instruction, labelName };
          } else {
            alert(`Label "${labelName}" already exists`);
            return;
          }
        }
      } else if ('label' in instruction) {
        const label = editValue.trim();
        if (label.length > 0) {
          updatedInstruction = { ...instruction, label };
        }
      }
  
      if (!updatedInstruction) return;

      if (!parentIfId) {
        // top-level instruction
        updateInstruction(instruction.id, updatedInstruction);
      } else {
        // nested instruction
        const parentIf = playerInstructions.find(i => i.id === parentIfId);
        if (!parentIf || !('body' in parentIf)) return;

        updateInstruction(parentIf.id, {
          ...parentIf,
          body: parentIf.body.map(child =>
            child.id === instruction.id ? updatedInstruction : child
          ),
        });
      }

  
      setIsEditing(false);
      setEditValue('');
    };
  
    const handleCancel = () => {
      setIsEditing(false);
      setEditValue('');
    };

    const { setNodeRef: setIfBodyRef, isOver } = useDroppable({
      id: `IF_BODY_${instruction.id}`,
      data: {
        source: 'IF_BODY',
        parentIfId: instruction.id,
      },
    });   

    const isDraggingInsideIf =
    activeDragItem?.source === 'IF_BODY' &&
    activeDragItem.parentIfId === instruction.id;


    const isBlockIf =
    instruction.type === InstructionType.IF_GREATER ||
    instruction.type === InstructionType.IF_LESS ||
    instruction.type === InstructionType.IF_EQUAL ||
    instruction.type === InstructionType.IF_NOT_EQUAL;

    return (
      <div
        id={instruction.id}
        ref={(node) => {
          setNodeRef(node);
          setDropRef(node);
          rowRef.current = node;
        }}

        style={style}
        {...attributes}
        {...listeners}
        className={`
          flex justify-center relative
        `}
        
      >
        <div className="flex flex-col items-center">
          {/* GAP ABOVE */}
          {showGapAbove && (
            <div className="h-8 transition-all duration-150" />
          )}
         
          {/* Instruction row (arrow is positioned relative to THIS only) */}
          <div className="relative flex justify-center">
            
            {isActive && (
              <span
                className="
                  absolute
                  -left-2
                  -translate-x-full
                  top-1/2
                  -translate-y-1/2
                  text-green-400
                  text-lg
                  select-none
                "
              >
                ▶
              </span>
            )}
    
            {isEditing && hasEditableParameter ? (
              <div className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded text-sm w-full max-w-sm">
                <span className="text-gray-400 w-6">{index + 1}</span>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                    if (e.key === 'Escape') handleCancel();
                  }}
                  autoFocus
                  className="flex-1 bg-gray-600 text-white px-2 py-1 rounded font-mono"
                />
                <button
                  onClick={handleSave}
                  className="text-green-400 hover:text-green-300 text-xs"
                >
                  ✓
                </button>
                <button
                  onClick={handleCancel}
                  className="text-gray-500 hover:text-gray-300 text-xs"
                >
                  ×
                </button>
              </div>
            ) : (
              <div
                className={isError ? 'ring-2 ring-red-500 rounded-lg justify-center' : ''}
              >
              <FlowchartBlock
                instruction={instruction}
                lineNumber={index}
                parentIfId={parentIfId}
                onEdit={hasEditableParameter ? handleEdit : undefined}
              />
              </div>
            )}
            
          </div>
          {/* Nested IF box */}
          {isBlockIf && (
            <div className="flex ml-6">
            <div
              ref={setIfBodyRef}
              style={
                isDraggingInsideIf
                  ? { minHeight: instruction.body.length * 44 }
                  : undefined
              }
              className={`
                ml-1 mt-1 mb-1 p-2
                border-l-4 border-dashed
                rounded bg-gray-900
                min-h-[40px] w-full
                ${isOver ? 'border-green-400' : 'border-gray-500'}
              `}
            >
              <SortableContext
                items={instruction.body.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                {instruction.body.map((child, childIdx) => (
                  <SortableInstructionLine
                    key={child.id}
                    instruction={child}
                    index={childIdx}
                    isActive={currentInstructionId === child.id}
                    insertPreview={insertPreview}
                    parentIfId={instruction.id}
                  />
                ))}
              </SortableContext>
              </div>
              </div>
          )}

          {/* GAP BELOW */}
          {showGapBelow && (
              <div className="h-8 transition-all duration-150" />
            )}

          {/* Down arrow (separate row, NOT affecting centering) */}
          {(() => {
            let container: Instruction[] = playerInstructions;

            if (parentIfId) {
              const parentIf = playerInstructions.find(
                (i) =>
                  i.id === parentIfId &&
                  'body' in i &&
                  Array.isArray(i.body)
              );
              if (parentIf && 'body' in parentIf) {
                container = parentIf.body;
              }
            }

            return index < container.length - 1 ? (
              <div className="text-gray-400 text-sm leading-none mt-0.5 select-none">
                ↓
              </div>
            ) : null;
          })()}

        </div>
      </div>
    );  
      
  }
  function getInsertIndex(
    event: DragEndEvent | DragOverEvent,
    overInstructionId: string,
    instructions: Instruction[],
    rectMap: Map<string, DOMRect>
  ) {
    const hoverIndex = instructions.findIndex(
      i => i.id === overInstructionId
    );
  
    if (hoverIndex === -1) return instructions.length;
  
    const rect = rectMap.get(overInstructionId);
    if (!rect) return hoverIndex;
  
    const pointerY = getPointerClientY(event);
    const midpoint = rect.top + rect.height / 2;
  
    return pointerY > midpoint ? hoverIndex + 1 : hoverIndex;
  }
  
  function isAllowedInIfBody(inst: Instruction | InstructionType): boolean {
    const type =
      typeof inst === 'string'
        ? inst
        : inst.type;
  
    return (
      type !== InstructionType.LABEL 
    );
  }  
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
  
    const activeData = active.data.current as DragItem | undefined;
    const overData = over.data.current as
      | { source: 'PROGRAM'; instructionId: string }
      | { source: 'IF_BODY'; instructionId: string; parentIfId: string }
      | undefined;
  
    if (!activeData) return;
  
    /* ─────────────────────────────────────────────
       PALETTE → IF_BODY
    ───────────────────────────────────────────── */
    if (
      activeData.source === 'PALETTE' &&
      overData?.source === 'IF_BODY'
    ) {
      const parentIf = playerInstructions.find(
        i => i.id === overData.parentIfId
      );
      if (!parentIf || !('body' in parentIf)) return;
      if (!isAllowedInIfBody(activeData.instructionType)) {
        return;
      }
  
      const rects =
        ifBodyRects.current.get(overData.parentIfId) ?? new Map();

      const insertIndex = getInsertIndex(
        event,
        overData.instructionId,
        parentIf.body,
        rects
      );

  
      const newInstruction = createInstruction(
        activeData.instructionType,
        activeData.pointer,
      );
  
      const newBody = [...parentIf.body];
      newBody.splice(insertIndex, 0, newInstruction);
  
      updateInstruction(parentIf.id, {
        ...parentIf,
        body: newBody,
      });
  
      return;
    }
  
    /* ─────────────────────────────────────────────
       PALETTE → PROGRAM
    ───────────────────────────────────────────── */
    if (activeData.source === 'PALETTE') {
      if (over.id === 'PROGRAM_DROPZONE') {
        handleAddInstruction(
          activeData.instructionType,
          activeData.pointer
        );
        return;
      }
  
      if (overData?.source === 'PROGRAM') {
        const insertIndex = getInsertIndex(
          event,
          overData.instructionId,
          playerInstructions,
          programRects.current
        );
  
        const instruction = createInstruction(
          activeData.instructionType,
          activeData.pointer,
        );
  
        addInstruction(instruction, insertIndex);
        return;
      }
    }
  
    /* ─────────────────────────────────────────────
       PROGRAM → IF_BODY
    ───────────────────────────────────────────── */
    if (
      activeData.source === 'PROGRAM' &&
      overData?.source === 'IF_BODY'
    ) {
      const parentIf = playerInstructions.find(
        i => i.id === overData.parentIfId
      );
      if (!parentIf || !('body' in parentIf)) return;
  
      const inst = playerInstructions.find(
        i => i.id === activeData.instructionId
      );
      if (!inst) return;

      if (!isAllowedInIfBody(inst)) {
        return;
      }
  
      removeInstruction(inst.id);
  
      const rects =
        ifBodyRects.current.get(overData.parentIfId) ?? new Map();

      const insertIndex = getInsertIndex(
        event,
        overData.instructionId,
        parentIf.body,
        rects
      );
  
      const newBody = [...parentIf.body];
      newBody.splice(insertIndex, 0, inst);
  
      updateInstruction(parentIf.id, {
        ...parentIf,
        body: newBody,
      });
  
      return;
    }
  
    /* ─────────────────────────────────────────────
       IF_BODY → PROGRAM
    ───────────────────────────────────────────── */
    if (
      activeData.source === 'IF_BODY' &&
      (over.id === 'PROGRAM_DROPZONE' ||
        overData?.source === 'PROGRAM')
    ) {
      const parentIf = playerInstructions.find(
        i => i.id === activeData.parentIfId
      );
      if (!parentIf || !('body' in parentIf)) return;
  
      const inst = parentIf.body.find(
        i => i.id === activeData.instructionId
      );
      if (!inst) return;
  
      updateInstruction(parentIf.id, {
        ...parentIf,
        body: parentIf.body.filter(i => i.id !== inst.id),
      });
  
      const insertIndex =
        overData?.source === 'PROGRAM'
          ? getInsertIndex(
              event,
              overData.instructionId,
              playerInstructions,
              programRects.current
            )
          : playerInstructions.length;

      addInstruction(inst, insertIndex);
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
      const parentIf = playerInstructions.find(
        i => i.id === activeData.parentIfId
      );
      if (!parentIf || !('body' in parentIf)) return;
    
      const from = parentIf.body.findIndex(
        i => i.id === activeData.instructionId
      );
    
      const to = parentIf.body.findIndex(
        i => i.id === overData.instructionId
      );
      
      if (from !== to) {
        const newBody = [...parentIf.body];
        const [moved] = newBody.splice(from, 1);
        newBody.splice(to, 0, moved);
    
        updateInstruction(parentIf.id, {
          ...parentIf,
          body: newBody,
        });
      }
    
      return;
    }
    
  
    /* ─────────────────────────────────────────────
       PROGRAM → PROGRAM reorder
    ───────────────────────────────────────────── */
    // Reorder inside program
    if (
      activeData?.source === 'PROGRAM' &&
      overData?.source === 'PROGRAM'
    ) {
      const from = playerInstructions.findIndex(i => i.id === activeData.instructionId);
      const to = playerInstructions.findIndex(i => i.id === overData.instructionId);
      if (from !== to) reorderInstructions(from, to);
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
  };
  
  function PaletteDragPreview({
    instructionType,
    pointer,
    isGlobal,
  }: {
    instructionType: InstructionType;
    pointer: 'MOCO' | 'CHOCO';
    isGlobal?: boolean;
  }) {
    const template = instructionTemplates.find(
      (t) => t.type === instructionType
    );
  
    if (!template) return null;
  
    const buttonClass = isGlobal
      ? 'bg-purple-700 text-white'
      : pointer === 'MOCO'
      ? 'bg-blue-700 text-white'
      : 'bg-red-700 text-white';

    return (
      <div
        className={`${buttonClass} px-3 py-2 rounded text-sm shadow-lg`}
      >
        {template.label}
      </div>
    );
  }

  function ProgramArrowsOverlay() {
    const container = programContainerRef.current;
    if (!container) return null;

    return (
      <svg
        className="absolute insert-0 w-full h-full pointer-events-none"
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="8"
            refX="3.5"
            refY="2"
            orient="auto"
          >
            <path d="M0,0 L0,4 L4,2 z" fill="context-stroke" opacity="0.9"/>
          </marker>
        </defs>
  
        {arrows.map(({ from, to, color }) => {
          const fromRect = programRects.current.get(from.id)
            ?? [...ifBodyRects.current.values()]
                .map(m => m.get(from.id))
                .find(Boolean);

          const toRect = programRects.current.get(to.id)
            ?? [...ifBodyRects.current.values()]
                .map(m => m.get(to.id))
                .find(Boolean);

          if (!fromRect || !toRect) return null;
          console.log(fromRect.width)
          const startX = fromRect.left + fromRect.width / 2; //, laneX - 200);
          const startY = fromRect.top + fromRect.height / 3;

          const endX = toRect.left + fromRect.width / 2;
          const endY = toRect.top + toRect.height / 3;

          const gutter = 100;
          const midX =
            endX >= startX
              ? Math.max(startX, endX) + gutter
              : Math.min(startX, endX) - gutter;

          const d = `
            M ${startX} ${startY}
            L ${midX} ${startY}
            L ${midX} ${endY}
            L ${endX} ${endY}
          `;
          const dir = endY > startY ? 1 : -1;
          
          const arrowX = midX;
          const arrowY = (startY + endY) / 2;
          const arrowLen = 8;
          
          return (
            <>
              {/* main elbow path */}
              <path
                d={d}
                stroke={color}
                strokeWidth={4}
                fill="none"
                opacity={0.6}
              />

              {/* centered arrow */}
              <path
                d={`
                  M ${arrowX} ${arrowY - arrowLen * dir}
                  L ${arrowX} ${arrowY + arrowLen * dir}
                `}
                stroke={color}
                strokeWidth={4}
                fill="none"
                markerEnd="url(#arrowhead)"
                opacity={1}
              />
            </>

          );
        })}
      </svg>
    );
  }
  
  function InstructionHelpModal({
    allowedInstructions,
    onClose,
  }: {
    allowedInstructions: Set<InstructionType>;
    onClose: () => void;
  }) {
    const modalRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      const isOutside = (target: EventTarget | null) =>
        modalRef.current &&
        target instanceof Node &&
        !modalRef.current.contains(target);

      const handlePointerDown = (e: PointerEvent) => {
        if (isOutside(e.target)) onClose();
      };

      const handleWheel = (e: WheelEvent) => {
        if (isOutside(e.target)) onClose();
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (isOutside(e.target)) onClose();
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };

      document.addEventListener('pointerdown', handlePointerDown);
      document.addEventListener('wheel', handleWheel, { passive: true });
      document.addEventListener('touchmove', handleTouchMove, { passive: true });
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('pointerdown', handlePointerDown);
        document.removeEventListener('wheel', handleWheel);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [onClose]);

    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
        <div ref={modalRef} className="bg-gray-800 rounded-lg shadow-xl w-[84%] sm:w-full max-w-lg max-h-[80vh] flex flex-col">
          
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-700">
            <h3 className="text-white font-semibold">Instruction Guide</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-400 text-lg"
            >
              ✕
            </button>
          </div>
  
          {/* Content */}
          <div className="overflow-y-auto p-4 space-y-3">
          {instructionTemplates
            .filter((inst) => allowedInstructions.has(inst.type))
            .map((inst) => {

              const isGlobal = globalInstructionTypes.includes(inst.type);
  
              return (
                <div
                  key={inst.type}
                  className="bg-gray-700/60 rounded p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-white text-xs sm:text-sm">
                      {inst.label}
                    </span>
  
                    <span
                      className={`
                        text-xs px-2 py-0.5 rounded
                        ${
                          isGlobal
                            ? 'bg-purple-700 text-white'
                            : 'bg-gray-600 text-gray-200'
                        }
                      `}
                    >
                      {isGlobal ? 'BOTH' : 'POINTER'}
                    </span>
                  </div>
  
                  <p className="text-gray-300 text-xs sm:text-sm">
                    {inst.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
  
  const paletteHighlight = highlight?.scope === 'INSTRUCTION_PALETTE' &&
    !highlight.instructionType &&
    !highlight.control;
  const highlightHelp =  useTutorialHighlight(
    'INSTRUCTION_PALETTE',
    { control: 'HELP' }
  );

  const highlightProgram = useTutorialHighlight(
    'INSTRUCTION_PALETTE',
    { control: 'PROGRAM' }
  );
  const highlightPalette =
    paletteHighlight &&
    !highlightHelp &&
    !highlightProgram;

  
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragOver={(event) => {
        const activeData = event.active.data.current as DragItem | undefined;
        const overData = event.over?.data.current as
          | { source: 'PROGRAM'; instructionId: string }
          | { source: 'IF_BODY'; instructionId: string; parentIfId: string }
          | undefined;

        const isInsertIntoProgram =
        activeData?.source === 'PALETTE' ||
        activeData?.source === 'IF_BODY';
      
        if (!isInsertIntoProgram || !overData) {
          if (insertPreview !== null) {
            setInsertPreview(null);
          }
          return;
        }
      
        let rect: DOMRect | undefined;

        if (overData.source === 'PROGRAM') {
          rect = programRects.current.get(overData.instructionId);
        } else if (overData.source === 'IF_BODY') {
          rect =
            ifBodyRects.current
              .get(overData.parentIfId)
              ?.get(overData.instructionId);
        }

        if (!rect) return;

        const pointerY = getPointerClientY(event);
      
        const position =
          pointerY > rect.top + rect.height / 2 ? 'below' : 'above';
      
        if (
          insertPreview?.id === overData.instructionId &&
          insertPreview?.position === position
        ) {
          return;
        }
      
        setInsertPreview({
          id: overData.instructionId,
          position,
        });
      }}
      

      onDragStart={(event) => {
        setActiveDragItem(event.active.data.current as DragItem);
      }}
      onDragEnd={(event) => {
        handleDragEnd(event);
        setInsertPreview(null);
        setActiveDragItem(null);
      }}
      onDragCancel={() => {
        setInsertPreview(null);
        setActiveDragItem(null);
      }}
    >
      <div className="instruction-palette bg-gray-800 rounded-lg p-4">
      <div className="relative flex items-center mb-3">
        <button
        onClick={() => setShowHelp(true)}
        title="Instruction help"
        className={`
          mr-auto
          text-gray-300
          transition
          text-lg
          px-2
          ${highlightHelp ? 'ring-2 ring-yellow-400 rounded' : 'hover:text-yellow-400'}
        `}
      >
        ⓘ
      </button>
      <h3 className="absolute left-1/2 -translate-x-1/2 text-white font-semibold">Action Cards</h3>

      </div>

        <div className="flex flex-col sm:flex-row gap-4">
          
          <div className="w-full lg:w-1/2 mt-6 flex flex-col gap-4">
            {/* Global Instructions */}
            {globalInstructionTemplates.length > 0 && (
            <div className="flex justify-center">
              <div className="bg-gray-700/60 rounded-lg p-3 w-full max-w-md">
                <h4 className="text-gray-300 font-semibold mb-2 text-center">
                  BOTH
                </h4>

                <SortableContext
                  items={globalInstructionTemplates.map(
                    (t) => `palette-MOCO-${t.type}`
                  )}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="grid grid-cols-2 gap-2">
                    {globalInstructionTemplates.map((template) => (
                      <DraggablePaletteItem
                        key={`global-${template.type}`}
                        template={template}
                        pointer="MOCO"
                        isGlobal
                      />
                    ))}
                  </div>
                </SortableContext>

              </div>
              </div>
            )}

            {/* MOCO */}
            {allowedPointers.includes('MOCO') && (
            <div className="flex justify-center">
            <div className={`
              bg-gray-700/60 rounded-lg p-3 w-full max-w-md
              ${highlightPalette ? 'ring-2 ring-yellow-400' : ''}
            `}>
              <h4 className="text-blue-300 font-semibold mb-2 text-center">
                MOCO
              </h4>

              <SortableContext
                items={pointerInstructionTemplates.map(
                  (t) => `palette-MOCO-${t.type}`
                )}
                strategy={verticalListSortingStrategy}
              >
                <div className="grid grid-cols-2 gap-2">
                  {pointerInstructionTemplates.map((template) => (
                    <DraggablePaletteItem
                      key={`moco-${template.type}`}
                      template={template}
                      pointer="MOCO"
                    />
                  ))}
                </div>
              </SortableContext>

            </div>
            </div>
            )}

            {/* CHOCO */}
            {allowedPointers.includes('CHOCO') && (
            <div className="flex justify-center">
            <div className="bg-gray-700/60 rounded-lg p-3 w-full max-w-md">
              <h4 className="text-red-300 font-semibold mb-2 text-center">
                CHOCO
              </h4>

              <SortableContext
                items={pointerInstructionTemplates.map(
                  (t) => `palette-CHOCO-${t.type}`
                )}
                strategy={verticalListSortingStrategy}
              >
                <div className="grid grid-cols-2 gap-2">
                  {pointerInstructionTemplates.map((template) => (
                    <DraggablePaletteItem
                      key={`choco-${template.type}`}
                      template={template}
                      pointer="CHOCO"
                    />
                  ))}
                </div>
              </SortableContext>

            </div>
            </div>
            )}
            
          </div>
          {/* Current program */}
          <div
            ref={programContainerRef}
            className={`w-full lg:w-1/2 flex flex-col min-h-[300px] sm:min-h-0 max-h-[126vh] relative`}
          >

            <div className="flex items-center mb-2">
              <h4 className="text-gray-400 text-sm mx-auto">Your Program</h4>
            
              <button
                onClick={() => {
                  if (playerInstructions.length === 0) return;
                  clearPlayerInstructions();
                }}
                title="Clear program"
                className="
                  text-gray-400
                  hover:text-red-400
                  transition
                  text-xl
                  leading-none
                "
              >
                ⟲
              </button>
            </div>
            <ProgramArrowsOverlay key={layoutVersion} />
            
            <ProgramDropzone highlight ={highlightProgram}>
            
            <SortableContext
              items={playerInstructions.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              
                {playerInstructions.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center h-full">
                  <div 
                    className={`text-mm text-gray-500 italic select-none pointer-events-none`}
                    >
                    Drag & drop ↓ 
                  </div>
                  </div>
                
                ) : (
                  playerInstructions.map((inst, idx) => (
                    <SortableInstructionLine
                      key={inst.id}
                      instruction={inst}
                      index={idx}
                      isActive={currentInstructionId === inst.id}
                      insertPreview={insertPreview}
                    />
                  ))
                )}
              
            </SortableContext>
            </ProgramDropzone>
           
          </div>
        </div>

        
        
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
      {showHelp && (
        <InstructionHelpModal
          allowedInstructions={allowedInstructions}
          onClose={() => setShowHelp(false)}
        />
      )}

    </DndContext>
  );
}

