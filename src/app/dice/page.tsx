'use client';
import { useState } from 'react';
import Layout from '@/components/layout/layout';
import { useCredits } from '@/contexts/CreditContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function DicePage() {
  const { balance, deductBet, addWinnings } = useCredits();
  const [rollUnder, setRollUnder] = useState(50);
  const [betAmount, setBetAmount] = useState(100);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [won, setWon] = useState<boolean | null>(null);
  const [history, setHistory] = useState<{roll: number, target: number, won: boolean}[]>([]);

  const multiplier = ((100 / rollUnder) * 0.98);
  const winChance = rollUnder;

  const roll = async () => {
    const betResult = deductBet(betAmount, 'dice');
    if (!betResult) return;

    setRolling(true);
    setResult(null);
    setWon(null);

    // Simulate roll animation delay
    await new Promise(r => setTimeout(r, 1500));

    // Generate random number 1-100
    const rollResult = Math.floor(Math.random() * 100) + 1;
    const isWin = rollResult < rollUnder;

    setResult(rollResult);
    setWon(isWin);
    setRolling(false);

    if (isWin) {
      const winAmount = Math.floor(betAmount * multiplier);
      addWinnings(winAmount, 'dice');
    }

    setHistory(prev => [{ roll: rollResult, target: rollUnder, won: isWin }, ...prev].slice(0, 20));
  };

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row gap-4 p-4 max-w-6xl mx-auto">
        {/* Main game area */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <img src="/icone.png" alt="Caramelo" className="w-10 h-10 rounded-full" />
            <h1 className="text-2xl font-bold text-white">Dados</h1>
          </div>
          <div className="bg-black/40 rounded-lg px-3 py-2 border border-white/5 text-xs text-gray-400 mb-4">
            <span className="text-yellow-400 font-bold">Como jogar:</span> Escolha um numero com o slider. Se o dado rolar abaixo do seu numero, voce ganha! Quanto menor o numero, maior o multiplicador.
          </div>

          {/* Result display */}
          <div className="bg-black/60 backdrop-blur rounded-2xl p-8 border border-gray-800 mb-6 text-center">
            <AnimatePresence mode="wait">
              {rolling ? (
                <motion.div
                  key="rolling"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1, rotate: [0, 360] }}
                  transition={{ rotate: { repeat: Infinity, duration: 0.5 } }}
                  className="text-8xl"
                >
                  <span>&#x1F3B2;</span>
                </motion.div>
              ) : result !== null ? (
                <motion.div
                  key="result"
                  initial={{ scale: 2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <div className={`text-8xl font-bold ${won ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result}
                  </div>
                  <div className={`text-2xl mt-2 ${won ? 'text-emerald-400' : 'text-red-400'}`}>
                    {won ? `+${Math.floor(betAmount * multiplier).toLocaleString()} creditos!` : 'Nao foi dessa vez!'}
                  </div>
                </motion.div>
              ) : (
                <div className="text-6xl text-gray-600">?</div>
              )}
            </AnimatePresence>
          </div>

          {/* Slider */}
          <div className="bg-black/40 rounded-xl p-6 border border-gray-800">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Rolar Abaixo de</span>
              <span className="text-white font-bold text-lg">{rollUnder}</span>
            </div>

            {/* Visual bar showing win/lose zones */}
            <div className="relative h-4 rounded-full overflow-hidden mb-2">
              <div className="absolute inset-0 bg-red-900/50" />
              <div
                className="absolute left-0 top-0 h-full bg-emerald-600/50 rounded-l-full transition-all"
                style={{ width: `${rollUnder}%` }}
              />
              {result !== null && (
                <div
                  className={`absolute top-0 w-1 h-full ${won ? 'bg-emerald-400' : 'bg-red-400'}`}
                  style={{ left: `${result}%` }}
                />
              )}
            </div>

            <input
              type="range"
              min={2}
              max={98}
              value={rollUnder}
              onChange={e => setRollUnder(parseInt(e.target.value))}
              className="w-full accent-red-600"
              disabled={rolling}
            />

            <div className="grid grid-cols-3 gap-4 mt-4 text-center">
              <div>
                <div className="text-gray-500 text-xs">Multiplicador</div>
                <div className="text-yellow-400 font-bold text-xl">{multiplier.toFixed(2)}x</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Chance de ganhar</div>
                <div className="text-white font-bold text-xl">{winChance}%</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Ganho potencial</div>
                <div className="text-emerald-400 font-bold text-xl">{Math.floor(betAmount * multiplier).toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {history.map((h, i) => (
                <span
                  key={i}
                  className={`px-2 py-1 rounded text-xs font-mono ${h.won ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}
                >
                  {h.roll}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Controls sidebar */}
        <div className="w-full lg:w-80 bg-black/60 backdrop-blur rounded-xl p-4 border border-gray-800">
          <div className="mb-4">
            <label className="text-gray-400 text-sm">Saldo</label>
            <div className="text-xl font-bold text-white">{balance.toLocaleString()} creditos</div>
          </div>

          <div className="mb-4">
            <label className="text-gray-400 text-sm mb-1 block">Aposta</label>
            <input
              type="number"
              value={betAmount}
              onChange={e => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-700"
            />
            <div className="flex gap-1 mt-1">
              <button onClick={() => setBetAmount(Math.floor(betAmount / 2))} className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300 hover:bg-gray-700">1/2</button>
              <button onClick={() => setBetAmount(betAmount * 2)} className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300 hover:bg-gray-700">2x</button>
              <button onClick={() => setBetAmount(balance)} className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300 hover:bg-gray-700">MAX</button>
            </div>
          </div>

          <button
            onClick={roll}
            disabled={rolling || betAmount <= 0 || betAmount > balance}
            className="w-full py-3 bg-gradient-to-r from-red-800 to-red-600 text-white font-bold rounded-lg hover:from-red-700 hover:to-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg"
          >
            {rolling ? 'Rolando...' : 'Rolar Dado'}
          </button>
        </div>
      </div>
    </Layout>
  );
}
