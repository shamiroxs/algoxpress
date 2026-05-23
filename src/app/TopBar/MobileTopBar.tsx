import { motion } from "framer-motion";
import { InstructionPalette } from "../../ui/InstructionPalette/InstructionPalette";

import { useTutorialHighlight } from '../../tutorial/selectors';
import { useGameStore } from '../../orchestrator/store';

import { soundManager } from "../../audio/soundManager";
import backMp3 from '../../assets/sounds/back.mp3';
import { useEffect } from "react";

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

    const highlightChallenge = useTutorialHighlight('CHALLENGE_PANEL');
    const maybeCompleteTutorial = useGameStore(s => s.maybeCompleteTutorial);

    useEffect(() => {
      soundManager.register('back', backMp3)
    }, [])

    return (
      <div className="relative bg-gray-800 border-b border-gray-700 z-20">
        <div className="relative min-h-[3rem] flex items-center px-4">
          <button
            onClick={() => {
              soundManager.play('back');
            
              onBack();
            }}
            className="text-gray-400 hover:text-white text-sm z-10"
          >
            ← Back
          </button>
  
          <div className="absolute left-0 right-0 flex justify-center pointer-events-none">
            <div
              className={`pointer-events-auto flex items-center gap-2 cursor-pointer select-none
                ${highlightChallenge ? 'ring-2 ring-yellow-400 rounded-lg' : ''}
              `}
              onClick={() => {
                onToggleChallenge();
            
                maybeCompleteTutorial('ANY_CONTROL');
              }}
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
  