/**
 * Overlay for locked challenges
 * Shows CTA to unlock (UI-only, no actual payment)
 */

import { motion } from 'framer-motion';

interface LockedOverlayProps {
  challengeTitle: string;
}

export function LockedOverlay({ challengeTitle }: LockedOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm rounded-lg flex items-center justify-center z-10"
    >
      <div className="text-center p-6">
        <div className="text-4xl mb-4">🔒</div>
        <h3 className="text-white text-xl font-bold mb-2">{challengeTitle}</h3>
        <p className="text-gray-400 mb-4">This challenge is locked</p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold">
          Unlock Hard Mode
        </button>
        <p className="text-gray-500 text-xs mt-2">(Coming soon)</p>
      </div>
    </motion.div>
  );
}





