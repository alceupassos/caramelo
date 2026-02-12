'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptics } from '@/utils/haptics';

interface LossAnimationProps {
  show: boolean;
  onDismiss?: () => void;
}

export function LossAnimation({ show, onDismiss }: LossAnimationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) {
      setVisible(false);
      return;
    }

    setVisible(true);
    haptics.loss();

    const timeout = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, 2000);

    return () => clearTimeout(timeout);
  }, [show, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99] flex items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-red-900/50"
          />
          <motion.div
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              x: [0, -4, 4, -4, 4, -4, 4, 0],
            }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-black/80 backdrop-blur-md border-2 border-red-500 rounded-2xl px-10 py-8 text-center"
          >
            <p className="text-3xl md:text-4xl font-black text-red-400">
              Perdeu!
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
