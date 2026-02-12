import * as Phaser from 'phaser';
import { AudioManager } from '../audio/AudioManager';
import { PremiumParticles } from '../particles/PremiumParticles';

export default class MainScene extends Phaser.Scene {
    rocket!: Phaser.GameObjects.Image;
    sky!: Phaser.GameObjects.TileSprite;
    station!: Phaser.GameObjects.Image;
    smokey!: Phaser.GameObjects.Particles.ParticleEmitter;
    crashed = false;
    rocketContainer!: Phaser.GameObjects.Container;
    private startTime!: number;
    private scrollSpeed: number = 2;

    private baseX!: number;
    private vibrationOffset!: number;

    private launched = false;

    private multiplierText!: Phaser.GameObjects.Text;
    private currentMultiplier: number = 1.0;
    private audioManager!: AudioManager;

    constructor() {
        super('MainScene');
    }

    preload() {
        this.load.setPath("assets/game");
        this.load.image('station', 'image/station.png');
        this.load.image('airship', 'image/rocket.png');
        this.load.image('sky', 'image/sky.png');
        this.load.image('umbrella', 'image/umbrella.png');
        // this.load.spritesheet('explosion', 'explosion.png', {
        //   frameWidth: 64,
        //   frameHeight: 64,
        // });
        this.load.atlas('rocket', 'animations/rocket.png', 'animations/rocket.json');
        this.load.atlas('flares', 'particles/flares.png', 'particles/flares.json');
        this.load.spritesheet('boom', 'sprites/explosion.png', { frameWidth: 64, frameHeight: 64, endFrame: 23 });
        this.load.image('avatar', 'image/astro.png');
        this.load.start();

        // Preload audio assets
        this.audioManager = new AudioManager(this);
        this.audioManager.preload();
    }

    create() {
        this.crashed = false;
        this.launched = false;
        this.startTime = this.time.now;
        this.currentMultiplier = 1.0;
        const { width, height } = this.scale;
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.events.off('escape', this.triggerEscape, this);
            this.events.off('launch', this.triggerLaunch, this);
            this.events.off('crash', this.triggerCrash, this);
            this.audioManager.destroy();
        });
        this.events.on('launch', this.triggerLaunch, this);
        this.events.on('crash', this.triggerCrash, this);
        this.events.on('escape', this.triggerEscape, this);

        this.anims.create({ key: 'trail', frames: this.anims.generateFrameNames('rocket', { prefix: 'trail_', start: 0, end: 12, zeroPad: 2 }), repeat: -1 });
        this.anims.create({
            key: 'explode',
            frames: 'boom',
            frameRate: 20,
            showOnStart: true,
            hideOnComplete: true
        });

        this.sky = this.add.tileSprite(width / 2,
            height / 2,
            width,
            height,
            "sky");
        this.rocketContainer = this.add.container(width / 2, height - 300);

        //  A container must have a size in order to receive input
        this.rocketContainer.setSize(120, 80);
        this.rocketContainer.setInteractive({ draggable: true });

        const trail = this.add.sprite(-125, 0, 'trail').play('trail');
        const smokeyManager = this.add.particles(0, -180, 'flares');
        const smokey = this.add.particles(0, -180, 'flares',
            {
                frame: 'white',
                color: [0x040d61, 0xfacc22, 0xf89800, 0xf83600, 0x9f0404, 0x4b4a4f, 0x353438, 0x040404],
                lifespan: 1500,
                angle: { min: -100, max: -80 },
                scale: 0.75,
                speed: { min: 200, max: 300 },
                advance: 2000,
                blendMode: 'ADD'
            });
        smokey.setVisible(false);
        this.smokey = smokey;
        this.station = this.add.image(this.cameras.main.width / 2, this.cameras.main.height, 'station', 'station');
        this.station.setOrigin(0.5, 1);
        this.station.setScale(0.7);
        this.rocket = this.add.image(0, 0, 'airship', 'airship');
        this.rocket.setOrigin(0.5, 1);
        this.rocketContainer.add([smokey, this.rocket]);
        this.rocketContainer.setRotation(Phaser.Math.DegToRad(-180));


        this.vibrationOffset = 2;

        // Multiplier display
        this.multiplierText = this.add.text(
            this.scale.width / 2, 80,
            '1.00x',
            {
                fontSize: '64px',
                fontFamily: 'monospace',
                color: '#FFD700',
                stroke: '#000000',
                strokeThickness: 6,
                shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 8, fill: true }
            }
        ).setOrigin(0.5).setDepth(100).setAlpha(0);

        // Audio manager (already created in preload)
        if (!this.audioManager) {
            this.audioManager = new AudioManager(this);
        }

        // Touch to escape (mobile)
        this.input.on('pointerdown', () => {
            if (this.launched && !this.crashed) {
                this.events.emit('touch-escape');
            }
        });

        let resizeTimeout: NodeJS.Timeout;
        this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
            // clearTimeout(resizeTimeout);
            // resizeTimeout = setTimeout(() => {
            this.resizeHandler();
            // }, 100);
        })
        this.resizeHandler();
    }

    resizeHandler() {
        const parent = this.scale.parent as HTMLElement;
        const width = parent.clientWidth;
        const height = parent.clientHeight;
        console.log("resize", width)
        // Re-center sky
        this.sky.setSize(width, height);
        this.sky.setPosition(width / 2, height / 2);
        // Reposition rocket (e.g. center bottom)
        if (this.rocketContainer) {
            this.rocketContainer.setPosition(width / 2, height - 400); // adjust Y as needed
            this.baseX = this.rocketContainer.x;
        }

        // Reposition station at bottom center
        if (this.station && !this.launched)
            this.station.setPosition(width / 2, height - 100); // adjust Y as needed

        // Reposition multiplier text
        if (this.multiplierText) {
            this.multiplierText.setPosition(width / 2, 80);
        }
    }

    triggerCrash() {
        if (this.crashed) return;
        this.crashed = true;

        // Hide the rocket
        this.rocket.setVisible(false);
        const { x, y } = this.rocket.parentContainer;
        console.log("crash triggered", x, y);

        // Camera shake and premium effects
        this.cameras.main.shake(500, 0.015);
        PremiumParticles.createScreenFlash(this, 0xFF4400, 300);
        PremiumParticles.createGoldExplosion(this, x, y);
        this.audioManager.playSFX('sfx_crash');

        // Add explosion at rocket's position
        const explosion = this.add.sprite(x, y, 'boom');
        explosion.setBlendMode('ADD');
        explosion.setScale(6);
        explosion.setOrigin(0.5);
        explosion.play('explode');
        this.smokey.stop(); // stop emission
        // Optional: remove explosion after animation
        explosion.on('animationcomplete', () => {
            explosion.destroy();
            // Optional: slight delay before restart
            this.time.delayedCall(1000, () => {
                this.scene.restart();
            });
        });

        // Reset multiplier display
        this.currentMultiplier = 1.0;
        this.multiplierText.setText('1.00x').setAlpha(0).setColor('#FFD700');

        // Notify React if needed
        this.events.emit('gameOver');

    }

    triggerLaunch() {
        console.log("launch")
        if (this.launched) return;

        this.launched = true;
        this.startTime = this.time.now;

        this.smokey.setVisible(true); // show trail
        this.smokey.start(); // start emission

        // Play launch SFX
        this.audioManager.playSFX('sfx_launch');

        // Show multiplier
        this.multiplierText.setAlpha(1);
    }

    triggerEscape(avatar: any) {
        if (!this.launched) return;
        if (this.crashed) return;

        // Play escape SFX
        this.audioManager.playSFX('sfx_escape');

        // Use current rocket position
        const worldPos = this.rocket.getWorldTransformMatrix().decomposeMatrix();

        // Alternate direction for fun (left or right)
        const direction = Phaser.Math.Between(0, 1) === 0 ? 'left' : 'right';
        this.load.image('avatar', avatar);
        this.escapeAstronaut(worldPos.translateX, worldPos.translateY, direction as 'left' | 'right', "avatar");
    }


    escapeAstronaut(x: number, y: number, direction: 'left' | 'right', textureKey: string) {
        const offsetX = direction === 'left' ? -50 : 50;

        const astronaut = this.add.sprite(0, 30, textureKey);
        astronaut.setDisplaySize(30, 30);

        // Corrected circular mask creation
        const maskGraphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
        maskGraphics.fillStyle(0xffffff);
        maskGraphics.fillCircle(15, 15, 15); // center at (15,15) in graphics

        const mask = maskGraphics.createGeometryMask();
        // astronaut.setMask(mask);


        const umbrella = this.add.image(0, -10, 'umbrella').setDisplaySize(40, 55).setVisible(false);

        const group = this.add.container(x + offsetX, y, [umbrella, astronaut]);

        const velocity = 250;
        const gravity = 300;
        const angle = direction === 'left' ? Phaser.Math.DegToRad(-140) : Phaser.Math.DegToRad(-40);

        const vx = velocity * Math.cos(angle);
        const vy = velocity * Math.sin(angle);

        let elapsed = 0;
        const duration = 3000;
        let hasPeaked = false;

        const loop = this.time.addEvent({
            delay: 16,
            callback: () => {
                elapsed += 16;
                const t = elapsed / 1000;

                const currentY = y + vy * t + 0.5 * gravity * t * t;
                const verticalVelocity = vy + gravity * t;

                group.x = x + vx * t;
                group.y = currentY;
                // Show umbrella when falling (after peak)
                if (!hasPeaked && verticalVelocity > 250) {
                    umbrella.setVisible(true);
                    hasPeaked = true;
                }

                if (t >= duration / 1000) {
                    group.destroy();
                    this.time.removeEvent(loop);
                }
            },
            loop: true
        });

        this.tweens.add({
            targets: astronaut,
            angle: { from: -10, to: 10 },
            yoyo: true,
            repeat: -1,
            duration: 400,
            ease: 'Sine.easeInOut'
        });
        this.tweens.add({
            targets: umbrella,
            angle: { from: 10, to: -10 },
            yoyo: true,
            repeat: -1,
            duration: 400,
            ease: 'Sine.easeInOut'
        });
    }

    // Public method callable from React to update multiplier externally
    updateMultiplier(multiplier: number) {
        this.currentMultiplier = multiplier;
        if (this.multiplierText) {
            this.multiplierText.setText(`${multiplier.toFixed(2)}x`);
            this.multiplierText.setAlpha(1);

            // Color changes based on multiplier
            if (multiplier >= 5) {
                this.multiplierText.setColor('#FF0000');
            } else if (multiplier >= 3) {
                this.multiplierText.setColor('#FF6600');
            } else if (multiplier >= 2) {
                this.multiplierText.setColor('#FFAA00');
            } else {
                this.multiplierText.setColor('#FFD700');
            }
        }
    }

    update() {
        if (!this.launched) return;
        if (this.crashed) return;
        const elapsed = (this.time.now - this.startTime) / 1000;
        let speed = 0.5 + elapsed * 0.3;
        speed = Math.min(speed, 12);

        this.sky.tilePositionY -= speed;
        this.station.y += speed;

        this.vibrationOffset = Math.min(this.vibrationOffset, 2);

        if (this.launched && this.vibrationOffset > 0) {
            const offsetX = Phaser.Math.Between(-this.vibrationOffset, this.vibrationOffset);
            const offsetY = Phaser.Math.Between(-this.vibrationOffset, this.vibrationOffset);
            this.rocketContainer.x = this.baseX + offsetX;

            this.vibrationOffset -= 0.003;
            this.vibrationOffset = Math.max(this.vibrationOffset, 0);
        }

        if (this.launched && !this.crashed) {
            // Update multiplier (exponential growth based on elapsed time)
            this.currentMultiplier = 1 + Math.pow(elapsed, 1.5) * 0.1;
            this.multiplierText.setText(`${this.currentMultiplier.toFixed(2)}x`);
            this.multiplierText.setAlpha(1);

            // Color changes based on multiplier
            if (this.currentMultiplier >= 5) {
                this.multiplierText.setColor('#FF0000');
            } else if (this.currentMultiplier >= 3) {
                this.multiplierText.setColor('#FF6600');
            } else if (this.currentMultiplier >= 2) {
                this.multiplierText.setColor('#FFAA00');
            }

            // Pulse animation every 0.5x increment
            const prevHalf = Math.floor((this.currentMultiplier - 0.01) * 2);
            const currHalf = Math.floor(this.currentMultiplier * 2);
            if (currHalf > prevHalf) {
                this.tweens.add({
                    targets: this.multiplierText,
                    scale: 1.3,
                    duration: 150,
                    yoyo: true,
                    ease: 'Back.easeOut'
                });
            }

            // Compute progress of red effect (0 to 1)
            const redProgress = Math.min(elapsed / 50, 1); // fully red after 50 seconds

            // Interpolate from white (0xFFFFFF) to red (0xFF0000)
            if (redProgress === 1) {
                this.vibrationOffset += 0.01; // reset vibration offset when fully red
            }
            const r = 255;
            const g = Math.floor(255 * (1 - redProgress));
            const b = Math.floor(255 * (1 - redProgress));
            const tintColor = (r << 16) + (g << 8) + b;

            this.rocket.setTint(tintColor);
        }
    }
}
