// Audio Manager - Simple direct playback like Swift SKAction.playSoundFileNamed
class AudioManager {
  constructor(scene) {
    this.scene = scene;
    this.music = null;
    this.masterVolume = 1.0;
    this.musicVolume = 1.0;
    this.sfxVolume = 0.3; // Default SFX volume like Swift
  }

  // Play sound effect directly (like Swift's SKAction.playSoundFileNamed)
  playSFX(soundFile, volume = 0.3) {
    if (!this.scene || !this.scene.sound) return;
    
    try {
      const adjustedVolume = this.masterVolume * this.sfxVolume * volume;
      this.scene.sound.play(soundFile, { volume: adjustedVolume });
    } catch (e) {
      // Silently fail if sound doesn't exist
    }
  }

  // Play music with looping
  playMusic(soundFile, loop = true) {
    this.stopMusic();
    
    if (!this.scene || !this.scene.sound) return;
    
    try {
      const adjustedVolume = this.masterVolume * this.musicVolume;
      this.music = this.scene.sound.add(soundFile, { 
        loop, 
        volume: adjustedVolume 
      });
      this.music.play();
    } catch (e) {
      // Silently fail if music doesn't exist
    }
  }

  playRandomGameplayMusic() {
    const variant = Phaser.Math.Between(1, 4);
    this.playMusic(`sounds/backroundmusicvariant${variant}.mp3`);
  }

  stopMusic() {
    if (this.music) {
      try {
        this.music.stop();
        this.music.destroy();
      } catch (e) {
        // Ignore errors
      }
      this.music = null;
    }
  }

  setMasterVolume(vol) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.music) {
      this.music.setVolume(this.masterVolume * this.musicVolume);
    }
  }

  setMusicVolume(vol) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.music) {
      this.music.setVolume(this.masterVolume * this.musicVolume);
    }
  }

  setSFXVolume(vol) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
  }
}
