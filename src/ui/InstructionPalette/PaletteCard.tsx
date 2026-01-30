// PaletteCard.tsx
import React from 'react';
import type { PaletteInstructionConfig } from './paletteConfig';

interface PaletteCardProps {
  config: PaletteInstructionConfig;
  onClick: () => void;
}

export const PaletteCard: React.FC<PaletteCardProps> = ({
  config,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="
        flex flex-col items-start gap-1
        rounded-lg border border-slate-200
        bg-white px-3 py-2
        text-left
        shadow-sm
        transition
        hover:bg-slate-50
        hover:shadow
        active:scale-[0.98]
      "
    >
      <div className="text-sm font-semibold text-slate-800">
        {config.label}
      </div>

      {config.pointer && (
        <div className="text-xs text-slate-500">
          Pointer: {config.pointer}
        </div>
      )}

      {config.description && (
        <div className="text-xs text-slate-400">
          {config.description}
        </div>
      )}
    </button>
  );
};
