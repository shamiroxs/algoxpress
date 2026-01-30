// src/ui/program/ProgramInstruction.tsx
import type { Instruction } from '../../engine/instructions/types';

interface Props {
  instruction: Instruction;
  index: number;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (index: number) => void;
}

export function ProgramInstruction({
  instruction,
  index,
  onDragStart,
  onDragOver,
  onDrop,
}: Props) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={onDragOver}
      onDrop={() => onDrop(index)}
      className="
        flex items-center gap-2
        px-3 py-2
        rounded-md
        bg-slate-800
        border border-slate-700
        text-sm text-slate-200
        cursor-grab
        hover:bg-slate-700
        active:cursor-grabbing
      "
    >
      <span className="text-xs text-slate-400 w-6">
        {index + 1}
      </span>

      <span className="font-mono">
        {instruction.type}
      </span>
    </div>
  );
}
