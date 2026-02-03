import { motion } from "framer-motion";
import { InstructionPalette } from "../../ui/InstructionPalette/InstructionPalette";

type Props = {
    challengeTitle: string;
    mode: 'PLAY' | 'READ';
    onToggleChallenge: () => void;
    onBack: () => void;
  };
  
  export function DesktopTopBar({
    challengeTitle,
    mode,
    onToggleChallenge,
    onBack,
  }: Props) {
    return (
      <div className="h-48 relative flex items-center justify-between px-4 bg-gray-800 border-b border-gray-700 z-20">
        <button
          onClick={onBack}
          className="absolute top-4 left-4 text-gray-400 hover:text-white"
        >
          ← Back to Station
        </button>
  
        <div
          className="absolute left-0 w-1/2 flex items-center justify-center gap-3 cursor-pointer select-none"
          onClick={onToggleChallenge}
        >
          <div className="mr-auto flex items-center gap-2 px-12">
            <span className="font-semibold">{challengeTitle}</span>
            <motion.span
              animate={{ rotate: mode === 'READ' ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              ▼
            </motion.span>
          </div>
        </div>
  
        <div className="ml-auto h-full flex items-center">
          <InstructionPalette />
        </div>
      </div>
    );
  }
  