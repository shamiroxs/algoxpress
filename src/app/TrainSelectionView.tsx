import { trains } from "../engine/challenges/trains";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect } from "react";

import { soundManager } from "../audio/soundManager";
import enterMp3 from '../assets/sounds/enter.mp3';

export function TrainSelectionView() {
  const navigate = useNavigate();

    useEffect(() => {
      soundManager.register('enter', enterMp3)
    }, [])

  return (
    /* Added overflow-x-hidden to prevent scrollbars during the slide-in animation */
    <div className="min-h-screen bg-gray-900 flex flex-col items-center py-16 overflow-x-hidden">
      <h1 className="text-4xl font-bold text-white text-center mb-2">
        Algorithm Express
      </h1>
      <p className="text-lg text-gray-400 mb-12 text-center">
        Select a train to begin your journey.
      </p>

      <div className="flex flex-col items-center">
        {trains.map((train, index) => (
          <div key={train.id} className="flex flex-col items-center">
            
            {/* Train Connector (Coupler) */}
            {index > 0 && (
              <motion.div 
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ 
                  duration: 0.2, 
                  delay: (index * 0.15) + 0.2 // Triggers right after the top car arrives
                }}
                style={{ originY: 0 }} // Ensures it scales downwards from the top car
                className="w-4 h-8 bg-gray-700 border-x-2 border-gray-950 z-0"
              />
            )}

            {/* Train Car Button */}
            <motion.button
              onClick={() => {
                if (train.comingSoon) return;
              
                soundManager.play('enter');
              
                navigate(`/train/${train.id}`);
              }}
              disabled={train.comingSoon}
              
              // 1. Pull-in from right to left
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 100, 
                damping: 15, 
                delay: index * 0.15 
              }}

              // 2. Map hover state to a variant name to control children (wheels)
              whileHover={!train.comingSoon ? "hover" : ""}
              
              // 3. The "Idling Engine" high-frequency vibration
              variants={{
                hover: {
                  y: [0, -1, 0, 1, 0],
                  boxShadow: "0 4px 20px rgba(30,58,138,0.5)",
                  transition: {
                    y: {
                      repeat: Infinity,
                      duration: 0.2,
                      ease: "linear"
                    }
                  }
                }
              }}
              className={`relative w-80 px-6 pt-5 pb-6 text-left transition-colors duration-200 z-10
                rounded-t-lg rounded-b-sm border-b-[6px]
                ${
                  train.comingSoon
                    ? "bg-gray-800 border-gray-950 text-gray-500 cursor-not-allowed"
                    : "bg-blue-900 border-blue-950 text-white"
                }`}
            >
              {/* Subtle Roof Highlight */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/10 rounded-t-lg"></div>

              <div className="flex justify-between items-start mb-2 mt-1">
                <h2 className="text-xl font-bold tracking-wide">
                  {train.title}
                </h2>

                {train.comingSoon && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 px-2 py-1 rounded">
                    In Development
                  </span>
                )}
              </div>

              <p className={`text-sm mt-2 ${train.comingSoon ? "text-gray-600" : "text-blue-200"}`}>
                {train.description}
              </p>

              {/* Left Wheel */}
              <motion.div 
                variants={{
                  hover: { rotate: 180 }
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute -bottom-3 left-6 w-7 h-7 bg-gray-800 rounded-full border-4 border-gray-950 flex items-center justify-center"
              >
                {/* Changed to a bar/spoke so rotation is visible */}
                <div className="w-4 h-1 bg-gray-500 rounded-full"></div>
              </motion.div>
              
              {/* Right Wheel */}
              <motion.div 
                variants={{
                  hover: { rotate: 180 }
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute -bottom-3 right-6 w-7 h-7 bg-gray-800 rounded-full border-4 border-gray-950 flex items-center justify-center"
              >
                <div className="w-4 h-1 bg-gray-500 rounded-full"></div>
              </motion.div>
            </motion.button>
            
            {/* Spacing for absolute positioned wheels */}
            <div className="h-3"></div>
          </div>
        ))}
      </div>
    </div>
  );
}