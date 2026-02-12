'use client';

import dynamic from 'next/dynamic';
import Layout from "../../components/layout/layout";
import { useGameController } from "../../hooks/useCrashGameController";
import PrimaryButton from '../../components/button/primary';
import { useEffect, useState, useRef, useCallback } from 'react';
import { addToast, Image } from '@heroui/react';
import { FaCrown, FaParachuteBox, FaUser } from 'react-icons/fa6';
import { useCredits } from '@/contexts/CreditContext';

const PhaserGame = dynamic(() => import('../engine/CrashGame'), {
    ssr: false,
});

declare global {
    interface Window {
        game: Phaser.Game;
        sizeChanged: () => void;
    }
}

const BET_AMOUNT = 1000;

type MockGamePhase = 'WAITING' | 'COUNTDOWN' | 'LAUNCHED' | 'CRASHED';

interface MockHistory {
    round: number;
    crashAt: number;
    escaped: boolean;
    escapeMultiplier?: number;
    winAmount: number;
}

const BOT_NAMES = ['CriptoDoguinho', 'LuaCheia77', 'ApostaFirme', 'FoguetaoVIP', 'BaraoDoJogo', 'SortudoBR', 'CarameloFan', 'PixRapido'];

const Crash = () => {
    const [phase, setPhase] = useState<MockGamePhase>('WAITING');
    const [joined, setJoined] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [multiplier, setMultiplier] = useState(1.0);
    const [crashPoint, setCrashPoint] = useState(0);
    const [escaped, setEscaped] = useState(false);
    const [round, setRound] = useState(1);
    const [history, setHistory] = useState<MockHistory[]>([]);
    const [bots, setBots] = useState<{ name: string; escaped: boolean; multiplier?: number }[]>([]);
    const multiplierRef = useRef(1.0);
    const crashPointRef = useRef(0);
    const launchTimeRef = useRef(0);
    const animFrameRef = useRef<number>(0);

    const { balance, deductBet, addWinnings } = useCredits();

    const {
        setGameInstance,
        triggerCrash,
        triggerLaunch,
        triggerEscape,
    } = useGameController();

    // Generate a random crash point (house edge ~4%)
    const generateCrashPoint = () => {
        const r = Math.random();
        // Provably fair-ish formula: inverse of uniform random with house edge
        if (r < 0.04) return 1.0; // 4% instant crash
        return Math.max(1.0, 1 / (1 - r) * 0.96);
    };

    const generateBots = useCallback(() => {
        const count = Math.floor(Math.random() * 4) + 2;
        const shuffled = [...BOT_NAMES].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count).map(name => ({ name, escaped: false }));
    }, []);

    // Join the game
    const handleJoin = () => {
        if (phase !== 'WAITING' && phase !== 'COUNTDOWN') return;
        const result = deductBet(BET_AMOUNT, 'crash');
        if (!result) {
            addToast({ title: 'Creditos insuficientes!', color: 'danger', timeout: 3000 });
            return;
        }
        setJoined(true);
        addToast({ title: `Apostou ${BET_AMOUNT.toLocaleString()} creditos!`, color: 'success', timeout: 2000 });

        // Start countdown if not started
        if (phase === 'WAITING') {
            startCountdown();
        }
    };

    // Start countdown to launch
    const startCountdown = useCallback(() => {
        setPhase('COUNTDOWN');
        setBots(generateBots());
        const cp = generateCrashPoint();
        setCrashPoint(cp);
        crashPointRef.current = cp;
        setCountdown(5);
        setMultiplier(1.0);
        multiplierRef.current = 1.0;
        setEscaped(false);

        let count = 5;
        const timer = setInterval(() => {
            count--;
            setCountdown(count);
            if (count <= 0) {
                clearInterval(timer);
                launchRocket();
            }
        }, 1000);
    }, [generateBots]);

    // Launch the rocket
    const launchRocket = () => {
        setPhase('LAUNCHED');
        triggerLaunch();
        launchTimeRef.current = Date.now();

        const updateMultiplier = () => {
            const elapsed = (Date.now() - launchTimeRef.current) / 1000;
            const newMultiplier = 1 + Math.pow(elapsed, 1.5) * 0.1;
            multiplierRef.current = newMultiplier;
            setMultiplier(newMultiplier);

            // Simulate bots escaping
            setBots(prev => prev.map(bot => {
                if (!bot.escaped && Math.random() < 0.01 && newMultiplier > 1.2) {
                    return { ...bot, escaped: true, multiplier: newMultiplier };
                }
                return bot;
            }));

            if (newMultiplier >= crashPointRef.current) {
                // CRASH!
                setPhase('CRASHED');
                triggerCrash();
                cancelAnimationFrame(animFrameRef.current);

                // Record history
                setHistory(prev => [{
                    round: round,
                    crashAt: crashPointRef.current,
                    escaped: false,
                    winAmount: 0,
                }, ...prev].slice(0, 10));

                // Auto restart after delay
                setTimeout(() => {
                    setRound(r => r + 1);
                    setPhase('WAITING');
                    setJoined(false);
                    setMultiplier(1.0);
                    multiplierRef.current = 1.0;
                }, 3000);

                return;
            }

            animFrameRef.current = requestAnimationFrame(updateMultiplier);
        };

        animFrameRef.current = requestAnimationFrame(updateMultiplier);
    };

    // Escape (cashout)
    const handleEscape = () => {
        if (phase !== 'LAUNCHED' || escaped || !joined) return;
        setEscaped(true);

        const currentMultiplier = multiplierRef.current;
        const winAmount = Math.floor(BET_AMOUNT * currentMultiplier);
        addWinnings(winAmount, 'crash');
        triggerEscape('/icone.png');

        addToast({
            title: `Escapou com ${currentMultiplier.toFixed(2)}x! +${winAmount.toLocaleString()} creditos`,
            color: 'success',
            timeout: 4000,
        });

        // Update history when crash happens
        const origSetHistory = setHistory;
        setHistory(prev => {
            // Will be overwritten when crash happens, but mark as escaped
            return prev;
        });

        // Override the crash history entry
        const currentRound = round;
        const checkCrash = () => {
            if (multiplierRef.current >= crashPointRef.current) {
                setHistory(prev => {
                    const existing = prev.find(h => h.round === currentRound);
                    if (existing) return prev;
                    return [{
                        round: currentRound,
                        crashAt: crashPointRef.current,
                        escaped: true,
                        escapeMultiplier: currentMultiplier,
                        winAmount,
                    }, ...prev].slice(0, 10);
                });
                return;
            }
            requestAnimationFrame(checkCrash);
        };
        checkCrash();
    };

    // Cleanup
    useEffect(() => {
        return () => {
            cancelAnimationFrame(animFrameRef.current);
        };
    }, []);

    const getPhaseLabel = () => {
        switch (phase) {
            case 'WAITING': return 'Aguardando...';
            case 'COUNTDOWN': return `Lancamento em ${countdown}s`;
            case 'LAUNCHED': return `${multiplier.toFixed(2)}x`;
            case 'CRASHED': return `EXPLODIU em ${crashPoint.toFixed(2)}x`;
        }
    };

    const getPhaseColor = () => {
        switch (phase) {
            case 'WAITING': return 'text-gray-400';
            case 'COUNTDOWN': return 'text-yellow-400';
            case 'LAUNCHED': return multiplier >= 3 ? 'text-red-400' : multiplier >= 2 ? 'text-orange-400' : 'text-green-400';
            case 'CRASHED': return 'text-red-500';
        }
    };

    return (
        <Layout className="bg-crash bg-cover bg-center">
            <div className='flex flex-col'>
                {/* History bar */}
                <div className='flex gap-2 horizontal-scrollbar scrollbar-hide overflow-x-auto w-full py-4 px-2'>
                    {history.map((h, idx) => (
                        <div
                            key={idx}
                            className={`shrink-0 rounded-lg border px-3 py-2 text-center min-w-[80px] ${h.escaped
                                    ? 'border-green-500/50 bg-green-900/20'
                                    : 'border-red-500/50 bg-red-900/20'
                                }`}
                        >
                            <p className={`text-lg font-bold ${h.escaped ? 'text-green-400' : 'text-red-400'}`}>
                                {h.crashAt.toFixed(2)}x
                            </p>
                            <p className='text-xs text-white/40'>#{h.round}</p>
                            {h.escaped && (
                                <p className='text-xs text-green-300'>+{h.winAmount.toLocaleString()}</p>
                            )}
                        </div>
                    ))}
                    {history.length === 0 && (
                        <p className='text-white/30 text-sm px-4'>Nenhum jogo ainda. Clique em Entrar para comecar!</p>
                    )}
                </div>

                <div className="flex flex-col w-full bg-opacity-15 flex-1 md:flex-row">
                    {/* Phaser Canvas */}
                    <div className='relative w-full md:w-[50%] lg:w-[55%] min-h-[300px] md:min-h-[500px]'>
                        <div className="relative h-full">
                            <PhaserGame onReady={setGameInstance} />
                        </div>
                    </div>

                    {/* Controls */}
                    <div className='flex-1 flex gap-2'>
                        <div className='max-w-[400px] shrink-0 w-full flex flex-col gap-2 px-4 py-2'>
                            {/* Como jogar */}
                            <div className='bg-black/40 rounded-lg px-3 py-2 border border-white/5 text-xs text-gray-400'>
                                <span className='text-yellow-400 font-bold'>Como jogar:</span> Entre antes do lancamento. O foguete sobe e o multiplicador aumenta. Clique em Escapar antes que exploda para ganhar!
                            </div>

                            {/* Status display */}
                            <div className='h-[200px] relative bg-gradient-to-br from-violet-500/80 to-fuchsia-500/80 rounded-xl flex flex-col items-center justify-center gap-2'>
                                <p className={`text-4xl font-bold font-mono ${getPhaseColor()}`}>
                                    {getPhaseLabel()}
                                </p>
                                {phase === 'LAUNCHED' && joined && !escaped && (
                                    <p className='text-sm text-white/60'>Ganho potencial: {Math.floor(BET_AMOUNT * multiplier).toLocaleString()}</p>
                                )}
                                {escaped && (
                                    <p className='text-sm text-green-300 font-bold'>Voce escapou!</p>
                                )}
                                <img src="/icone.png" alt="Caramelo" className="absolute bottom-2 right-2 w-10 h-10 rounded-full opacity-60" />
                            </div>

                            {/* Bet info */}
                            <div className='bg-black/40 rounded-lg px-3 py-2 border border-white/5 flex justify-between'>
                                <span className='text-gray-400'>Aposta</span>
                                <span className='text-yellow-400 font-bold'>{BET_AMOUNT.toLocaleString()} creditos</span>
                            </div>

                            {/* Action buttons */}
                            <div className='flex gap-2'>
                                {phase === 'LAUNCHED' && joined && !escaped && (
                                    <PrimaryButton onClick={handleEscape} className='w-full text-lg'>
                                        Escapar ({multiplier.toFixed(2)}x)
                                    </PrimaryButton>
                                )}
                                {(phase === 'WAITING' || phase === 'COUNTDOWN') && !joined && (
                                    <PrimaryButton onClick={handleJoin} className='w-full' disabled={balance < BET_AMOUNT}>
                                        Entrar
                                    </PrimaryButton>
                                )}
                                {joined && phase !== 'LAUNCHED' && phase !== 'CRASHED' && (
                                    <div className='w-full text-center py-3 text-yellow-400 font-bold animate-pulse'>
                                        Preparando lancamento...
                                    </div>
                                )}
                                {phase === 'CRASHED' && (
                                    <div className='w-full text-center py-3 text-red-400 font-bold'>
                                        {escaped ? 'Voce escapou a tempo!' : 'BOOM! Explodiu!'}
                                    </div>
                                )}
                                {phase === 'WAITING' && joined && (
                                    <div className='w-full text-center py-3 text-green-400 font-bold'>
                                        Aposta confirmada!
                                    </div>
                                )}
                            </div>

                            {/* Players */}
                            <div className='pt-2'>
                                <div className='w-full justify-between flex px-2 mb-2'>
                                    <div className="text-primary flex items-center justify-center gap-2">
                                        <FaUser size={14} />
                                        <p className='text-white'>{(joined ? 1 : 0) + bots.length} jogadores</p>
                                    </div>
                                    <p>
                                        Rodada <span className='text-xl text-primary'>#</span><span>{round}</span>
                                    </p>
                                </div>
                                <div className='flex flex-col gap-1 max-h-[200px] overflow-auto'>
                                    {/* You */}
                                    {joined && (
                                        <div className='flex items-center justify-between bg-black/30 rounded-lg px-3 py-2 border border-white/10'>
                                            <div className='flex items-center gap-2'>
                                                <img src="/icone.png" alt="" className='w-8 h-8 rounded-full' />
                                                <span className='text-white text-sm font-bold'>Voce</span>
                                            </div>
                                            <div>
                                                {escaped && <span className='text-green-400 text-sm font-bold flex items-center gap-1'><FaCrown /> GANHOU</span>}
                                                {phase === 'CRASHED' && !escaped && <span className='text-red-400 text-sm'>PERDEU</span>}
                                                {phase === 'LAUNCHED' && !escaped && <span className='text-yellow-400 text-sm animate-pulse'>Jogando...</span>}
                                            </div>
                                        </div>
                                    )}
                                    {/* Bots */}
                                    {bots.map((bot, idx) => (
                                        <div key={idx} className='flex items-center justify-between bg-black/20 rounded-lg px-3 py-1.5 border border-white/5'>
                                            <div className='flex items-center gap-2'>
                                                <div className='w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold'>
                                                    {bot.name[0]}
                                                </div>
                                                <span className='text-white/60 text-sm'>{bot.name}</span>
                                            </div>
                                            <div>
                                                {bot.escaped && <span className='text-green-400 text-xs'>{bot.multiplier?.toFixed(2)}x</span>}
                                                {phase === 'CRASHED' && !bot.escaped && <span className='text-red-400 text-xs'>PERDEU</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Crash;
