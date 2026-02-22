/**
 * SVG-based array visualization
 * Pure rendering, no business logic
 */

import { motion } from 'framer-motion';
import type { ExecutionErrorContext } from '../interpreter/vm';
import { getArrayLayout, getCellX } from './layout';

interface ArrayViewProps {
  array: number[];

  /** Pointer positions */
  mocoPointer?: number;
  chocoPointer?: number;
  locoPointer?: number;

  cellWidth?: number;
  cellHeight?: number;

  errorContext?: ExecutionErrorContext;
}

export function ArrayView({
  array,
  mocoPointer,
  chocoPointer,
  locoPointer,
  cellWidth = 60,
  cellHeight = 60,
  errorContext

}: ArrayViewProps) {
  const spacing = 10;
  const offset = 2;

  const { viewBoxWidth } = getArrayLayout(array.length, cellWidth);

  return (
    <svg
      viewBox={`0 0 ${viewBoxWidth} ${cellHeight + 70}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full max-w-[360px] h-auto block mx-auto"
    >
      {array.map((value, index) => {
        const x = getCellX(index, cellWidth,spacing, offset);
        //const x = 2 + index * (cellWidth + spacing);

        const hasMoco = mocoPointer === index;
        const hasChoco = chocoPointer === index;
        const hasLoco = locoPointer === index;
        const both = hasMoco && hasChoco;

        const isErrorCell =
        errorContext?.kind === 'ARRAY_INDEX' &&
        errorContext.index === index;

        const fill = both
          ? '#7c3aed' // purple
          : hasMoco
          ? '#2563eb' // blue
          : hasChoco
          ? '#dc2626' // red
          : hasLoco
          ? '#eab308' //yellow
          : '#1f2937';

        const stroke = both
          ? '#a78bfa'
          : hasMoco
          ? '#60a5fa'
          : hasChoco
          ? '#f87171'
          : hasLoco
          ? '#fef08a'
          : '#374151';

        return (
          <g key={index}>
            {/* Cell background */}
            <motion.rect
              x={x}
              y={30}
              width={cellWidth}
              height={cellHeight}
              rx={6}
              fill={isErrorCell ? '#7f1d1d' : fill}
              stroke={isErrorCell ? '#ef4444' : stroke}
              animate={{
                scale: isErrorCell ? 1.1 : 1,
              }}
              strokeWidth={2}
              initial={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            />

            {/* Index label */}
            <text
              x={x + cellWidth / 2}
              y={20}
              textAnchor="middle"
              fill="#9ca3af"
              fontSize="12"
              fontWeight="500"
            >
              {index}
            </text>

            {/* Value */}
            <text
              x={x + cellWidth / 2}
              y={30 + cellHeight / 2 + 6}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="18"
              fontWeight="600"
            >
              {value}
            </text>

            {/* Pointer indicators */}
            {hasMoco && (
              <text
                x={x + cellWidth / 2}
                y={cellHeight + 50}
                textAnchor="middle"
                fill="#93c5fd"
                fontSize="11"
                fontWeight="600"
              >
                MOCO
              </text>
            )}

            {hasChoco && (
              <text
                x={x + cellWidth / 2}
                y={cellHeight + (hasMoco ? 62 : 50)}
                textAnchor="middle"
                fill="#fca5a5"
                fontSize="11"
                fontWeight="600"
              >
                CHOCO
              </text>
            )}

            {hasLoco && (
              <text
                x={x + cellWidth / 2}
                y={
                  cellHeight +
                  (hasMoco && hasChoco
                    ? 74
                    : hasMoco || hasChoco
                    ? 62
                    : 50)
                }
                textAnchor="middle"
                fill="#fde047" // yellow
                fontSize="11"
                fontWeight="600"
              >
                LOCO
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
