import { motion } from 'framer-motion';
import QRCode from 'react-qr-code';
import { useState } from 'react';
import clsx from 'clsx';

const UPI_LINK =
  'upi://pay?pa=9544123218@ybl&pn=Shamir%20Ashraf&tn=Support%20Development&cu=INR';

export function SupportCard() {
    const [supported, setSupported] = useState(false);

    const handleClick = () => {
        setSupported(true);
    
        // Small delay so animation/color update is visible
        setTimeout(() => {
            window.open(UPI_LINK, '_blank');
        }, 120);
      };    

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        ease: 'easeOut',
      }}
      onClick={handleClick}
      className={clsx(
        `
        w-26 sm:w-32
        rounded-xl sm:rounded-2xl
        border border-indigo-500/30
        bg-gray-800/95
        p-3 sm:p-4
        shadow-xl
        backdrop-blur-sm
        transition-all
        hover:scale-[1.02]
        hover:border-indigo-400
        active:scale-[0.98]
      `,
        supported
        ? 'border-green-900 hover:border-green-400'
        : 'border-indigo-500/30 hover:border-indigo-400'
        )}
    >
      {/* Header */}
      <div className="text-center">
        <p
          className={clsx(
            `
            text-[8px] sm:text-[10px]
            font-semibold uppercase
            tracking-[0.15em]
            text-indigo-300
          `,
            supported ? 'text-green-500' : 'text-indigo-300'
          )}
        >
          Support Development
        </p>

        <p
          className="
            mt-1 text-[9px] sm:text-[11px]
            text-gray-400
          "
        >
          Help the train 🚆
        </p>
      </div>

      {/* QR */}
      <div
        className="
          mt-3 sm:mt-4
          rounded-xl
          bg-white
          p-2 sm:p-3
        "
      >
        <QRCode
          value={UPI_LINK}
          size={160}
          style={{
            width: '100%',
            height: 'auto',
          }}
        />
      </div>

      {/* Footer */}
      <div className="mt-3 text-center">
        <p className="text-[8px] sm:text-[11px] text-gray-300">
          Tap to pay via UPI
        </p>

      </div>
    </motion.button>
  );
}