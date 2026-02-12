export class AudioManager {
  private scene: Phaser.Scene;
  private music: Phaser.Sound.BaseSound | null = null;
  private sfxMap: Map<string, Phaser.Sound.BaseSound> = new Map();
  private musicVolume: number = 0.3;
  private sfxVolume: number = 0.7;
  private muted: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  preload() {
    // Only preload if assets exist - use try/catch pattern
    const audioAssets = [
      { key: 'bgMusic', path: '/assets/audio/music/casino-ambient.mp3' },
      { key: 'sfx_launch', path: '/assets/audio/sfx/launch.mp3' },
      { key: 'sfx_crash', path: '/assets/audio/sfx/explosion.mp3' },
      { key: 'sfx_win', path: '/assets/audio/sfx/win-chime.mp3' },
      { key: 'sfx_escape', path: '/assets/audio/sfx/escape.mp3' },
      { key: 'sfx_tick', path: '/assets/audio/sfx/tick.mp3' },
    ];

    audioAssets.forEach(({ key, path }) => {
      this.scene.load.audio(key, path);
    });
  }

  playMusic(key: string = 'bgMusic') {
    if (this.muted) return;
    try {
      if (this.music) this.music.stop();
      this.music = this.scene.sound.add(key, { loop: true, volume: this.musicVolume });
      this.music.play();
    } catch (e) {
      console.warn('Audio not available:', key);
    }
  }

  playSFX(key: string) {
    if (this.muted) return;
    try {
      const sfx = this.scene.sound.add(key, { volume: this.sfxVolume });
      sfx.play();
    } catch (e) {
      console.warn('SFX not available:', key);
    }
  }

  setMusicVolume(vol: number) { this.musicVolume = vol; if (this.music) (this.music as any).volume = vol; }
  setSFXVolume(vol: number) { this.sfxVolume = vol; }
  toggleMute() { this.muted = !this.muted; if (this.muted && this.music) this.music.stop(); return this.muted; }
  stopMusic() { if (this.music) { this.music.stop(); this.music = null; } }
  destroy() { this.stopMusic(); this.sfxMap.clear(); }
}
