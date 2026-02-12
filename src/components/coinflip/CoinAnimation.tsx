'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface CoinAnimationProps {
  flipping: boolean;
  result: 'heads' | 'tails' | null;
  onComplete?: () => void;
}

const CoinAnimation = ({ flipping, result, onComplete }: CoinAnimationProps) => {
  const [displayResult, setDisplayResult] = useState<'heads' | 'tails' | null>(null);

  useEffect(() => {
    if (!flipping) return;
    setDisplayResult(null);

    const timer = setTimeout(() => {
      setDisplayResult(result);
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [flipping, result, onComplete]);

  const finalRotation = displayResult === 'tails' ? 1980 + 180 : 1980;

  return (
    <div className="flex items-center justify-center" style={{ perspective: '800px' }}>
      <motion.div
        className="relative w-40 h-40 sm:w-48 sm:h-48"
        style={{ transformStyle: 'preserve-3d' }}
        animate={
          flipping
            ? { rotateY: finalRotation }
            : { rotateY: displayResult === 'tails' ? 180 : 0 }
        }
        transition={
          flipping
            ? { duration: 3, ease: [0.22, 1, 0.36, 1] }
            : { duration: 0.3, ease: 'easeOut' }
        }
      >
        {/* Heads Face */}
        <div
          className="absolute inset-0 flex items-center justify-center rounded-full border-4 border-yellow-500/60 shadow-[0_0_40px_rgba(234,179,8,0.3)]"
          style={{
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(145deg, #d4a017, #f5c842, #d4a017)',
          }}
        >
          <div className="flex flex-col items-center">
            <span className="text-5xl sm:text-6xl">🟡</span>
            <span className="text-sm font-bold text-yellow-900 mt-1 tracking-wider">CARA</span>
          </div>
        </div>

        {/* Tails Face */}
        <div
          className="absolute inset-0 flex items-center justify-center rounded-full border-4 border-red-500/60 shadow-[0_0_40px_rgba(138,0,0,0.3)]"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(145deg, #8A0000, #c0392b, #8A0000)',
          }}
        >
          <div className="flex flex-col items-center">
            <span className="text-5xl sm:text-6xl">🔴</span>
            <span className="text-sm font-bold text-red-200 mt-1 tracking-wider">COROA</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CoinAnimation;
