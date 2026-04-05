// BootScene — loads ALL audio once, then starts MenuScene
// The loading screen itself acts as the first user interaction point
class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    const W = this.scale.width, H = this.scale.height;

    this.add.rectangle(W/2, H/2, W, H, 0x050810);
    this.add.text(W/2, H/2 - 20, 'ROGUELITE ARENA', {
      fontSize:'28px', fontFamily:'Helvetica Neue, sans-serif',
      color:'#66ccff', fontStyle:'bold'
    }).setOrigin(0.5);
    this.add.text(W/2, H/2 + 20, 'Loading...', {
      fontSize:'18px', fontFamily:'Helvetica Neue, sans-serif', color:'#8899bb'
    }).setOrigin(0.5);

    // Progress bar
    const barBg = this.add.graphics();
    barBg.fillStyle(0x222233, 1);
    barBg.fillRoundedRect(W/2 - 200, H/2 + 60, 400, 16, 8);
    const bar = this.add.graphics();

    this.load.on('progress', (value) => {
      bar.clear();
      bar.fillStyle(0x4488ff, 1);
      bar.fillRoundedRect(W/2 - 200, H/2 + 60, 400 * value, 16, 8);
    });

    // Load ALL audio files
    const sounds = [
      ['shoot',           'sounds/shoot.mp3'],
      ['enemydie',        'sounds/enemydie.wav'],
      ['enemytakedamage', 'sounds/enemytakedamage.wav'],
      ['playerdamage',    'sounds/playerdamage.mp3'],
      ['coin',            'sounds/coin.mp3'],
      ['level',           'sounds/level.mp3'],
      ['skillupgrade',    'sounds/skillupgrade.mp3'],
      ['shopbuy',         'sounds/shopbuy.mp3'],
      ['buttonclick',     'sounds/buttonclick.mp3'],
      ['bossspawn',       'sounds/bossspawn.mp3'],
      ['start',           'sounds/start.mp3'],
      ['over',            'sounds/over.mp3'],
      ['maintheme',       'sounds/maintheme.mp3'],
      ['shopmusic',       'sounds/shopmusic.mp3'],
      ['bgm1',            'sounds/backroundmusicvariant1.mp3'],
      ['bgm2',            'sounds/backroundmusicvariant2.mp3'],
      ['bgm3',            'sounds/backroundmusicvariant3.mp3'],
      ['bgm4',            'sounds/backroundmusicvariant4.mp3'],
    ];
    sounds.forEach(([key, path]) => this.load.audio(key, path));
    this.load.on('loaderror', f => console.warn('[Boot] Audio missing:', f.key, f.url));
  }

  create() {
    const W = this.scale.width, H = this.scale.height;

    // Show "Click to Start" — this click unlocks the AudioContext
    this.add.text(W/2, H/2 + 100, 'Click anywhere to start', {
      fontSize:'20px', fontFamily:'Helvetica Neue, sans-serif', color:'#66ccff'
    }).setOrigin(0.5);

    // Pulse the text
    const pulse = this.add.text(W/2, H/2 + 100, 'Click anywhere to start', {
      fontSize:'20px', fontFamily:'Helvetica Neue, sans-serif', color:'#66ccff'
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: pulse, alpha: 1, duration: 600, yoyo: true, repeat: -1 });

    // Wait for click — this IS the user gesture that unlocks AudioContext
    this.input.once('pointerdown', () => {
      // Resume AudioContext explicitly
      try {
        if (this.sound.context && this.sound.context.state === 'suspended') {
          this.sound.context.resume();
        }
      } catch(e) {}
      // Mark as unlocked in our helper
      _audioUnlocked = true;
      // Play any pending music
      if (_pendingMusic) {
        var p = _pendingMusic;
        _pendingMusic = null;
        _playMusicNow(p.scene, p.key);
      }
      this.scene.start('MenuScene');
    });
  }
}
