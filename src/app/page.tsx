'use client';
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import SplashScreen from '@/components/splash/SplashScreen';

const games = [
  {
    name: 'Crash',
    href: '/crash',
    emoji: '🚀',
    description: 'Aposte e saia antes do crash!',
    gradient: 'from-red-900/60 to-orange-900/40',
  },
  {
    name: 'Tigrinho',
    href: '/tigrinho',
    emoji: '🐯',
    description: 'O clássico Fortune Tiger',
    gradient: 'from-amber-900/60 to-yellow-900/40',
  },
  {
    name: 'Coinflip',
    href: '/coinflip',
    emoji: '🪙',
    description: 'Cara ou coroa, 50/50',
    gradient: 'from-yellow-900/60 to-amber-800/40',
  },
  {
    name: 'Mines',
    href: '/mines',
    emoji: '💣',
    description: 'Desvie das minas e ganhe!',
    gradient: 'from-emerald-900/60 to-green-900/40',
  },
  {
    name: 'Dice',
    href: '/dice',
    emoji: '🎲',
    description: 'Role os dados da sorte',
    gradient: 'from-purple-900/60 to-indigo-900/40',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function Home() {
  const [splashDone, setSplashDone] = useState(false);

  const handleSplashComplete = useCallback(() => {
    setSplashDone(true);
  }, []);

  return (
    <>
      <SplashScreen onComplete={handleSplashComplete} />

      {splashDone && (
        <div className="relative min-h-screen w-full overflow-x-hidden bg-black text-white">
          {/* Background */}
          <div
            className="fixed inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/caramelo.jpg')" }}
          />
          <div className="fixed inset-0 bg-black/70 backdrop-blur-[2px]" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center min-h-screen px-4 py-12">
            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="flex flex-col items-center text-center mt-12 mb-16"
            >
              <motion.img
                src="/caramelo.png"
                alt="Caramelo"
                className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover mb-6 border-2 border-[#8A0000]/60 shadow-lg shadow-[#8A0000]/30"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              />

              <h1
                className="text-5xl md:text-7xl font-bold tracking-tight"
                style={{
                  textShadow: '0 0 40px rgba(138,0,0,0.6), 0 0 80px rgba(138,0,0,0.3)',
                }}
              >
                <span className="text-[#ff4444]">Caramelo</span>{' '}
                <span className="text-amber-400">Casino</span>
              </h1>

              <motion.p
                className="text-lg md:text-xl text-white/60 mt-4 max-w-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                O Casino Mais Viciante da Web
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="mt-8"
              >
                <Link
                  href="/crash"
                  className="inline-block px-10 py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-[#8A0000] to-[#cc0000] hover:from-[#aa0000] hover:to-[#ee2222] text-white shadow-lg shadow-[#8A0000]/40 hover:shadow-[#8A0000]/60 transition-all duration-300 hover:scale-105"
                >
                  Jogar Agora
                </Link>
              </motion.div>
            </motion.div>

            {/* Game Cards */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 w-full max-w-6xl mb-16"
            >
              {games.map((game) => (
                <motion.div key={game.name} variants={itemVariants}>
                  <Link href={game.href} className="block group">
                    <div
                      className={`relative rounded-2xl p-5 border border-white/10 bg-gradient-to-br ${game.gradient} backdrop-blur-md hover:border-[#8A0000]/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-[#8A0000]/20`}
                    >
                      <div className="text-4xl mb-3">{game.emoji}</div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {game.name}
                      </h3>
                      <p className="text-sm text-white/50">{game.description}</p>
                      <div className="mt-4 text-xs text-[#ff4444] font-medium group-hover:text-amber-400 transition-colors">
                        Jogar &rarr;
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Footer */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-white/20 text-sm pb-8"
            >
              Caramelo Casino &mdash; Jogue com responsabilidade
            </motion.p>
          </div>
        </div>
      )}
    </>
  );
}
