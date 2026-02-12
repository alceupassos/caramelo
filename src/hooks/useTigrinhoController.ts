'use client';
import { useRef, useState, useCallback, useEffect } from 'react';

export interface SpinResult {
  totalWin: number;
  wins: any[];
  grid: number[][];
}

export function useTigrinhoController() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [lastWin, setLastWin] = useState(0);
  const [freeSpinsLeft, setFreeSpinsLeft] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [bigWin, setBigWin] = useState(false);

  const setGameInstance = useCallback((game: Phaser.Game) => {
    gameRef.current = game;

    // Wait for the scene to be ready before attaching listeners
    const checkScene = () => {
      const scene = game.scene.getScene('TigrinhoScene');
      if (scene) {
        scene.events.on('spinComplete', (result: SpinResult) => {
          setSpinning(false);
          setLastWin(result.totalWin);
        });

        scene.events.on('win', (amount: number) => {
          setLastWin(amount);
        });

        scene.events.on('bigWin', () => {
          setBigWin(true);
          setTimeout(() => setBigWin(false), 3000);
        });

        scene.events.on('freeSpins', (count: number) => {
          setFreeSpinsLeft((prev) => prev + count);
        });
      } else {
        setTimeout(checkScene, 100);
      }
    };

    checkScene();
  }, []);

  const triggerSpin = useCallback((betAmount?: number) => {
    const scene = gameRef.current?.scene.getScene('TigrinhoScene') as any;
    if (!scene || spinning) return;

    setSpinning(true);
    setLastWin(0);
    setBigWin(false);

    if (betAmount !== undefined) {
      scene.setBetAmount(betAmount);
    }
    scene.spin();
  }, [spinning]);

  const consumeFreeSpin = useCallback(() => {
    setFreeSpinsLeft((prev) => Math.max(0, prev - 1));
  }, []);

  return {
    setGameInstance,
    triggerSpin,
    spinning,
    lastWin,
    freeSpinsLeft,
    autoPlay,
    setAutoPlay,
    bigWin,
    consumeFreeSpin,
  };
}
