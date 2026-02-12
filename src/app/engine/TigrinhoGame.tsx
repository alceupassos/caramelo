'use client';
import { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import TigrinhoScene from '../../phaser/scenes/TigrinhoScene';

export default function TigrinhoGame({ onReady }: { onReady?: (game: Phaser.Game) => void }) {
    const gameRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.WEBGL,
            parent: 'tigrinho-container',
            backgroundColor: '#0a0a1a',
            scale: {
                mode: Phaser.Scale.ScaleModes.RESIZE,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                parent: 'tigrinho-container',
            },
            scene: [TigrinhoScene],
        };

        gameRef.current = new Phaser.Game(config);
        if (onReady) {
            onReady(gameRef.current);
        }

        return () => {
            gameRef.current?.destroy(true);
        };
    }, []);

    return <div id="tigrinho-container" className='w-full h-full' />;
}
