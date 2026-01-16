import { motion } from 'framer-motion';
import { getArrayLayout } from './layout';
import { useTutorialHighlight } from '../tutorial/selectors';

interface HandViewProps {
  value: number | null;
  fill?: string;
  stroke?: string;
  isActive?: boolean;
  size?: number;
  arrayLength: number;
}

export function HandView({
  value,
  fill = '#1f2937',     // same as array idle cell
  stroke = '#374151',
  isActive = false,
  size = 80,
  arrayLength            // match array cell size
}: HandViewProps) {

  const { viewBoxWidth } = getArrayLayout(arrayLength, size);
  const isHighlighted = useTutorialHighlight('HAND');
  const hasValue = value !== null;

  return (
    <motion.svg
      viewBox={`0 0 ${viewBoxWidth} ${size}`}
      className="w-full max-w-[360px] h-auto block mx-auto"
      animate={{
        scale: isActive ? 1.1 : 1,
      }}
      transition={{ duration: 0.2 }}
    >
      {/* Highlight ring */}
      {isHighlighted && hasValue && (
        <motion.circle
          cx={viewBoxWidth / 2}
          cy={size / 2}
          r={size / 2 - 2}
          fill="none"
          stroke="#66BB6A"        
          strokeWidth={4}
          initial={{ opacity: 1 }}
        />
      )}
      {/* Hand (circle cell) */}
      <circle
        cx={viewBoxWidth / 2}
        cy={size / 2}
        r={size / 2 - 4}
        fill={hasValue ? fill : '#111827'}   // darker empty
        stroke={hasValue ? stroke : '#374151'}
        strokeWidth={2}
      />

      {/* Value (same style as ArrayView) */}
      <text
        x={viewBoxWidth / 2}
        y={size / 2 + 6}
        textAnchor="middle"
        fill={hasValue ? '#ffffff' : '#6b7280'}
        fontSize="18"
        fontWeight="600"
      >
        {hasValue ? value : ' '}
      </text>
    </motion.svg>
  );
}
