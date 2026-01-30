// src/ui/program/useProgramDnD.ts
import { useRef } from 'react';
import { useGameStore } from '../../orchestrator/store';
import type { Instruction } from '../../engine/instructions/types';

type DragSource =
  | { type: 'palette'; instruction: Instruction }
  | { type: 'program'; index: number };

export function useProgramDnD() {
  const dragSource = useRef<DragSource | null>(null);

  const {
    playerInstructions,
    addInstruction,
    reorderInstructions,
  } = useGameStore();

  /** ---- Palette ---- */
  function onPaletteDragStart(instruction: Instruction) {
    dragSource.current = {
      type: 'palette',
      instruction,
    };
  }

  /** ---- Program ---- */
  function onProgramDragStart(index: number) {
    dragSource.current = {
      type: 'program',
      index,
    };
  }

  function onProgramDragOver(e: React.DragEvent) {
    e.preventDefault(); // required to allow drop
  }

  function onProgramDrop(targetIndex: number) {
    const source = dragSource.current;
    dragSource.current = null;

    if (!source) return;

    if (source.type === 'palette') {
      addInstruction(source.instruction, targetIndex);
      return;
    }

    if (source.type === 'program') {
      if (source.index !== targetIndex) {
        reorderInstructions(source.index, targetIndex);
      }
    }
  }

  function onDropAtEnd() {
    const source = dragSource.current;
    dragSource.current = null;

    if (!source) return;

    if (source.type === 'palette') {
      addInstruction(source.instruction);
    }

    if (source.type === 'program') {
      reorderInstructions(source.index, playerInstructions.length - 1);
    }
  }

  return {
    onPaletteDragStart,
    onProgramDragStart,
    onProgramDragOver,
    onProgramDrop,
    onDropAtEnd,
  };
}
