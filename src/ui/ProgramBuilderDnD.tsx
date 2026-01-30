// src/ui/ProgramBuilderDnD.tsx
import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  type DragCancelEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

import { InstructionPalette } from './InstructionPalette/InstructionPalette';
import { ProgramContainer } from './ProgramContainer/ProgramContainer';

import { useGameStore } from '../orchestrator/store';
import { createInstruction } from '../engine/instructions/factory';
import type { Instruction } from '../engine/instructions/types';
import { InstructionType } from '../engine/instructions/types';

/**
 * Must match payload used by palette + sortable lines
 * (this is the same union I used in the ProgramContainer earlier)
 */
export type DragItem =
  | {
      source: 'PALETTE';
      instructionType: InstructionType;
      pointer: 'MOCO' | 'CHOCO';
      isGlobal?: boolean;
    }
  | { source: 'PROGRAM'; instructionId: string }
  | { source: 'IF_BODY'; instructionId: string; parentIfId: string };

type InsertPreview = { id: string; position: 'above' | 'below' } | null;

function isInstructionType(x: any): x is InstructionType {
  return Object.values(InstructionType).includes(x);
}

function parseDragItem(activeData: any): DragItem | null {
  if (!activeData) return null;

  // Palette item
  if (
    activeData.source === 'PALETTE' &&
    isInstructionType(activeData.instructionType) &&
    (activeData.pointer === 'MOCO' || activeData.pointer === 'CHOCO')
  ) {
    return activeData as DragItem;
  }

  // Program sortable
  if (activeData.source === 'PROGRAM' && typeof activeData.instructionId === 'string') {
    return activeData as DragItem;
  }

  // IF body sortable
  if (
    activeData.source === 'IF_BODY' &&
    typeof activeData.instructionId === 'string' &&
    typeof activeData.parentIfId === 'string'
  ) {
    return activeData as DragItem;
  }

  return null;
}

function isIfContainerInstruction(inst: Instruction) {
  return (
    inst.type === InstructionType.IF_GREATER ||
    inst.type === InstructionType.IF_LESS ||
    inst.type === InstructionType.IF_EQUAL ||
    inst.type === InstructionType.IF_NOT_EQUAL
  );
}

function isAllowedInIfBody(type: InstructionType) {
  // Keep same old rule: LABEL not allowed inside IF body
  return type !== InstructionType.LABEL;
}

export function ProgramBuilderDnD() {
  const playerInstructions = useGameStore((s) => s.playerInstructions);
  const setPlayerInstructions = useGameStore((s) => s.setPlayerInstructions);
  const addInstruction = useGameStore((s) => s.addInstruction);
  const updateInstruction = useGameStore((s) => s.updateInstruction);

  // Used by ProgramContainer for arrows overlay refresh
  const [layoutVersion, setLayoutVersion] = useState(0);

  // Insert preview for "gap above/below"
  const [insertPreview, setInsertPreview] = useState<InsertPreview>(null);

  // active drag item (palette or existing instruction)
  const [activeDragItem, setActiveDragItem] = useState<DragItem | null>(null);

  // Drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  // ----- Helpers -----
  const instructionIndexById = useMemo(() => {
    const map = new Map<string, number>();
    playerInstructions.forEach((i, idx) => map.set(i.id, idx));
    return map;
  }, [playerInstructions]);

  const findInstructionByIdRecursive = (
    list: Instruction[],
    id: string
  ): { inst: Instruction; parentIfId?: string } | null => {
    for (const inst of list) {
      if (inst.id === id) return { inst };
      if ('body' in inst && Array.isArray(inst.body)) {
        const found = findInstructionByIdRecursive(inst.body, id);
        if (found) return { ...found, parentIfId: inst.id };
      }
    }
    return null;
  };

  // Determine above/below for insert preview
  const computeAboveBelow = (e: DragOverEvent): 'above' | 'below' => {
    const clientY =
      e.activatorEvent instanceof MouseEvent
        ? e.activatorEvent.clientY
        : e.activatorEvent instanceof TouchEvent && e.activatorEvent.touches[0]
        ? e.activatorEvent.touches[0].clientY
        : 0;

    const rect = e.over?.rect;
    if (!rect) return 'below';

    const mid = rect.top + rect.height / 2;
    return clientY < mid ? 'above' : 'below';
  };

  // ----- DND Events -----
  const onDragStart = (e: DragStartEvent) => {
    const data = e.active.data.current;
    const item = parseDragItem(data);

    setActiveDragItem(item);
    setInsertPreview(null);
  };

  const onDragOver = (e: DragOverEvent) => {
    const item = activeDragItem;
    if (!item) return;

    // hovering nothing
    if (!e.over) {
      setInsertPreview(null);
      return;
    }

    const overId = String(e.over.id);

    // If hovering IF body droppable
    if (overId.startsWith('IF_BODY_')) {
      // no above/below preview (old behavior: highlight body container)
      setInsertPreview(null);
      return;
    }

    // hovering an instruction line
    if (typeof overId === 'string' && overId !== 'PROGRAM_DROPZONE') {
      const position = computeAboveBelow(e);
      setInsertPreview({ id: overId, position });
      return;
    }

    // hovering end dropzone
    if (overId === 'PROGRAM_DROPZONE') {
      setInsertPreview(null);
      return;
    }

    setInsertPreview(null);
  };

  const onDragCancel = (_e: DragCancelEvent) => {
    setActiveDragItem(null);
    setInsertPreview(null);
  };

  const onDragEnd = (e: DragEndEvent) => {
    const item = activeDragItem;
    setActiveDragItem(null);

    if (!item) {
      setInsertPreview(null);
      return;
    }

    if (!e.over) {
      setInsertPreview(null);
      return;
    }

    const overId = String(e.over.id);

    // ---------- Drop into IF body ----------
    if (overId.startsWith('IF_BODY_')) {
      const parentIfId = overId.replace('IF_BODY_', '');

      const parentIf = playerInstructions.find((i) => i.id === parentIfId);
      if (!parentIf || !isIfContainerInstruction(parentIf)) {
        setInsertPreview(null);
        return;
      }

      // Drop from palette → add into body
      if (item.source === 'PALETTE') {
        if (!isAllowedInIfBody(item.instructionType)) {
          setInsertPreview(null);
          return;
        }

        const newInst = createInstruction(item.instructionType, item.pointer);

        updateInstruction(parentIfId, {
          ...parentIf,
          body: [...parentIf.body, newInst],
        });

        setLayoutVersion((v) => v + 1);
        setInsertPreview(null);
        return;
      }

      // Drop from PROGRAM → move into IF body
      if (item.source === 'PROGRAM') {
        const dragged = playerInstructions.find((x) => x.id === item.instructionId);
        if (!dragged) {
          setInsertPreview(null);
          return;
        }

        // disallow LABEL inside IF body
        if (!isAllowedInIfBody(dragged.type)) {
          setInsertPreview(null);
          return;
        }

        // remove from top-level
        const newTop = playerInstructions.filter((x) => x.id !== dragged.id);

        // add to IF body
        const updatedParent = {
          ...parentIf,
          body: [...parentIf.body, dragged],
        };

        setPlayerInstructions(
          newTop.map((x) => (x.id === parentIfId ? updatedParent : x))
        );

        setLayoutVersion((v) => v + 1);
        setInsertPreview(null);
        return;
      }

      // Drop from IF_BODY → reorder/move between bodies (optional)
      if (item.source === 'IF_BODY') {
        // same body reorder: append for simplicity
        const srcParentId = item.parentIfId;
        const dstParentId = parentIfId;

        const srcParent = playerInstructions.find((x) => x.id === srcParentId);
        const dstParent = playerInstructions.find((x) => x.id === dstParentId);

        if (
          !srcParent ||
          !dstParent ||
          !isIfContainerInstruction(srcParent) ||
          !isIfContainerInstruction(dstParent)
        ) {
          setInsertPreview(null);
          return;
        }

        const moving = srcParent.body.find((x) => x.id === item.instructionId);
        if (!moving) {
          setInsertPreview(null);
          return;
        }

        if (!isAllowedInIfBody(moving.type)) {
          setInsertPreview(null);
          return;
        }

        const nextSrc = { ...srcParent, body: srcParent.body.filter((x) => x.id !== moving.id) };
        const nextDst =
          srcParentId === dstParentId
            ? nextSrc // same parent; will append later
            : { ...dstParent, body: [...dstParent.body, moving] };

        const finalDst =
          srcParentId === dstParentId
            ? { ...nextSrc, body: [...nextSrc.body, moving] }
            : nextDst;

        setPlayerInstructions(
          playerInstructions.map((x) => {
            if (x.id === srcParentId) return nextSrc;
            if (x.id === dstParentId) return finalDst;
            return x;
          })
        );

        setLayoutVersion((v) => v + 1);
        setInsertPreview(null);
        return;
      }

      setInsertPreview(null);
      return;
    }

    // ---------- Drop on instruction line (insert above/below) ----------
    if (overId !== 'PROGRAM_DROPZONE') {
      const overIndex = instructionIndexById.get(overId);

      // If we are hovering something that is not top-level instruction,
      // ignore (because IF body items are handled above)
      if (overIndex == null) {
        setInsertPreview(null);
        return;
      }

      const pos = insertPreview?.id === overId ? insertPreview.position : 'below';
      const insertIndex = pos === 'above' ? overIndex : overIndex + 1;

      // Palette → insert at index
      if (item.source === 'PALETTE') {
        const newInst = createInstruction(item.instructionType, item.pointer);
        addInstruction(newInst, insertIndex);
        setLayoutVersion((v) => v + 1);
        setInsertPreview(null);
        return;
      }

      // Program reorder
      if (item.source === 'PROGRAM') {
        const fromIndex = instructionIndexById.get(item.instructionId);
        if (fromIndex == null) {
          setInsertPreview(null);
          return;
        }

        // if dropping on itself
        if (item.instructionId === overId) {
          setInsertPreview(null);
          return;
        }

        // arrayMove expects target index in current array
        const toIndex = insertIndex > fromIndex ? insertIndex - 1 : insertIndex;

        const next = arrayMove(playerInstructions, fromIndex, Math.max(0, Math.min(toIndex, playerInstructions.length - 1)));
        setPlayerInstructions(next);

        setLayoutVersion((v) => v + 1);
        setInsertPreview(null);
        return;
      }

      setInsertPreview(null);
      return;
    }

    // ---------- Drop at end of program ----------
    if (overId === 'PROGRAM_DROPZONE') {
      if (item.source === 'PALETTE') {
        const newInst = createInstruction(item.instructionType, item.pointer);
        addInstruction(newInst);
        setLayoutVersion((v) => v + 1);
        setInsertPreview(null);
        return;
      }

      // dropping program item onto end does nothing (old behavior)
      setInsertPreview(null);
      return;
    }

    setInsertPreview(null);
  };

  // ----- Drag overlay (visual preview while dragging) -----
  const overlayNode = useMemo(() => {
    if (!activeDragItem) return null;

    if (activeDragItem.source === 'PALETTE') {
      return (
        <div className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white font-mono text-sm shadow-xl">
          {activeDragItem.instructionType}
        </div>
      );
    }

    if (activeDragItem.source === 'PROGRAM' || activeDragItem.source === 'IF_BODY') {
      const found = findInstructionByIdRecursive(playerInstructions, activeDragItem.instructionId);
      if (!found) return null;

      return (
        <div className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white font-mono text-sm shadow-xl">
          {found.inst.type}
        </div>
      );
    }

    return null;
  }, [activeDragItem, playerInstructions]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragCancel={onDragCancel}
      onDragEnd={onDragEnd}
    >
      {/* Top bar palette */}
      <InstructionPalette />

      {/* Program container (right panel) */}
      <ProgramContainer
        insertPreview={insertPreview}
        activeDragItem={activeDragItem}
        layoutVersion={layoutVersion}
      />

      <DragOverlay>{overlayNode}</DragOverlay>
    </DndContext>
  );
}
