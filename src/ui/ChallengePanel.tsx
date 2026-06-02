/**
 * Challenge information panel
 * Shows challenge description, initial/target arrays, and validation results
 */

import { useState } from 'react';
import { useCurrentChallenge } from '../orchestrator/selectors';
import { ArrayView } from '../renderer/ArrayView';
import { useTutorialHighlight } from '../tutorial/selectors';
import { motion } from 'framer-motion';
import { useGameStore } from '../orchestrator/store';
import { getSpeedLimit } from '../engine/challenges/utils';

function HintRevealer({ hints }: { hints: string[] }) {
  const [revealed, setRevealed] = useState(0);
  const incrementHintsRevealed =
    useGameStore(
      (s) => s.incrementHintsRevealed
    );

  return (
    <div className="mb-4">
      <div className="flex justify-center items-center gap-2 mb-2">
      <h3 className="text-gray-400 text-sm">Hints</h3>
      <span className="px-1.5 py-0.5 rounded-full bg-gray-700 border border-gray-600 text-gray-400 text-xs">
        {revealed}/{hints.length}
      </span>
    </div>

      <div className="space-y-2">
        {hints.slice(0, revealed).map((hint, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2.5 p-2.5 rounded-lg bg-gray-700/50 border border-gray-600"
          >
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-xs flex items-center justify-center font-bold">
              {i + 1}
            </span>
            <p className="text-gray-300 text-sm leading-relaxed">{hint}</p>
          </motion.div>
        ))}
      </div>

      {revealed < hints.length ? (
        <button
          onClick={() => {
            setRevealed(r => r + 1)
            incrementHintsRevealed();
          }}
          className="mt-2 w-full py-1.5 rounded-lg border border-dashed border-gray-600 text-gray-500 text-xs hover:border-yellow-500/50 hover:text-yellow-400 transition-colors"
        >
          {revealed === 0 ? 'Show first hint' : `Show next hint (${revealed + 1}/${hints.length})`}
        </button>
      ) : (
        <p className="mt-2 text-center text-sm text-gray-600">All hints revealed</p>
      )}
    </div>
  );
}

export function ChallengePanel() {
  const challenge = useCurrentChallenge();
 
  if (!challenge) {
    return (
      <div className="challenge-panel bg-gray-800 rounded-lg p-4">
        <div className="text-gray-400">Select a challenge to begin</div>
      </div>
    );
  }

  const highlightChallenge = useTutorialHighlight('WELCOME')
  
  return (
    <div className={`challenge-panel bg-gray-800 rounded-lg p-4
      ${highlightChallenge ? 'ring-2 ring-yellow-400 rounded-lg' : ''}
              
      `}
    >
      <div className="mb-4">
        <h2 className="text-white text-xl font-bold mb-2">{challenge.title}</h2>
        <p className="text-gray-300 text-sm mb-2 whitespace-pre-line">
          {challenge.description}
        </p>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          {/* Difficulty Badge */}
          <span className={`px-2 py-1 rounded text-xs font-bold tracking-wide uppercase ${
            challenge.difficulty === 'EASY' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' :
            challenge.difficulty === 'MEDIUM' ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' :
            'bg-rose-600/20 text-rose-400 border border-rose-500/30'
          }`}>
            {challenge.difficulty}
          </span>

          {/* Max Steps Goal */}
          {challenge.maxSteps && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium shadow-sm">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span><strong className="font-bold">{challenge.maxSteps} steps</strong></span>
            </div>
          )}

          {/* Speed Goal */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium shadow-sm">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                <strong className="font-bold">{getSpeedLimit(challenge)}s</strong></span>
            </div>

        </div>
      </div>

      {/* Initial Array */}
      <div className="mb">
        <h3 className="text-gray-400 text-sm mb-2">Seating Now</h3>
        <ArrayView array={challenge.initialArray} />
      </div>

      {/* Target Array */}
      <div className="mb-2">
      <h3 className="text-gray-400 text-sm mb-2">Target Seating</h3>
        <ArrayView array={challenge.targetArray} />
      </div>

      {/* Hints */}
      {challenge.hints && challenge.hints.length > 0 && (
        <HintRevealer hints={challenge.hints} />
      )}
      {/* Concept explanation */}
      {challenge.explanation && (
        <div className="mb-4 p-3 rounded-lg bg-gray-700/50 border border-gray-600">
          <h3 className="text-gray-400 text-sm font-semibold tracking-wider mb-2">What is this?</h3>
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{challenge.explanation}</p>
        </div>
      )}
    </div>
  );
}





