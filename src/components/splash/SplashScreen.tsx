'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem('caramelo_splash_shown')) {
      setVisible(false);
      onComplete();
      return;
    }
  }, [onComplete]);

  const handleVideoEnd = () => {
    sessionStorage.setItem('caramelo_splash_shown', 'true');
    setVisible(false);
    setTimeout(onComplete, 500);
  };

  const handleSkip = () => {
    if (videoRef.current) videoRef.current.pause();
    handleVideoEnd();
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
          onClick={handleSkip}
        >
          <video
            ref={videoRef}
            src="/caramelov.mp4"
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnd}
            className="w-full h-full object-contain"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSkip();
            }}
            className="absolute bottom-8 right-8 text-white/50 hover:text-white text-sm px-4 py-2 border border-white/20 rounded-lg backdrop-blur-sm bg-black/30 transition-all"
          >
            Pular
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
