import { motion } from "framer-motion";
import { InstructionPalette } from "../../ui/InstructionPalette/InstructionPalette";
 
import { useTutorialHighlight } from '../../tutorial/selectors';
import { useGameStore } from '../../orchestrator/store';

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

    const highlightChallenge = useTutorialHighlight('CHALLENGE_PANEL');
    const maybeCompleteTutorial = useGameStore(s => s.maybeCompleteTutorial);

    return (
      <div className="h-48 relative flex items-center justify-between px-4 bg-gray-800 border-b border-gray-700 z-20">
        <button
          onClick={onBack}
          className="absolute top-4 left-4 text-gray-400 hover:text-white"
        >
          ← Back to Station
        </button>
  
        <div
          className={`
            absolute left-1 flex items-center justify-center gap-3 cursor-pointer select-none
            ${highlightChallenge ? 'ring-2 ring-yellow-400 rounded-lg' : ''}
          `}
          onClick={() => {
            onToggleChallenge();
        
            maybeCompleteTutorial('ANY_CONTROL');
          }}
        >
          <div className={`mr-auto flex items-center gap-2 px-12`}>
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
  