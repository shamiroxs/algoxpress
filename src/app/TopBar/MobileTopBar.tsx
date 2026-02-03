import { motion } from "framer-motion";
import { InstructionPalette } from "../../ui/InstructionPalette/InstructionPalette";

type Props = {
    challengeTitle: string;
    mode: 'PLAY' | 'READ';
    onToggleChallenge: () => void;
    onBack: () => void;
  };
  
  export function MobileTopBar({
    challengeTitle,
    mode,
    onToggleChallenge,
    onBack,
  }: Props) {
    return (
      <div className="relative bg-gray-800 border-b border-gray-700 z-20">
        <div className="relative min-h-[3rem] flex items-center px-4">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white text-sm z-10"
          >
            ← Back
          </button>
  
          <div className="absolute left-0 right-0 flex justify-center pointer-events-none">
            <div
              className="pointer-events-auto flex items-center gap-2 cursor-pointer select-none"
              onClick={onToggleChallenge}
            >
              <span className="font-semibold text-sm">
                {challengeTitle}
              </span>
              <motion.span
                animate={{ rotate: mode === 'READ' ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                ▼
              </motion.span>
            </div>
          </div>
        </div>
  
        <div className="w-full flex justify-center">
          <InstructionPalette />
        </div>
      </div>
    );
  }
  