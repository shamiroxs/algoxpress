/**
 * SVG-based pointer visualization
 * Shows MOCO (blue) and CHOCO (red) pointers
 * Pure rendering, no business logic
 */

import type { ExecutionErrorContext } from '../interpreter/vm';
import { Character } from './Character';
import { getArrayLayout, getCellCenterX } from './layout';

interface PointerViewProps {
  arrayLength: number;

  mocoPointer?: number;
  chocoPointer?: number;
  locoPointer?: number;

  cellWidth?: number;
  spacing?: number;
  errorContext?: ExecutionErrorContext;

  isHandActive?: boolean;
  handAction?: 'PICK' | 'PUT' | null;

  moveAction?: 'LEFT' | 'RIGHT' | null;

  isIfActive?: boolean;
  isMoveActive?: boolean;
  isSwapActive?: boolean;

  activePointer?: 'MOCO' | 'CHOCO' | 'LOCO' | null;
}

export function PointerView({
  arrayLength,
  mocoPointer,
  chocoPointer,
  locoPointer,
  cellWidth = 60,
  spacing = 10,
  errorContext,
  isHandActive,
  handAction,
  moveAction,
  isIfActive,
  isMoveActive,
  isSwapActive,
  activePointer
}: PointerViewProps) {
  const { viewBoxWidth: width } = getArrayLayout(arrayLength, cellWidth);
  //const width = arrayLength * (cellWidth + spacing) - spacing ;

  function renderCharacter(
    index: number,
    type: 'MOCO' | 'CHOCO' | 'LOCO',
    yOffset: number,
    isError?: boolean,
    isHandActive?: boolean
  ) {
    if (index < 0 || index >= arrayLength) return null;
  
    const x = getCellCenterX(index, cellWidth, spacing);
    //const x = index * (cellWidth + spacing-0.4) + cellWidth / 2;
    const isActive = activePointer === type;
  
    return (
      <Character
        type={type}
        x={x}
        y={yOffset}
        size={1.4}
        isError={isError}
        isHandActive={isActive && isHandActive}
        handAction={isActive ? handAction : null}
        moveAction={isActive ? moveAction : null}
        isIfActive={isActive && isIfActive}
        isMoveActive={isActive && isMoveActive}
        isSwapActive={isSwapActive}
      />
    );
  }
  
  const mocoError =
  errorContext?.kind === 'POINTER' &&
  errorContext.target === 'MOCO';

  const chocoError =
    errorContext?.kind === 'POINTER' &&
    errorContext.target === 'CHOCO';
  const locoError =
    errorContext?.kind === 'POINTER' &&
    errorContext.target === 'LOCO';

    const mocoSame =
    (mocoPointer !== undefined &&
      chocoPointer !== undefined &&
      mocoPointer === chocoPointer) ||
    (mocoPointer !== undefined &&
      locoPointer !== undefined &&
      mocoPointer === locoPointer);
  
  const chocoSame =
    (chocoPointer !== undefined &&
      mocoPointer !== undefined &&
      chocoPointer === mocoPointer) ||
    (chocoPointer !== undefined &&
      locoPointer !== undefined &&
      chocoPointer === locoPointer);
  
  const locoSame =
    (locoPointer !== undefined &&
      mocoPointer !== undefined &&
      locoPointer === mocoPointer) ||
    (locoPointer !== undefined &&
      chocoPointer !== undefined &&
      locoPointer === chocoPointer);

  return (
    <svg
      viewBox={`0 -5 ${width} ${84}`}
      preserveAspectRatio="xMidYMid meet"
      className="pointer-view w-full max-w-[360px] h-auto block mx-auto"
    >
      {/* MOCO */}
      {mocoPointer !== undefined &&
        renderCharacter(
          mocoPointer,
          'MOCO',
          mocoSame ? 0 : 10,
          mocoError,
          isHandActive
        )}

      {/* CHOCO */}
      {chocoPointer !== undefined &&
        renderCharacter(
          chocoPointer,
          'CHOCO',
          chocoSame ? 16 : 10,
          chocoError,
          isHandActive
        )}

      {/* LOCO */}
      {locoPointer !== undefined &&
        renderCharacter(
          locoPointer,
          'LOCO',
          locoSame ? 32 : 10,
          locoError,
          isHandActive
        )}

    </svg>
  );
}
