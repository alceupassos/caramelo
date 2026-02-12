export class PremiumParticles {
  static createGoldExplosion(scene: Phaser.Scene, x: number, y: number) {
    // Create gold coin burst effect using the existing flares texture
    const particles = scene.add.particles(x, y, 'flares', {
      frame: 0,
      lifespan: 2000,
      speed: { min: 100, max: 400 },
      scale: { start: 0.4, end: 0 },
      gravityY: 200,
      quantity: 30,
      emitting: false,
      tint: [0xFFD700, 0xFFA500, 0xFFFF00, 0xDAA520],
      blendMode: Phaser.BlendModes.ADD,
      rotate: { min: 0, max: 360 },
    });
    particles.explode(30);
    scene.time.delayedCall(2500, () => particles.destroy());
    return particles;
  }

  static createWinSparkles(scene: Phaser.Scene, x: number, y: number, duration: number = 3000) {
    const particles = scene.add.particles(x, y, 'flares', {
      frame: 0,
      lifespan: 1000,
      speed: { min: 20, max: 80 },
      scale: { start: 0.3, end: 0 },
      quantity: 2,
      frequency: 100,
      tint: [0xFFD700, 0xFFFFFF, 0x00FF88],
      blendMode: Phaser.BlendModes.ADD,
      alpha: { start: 1, end: 0 },
    });
    scene.time.delayedCall(duration, () => particles.destroy());
    return particles;
  }

  static createEnhancedRocketTrail(scene: Phaser.Scene, x: number, y: number) {
    return scene.add.particles(x, y, 'flares', {
      frame: 0,
      lifespan: 1500,
      speed: { min: 200, max: 350 },
      scale: { start: 0.6, end: 0 },
      quantity: 3,
      frequency: 30,
      angle: { min: 85, max: 95 },
      tint: [0x0066FF, 0x00AAFF, 0xFFAA00, 0xFF4400, 0xFF0000],
      blendMode: Phaser.BlendModes.ADD,
      alpha: { start: 1, end: 0 },
      gravityY: 50,
    });
  }

  static createScreenFlash(scene: Phaser.Scene, color: number = 0xFFFFFF, duration: number = 200) {
    const flash = scene.add.rectangle(
      scene.scale.width / 2,
      scene.scale.height / 2,
      scene.scale.width,
      scene.scale.height,
      color,
      0.8
    ).setDepth(1000);

    scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: duration,
      onComplete: () => flash.destroy()
    });
  }
}
