'use client';
import { useState, useCallback } from 'react';
import Layout from '@/components/layout/layout';
import { useCredits } from '@/contexts/CreditContext';
import CoinAnimation from '@/components/coinflip/CoinAnimation';
import { motion, AnimatePresence } from 'framer-motion';

type FlipResult = {
  choice: 'heads' | 'tails';
  result: 'heads' | 'tails';
  won: boolean;
  amount: number;
};

const BET_PRESETS = [100, 500, 1000, 5000, 10000, 50000];

export default function CoinflipPage() {
  const { balance, deductBet, addWinnings } = useCredits();
  const [betAmount, setBetAmount] = useState(100);
  const [selectedSide, setSelectedSide] = useState<'heads' | 'tails'>('heads');
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);
  const [lastResult, setLastResult] = useState<FlipResult | null>(null);
  const [history, setHistory] = useState<FlipResult[]>([]);

  const handleFlip = useCallback(() => {
    if (flipping) return;
    const bet = deductBet(betAmount, 'coinflip');
    if (!bet) return;

    const flipResult: 'heads' | 'tails' = Math.random() < 0.49 ? 'heads' : 'tails';
    setResult(flipResult);
    setFlipping(true);
    setLastResult(null);
  }, [flipping, betAmount, deductBet]);

  const handleFlipComplete = useCallback(() => {
    if (!result) return;
    const won = result === selectedSide;
    const winAmount = won ? betAmount * 2 : 0;

    if (won) {
      addWinnings(winAmount, 'coinflip');
    }

    const flipResult: FlipResult = {
      choice: selectedSide,
      result,
      won,
      amount: won ? winAmount : betAmount,
    };

    setLastResult(flipResult);
    setHistory((prev) => [flipResult, ...prev].slice(0, 10));
    setFlipping(false);
  }, [result, selectedSide, betAmount, addWinnings]);

  return (
    <Layout>
      <div className="min-h-screen bg-[#101114] py-8 px-4 flex flex-col items-center">
        {/* Header */}
        <div className="w-full max-w-2xl mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-wide mb-2">
            <span className="bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 bg-clip-text text-transparent">
              COINFLIP
            </span>
          </h1>
          <p className="text-gray-400">Escolha um lado, 49% de chance de ganhar 2x</p>
        </div>

        {/* Coin Animation */}
        <div className="mb-8">
          <CoinAnimation flipping={flipping} result={result} onComplete={handleFlipComplete} />
        </div>

        {/* Result */}
        <AnimatePresence>
          {lastResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`text-center mb-6 px-6 py-3 rounded-xl border-2 ${
                lastResult.won
                  ? 'border-green-500 bg-green-900/20 text-green-400'
                  : 'border-red-500 bg-red-900/20 text-red-400'
              }`}
            >
              <p className="text-2xl font-bold">
                {lastResult.won ? `+${lastResult.amount.toLocaleString()}` : `-${lastResult.amount.toLocaleString()}`}
              </p>
              <p className="text-sm opacity-70">
                {lastResult.won ? 'Voce ganhou!' : 'Tente novamente'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="w-full max-w-md bg-[#181A20] rounded-2xl p-6 border border-[#23232a] space-y-5">
          {/* Side Selection */}
          <div>
            <p className="text-gray-400 text-sm mb-2">Escolha o lado</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedSide('heads')}
                disabled={flipping}
                className={`py-4 rounded-xl font-bold text-lg transition-all ${
                  selectedSide === 'heads'
                    ? 'bg-gradient-to-br from-yellow-600 to-amber-500 text-white scale-[1.02] shadow-lg shadow-yellow-900/40'
                    : 'bg-[#23232a] text-gray-400 hover:bg-[#2a2a32]'
                } disabled:opacity-50`}
              >
                🟡 Heads
              </button>
              <button
                onClick={() => setSelectedSide('tails')}
                disabled={flipping}
                className={`py-4 rounded-xl font-bold text-lg transition-all ${
                  selectedSide === 'tails'
                    ? 'bg-gradient-to-br from-red-800 to-red-600 text-white scale-[1.02] shadow-lg shadow-red-900/40'
                    : 'bg-[#23232a] text-gray-400 hover:bg-[#2a2a32]'
                } disabled:opacity-50`}
              >
                🔴 Tails
              </button>
            </div>
          </div>

          {/* Bet Amount */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400 text-sm">Aposta</span>
              <span className="text-gray-500 text-xs">Saldo: {balance.toLocaleString()}</span>
            </div>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
              disabled={flipping}
              className="w-full bg-[#23232a] text-white px-4 py-3 rounded-xl border border-[#33333a] focus:outline-none focus:ring-2 focus:ring-yellow-600/50 text-lg font-bold tabular-nums"
            />
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {BET_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setBetAmount(preset)}
                  disabled={flipping}
                  className="px-3 py-1.5 bg-[#23232a] hover:bg-[#2a2a32] rounded-lg text-xs text-gray-300 font-medium transition-colors disabled:opacity-50"
                >
                  {preset >= 1000 ? `${preset / 1000}k` : preset}
                </button>
              ))}
              <button
                onClick={() => setBetAmount(Math.floor(betAmount / 2))}
                disabled={flipping}
                className="px-3 py-1.5 bg-[#23232a] hover:bg-[#2a2a32] rounded-lg text-xs text-gray-300 font-medium disabled:opacity-50"
              >
                1/2
              </button>
              <button
                onClick={() => setBetAmount(betAmount * 2)}
                disabled={flipping}
                className="px-3 py-1.5 bg-[#23232a] hover:bg-[#2a2a32] rounded-lg text-xs text-gray-300 font-medium disabled:opacity-50"
              >
                2x
              </button>
            </div>
          </div>

          {/* Potential Win */}
          <div className="flex justify-between bg-[#23232a] rounded-xl px-4 py-3">
            <span className="text-gray-400">Ganho potencial</span>
            <span className="text-green-400 font-bold">{(betAmount * 2).toLocaleString()}</span>
          </div>

          {/* Flip Button */}
          <button
            onClick={handleFlip}
            disabled={flipping || betAmount <= 0 || betAmount > balance}
            className="w-full py-4 bg-gradient-to-r from-[#8A0000] to-[#cc0000] hover:from-[#aa0000] hover:to-[#ee2222] text-white font-bold text-xl rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#8A0000]/30 hover:shadow-[#8A0000]/50 hover:scale-[1.02] active:scale-[0.98]"
          >
            {flipping ? 'Girando...' : 'Flip!'}
          </button>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="w-full max-w-md mt-6">
            <p className="text-gray-500 text-sm mb-2">Historico</p>
            <div className="flex gap-2 flex-wrap">
              {history.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 ${
                    h.won
                      ? 'border-green-500 bg-green-900/20'
                      : 'border-red-500 bg-red-900/20'
                  }`}
                >
                  {h.result === 'heads' ? '🟡' : '🔴'}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
