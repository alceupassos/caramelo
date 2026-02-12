'use client';

import dynamic from 'next/dynamic';
import Layout from '../../components/layout/layout';
import { useTigrinhoController } from '../../hooks/useTigrinhoController';
import { useCredits } from '@/contexts/CreditContext';
import { useState, useEffect, useCallback } from 'react';
import { addToast } from '@heroui/react';
import PaytableModal from '@/components/tigrinho/PaytableModal';
import { FaCircleInfo, FaMinus, FaPlay, FaPlus } from 'react-icons/fa6';

const TigrinhoGame = dynamic(() => import('../engine/TigrinhoGame'), {
    ssr: false,
});

const BET_PRESETS = [100, 500, 1000, 5000, 10000, 50000];
const MIN_BET = 100;
const MAX_BET = 500000;

const Tigrinho = () => {
    const [betAmount, setBetAmount] = useState(1000);
    const [paytableOpen, setPaytableOpen] = useState(false);

    const {
        setGameInstance,
        triggerSpin,
        spinning,
        lastWin,
        freeSpinsLeft,
        autoPlay,
        setAutoPlay,
        bigWin,
        consumeFreeSpin,
    } = useTigrinhoController();

    const { balance, deductBet, addWinnings } = useCredits();

    const handleSpin = useCallback(() => {
        if (spinning) return;

        const isFreeSpin = freeSpinsLeft > 0;

        if (!isFreeSpin) {
            const result = deductBet(betAmount, 'tigrinho');
            if (!result) {
                addToast({
                    title: 'Creditos insuficientes',
                    color: 'danger',
                    timeout: 3000,
                });
                return;
            }
        } else {
            consumeFreeSpin();
        }

        triggerSpin(betAmount);
    }, [spinning, betAmount, freeSpinsLeft, deductBet, triggerSpin, consumeFreeSpin]);

    // Handle win credits
    useEffect(() => {
        if (lastWin > 0 && !spinning) {
            addWinnings(Math.round(lastWin), 'tigrinho');
            if (lastWin >= betAmount * 5) {
                addToast({
                    title: `GRANDE VITORIA! +${Math.round(lastWin).toLocaleString()} creditos!`,
                    color: 'success',
                    timeout: 5000,
                });
            }
        }
    }, [lastWin, spinning]);

    // Auto-play logic
    useEffect(() => {
        if (!autoPlay || spinning) return;

        const timer = setTimeout(() => {
            handleSpin();
        }, 1500);

        return () => clearTimeout(timer);
    }, [autoPlay, spinning, handleSpin]);

    // Free spins notification
    useEffect(() => {
        if (freeSpinsLeft > 0 && !spinning) {
            addToast({
                title: `Giros Gratis: ${freeSpinsLeft} restantes!`,
                color: 'warning',
                timeout: 3000,
            });
        }
    }, [freeSpinsLeft]);

    const adjustBet = (direction: 'up' | 'down') => {
        setBetAmount((prev) => {
            if (direction === 'up') {
                const next = prev * 2;
                return Math.min(next, MAX_BET);
            } else {
                const next = Math.floor(prev / 2);
                return Math.max(next, MIN_BET);
            }
        });
    };

    return (
        <Layout>
            <div className="flex flex-col lg:flex-row w-full h-full gap-4 p-2 md:p-4">
                {/* Game Canvas */}
                <div className="flex-1 relative min-h-[400px] lg:min-h-[500px] rounded-xl overflow-hidden border border-yellow-600/20 bg-[#0a0a1a]">
                    <TigrinhoGame onReady={setGameInstance} />

                    {/* Caramelo mascot */}
                    <img src="/icone.png" alt="Caramelo" className="absolute top-3 left-3 w-12 h-12 rounded-full z-10 border-2 border-yellow-600/50 shadow-lg" />

                    {/* Big Win Overlay */}
                    {bigWin && (
                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                            <div className="text-6xl md:text-8xl font-black text-yellow-400 animate-bounce drop-shadow-[0_0_30px_rgba(255,215,0,0.8)]">
                                GRANDE VITORIA!
                            </div>
                        </div>
                    )}

                    {/* Free Spins Badge */}
                    {freeSpinsLeft > 0 && (
                        <div className="absolute top-4 right-4 bg-purple-600/90 backdrop-blur-sm px-4 py-2 rounded-full z-10">
                            <span className="text-white font-bold text-sm">
                                Giros Gratis: {freeSpinsLeft}
                            </span>
                        </div>
                    )}
                </div>

                {/* Controls Panel */}
                <div className="w-full lg:w-[360px] shrink-0 flex flex-col gap-3">
                    {/* Como jogar */}
                    <div className="bg-black/40 rounded-lg px-3 py-2 border border-white/5 text-xs text-gray-400">
                        <span className="text-yellow-400 font-bold">Como jogar:</span> Escolha o valor da aposta e clique em Girar. Combine simbolos iguais nas linhas para ganhar! 3+ estrelas = giros gratis.
                    </div>

                    {/* Balance */}
                    <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                        <p className="text-gray-400 text-sm">Saldo</p>
                        <p className="text-2xl font-bold text-white font-mono">
                            {balance.toLocaleString()} <span className="text-sm text-gray-400">creditos</span>
                        </p>
                    </div>

                    {/* Last Win */}
                    {lastWin > 0 && (
                        <div className="bg-yellow-600/10 backdrop-blur-sm rounded-xl p-4 border border-yellow-600/30">
                            <p className="text-yellow-400 text-sm">Ultimo Ganho</p>
                            <p className="text-2xl font-bold text-yellow-400 font-mono">
                                +{Math.round(lastWin).toLocaleString()}
                            </p>
                        </div>
                    )}

                    {/* Bet Controls */}
                    <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                        <p className="text-gray-400 text-sm mb-2">Valor da Aposta</p>

                        <div className="flex items-center gap-2 mb-3">
                            <button
                                onClick={() => adjustBet('down')}
                                disabled={spinning || betAmount <= MIN_BET}
                                className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors"
                            >
                                <FaMinus size={12} />
                            </button>

                            <div className="flex-1 text-center">
                                <p className="text-xl font-bold text-white font-mono">
                                    {betAmount.toLocaleString()}
                                </p>
                            </div>

                            <button
                                onClick={() => adjustBet('up')}
                                disabled={spinning || betAmount >= MAX_BET}
                                className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors"
                            >
                                <FaPlus size={12} />
                            </button>
                        </div>

                        {/* Quick Bet Buttons */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            <button
                                onClick={() => setBetAmount((prev) => Math.max(MIN_BET, Math.floor(prev / 2)))}
                                disabled={spinning}
                                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono disabled:opacity-30 transition-colors"
                            >
                                1/2x
                            </button>
                            <button
                                onClick={() => setBetAmount((prev) => Math.min(MAX_BET, prev * 2))}
                                disabled={spinning}
                                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono disabled:opacity-30 transition-colors"
                            >
                                2x
                            </button>
                            {BET_PRESETS.map((preset) => (
                                <button
                                    key={preset}
                                    onClick={() => setBetAmount(preset)}
                                    disabled={spinning}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors disabled:opacity-30
                                        ${betAmount === preset
                                            ? 'bg-yellow-600 text-black font-bold'
                                            : 'bg-white/10 hover:bg-white/20 text-white'
                                        }`}
                                >
                                    {preset >= 1000 ? `${preset / 1000}K` : preset}
                                </button>
                            ))}
                            <button
                                onClick={() => setBetAmount(Math.min(balance, MAX_BET))}
                                disabled={spinning}
                                className="px-3 py-1.5 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-300 text-xs font-mono disabled:opacity-30 transition-colors"
                            >
                                MAX
                            </button>
                        </div>
                    </div>

                    {/* Spin Button */}
                    <button
                        onClick={handleSpin}
                        disabled={spinning || (balance < betAmount && freeSpinsLeft <= 0)}
                        className={`w-full py-4 rounded-xl font-bold text-xl transition-all duration-200
                            ${spinning
                                ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                                : freeSpinsLeft > 0
                                    ? 'bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white shadow-lg shadow-purple-600/30'
                                    : 'bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white shadow-lg shadow-red-600/30'
                            }
                            disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <FaPlay size={16} className={spinning ? 'animate-spin' : ''} />
                            {spinning ? 'GIRANDO...' : freeSpinsLeft > 0 ? `GIRO GRATIS (${freeSpinsLeft})` : 'GIRAR'}
                        </div>
                    </button>

                    {/* Auto Play */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setAutoPlay(!autoPlay)}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all
                                ${autoPlay
                                    ? 'bg-yellow-600 text-black'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                }
                            `}
                        >
                            {autoPlay ? 'PARAR AUTO' : 'AUTO GIRAR'}
                        </button>

                        <button
                            onClick={() => setPaytableOpen(true)}
                            className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors flex items-center gap-2"
                        >
                            <FaCircleInfo size={14} />
                            Premios
                        </button>
                    </div>
                </div>
            </div>

            <PaytableModal isOpen={paytableOpen} onClose={() => setPaytableOpen(false)} />
        </Layout>
    );
};

export default Tigrinho;
