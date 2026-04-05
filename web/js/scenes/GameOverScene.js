// GameOverScene - shows first, then optionally skill tree if player has skill points
class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  init(data) {
    this.wave             = data.wave || 1;
    this.kills            = data.kills || 0;
    this.bossKills        = data.bossKills || 0;
    this.damage           = data.damage || 0;
    this.coins            = data.coins || 0;
    this.level            = data.level || 1;
    this.classPointsEarned = data.classPointsEarned || 0;
    this.skillPoints      = data.skillPoints || 0;
  }

  playSFX(key, vol = 0.3) { playSFX(this, key, vol); }

  create() {
    const W = this.scale.width, H = this.scale.height;

    this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.95);

    // Title
    this.add.text(W/2+2, H/2-202, 'GAME OVER', {
      fontSize:'80px', fontFamily:'Helvetica Neue, sans-serif', color:'#800000', fontStyle:'bold'
    }).setOrigin(0.5).setAlpha(0.5);
    const title = this.add.text(W/2, H/2-200, 'GAME OVER', {
      fontSize:'80px', fontFamily:'Helvetica Neue, sans-serif', color:'#ff3333', fontStyle:'bold',
      stroke:'#000000', strokeThickness:4
    }).setOrigin(0.5);
    this.tweens.add({ targets: title, scaleX:1.05, scaleY:1.05, duration:1000, yoyo:true, repeat:-1 });

    // Stats panel
    const g = this.add.graphics();
    g.lineStyle(3, 0xcc4d4d, 1);
    g.fillStyle(0x0d0d1a, 0.9);
    g.fillRoundedRect(W/2-300, H/2-130, 600, 280, 20);
    g.strokeRoundedRect(W/2-300, H/2-130, 600, 280, 20);

    this.add.text(W/2, H/2-100, 'FINAL STATS', {
      fontSize:'32px', fontFamily:'Helvetica Neue, sans-serif', color:'#ffcc33', fontStyle:'bold'
    }).setOrigin(0.5);

    const stats = [
      ['Waves Survived:', this.wave],
      ['Level Reached:', this.level],
      ['Enemies Defeated:', this.kills],
      ['Bosses Killed:', this.bossKills]
    ];
    stats.forEach(([label, val], i) => {
      this.add.text(W/2-200, H/2-55+i*35, label, {
        fontSize:'22px', fontFamily:'Helvetica Neue, sans-serif', color:'#ccccdd'
      });
      this.add.text(W/2+200, H/2-55+i*35, ''+val, {
        fontSize:'22px', fontFamily:'Helvetica Neue, sans-serif', color:'#ffffff', fontStyle:'bold'
      }).setOrigin(1, 0);
    });

    // Class points earned
    const ptsText = this.add.text(W/2, H/2+100, '+'+this.classPointsEarned+' Class Points Earned!', {
      fontSize:'24px', fontFamily:'Helvetica Neue, sans-serif', color:'#ffcc33', fontStyle:'bold'
    }).setOrigin(0.5);
    this.tweens.add({ targets: ptsText, alpha: 0.5, duration: 600, yoyo: true, repeat: -1 });

    // Skill points available — show button to spend them
    if (this.skillPoints > 0) {
      const spText = this.add.text(W/2, H/2+135, this.skillPoints+' Skill Point'+(this.skillPoints>1?'s':'')+' to spend!', {
        fontSize:'20px', fontFamily:'Helvetica Neue, sans-serif', color:'#ffff44', fontStyle:'bold'
      }).setOrigin(0.5);
      this.tweens.add({ targets: spText, alpha: 0.4, duration: 500, yoyo: true, repeat: -1 });

      const { zone: spZone } = createButton(this, W/2, H/2+175, 280, 55, 'SPEND SKILL POINTS', 0x1a3300, 0x88ff44, 'sp');
      spZone.on('pointerdown', () => {
        this.playSFX('buttonclick');
        this.scene.start('SkillTreeScene', {
          fromDeath: true,
          skillPointsOnDeath: this.skillPoints,
          wave: this.wave, kills: this.kills, bossKills: this.bossKills,
          damage: this.damage, coins: this.coins,
          level: this.level, classPointsEarned: this.classPointsEarned
        });
      });

      // Shift bottom buttons down
      const { zone: restartZone } = createButton(this, W/2-110, H/2+245, 190, 50, 'RESTART', 0x4d2200, 0xff8833, 'restart');
      restartZone.on('pointerdown', () => { this.playSFX('buttonclick'); this.scene.start('MenuScene'); });
      const { zone: menuZone } = createButton(this, W/2+110, H/2+245, 190, 50, 'MENU', 0x1a1a4d, 0x6666ff, 'menu');
      menuZone.on('pointerdown', () => { this.playSFX('buttonclick'); this.scene.start('MenuScene'); });
    } else {
      const { zone: restartZone } = createButton(this, W/2-110, H/2+165, 190, 55, 'RESTART', 0x4d2200, 0xff8833, 'restart');
      restartZone.on('pointerdown', () => { this.playSFX('buttonclick'); this.scene.start('MenuScene'); });
      const { zone: menuZone } = createButton(this, W/2+110, H/2+165, 190, 55, 'MENU', 0x1a1a4d, 0x6666ff, 'menu');
      menuZone.on('pointerdown', () => { this.playSFX('buttonclick'); this.scene.start('MenuScene'); });
    }
  }
}
