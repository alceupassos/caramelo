'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Confetti } from './Confetti';
import { haptics } from '@/utils/haptics';

interface WinAnimationProps {
  amount: number;
  show: boolean;
  onDismiss?: () => void;
}

export function WinAnimation({ amount, show, onDismiss }: WinAnimationProps) {
  const [displayAmount, setDisplayAmount] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) {
      setVisible(false);
      return;
    }

    setVisible(true);
    haptics.win();

    const steps = 30;
    const increment = amount / steps;
    let current = 0;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        current = amount;
        clearInterval(interval);
      }
      setDisplayAmount(Math.round(current));
    }, 50);

    const timeout = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [show, amount, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <>
          <Confetti active={visible} duration={3000} />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99] flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200 }}
              className="flex flex-col items-center gap-4"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(34, 197, 94, 0.3)',
                    '0 0 60px rgba(34, 197, 94, 0.6)',
                    '0 0 20px rgba(34, 197, 94, 0.3)',
                  ],
                }}
                transition={{ duration: 1, repeat: Infinity }}
                className="bg-black/80 backdrop-blur-md border-2 border-green-500 rounded-2xl px-10 py-8 text-center"
              >
                <p className="text-2xl font-bold text-green-400 mb-2">GANHOU!</p>
                <p className="text-4xl md:text-5xl font-black text-green-300 tabular-nums">
                  +{displayAmount.toLocaleString('pt-BR')}
                </p>
                <p className="text-sm text-green-500/70 mt-2">creditos</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
