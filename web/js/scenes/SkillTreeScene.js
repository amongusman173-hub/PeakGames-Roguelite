// SkillTreeScene - direct conversion from Swift SkillTree.createUI()
class SkillTreeScene extends Phaser.Scene {
  constructor() { super('SkillTreeScene'); }

  init(data) {
    this.gameScene = data.gameScene || null;
    this.fromGame = data.fromGame || false;
    this.fromMenu = data.fromMenu || false;
    this.fromDeath = data.fromDeath || false;
    // Store death data for passing to GameOverScene
    this.deathData = data.fromDeath ? {
      wave: data.wave, kills: data.kills, bossKills: data.bossKills,
      damage: data.damage, coins: data.coins, level: data.level,
      classPointsEarned: data.classPointsEarned
    } : null;
    // Skill points passed directly — not read from runState (which may be cleared)
    this._skillPointsOnDeath = data.skillPointsOnDeath || 0;
    this.currentPage = 1;
  }

  playSFX(key, vol = 0.3) { playSFX(this, key, vol); }

  create() {
    this.W = this.scale.width;
    this.H = this.scale.height;

    if (this.fromMenu) {
      this.player = new Player(this);
      this.player.graphics.setVisible(false);
      this.skillTree = new SkillTree();
      // Load saved skill points when accessing from menu
      const savedSkillPoints = loadData('savedSkillPoints', 0);
      if (savedSkillPoints > 0) {
        this.player.skillPoints = savedSkillPoints;
      }
    } else if (this.fromDeath) {
      // After death — use a temp player to spend skill points, then go to game over
      this.player = new Player(this);
      this.player.graphics.setVisible(false);
      this.skillTree = new SkillTree();
      // Use skill points passed directly from GameScene (runState is already cleared)
      this.player.skillPoints = this._skillPointsOnDeath;
    } else {
      this.player = this.gameScene.player;
      this.skillTree = this.gameScene.skillTree;
    }

    this._buildUI();
  }

  _buildUI() {
    this.children.removeAll(true);
    const W = this.W, H = this.H;

    // Background matching Swift - dark blue with animated particles
    this.add.rectangle(W/2, H/2, W, H, 0x050514, 0.98);
    this.add.graphics().setDepth(-1).lineStyle(3, 0x4d80e6, 0.4).strokeRect(0, 0, W, H);

    // Animated background particles matching Swift createUI()
    for (let i = 0; i < 20; i++) {
      const p = this.add.circle(Math.random()*W, Math.random()*H, Phaser.Math.FloatBetween(1,3), 0x4d80ff, Phaser.Math.FloatBetween(0.1,0.3)).setDepth(-1);
      this.tweens.add({
        targets: p,
        x: p.x + Phaser.Math.Between(-20,20),
        y: p.y + Phaser.Math.Between(-20,20),
        duration: Phaser.Math.Between(3000,6000),
        yoyo: true, repeat: -1
      });
    }

    // Title with glow matching Swift
    const maxPage = Math.max(...Object.values(this.skillTree.skills).map(s => s.page));
    const pageNames = ['Basic Stats', 'Advanced Stats', 'Special Abilities', 'Master Skills', 'Legendary Skills'];
    this.add.text(W/2+1, 41, '⚔️ '+pageNames[this.currentPage-1]+' ⚔️', {
      fontSize:'42px', fontFamily:'Helvetica Neue, sans-serif', color:'#3366cc', fontStyle:'bold'
    }).setOrigin(0.5).setAlpha(0.5);
    const title = this.add.text(W/2, 40, '⚔️ '+pageNames[this.currentPage-1]+' ⚔️', {
      fontSize:'42px', fontFamily:'Helvetica Neue, sans-serif', color:'#66ccff', fontStyle:'bold'
    }).setOrigin(0.5);
    this.tweens.add({ targets: title, scaleX:1.05, scaleY:1.05, duration:1500, yoyo:true, repeat:-1 });

    // Skill points display with glow matching Swift
    const ptsBg = this.add.graphics();
    ptsBg.lineStyle(3, 0x80b3ff, 1);
    ptsBg.fillStyle(0x1a1a33, 0.9);
    ptsBg.fillRoundedRect(W/2-125, 568, 250, 45, 10);
    ptsBg.strokeRoundedRect(W/2-125, 568, 250, 45, 10);
    // Glow ring
    const ptGlow = this.add.graphics();
    ptGlow.lineStyle(8, 0x80b3ff, 0.3);
    ptGlow.strokeRoundedRect(W/2-130, 563, 260, 55, 12);
    this.tweens.add({ targets: ptGlow, alpha: 0.1, duration: 1500, yoyo: true, repeat: -1 });
    this.add.text(W/2, 590, 'Skill Points: '+this.player.skillPoints, {
      fontSize:'26px', fontFamily:'Helvetica Neue, sans-serif', color:'#ffff00', fontStyle:'bold'
    }).setOrigin(0.5);

    // Page navigation matching Swift prevBtn/nextBtn
    const prevBtn = this.add.graphics();
    const prevActive = this.currentPage > 1;
    prevBtn.lineStyle(2, 0x66b3ff, 1);
    prevBtn.fillStyle(prevActive ? 0x336699 : 0x1a1a33, prevActive ? 0.8 : 0.5);
    prevBtn.fillRoundedRect(120, 505, 160, 50, 10);
    prevBtn.strokeRoundedRect(120, 505, 160, 50, 10);
    const prevLabel = this.add.text(200, 530, '◀ Previous', {
      fontSize:'18px', fontFamily:'Helvetica Neue, sans-serif',
      color: prevActive ? '#ffffff' : '#666666', fontStyle:'bold'
    }).setOrigin(0.5);
    if (prevActive) {
      const prevZone = this.add.zone(200, 530, 160, 50).setInteractive({ useHandCursor: true });
      prevZone.on('pointerdown', () => { this.playSFX('buttonclick'); this.currentPage--; this._buildUI(); });
    }

    this.add.text(W/2, 530, 'Page '+this.currentPage+'/'+maxPage, {
      fontSize:'20px', fontFamily:'Helvetica Neue, sans-serif', color:'#b3e6ff', fontStyle:'bold'
    }).setOrigin(0.5);

    const nextBtn = this.add.graphics();
    const nextActive = this.currentPage < maxPage;
    nextBtn.lineStyle(2, 0x66b3ff, 1);
    nextBtn.fillStyle(nextActive ? 0x336699 : 0x1a1a33, nextActive ? 0.8 : 0.5);
    nextBtn.fillRoundedRect(W-280, 505, 160, 50, 10);
    nextBtn.strokeRoundedRect(W-280, 505, 160, 50, 10);
    this.add.text(W-200, 530, 'Next ▶', {
      fontSize:'18px', fontFamily:'Helvetica Neue, sans-serif',
      color: nextActive ? '#ffffff' : '#666666', fontStyle:'bold'
    }).setOrigin(0.5);
    if (nextActive) {
      const nextZone = this.add.zone(W-200, 530, 160, 50).setInteractive({ useHandCursor: true });
      nextZone.on('pointerdown', () => { this.playSFX('buttonclick'); this.currentPage++; this._buildUI(); });
    }

    // Draw skills matching Swift circle-based layout
    const pageSkills = Object.entries(this.skillTree.skills).filter(([,s]) => s.page === this.currentPage);

    pageSkills.forEach(([key, skill]) => {
      const pos = skill.pos;
      const canUp = this.skillTree.canUpgrade(key, this.player);
      const isUnlocked = skill.level > 0;
      const isLocked = skill.requires && (!this.skillTree.skills[skill.requires] || this.skillTree.skills[skill.requires].level === 0);

      // Colors matching Swift exactly
      let baseColor, glowColor;
      if (isLocked) {
        baseColor = 0x4d3333; glowColor = 0x804d4d;
      } else if (skill.special) {
        baseColor = isUnlocked ? 0xff9933 : canUp ? 0xe6b24d : 0x664d33;
        glowColor = 0xff9933;
      } else {
        baseColor = canUp ? 0x33e666 : isUnlocked ? 0x6699e6 : 0x4d4d66;
        glowColor = canUp ? 0x33e666 : 0x6699e6;
      }

      // Shadow matching Swift
      const shadow = this.add.circle(pos.x+2, pos.y-2, 44, 0x000000, 0.5);
      const bgCircle = this.add.circle(pos.x, pos.y, 42, 0x0d0d0d, 0.9);

      // Glow for upgradeable - matching Swift outer/inner glow with pulse
      if (canUp) {
        const outerGlow = this.add.circle(pos.x, pos.y, 55, glowColor, 0.3);
        this.tweens.add({ targets: outerGlow, scale: 1.2, alpha: 0.2, duration: 800, yoyo: true, repeat: -1 });
        const innerGlow = this.add.circle(pos.x, pos.y, 50, glowColor, 0.4);
        this.tweens.add({ targets: innerGlow, scale: 1.15, alpha: 0.4, duration: 600, yoyo: true, repeat: -1 });

        // Sparkle particles matching Swift
        for (let i = 0; i < 3; i++) {
          const angle = Math.random() * Math.PI * 2;
          const sparkle = this.add.circle(pos.x + Math.cos(angle)*45, pos.y + Math.sin(angle)*45, 2, 0xffff80, 0.8);
          this.tweens.add({ targets: sparkle, alpha: 0, duration: 1500, yoyo: true, repeat: -1, delay: i*500 });
        }
      }

      // Main circle matching Swift - strokeColor = baseColor, lineWidth 5-6
      const circle = this.add.circle(pos.x, pos.y, 38, 0x141414, 0.95);
      circle.setStrokeStyle(skill.special ? 6 : 5, baseColor, 1);

      // Rotating ring for unlocked special skills matching Swift
      if (skill.special && isUnlocked) {
        const ring = this.add.circle(pos.x, pos.y, 45, 0x000000, 0);
        ring.setStrokeStyle(2, 0xff9933, 0.6);
        this.tweens.add({ targets: ring, angle: 360, duration: 4000, repeat: -1 });
        // 8 particles on ring matching Swift
        for (let i = 0; i < 8; i++) {
          const a = (i * Math.PI * 2) / 8;
          this.add.circle(pos.x + Math.cos(a)*45, pos.y + Math.sin(a)*45, 3, 0xffcc66, 0.7);
        }
      }

      // Skill name with shadow matching Swift
      this.add.text(pos.x+1, pos.y-49, skill.name, {
        fontSize: skill.special ? '16px' : '14px',
        fontFamily:'Helvetica Neue, sans-serif',
        color:'#000000', fontStyle: skill.special ? 'bold' : 'normal'
      }).setOrigin(0.5).setAlpha(0.7);
      this.add.text(pos.x, pos.y-50, skill.name, {
        fontSize: skill.special ? '16px' : '14px',
        fontFamily:'Helvetica Neue, sans-serif',
        color: skill.special ? '#ffe680' : '#ffffff',
        fontStyle: skill.special ? 'bold' : 'normal'
      }).setOrigin(0.5);

      // Level/status matching Swift
      if (skill.special) {
        this.add.text(pos.x, pos.y, isUnlocked ? '✓ UNLOCKED' : 'LOCKED', {
          fontSize:'13px', fontFamily:'Helvetica Neue, sans-serif',
          color: isUnlocked ? '#4dff4d' : '#808080'
        }).setOrigin(0.5);
      } else {
        this.add.text(pos.x, pos.y, skill.level+'/'+skill.maxLevel, {
          fontSize:'22px', fontFamily:'Helvetica Neue, sans-serif',
          color: isUnlocked ? '#ffff00' : '#ffffff', fontStyle:'bold'
        }).setOrigin(0.5);
      }

      // Cost/lock label matching Swift
      if (skill.level < skill.maxLevel) {
        if (isLocked) {
          this.add.text(pos.x, pos.y+35, '🔒 Req: '+skill.requires, {
            fontSize:'11px', color:'#ff8080', fontFamily:'Helvetica Neue, sans-serif'
          }).setOrigin(0.5);
        } else {
          const cost = this.skillTree.getCost(key);
          this.add.text(pos.x, pos.y+35, 'Cost: '+cost, {
            fontSize:'11px', fontFamily:'Helvetica Neue, sans-serif',
            color: this.player.skillPoints >= cost ? '#4dff4d' : '#ff4d4d'
          }).setOrigin(0.5);
        }
      }

      // Description
      this.add.text(pos.x, pos.y+50, skill.desc, {
        fontSize:'11px', color:'#b3b3cc', fontFamily:'Helvetica Neue, sans-serif'
      }).setOrigin(0.5);

      // Click zone
      if (!isLocked && skill.level < skill.maxLevel) {
        const zone = this.add.zone(pos.x, pos.y, 80, 80).setInteractive({ useHandCursor: true });
        zone.on('pointerdown', () => {
          if (this.skillTree.upgrade(key, this.player)) {
            this.playSFX('skillupgrade', 0.5);
            this._upgradeVFX(pos.x, pos.y, skill.special);
            // Save skill points immediately after spending them
            saveData('savedSkillPoints', this.player.skillPoints);
            if (this.gameScene) this.gameScene.saveRunState();
            this._buildUI();
          }
        });
      }
    });

    // Instructions matching Swift
    const instBg = this.add.graphics();
    instBg.fillStyle(0x0d0d1a, 0.8);
    instBg.lineStyle(2, 0x4d80cc, 0.5);
    instBg.fillRoundedRect(50, H-90, W-100, 70, 10);
    instBg.strokeRoundedRect(50, H-90, W-100, 70, 10);
    this.add.text(W/2, H-65, 'Click on skills to upgrade  •  Use arrows to navigate pages', {
      fontSize:'16px', color:'#ccccdd', fontFamily:'Helvetica Neue, sans-serif'
    }).setOrigin(0.5);

    // Refund button matching Swift
    const hasSkills = Object.values(this.skillTree.skills).some(s => s.page === this.currentPage && s.level > 0);
    const refundBg = this.add.graphics();
    refundBg.lineStyle(2, hasSkills ? 0xff6666 : 0x808080, 1);
    refundBg.fillStyle(hasSkills ? 0x4d1a1a : 0x333333, hasSkills ? 0.8 : 0.5);
    refundBg.fillRoundedRect(30, H-45, 180, 50, 12);
    refundBg.strokeRoundedRect(30, H-45, 180, 50, 12);
    this.add.text(120, H-20, '🔄 REFUND ALL', {
      fontSize:'18px', fontFamily:'Helvetica Neue, sans-serif',
      color: hasSkills ? '#ffffff' : '#999999', fontStyle:'bold'
    }).setOrigin(0.5);
    if (hasSkills) {
      const refundZone = this.add.zone(120, H-20, 180, 50).setInteractive({ useHandCursor: true });
      refundZone.on('pointerdown', () => {
        this.playSFX('buttonclick');
        this.skillTree.refundPage(this.currentPage, this.player);
        // Save skill points immediately after refunding
        saveData('savedSkillPoints', this.player.skillPoints);
        if (this.gameScene) this.gameScene.saveRunState();
        this._buildUI();
      });
    }

    // Done/Back button
    const doneLabel = this.fromMenu ? '← Back' : (this.fromDeath ? '✓ Done → Game Over' : '✓ Continue');
    const { zone: doneZone } = createButton(this, W-100, H-20, 200, 50, doneLabel, 0x1a4d22, 0x44ff44, 'done');
    doneZone.on('pointerdown', () => {
      this.playSFX('buttonclick');
      // Always save skill points when exiting skill tree
      saveData('savedSkillPoints', this.player.skillPoints);
      if (this.fromMenu) {
        this.scene.start('MenuScene');
      } else if (this.fromDeath) {
        this.scene.start('GameOverScene', {
          ...this.deathData,
          skillPoints: this.player.skillPoints // Update with remaining skill points
        });
      } else {
        if (this.gameScene) {
          this.gameScene.saveRunState();
          const gs = this.gameScene;
          this.scene.stop();
          this.scene.resume('GameScene');
          // Use delayedCall to let the scene fully resume before opening shop
          gs.time.delayedCall(50, () => gs._openShop());
        }
      }
    });

    // "Click anywhere to continue" hint when no skill points
    if (this.player.skillPoints === 0 && !this.fromMenu) {
      const hint = this.add.text(W/2, H-55, '✓ Click anywhere to continue', {
        fontSize:'20px', fontFamily:'Helvetica Neue, sans-serif', color:'#4dff4d', fontStyle:'bold'
      }).setOrigin(0.5);
      this.tweens.add({ targets: hint, alpha: 0.5, duration: 700, yoyo: true, repeat: -1 });
      // Make the whole screen clickable to proceed
      const anyZone = this.add.zone(W/2, H/2, W, H).setInteractive().setDepth(1);
      anyZone.on('pointerdown', () => {
        this.playSFX('buttonclick');
        // Always save skill points when exiting skill tree
        saveData('savedSkillPoints', this.player.skillPoints);
        if (this.fromDeath) {
          this.scene.start('GameOverScene', {
            ...this.deathData,
            skillPoints: this.player.skillPoints // Update with remaining skill points
          });
        } else if (!this.fromMenu && this.gameScene) {
          const gs = this.gameScene;
          gs.saveRunState();
          this.scene.stop();
          this.scene.resume('GameScene');
          gs.time.delayedCall(50, () => gs._openShop());
        }
      });
    }
  }

  // Skill upgrade VFX matching Swift createUpgradeEffect()
  _upgradeVFX(x, y, isSpecial) {
    const count = isSpecial ? 30 : 20;
    const color = isSpecial ? 0xffaa33 : 0x33e666;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const dist = Phaser.Math.Between(50, 120);
      const sz = Phaser.Math.FloatBetween(2, 4);
      const p = this.add.circle(x, y, sz, color, 1).setDepth(100);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(a)*dist, y: y + Math.sin(a)*dist,
        scale: 0, alpha: 0,
        duration: Phaser.Math.Between(500, 1000),
        ease: 'Power2', onComplete: () => p.destroy()
      });
    }
    // Expanding ring matching Swift
    const ring = this.add.circle(x, y, 40, 0x000000, 0).setDepth(99);
    ring.setStrokeStyle(4, isSpecial ? 0xffb34d : 0x4dcc80, 0.8);
    this.tweens.add({ targets: ring, scale: 2.5, alpha: 0, duration: 600, onComplete: () => ring.destroy() });
    // Flash matching Swift
    const flash = this.add.circle(x, y, 45, isSpecial ? 0xffcc66 : 0x66ff99, 0.6).setDepth(98);
    this.tweens.add({ targets: flash, scale: 1.5, alpha: 0, duration: 150, onComplete: () => flash.destroy() });
  }
}
