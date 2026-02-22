// src/ui/program/ProgramContainer.tsx
/**
 * Program container extracted from old InstructionPalette.tsx
 * Keeps original flowchart rendering, IF nesting, arrows overlay,
 * insert-preview gaps, and editing behavior.
 */

import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
//import type { DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { useGameStore } from '../../orchestrator/store';
import { useExecutionErrorContext } from '../../orchestrator/selectors';

import { InstructionType } from '../../engine/instructions/types';
import type { Instruction } from '../../engine/instructions/types';
import { useTutorialHighlight } from '../../tutorial/selectors';

/** Must match palette drag payload */
export type DragItem =
  | {
      source: 'PALETTE';
      instructionType: InstructionType;
      pointer: 'MOCO' | 'CHOCO' | 'LOCO';
      isGlobal?: boolean;
    }
  | { source: 'PROGRAM'; instructionId: string }
  | { source: 'IF_BODY'; instructionId: string; parentIfId: string };

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
  LOCO: {
    bg: 'bg-yellow-600',
    border: 'border-yellow-300',
    text: 'text-white',
  },
  BOTH: {
    bg: 'bg-purple-700',
    border: 'border-purple-400',
    text: 'text-white',
  },
} as const;

type InstructionOwner = 'MOCO' | 'CHOCO' | 'LOCO' | 'BOTH';

function getInstructionOwner(inst: Instruction): InstructionOwner {
  if (!('target' in inst) || inst.target === undefined) return 'BOTH';
  return inst.target;
}

function getInstructionStyle(inst: Instruction) {
  const owner = getInstructionOwner(inst);
  return OWNER_STYLE_MAP[owner];
}

function formatInstruction(inst: Instruction): string {
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
    case InstructionType.IF_EVEN:
      return 'IFEven';
    case InstructionType.JUMP:
      return `Jump ${inst.label}`;
    case InstructionType.LABEL:
      return `${inst.labelName}:`;
    case InstructionType.SWAP:
      return 'Swap ⇄';
    case InstructionType.SWAP_WITH_NEXT:
      return 'SwapNext';
    case InstructionType.INCREMENT_VALUE:
      return 'Value +';
    case InstructionType.DECREMENT_VALUE:
      return 'Value -';
    case InstructionType.WAIT:
      return 'Wait';
    default:
      return 'UNKNOWN';
  }
}

/**
 * Props:
 * - insertPreview: managed by parent DndContext (same logic as old InstructionPalette)
 * - activeDragItem: managed by parent DndContext
 * - highlightProgram: optional tutorial highlight ring
 * - layoutVersion: to re-render arrow overlay after DOM rect updates
 *
 * IMPORTANT:
 * - programContainerRef / rect maps are internal and identical to old file.
 */

function useIsPhone() {
  const [isPhone, setIsPhone] = useState(() => window.innerWidth < 640);

  React.useEffect(() => {
    const onResize = () => {
      const next = window.innerWidth < 640;
      setIsPhone((prev) => (prev === next ? prev : next));
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return isPhone;
}

type InsertPreview = { id: string; position: 'above' | 'below' } | null;

export type ProgramRectsRef = React.RefObject<Map<string, DOMRect>>;
export type IfBodyRectsRef = React.RefObject<Map<string, Map<string, DOMRect>>>;


export function ProgramContainer({
  insertPreview,
  activeDragItem,
  layoutVersion,
  programRects,
  ifBodyRects,
  bumpLayout,
}: {
  insertPreview: InsertPreview;
  activeDragItem: DragItem | null;
  layoutVersion: number;
  programRects: ProgramRectsRef;
  ifBodyRects: IfBodyRectsRef;
  bumpLayout: () => void;
}) {
  const {
    playerInstructions,
    removeInstruction,
    updateInstruction,
    clearPlayerInstructions,
    executionState,
  } = useGameStore();

  const currentInstructionId = executionState?.currentInstructionId ?? null;
  const errorContext = useExecutionErrorContext();

  // container ref for arrows overlay
  const programContainerRef = useRef<HTMLDivElement | null>(null);
  const isPhone = useIsPhone();

  useLayoutEffect(() => {
    if (activeDragItem) return;
    if (insertPreview) return;
    measureAllInstructions();
  }, [layoutVersion]);
  

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

  function FlowchartBlock({
    instruction,
    onEdit,
    parentIfId,
  }: {
    instruction: Instruction;
    lineNumber: number;
    parentIfId?: string;
    onEdit?: () => void;
  }) {
    const style = getInstructionStyle(instruction);
    const isNested = !!parentIfId;

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
      instruction.type === InstructionType.IF_EVEN ||
      instruction.type === InstructionType.JUMP;

    return (
      <div
        className={`
          relative
          max-w-sm
          flex items-center justify-between
          ${isNested ? 'px-1.5 sm:px-3 py-0.4 sm:py-0.5' : 'px-1.5 py-0.4 sm:px-5 sm:py-0.5'}
          ${isNested ? 'rounded sm:rounded-md' : 'rounded-md sm:rounded-lg'}
          border
          shadow-md
          transition
          ${style.bg}
          ${style.border}
          ${style.text}
          font-mono
          text-xs
          group
          select-none
          touch-none
        `}
      >
        <div
          className={`
            flex-1
            text-center
            ${isNested ? 'text-[8px] sm:text-sm' : 'text-[10px] sm:text-base'}
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
              removeInstruction(instruction.id);
              return;
            }

            const parentIf = playerInstructions.find((i) => i.id === parentIfId);
            if (!parentIf || !('body' in parentIf)) return;

            updateInstruction(parentIf.id, {
              ...parentIf,
              body: parentIf.body.filter((child) => child.id !== instruction.id),
            });
            bumpLayout();
          }}
          className="absolute right-2 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          ×
        </button>
      </div>
    );
  }

  function collectLabels(instructions: Instruction[], set = new Set<string>()) {
    for (const inst of instructions) {
      if (inst.type === InstructionType.LABEL && 'labelName' in inst) {
        set.add(inst.labelName);
      }
      if ('body' in inst) collectLabels(inst.body, set);
    }
    return set;
  }
  function measureAllInstructions() {
    const container = programContainerRef.current;
    if (!container) return;
  
    programRects.current.clear();
    ifBodyRects.current.clear();
  
    const containerRect = container.getBoundingClientRect();
  
    const nodes = container.querySelectorAll<HTMLElement>('[data-instruction-id]');
  
    nodes.forEach((node) => {
      if (node.style.transform) return;
      const id = node.dataset.instructionId!;
      const parentIfId = node.dataset.parentIf || undefined;
  
      const rect = node.getBoundingClientRect();
  
      const relativeRect = {
        top: rect.top - containerRect.top,
        left: rect.left - containerRect.left,
        right: rect.right - containerRect.left,
        height: rect.height,
        width: rect.width,
      } as DOMRect;
  
      if (!parentIfId) {
        programRects.current.set(id, relativeRect);
      } else {
        if (!ifBodyRects.current.has(parentIfId)) {
          ifBodyRects.current.set(parentIfId, new Map());
        }
        ifBodyRects.current.get(parentIfId)!.set(id, relativeRect);
      }
    });
  }  

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
    insertPreview: { id: string; position: 'above' | 'below' } | null;
    parentIfId?: string;
  }) {
    const { setNodeRef: setDropRef } = useDroppable({
      id: instruction.id,
      data: parentIfId
        ? { source: 'IF_BODY', instructionId: instruction.id, parentIfId }
        : { source: 'PROGRAM', instructionId: instruction.id },
    });
    

    const showGapAbove =
      insertPreview?.id === instruction.id && insertPreview.position === 'above';
    const showGapBelow =
      insertPreview?.id === instruction.id && insertPreview.position === 'below';

    const rowRef = useRef<HTMLDivElement | null>(null);

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
      instruction.type === InstructionType.IF_EVEN ||
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
        if (label.length > 0) updatedInstruction = { ...instruction, label };
      }

      if (!updatedInstruction) return;

      if (!parentIfId) {
        updateInstruction(instruction.id, updatedInstruction);
      } else {
        const parentIf = playerInstructions.find((i) => i.id === parentIfId);
        if (!parentIf || !('body' in parentIf)) return;

        updateInstruction(parentIf.id, {
          ...parentIf,
          body: parentIf.body.map((child) =>
            child.id === instruction.id ? updatedInstruction! : child
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

    // IF body dropzone
    const { setNodeRef: setIfBodyRef, isOver } = useDroppable({
      id: `IF_BODY_${instruction.id}`,
      data: {
        source: 'IF_BODY',
        parentIfId: instruction.id,
      },
    });

    const isDraggingInsideIf =
      activeDragItem?.source === 'IF_BODY' && activeDragItem.parentIfId === instruction.id;

    const isDraggingOverThisIf =
      !!activeDragItem &&
      (
        activeDragItem.source === 'PALETTE' ||
        activeDragItem.source === 'PROGRAM' ||
        activeDragItem.parentIfId === instruction.id
      );

    const isBlockIf =
      instruction.type === InstructionType.IF_GREATER ||
      instruction.type === InstructionType.IF_LESS ||
      instruction.type === InstructionType.IF_EQUAL ||
      instruction.type === InstructionType.IF_NOT_EQUAL ||
      instruction.type === InstructionType.IF_EVEN;

    return (
      <div
        id={instruction.id}
        data-instruction-id={instruction.id}
        data-parent-if={parentIfId ?? ''}
        ref={(node) => {
          setNodeRef(node);
          setDropRef(node);
          rowRef.current = node;
        }}
        style={style}
        {...attributes}
        {...listeners}
        className={`flex justify-center relative ${parentIfId ? 'mt-1 sm:mt-1.5' : 'mt-2 sm:mt-4'}`}
      >
        <div className="flex flex-col items-center">
          {/* GAP ABOVE */}
          {showGapAbove && <div className="h-8 transition-all duration-150" />}

          {/* Instruction row */}
          <div className="relative flex justify-center">
            {isActive && (
              <span
                className="
                  absolute
                  -left-0.5
                  sm:-left-2
                  -translate-x-full
                  top-1/2
                  -translate-y-1/2
                  text-green-400
                  text-sm
                  sm:text-lg
                  select-none
                "
              >
                ▶
              </span>
            )}

            {isEditing && hasEditableParameter ? (
              <div className="flex items-center gap-1 bg-gray-700 px-1.5 py-1 sm:px-3 sm:py-2 rounded text-xs sm:text-sm w-full max-w-[160px] sm:max-w-[280px]">
                <span className="text-gray-400 text-[10px] sm:text-xs w-4 sm:w-6">{index + 1}</span>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                    if (e.key === 'Escape') handleCancel();
                  }}
                  autoFocus
                  className="flex-1 bg-gray-600 text-white max-w-[60px] sm:max-w-[100px] px-1 sm:px-2 py-0.5 sm:py-1 rounded-sm sm:rounded font-mono"
                />
                <button
                  onClick={handleSave}
                  className="text-green-400 hover:text-green-300 text-xs sm:text-sm"
                >
                  ✓
                </button>
                <button
                  onClick={handleCancel}
                  className="text-gray-500 hover:text-gray-300 text-xs sm:text-sm"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className={isError ? 'ring-2 ring-red-500 rounded-lg justify-center' : ''}>
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
                  isDraggingInsideIf ? { minHeight: instruction.body.length * 44 } : undefined
                }
                className={`
                  -ml-4 mt-0.5 mb-0.5 p-1
                  border-l-4 border-dashed
                  rounded bg-gray-900
                  min-h-[40px]
                  ${isOver ? 'border-green-400' : 'border-gray-500'}
                  ${isDraggingOverThisIf ? 'pb-4 sm:pb-6' : ''}
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
                  <div
                    className={`
                      transition-all duration-150
                      ${isOver ? 'h-8' : 'h-0'}
                    `}
                  />

                </SortableContext>
              </div>
            </div>
          )}

          {/* GAP BELOW */}
          {showGapBelow && <div className="h-8 transition-all duration-150" />}

          {/* Down arrow between lines */}
          {(() => {
            let container: Instruction[] = playerInstructions;

            if (parentIfId) {
              const parentIf = playerInstructions.find(
                (i) => i.id === parentIfId && 'body' in i && Array.isArray(i.body)
              );
              if (parentIf && 'body' in parentIf) container = parentIf.body;
            }

            return index < container.length - 1 ? (
              <div className={`
                text-gray-400
                ${parentIfId ? 'text-[8px] sm:text-[11px]' : 'text-[10px] sm:text-sm'}
                leading-none sm:mt-0.5 select-none
                `}>↓</div>
            ) : null;
          })()}
        </div>
      </div>
    );
  }

  // Labels map (top-level only like old)
  const labelMap = useMemo(() => {
    const map = new Map<string, Instruction>();
    playerInstructions.forEach((inst) => {
      if (inst.type === InstructionType.LABEL && 'labelName' in inst) {
        map.set(inst.labelName, inst);
      }
    });
    return map;
  }, [playerInstructions]);

  // Arrow targets
  const arrows = useMemo(() => {
    const results: Array<{ from: Instruction; to: Instruction; color: string }> = [];

    for (const inst of playerInstructions) {
      if (!('label' in inst)) continue;
      const target = labelMap.get(inst.label);
      if (!target) continue;

      const owner = getInstructionOwner(inst);
      const color =
        owner === 'MOCO' ? '#3b82f6' 
        : owner === 'CHOCO' ? '#ef4444' 
        : owner === 'LOCO' ? '#eab308'
        : '#a855f7';

      results.push({ from: inst, to: target, color });
    }
    bumpLayout();
    return results;
  }, [playerInstructions, labelMap]);

  function ProgramArrowsOverlay({ isPhone }: { isPhone: boolean }) {
    const container = programContainerRef.current;
    if (!container) return null;

    const strokeW = isPhone ? 2.5 : 4;
    const markerSize = isPhone ? 8 : 8;

    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <marker
            id="arrowhead"
            markerWidth={markerSize}
            markerHeight={markerSize}
            refX={markerSize * 0.45}
            refY={markerSize * 0.25}
            orient="auto"
          >
            <path
              d={`M0,0 L0,${markerSize * 0.5} L${markerSize * 0.5},${markerSize * 0.25} z`}
              fill="context-stroke"
              opacity="0.9"
            />
          </marker>
        </defs>

        {arrows.map(({ from, to, color }) => {
          const fromRect =
            programRects.current.get(from.id) ??
            [...ifBodyRects.current.values()]
              .map((m) => m.get(from.id))
              .find(Boolean);

          const toRect =
            programRects.current.get(to.id) ??
            [...ifBodyRects.current.values()]
              .map((m) => m.get(to.id))
              .find(Boolean);

          if (!fromRect || !toRect) return null;

          const startX = fromRect.left + fromRect.width / 2;
          const startY = fromRect.top + fromRect.height / 3;

          const endX = toRect.left + fromRect.width / 2;
          const endY = toRect.top + toRect.height / 3;

          const gutter = isPhone ? 40 : 80;
          
          const midX =
            endX >= startX ? Math.max(startX, endX) + gutter : Math.min(startX, endX) - gutter;

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
            <g key={`${from.id}->${to.id}`}>
              <path d={d} stroke={color} strokeWidth={strokeW} fill="none" opacity={0.6} />

              <path
                d={`
                  M ${arrowX} ${arrowY - arrowLen * dir}
                  L ${arrowX} ${arrowY + arrowLen * dir}
                `}
                stroke={color}
                strokeWidth={strokeW}
                fill="none"
                markerEnd="url(#arrowhead)"
                opacity={1}
              />
            </g>
          );
        })}
      </svg>
    );
  }

  const highlightProgram = useTutorialHighlight(
    'INSTRUCTION_PALETTE',
    { control: 'PROGRAM' }
  );

  return (
    <div
      ref={programContainerRef}
      className="w-full h-full flex flex-col min-h-[800px] sm:min-h-[140vh] max-h-[126vh] relative"
    >
      {/* Header */}
      <div className="flex items-center mb-2">
        <h4 className="text-gray-400 text-xs sm:text-sm mx-auto">Your Workspace</h4>

        <button
          onClick={() => {
            if (playerInstructions.length === 0) return;
            clearPlayerInstructions();
            bumpLayout();
          }}
          title="Clear program"
          className="
            text-gray-400
            hover:text-red-400
            transition
            text-base
            sm:text-xl
            leading-none
          "
        >
          ⟲
        </button>
      </div>

      {/* Arrow overlay */}
      <ProgramArrowsOverlay key={layoutVersion} isPhone={isPhone}/>

      <ProgramDropzone highlight={highlightProgram}>
        <SortableContext
          items={playerInstructions.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {playerInstructions.length === 0 ? (
            <div className="flex flex-1 justify-center h-full">
              <div className="mt-44 text-xs sm:text-base text-gray-500 italic select-none pointer-events-none">
                Drag &amp; drop ↓
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
        {/* bottom drop padding zone */}
        <div className="h-14 shrink-0" />
      </ProgramDropzone>
    </div>
  );
}
