'use client';
import { useState, useCallback } from 'react';
import Layout from '@/components/layout/layout';
import { useCredits } from '@/contexts/CreditContext';

// Game state
type TileState = 'hidden' | 'safe' | 'mine' | 'revealed-mine';

export default function MinesPage() {
  const { balance, deductBet, addWinnings } = useCredits();
  const [grid, setGrid] = useState<TileState[]>(Array(25).fill('hidden'));
  const [minePositions, setMinePositions] = useState<Set<number>>(new Set());
  const [mineCount, setMineCount] = useState(5);
  const [betAmount, setBetAmount] = useState(100);
  const [gameActive, setGameActive] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  // Calculate multiplier based on mines and revealed tiles
  const calculateMultiplier = useCallback((mines: number, revealed: number) => {
    if (revealed === 0) return 1.0;
    const totalTiles = 25;
    const safeTiles = totalTiles - mines;
    let multiplier = 1.0;
    for (let i = 0; i < revealed; i++) {
      multiplier *= (totalTiles - i) / (safeTiles - i);
    }
    return multiplier * 0.98; // 2% house edge
  }, []);

  // Start game: place mines randomly, deduct bet
  const startGame = useCallback(() => {
    const result = deductBet(betAmount, 'mines');
    if (!result) return; // insufficient balance

    // Generate random mine positions
    const positions = new Set<number>();
    while (positions.size < mineCount) {
      positions.add(Math.floor(Math.random() * 25));
    }

    setMinePositions(positions);
    setGrid(Array(25).fill('hidden'));
    setRevealedCount(0);
    setCurrentMultiplier(1.0);
    setGameActive(true);
    setGameOver(false);
    setWon(false);
  }, [betAmount, mineCount, deductBet]);

  // Cashout
  const cashout = useCallback(() => {
    if (!gameActive || revealedCount === 0) return;
    const winAmount = Math.floor(betAmount * currentMultiplier);
    addWinnings(winAmount, 'mines');
    setGameActive(false);
    setWon(true);
    setGameOver(true);
    // Reveal all mines
    setGrid(prev => {
      const newGrid = [...prev];
      minePositions.forEach(pos => { newGrid[pos] = 'revealed-mine'; });
      return newGrid;
    });
  }, [gameActive, revealedCount, betAmount, currentMultiplier, addWinnings, minePositions]);

  // Reveal tile
  const revealTile = useCallback((index: number) => {
    if (!gameActive || grid[index] !== 'hidden' || gameOver) return;

    if (minePositions.has(index)) {
      // Hit a mine!
      const newGrid = [...grid];
      newGrid[index] = 'mine';
      // Reveal all mines
      minePositions.forEach(pos => { newGrid[pos] = 'revealed-mine'; });
      newGrid[index] = 'mine'; // ensure clicked mine shows as 'mine' not 'revealed-mine'
      setGrid(newGrid);
      setGameOver(true);
      setGameActive(false);
    } else {
      // Safe tile
      const newGrid = [...grid];
      newGrid[index] = 'safe';
      setGrid(newGrid);
      const newRevealed = revealedCount + 1;
      setRevealedCount(newRevealed);
      const newMultiplier = calculateMultiplier(mineCount, newRevealed);
      setCurrentMultiplier(newMultiplier);

      // Check if all safe tiles revealed
      if (newRevealed === 25 - mineCount) {
        const winAmount = Math.floor(betAmount * newMultiplier);
        addWinnings(winAmount, 'mines');
        setGameActive(false);
        setWon(true);
        setGameOver(true);
        const finalGrid = [...newGrid];
        minePositions.forEach(pos => { finalGrid[pos] = 'revealed-mine'; });
        setGrid(finalGrid);
      }
    }
  }, [gameActive, grid, gameOver, minePositions, revealedCount, calculateMultiplier, mineCount, betAmount, addWinnings]);

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row gap-4 p-4 max-w-6xl mx-auto">
        {/* Game Grid */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <img src="/icone.png" alt="Caramelo" className="w-10 h-10 rounded-full" />
            <h1 className="text-2xl font-bold text-white">Mines</h1>
          </div>
          <div className="bg-black/40 rounded-lg px-3 py-2 border border-white/5 text-xs text-gray-400 mb-4">
            <span className="text-yellow-400 font-bold">Como jogar:</span> Defina a aposta e o numero de minas. Clique nos blocos para revelar. Cada bloco seguro aumenta o multiplicador. Clique em Retirar antes de explodir!
          </div>
          <div className="grid grid-cols-5 gap-2 max-w-[500px] mx-auto">
            {grid.map((tile, i) => (
              <button
                key={i}
                onClick={() => revealTile(i)}
                disabled={!gameActive || tile !== 'hidden'}
                className={`
                  aspect-square rounded-lg text-3xl font-bold
                  transition-all duration-300 transform
                  ${tile === 'hidden' ? 'bg-gray-800 hover:bg-gray-700 hover:scale-105 cursor-pointer border border-gray-700' : ''}
                  ${tile === 'safe' ? 'bg-emerald-900/50 border-2 border-emerald-400 scale-95' : ''}
                  ${tile === 'mine' ? 'bg-red-900/50 border-2 border-red-500 animate-pulse' : ''}
                  ${tile === 'revealed-mine' ? 'bg-red-900/30 border border-red-800' : ''}
                  disabled:cursor-default
                `}
              >
                {tile === 'safe' && <span>&#x1F48E;</span>}
                {tile === 'mine' && <span>&#x1F4A5;</span>}
                {tile === 'revealed-mine' && <span>&#x1F4A3;</span>}
              </button>
            ))}
          </div>

          {/* Game over message */}
          {gameOver && (
            <div className={`text-center mt-4 text-2xl font-bold ${won ? 'text-emerald-400' : 'text-red-400'}`}>
              {won ? `+${Math.floor(betAmount * currentMultiplier).toLocaleString()} creditos!` : 'BOOM! Explodiu!'}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="w-full lg:w-80 bg-black/60 backdrop-blur rounded-xl p-4 border border-gray-800">
          <div className="mb-4">
            <label className="text-gray-400 text-sm">Saldo</label>
            <div className="text-xl font-bold text-white">{balance.toLocaleString()} creditos</div>
          </div>

          {!gameActive && (
            <>
              <div className="mb-4">
                <label className="text-gray-400 text-sm mb-1 block">Aposta</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={betAmount}
                    onChange={e => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
                    className="flex-1 bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-700"
                  />
                </div>
                <div className="flex gap-1 mt-1">
                  <button onClick={() => setBetAmount(Math.floor(betAmount / 2))} className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300 hover:bg-gray-700">1/2</button>
                  <button onClick={() => setBetAmount(betAmount * 2)} className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300 hover:bg-gray-700">2x</button>
                  <button onClick={() => setBetAmount(balance)} className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300 hover:bg-gray-700">MAX</button>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-gray-400 text-sm mb-1 block">Minas: {mineCount}</label>
                <input
                  type="range"
                  min={1}
                  max={24}
                  value={mineCount}
                  onChange={e => setMineCount(parseInt(e.target.value))}
                  className="w-full accent-red-600"
                />
              </div>

              <button
                onClick={startGame}
                disabled={betAmount <= 0 || betAmount > balance}
                className="w-full py-3 bg-gradient-to-r from-red-800 to-red-600 text-white font-bold rounded-lg hover:from-red-700 hover:to-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Jogar
              </button>
            </>
          )}

          {gameActive && (
            <>
              <div className="mb-4 text-center">
                <div className="text-gray-400 text-sm">Multiplicador atual</div>
                <div className="text-3xl font-bold text-yellow-400">{currentMultiplier.toFixed(2)}x</div>
              </div>
              <div className="mb-4 text-center">
                <div className="text-gray-400 text-sm">Ganho potencial</div>
                <div className="text-xl font-bold text-emerald-400">
                  {Math.floor(betAmount * currentMultiplier).toLocaleString()}
                </div>
              </div>
              <button
                onClick={cashout}
                disabled={revealedCount === 0}
                className="w-full py-3 bg-gradient-to-r from-emerald-700 to-emerald-500 text-white font-bold rounded-lg hover:from-emerald-600 hover:to-emerald-400 disabled:opacity-50 transition-all text-lg"
              >
                Retirar {currentMultiplier.toFixed(2)}x
              </button>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
