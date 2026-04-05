class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }
  init(data) {
    this.selectedClass = data.selectedClass || loadData('selectedClass','classless');
    this.resumeData = data.resume || null;
  }

  // Audio uses global helpers from audioHelper.js

  create() {
    this.W = this.scale.width; this.H = this.scale.height;
    this.wave = 1; this.gameOver = false; this.paused = false;
    this.waveActive = false; this.spawnQueue = []; this.spawnTimer = 0;
    this.spawnInterval = 1.2; this.runDamage = 0; this.runKills = 0; this.runBossKills = 0;
    this.currentBiome = 0;
    this._classPointsEarned = 0; // Initialize class points counter

    this.skillTree = new SkillTree();
    this.shop = new Shop();
    this.achievements = new AchievementManager();
    this.player = new Player(this);
    this.player.applyClass(this.selectedClass);
    this.skillTree.applyAllToPlayer(this.player);

    if (this.resumeData) this._restoreRunState(this.resumeData);
    else {
      this.achievements.increment('runs');
      // Load saved skill points from previous runs
      const savedSkillPoints = loadData('savedSkillPoints', 0);
      if (savedSkillPoints > 0) {
        this.player.skillPoints = savedSkillPoints;
      }
    }

    this.enemies = []; this.projectiles = []; this.enemyProjectiles = []; this.coins = [];
    this.chests = []; // Initialize chests array

    // Graphics layers
    this.enemyGraphics = this.add.graphics().setDepth(10);
    this.projGraphics  = this.add.graphics().setDepth(20);
    this.coinGraphics  = this.add.graphics().setDepth(15);
    this.uiGraphics    = this.add.graphics().setDepth(100);

    // Background - biome based
    createGameBackground(this, this.currentBiome);

    // Input
    this.keys = this.input.keyboard.addKeys({
      W:Phaser.Input.Keyboard.KeyCodes.W, A:Phaser.Input.Keyboard.KeyCodes.A,
      S:Phaser.Input.Keyboard.KeyCodes.S, D:Phaser.Input.Keyboard.KeyCodes.D,
      UP:Phaser.Input.Keyboard.KeyCodes.UP, DOWN:Phaser.Input.Keyboard.KeyCodes.DOWN,
      LEFT:Phaser.Input.Keyboard.KeyCodes.LEFT, RIGHT:Phaser.Input.Keyboard.KeyCodes.RIGHT,
      SPACE:Phaser.Input.Keyboard.KeyCodes.SPACE, ESC:Phaser.Input.Keyboard.KeyCodes.ESC
    });
    this.mouseX = this.W/2; this.mouseY = this.H/2;
    this.mouseDown = false; this.rightMouseDown = false;
    this.input.on('pointermove', p => { this.mouseX=p.x; this.mouseY=p.y; });
    this.input.on('pointerdown', p => { if(p.rightButtonDown()) this.rightMouseDown=true; else this.mouseDown=true; });
    this.input.on('pointerup', p => {
      if(p.rightButtonReleased()) {
        if(this.player.chargedShotLevel>0) { const pr=this.player.releaseCharge(this.mouseX,this.mouseY); if(pr) this._addProjectiles(pr); }
        this.rightMouseDown=false;
      } else this.mouseDown=false;
    });
    this.input.mouse.disableContextMenu();
    this.keys.SPACE.on('down', () => { if(!this.gameOver&&!this.paused) this.player.dash(this._getKeys()); });
    this.keys.ESC.on('down', () => this._togglePause());

    this._createHUD();
    playRandomGameplayMusic(this);
    this._buildMapObstacles();
    this._startWave();
  }

  // ── Save/Restore ──────────────────────────────────────────────────────────
  saveRunState() {
    const p = this.player;
    // Save skill points separately so they persist between runs
    saveData('savedSkillPoints', p.skillPoints);
    
    // Save chest data
    const chestData = this.chests ? this.chests.map(c => ({
      x: c.x, y: c.y, collected: c.collected
    })) : [];
    
    saveData('runState', {
      wave:this.wave, runKills:this.runKills, runBossKills:this.runBossKills,
      runDamage:this.runDamage, selectedClass:this.selectedClass, currentBiome:this.currentBiome,
      classPointsEarned:this._classPointsEarned||0,
      chests: chestData,
      player:{
        hp:p.hp, maxHP:p.maxHP, damage:p.damage, moveSpeed:p.moveSpeed,
        attackSpeed:p.attackSpeed, projectileSpeed:p.projectileSpeed, bulletSize:p.bulletSize,
        critChance:p.critChance, critDamage:p.critDamage, armor:p.armor, lifesteal:p.lifesteal,
        dodgeChance:p.dodgeChance, piercing:p.piercing, multishot:p.multishot,
        bounceLevel:p.bounceLevel, xpBoost:p.xpBoost, coinBoost:p.coinBoost,
        healingOnKill:p.healingOnKill, regenerationRate:p.regenerationRate,
        chargedShotLevel:p.chargedShotLevel, dashLevel:p.dashLevel,
        tempDamageBoost:p.tempDamageBoost, tempFireRateBoost:p.tempFireRateBoost,
        burstShotLevel:p.burstShotLevel, xp:p.xp, level:p.level,
        skillPoints:p.skillPoints, coins:p.coins
      }
    });
  }
  _restoreRunState(d) {
    this.wave = d.wave||1; this.runKills=d.runKills||0;
    this.runBossKills=d.runBossKills||0; this.runDamage=d.runDamage||0;
    this.currentBiome=d.currentBiome||0;
    this._classPointsEarned=d.classPointsEarned||0;
    if(d.player) Object.assign(this.player, d.player);
    
    // Restore chests
    if (d.chests && Array.isArray(d.chests)) {
      this.chests = [];
      d.chests.forEach(chestData => {
        if (!chestData.collected) {
          this._spawnChest(chestData.x, chestData.y);
        }
      });
    }
  }
  clearRunState() { localStorage.removeItem('runState'); }

  // ── Input ─────────────────────────────────────────────────────────────────
  _getKeys() {
    return { W:this.keys.W.isDown, A:this.keys.A.isDown, S:this.keys.S.isDown, D:this.keys.D.isDown,
             UP:this.keys.UP.isDown, DOWN:this.keys.DOWN.isDown, LEFT:this.keys.LEFT.isDown, RIGHT:this.keys.RIGHT.isDown };
  }

  // ── HUD - matching Swift setupUI() exactly ───────────────────────────────
  _createHUD() {
    const ts = { fontFamily:'Helvetica Neue, sans-serif', stroke:'#000000', strokeThickness:3 };
    this.hpBarGraphics = this.add.graphics().setDepth(105);
    this.xpBarGraphics = this.add.graphics().setDepth(105);
    // HP label - white bold 18px (matching Swift hpLabel)
    this.hpText    = this.add.text(10, 10, '', {...ts, fontSize:'18px', color:'#ffffff', fontStyle:'bold'}).setDepth(110);
    // Level label - yellow bold 20px (matching Swift levelLabel)
    this.levelText = this.add.text(10, 32, '', {...ts, fontSize:'20px', color:'#ffdd00', fontStyle:'bold'}).setDepth(110);
    // XP label - light blue 16px (matching Swift xpLabel)
    this.xpText    = this.add.text(10, 56, '', {...ts, fontSize:'16px', color:'#66ccff'}).setDepth(110);
    // Wave - top center white bold 28px (matching Swift waveLabel)
    this.waveText  = this.add.text(this.W/2, 10, '', {...ts, fontSize:'28px', color:'#ffffff', fontStyle:'bold'}).setOrigin(0.5,0).setDepth(110);
    // Right side (matching Swift coinLabel, damageLabel, classLabel)
    this.coinText  = this.add.text(this.W-10, 10, '', {...ts, fontSize:'20px', color:'#ffcc00', fontStyle:'bold'}).setOrigin(1,0).setDepth(110);
    this.dmgText   = this.add.text(this.W-10, 34, '', {...ts, fontSize:'16px', color:'#ffb347'}).setOrigin(1,0).setDepth(110);
    this.classText = this.add.text(this.W-10, 54, '', {...ts, fontSize:'18px', color:'#66ccff', fontStyle:'bold'}).setOrigin(1,0).setDepth(110);
    this.killText  = this.add.text(this.W-10, 76, '', {...ts, fontSize:'14px', color:'#aaaaaa'}).setOrigin(1,0).setDepth(110);
    // Pause overlay
    this.pauseOverlay = this.add.rectangle(this.W/2, this.H/2, this.W, this.H, 0x000000, 0.85).setDepth(190).setVisible(false);
    this._buildPauseMenu();
  }

  _buildPauseMenu() {
    if (this._pauseContainer) this._pauseContainer.destroy();
    this._pauseContainer = this.add.container(0, 0).setDepth(200).setVisible(false);
    this._pauseZones = [];

    const W = this.W, H = this.H;
    const panel = this.add.graphics();
    panel.lineStyle(4, 0x4d80e6, 1);
    panel.fillStyle(0x0a0a1e, 0.97);
    panel.fillRoundedRect(W/2-200, H/2-200, 400, 420, 20);
    panel.strokeRoundedRect(W/2-200, H/2-200, 400, 420, 20);
    this._pauseContainer.add(panel);

    this._pauseContainer.add(this.add.text(W/2, H/2-165, '⏸ PAUSED', {
      fontSize:'40px', fontFamily:'Helvetica Neue, sans-serif', color:'#66ccff', fontStyle:'bold',
      stroke:'#000000', strokeThickness:4
    }).setOrigin(0.5));
    this._pauseContainer.add(this.add.text(W/2, H/2-128, '[ESC to resume]', {
      fontSize:'16px', fontFamily:'Helvetica Neue, sans-serif', color:'#8899bb'
    }).setOrigin(0.5));

    const addBtn = (y, label, fill, stroke, cb) => {
      const bx = W/2, bw = 320, bh = 55;
      const bg = this.add.graphics();
      bg.lineStyle(2, stroke, 1);
      bg.fillStyle(fill, 0.85);
      bg.fillRoundedRect(bx-bw/2, y-bh/2, bw, bh, 10);
      bg.strokeRoundedRect(bx-bw/2, y-bh/2, bw, bh, 10);
      const lbl = this.add.text(bx, y, label, {
        fontSize:'22px', fontFamily:'Helvetica Neue, sans-serif', color:'#ffffff', fontStyle:'bold'
      }).setOrigin(0.5);
      const zone = this.add.zone(bx, y, bw, bh).setInteractive({ useHandCursor: true }).setDepth(210);
      zone.setActive(false).setVisible(false);
      zone.on('pointerover', () => { bg.clear(); bg.lineStyle(2,stroke,1); bg.fillStyle(fill,1); bg.fillRoundedRect(bx-bw/2,y-bh/2,bw,bh,10); bg.strokeRoundedRect(bx-bw/2,y-bh/2,bw,bh,10); });
      zone.on('pointerout',  () => { bg.clear(); bg.lineStyle(2,stroke,1); bg.fillStyle(fill,0.85); bg.fillRoundedRect(bx-bw/2,y-bh/2,bw,bh,10); bg.strokeRoundedRect(bx-bw/2,y-bh/2,bw,bh,10); });
      zone.on('pointerdown', cb);
      this._pauseContainer.add([bg, lbl]);
      this._pauseZones.push(zone);
    };

    addBtn(H/2-70,  '▶  RESUME',         0x1a4d22, 0x33ff66, () => this._togglePause());
    addBtn(H/2,     'ENEMY ALMANAC',      0x331a4d, 0xb366e6, () => { this._togglePause(); this.scene.start('AlmanacScene'); });
    addBtn(H/2+70,  'STATS',              0x1a3333, 0x66cccc, () => { this._togglePause(); this.scene.start('StatsScene'); });
    addBtn(H/2+140, 'QUIT TO MENU',       0x4d1a1a, 0xff4444, () => {
      this.saveRunState();
      stopMusic();
      this.scene.start('MenuScene');
    });
  }

  _updateHUD() {
    const p = this.player;
    const hpRatio = Math.max(0, p.hp / p.maxHP);
    const xpRatio = Math.max(0, p.xp / (p.level * 100));
    const barX = 10, barW = 220;

    // HP bar - matching Swift: rounded rect, color-coded, white border
    const g = this.hpBarGraphics; g.clear();
    g.fillStyle(0x333333, 0.9); g.fillRoundedRect(barX-2, 76, barW+4, 24, 4);
    const hpCol = hpRatio > 0.5 ? 0x33cc33 : hpRatio > 0.25 ? 0xe6b200 : 0xe63333;
    g.fillStyle(hpCol, 1); g.fillRoundedRect(barX, 78, barW * hpRatio, 20, 3);
    g.lineStyle(2, 0xffffff, 0.4); g.strokeRoundedRect(barX-2, 76, barW+4, 24, 4);

    // XP bar - matching Swift: blue, below HP bar
    const xg = this.xpBarGraphics; xg.clear();
    xg.fillStyle(0x222222, 0.9); xg.fillRoundedRect(barX-2, 102, barW+4, 14, 3);
    xg.fillStyle(0x3399ff, 1); xg.fillRoundedRect(barX, 104, barW * xpRatio, 10, 2);
    xg.lineStyle(1, 0xffffff, 0.3); xg.strokeRoundedRect(barX-2, 102, barW+4, 14, 3);

    this.hpText.setText('HP: '+Math.ceil(p.hp)+' / '+p.maxHP);
    this.levelText.setText('Level: '+p.level+'   SP: '+p.skillPoints);
    this.xpText.setText('XP: '+p.xp+' / '+(p.level*100));
    this.waveText.setText('Wave: '+this.wave);
    this.coinText.setText('Coins: '+p.coins);
    this.dmgText.setText('DMG: '+Math.floor(p.damage+p.tempDamageBoost));
    const cls = PLAYER_CLASSES[this.selectedClass];
    this.classText.setText(cls ? cls.name : '');
    this.killText.setText('Kills: '+this.runKills);
  }

  // ── Wave management ───────────────────────────────────────────────────────
  _startWave() {
    try {
      this.waveActive = true;
      this.spawnQueue = this._buildSpawnQueue(this.wave);
      this.spawnTimer = 0;
      floatingText(this, this.W/2, this.H/2-60, 'Wave ' + this.wave, '#ffdd44', '36px');
      if (this.wave % 10 === 0) {
        floatingText(this, this.W/2, this.H/2-20, '⚠️ BOSS WAVE!', '#ff4444', '28px');
        playSFX(this, 'bossspawn', 0.5);
      } else if (this.wave % 5 === 0) {
        floatingText(this, this.W/2, this.H/2-20, '⚡ MINIBOSS WAVE!', '#ff8800', '24px');
        playSFX(this, 'bossspawn', 0.4);
      }
      // Only flash screen when map changes (every 10 waves starting from wave 11)
      if (this.wave % 10 === 1 && this.wave > 1) {
        const flash = this.add.rectangle(this.W/2, this.H/2, this.W, this.H, 0xffffff, 0.2).setDepth(150);
        this.tweens.add({ targets: flash, alpha: 0, duration: 300, onComplete: () => flash.destroy() });
      }
      this.saveRunState();
    } catch (error) {
      console.error('Error in _startWave:', error);
      // Fallback: create minimal wave setup
      try {
        this.waveActive = true;
        this.spawnQueue = [{ type: 'normal' }]; // Minimal spawn queue
        this.spawnTimer = 0;
      } catch (fallbackError) {
        console.error('Critical error in _startWave fallback:', fallbackError);
        this.scene.start('MenuScene');
      }
    }
  }

  _buildSpawnQueue(wave) {
    const queue = [];

    // Full boss every 10 waves
    if (wave % 10 === 0) {
      // Randomly select boss variant, with higher chance for twins on later waves
      const variant = BOSS_VARIANTS[Math.floor(Math.random() * BOSS_VARIANTS.length)];
      queue.push({ type:'boss', bossVariant: variant });
      if (wave >= 20) {
        const variant2 = BOSS_VARIANTS[Math.floor(Math.random() * BOSS_VARIANTS.length)];
        queue.push({ type:'boss', bossVariant: variant2 }); // double boss at wave 20+
      }
    }
    // Miniboss every 5 waves (but not on boss waves)
    else if (wave % 5 === 0) {
      // Miniboss = a boss with reduced HP (handled via a 'miniboss' flag)
      const variant = BOSS_VARIANTS[Math.floor(Math.random() * BOSS_VARIANTS.length)];
      queue.push({ type:'boss', miniboss: true, bossVariant: variant });
    }

    // Regular enemies
    const count = 2 + wave;
    const pool = this._getEnemyPool(wave);
    for (let i = 0; i < count; i++) {
      const type = pool[Math.floor(Math.random() * pool.length)];
      if (type === 'swarm') {
        for (let j = 0; j < Phaser.Math.Between(3,6); j++) queue.push({ type:'swarm' });
      } else {
        queue.push({ type });
      }
    }
    Phaser.Utils.Array.Shuffle(queue);
    return queue;
  }

  _getEnemyPool(wave) {
    const pool = ['normal'];
    if (wave >= 2) pool.push('runner');
    if (wave >= 3) pool.push('tank','tiny','giant','speedy');
    if (wave >= 4) pool.push('explosive');
    if (wave >= 5) pool.push('gold','healer','splitter');
    if (wave >= 6) pool.push('charger','sniper','swarm');
    if (wave >= 7) pool.push('teleporter','shield');
    if (wave >= 8) pool.push('necromancer','mimic','berserker');
    if (wave >= 9) pool.push('freezer','slime');
    return pool;
  }

  _addProjectiles(projs) {
    for (const p of projs) {
      this.projectiles.push({
        x:p.x, y:p.y,
        vx:Math.cos(p.angle)*p.speed, vy:Math.sin(p.angle)*p.speed,
        damage:p.damage, isCrit:p.isCrit, piercing:p.piercing||0,
        bounces:p.bounces||0, size:(p.size||1)*5,
        charged:p.charged||false, piercedEnemies:new Set(), life:5.0,
        angle:p.angle
      });
    }
  }

  // ── Main update loop ──────────────────────────────────────────────────────
  update(time, delta) {
    try {
      if (this.gameOver || this.paused) return;
      const dt = delta/1000;
      const now = time/1000;

      this.player.update(delta, this._getKeys(), this.mouseX, this.mouseY, this.rightMouseDown ? 'right' : null);
      this._checkObstacles(dt);

    // Shooting - muzzle flash + sound matching Swift
    if (this.mouseDown && !this.rightMouseDown) {
      const projs = this.player.shoot(this.mouseX, this.mouseY);
      if (projs) {
        this._addProjectiles(projs);
        playSFX(this, 'shoot', 0.3);
        const isCrit = projs.some(p => p.isCrit);
        const angle = Math.atan2(this.mouseY - this.player.y, this.mouseX - this.player.x);
        this._muzzleFlash(this.player.x, this.player.y, angle, isCrit);
      }
    }

    // Spawn enemies
    if (this.waveActive && this.spawnQueue.length > 0) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        const def = this.spawnQueue.shift();
        
        // Special handling for twins boss variant - spawn two bosses
        if (def.type === 'boss' && (def.bossVariant === 'twins' || (!def.bossVariant && Math.random() < 0.125))) {
          // If no variant specified, 1/8 chance for twins
          const variant = def.bossVariant || 'twins';
          
          // Spawn first twin
          const e1 = new Enemy(this.wave, def.type, variant);
          if (def.miniboss) {
            e1.maxHP = Math.floor(e1.maxHP * 0.5);
            e1.hp = e1.maxHP;
            e1.radius = Math.floor(e1.radius * 0.75);
            e1.coinValue = Math.floor(e1.coinValue * 0.6);
            e1.xpValue = Math.floor(e1.xpValue * 0.6);
            e1._isMiniboss = true;
          }
          
          // Spawn second twin with slight offset
          const e2 = new Enemy(this.wave, def.type, variant);
          if (def.miniboss) {
            e2.maxHP = Math.floor(e2.maxHP * 0.5);
            e2.hp = e2.maxHP;
            e2.radius = Math.floor(e2.radius * 0.75);
            e2.coinValue = Math.floor(e2.coinValue * 0.6);
            e2.xpValue = Math.floor(e2.xpValue * 0.6);
            e2._isMiniboss = true;
          }
          
          // Position twins slightly apart
          const angle = Math.random() * Math.PI * 2;
          const offset = 50;
          e2.x = e1.x + Math.cos(angle) * offset;
          e2.y = e1.y + Math.sin(angle) * offset;
          
          // Ensure twins stay on screen
          e2.x = Math.max(e2.radius, Math.min(this.W - e2.radius, e2.x));
          e2.y = Math.max(e2.radius, Math.min(this.H - e2.radius, e2.y));
          
          this.enemies.push(e1);
          this.enemies.push(e2);
          this._enemySpawnVFX(e1);
          this._enemySpawnVFX(e2);
        } else {
          // Normal single enemy spawn
          const e = new Enemy(this.wave, def.type, def.bossVariant||null);
          // Miniboss = boss with 50% HP and slightly smaller
          if (def.miniboss) {
            e.maxHP = Math.floor(e.maxHP * 0.5);
            e.hp = e.maxHP;
            e.radius = Math.floor(e.radius * 0.75);
            e.coinValue = Math.floor(e.coinValue * 0.6);
            e.xpValue = Math.floor(e.xpValue * 0.6);
            e._isMiniboss = true;
          }
          this.enemies.push(e);
          this._enemySpawnVFX(e);
        }
        
        this.spawnTimer = this.spawnInterval;
      }
    }

    // Update enemies
    for (const e of this.enemies) {
      if (e.dead) continue;
      e.update(dt, this.player, this.enemies, now);
      e.healNearby(this.enemies);
      // Push enemies out of solid obstacles + apply zone effects to enemies
      if (this._obstacleData) {
        for (const o of this._obstacleData) {
          if (o.type === 'solid') {
            // Solid collision
            if (o.r) {
              const dx = e.x - o.x, dy = e.y - o.y;
              const dist = Math.sqrt(dx*dx + dy*dy);
              if (dist < o.r + e.radius && dist > 0) {
                e.x = o.x + (dx/dist) * (o.r + e.radius + 1);
                e.y = o.y + (dy/dist) * (o.r + e.radius + 1);
              }
            } else if (o.w) {
              const hw = o.w/2 + e.radius, hh = o.h/2 + e.radius;
              if (e.x > o.x-hw && e.x < o.x+hw && e.y > o.y-hh && e.y < o.y+hh) {
                const ox = (e.x < o.x) ? (o.x-hw - e.x) : (o.x+hw - e.x);
                const oy = (e.y < o.y) ? (o.y-hh - e.y) : (o.y+hh - e.y);
                if (Math.abs(ox) < Math.abs(oy)) e.x += ox; else e.y += oy;
              }
            }
          } else {
            // Zone effects on enemies — slow them down in water/quicksand/mud/lava
            let inZone = false;
            if (o.r) {
              const dx = e.x - o.x, dy = e.y - o.y;
              inZone = Math.sqrt(dx*dx + dy*dy) < o.r;
            } else if (o.w) {
              inZone = e.x > o.x-o.w/2 && e.x < o.x+o.w/2 && e.y > o.y-o.h/2 && e.y < o.y+o.h/2;
            }
            if (inZone) {
              const t = o.type;
              // Slow enemies in water, quicksand, mud, lava, corruption
              if (t==='water'||t==='quicksand'||t==='mud'||t==='lava'||t==='corruption') {
                e._zoneSlow = 0.5;
              }
              // Speed up enemies on ice/snow (slippery)
              if (t==='ice'||t==='snow') {
                e._zoneSlow = 1.5;
              }
              // Zone VFX for enemies — emit particles matching Swift createWaterParticles etc.
              this._zoneParticles(e.x, e.y, t);
            }
          }
        }
      }

      // Enemy shooting (sniper, ranged boss)
      if ((e.isBoss && e.bossVariant === 'ranged') || e.type === 'sniper') {
        const dx = this.player.x-e.x; const dy = this.player.y-e.y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        if ((e.type === 'sniper' ? dist > 150 : true) && now-e.lastShootTime > e.shootCooldown) {
          e.lastShootTime = now;
          this._spawnEnemyProjectile(e);
        }
      }
      // Summoner boss
      if (e.isBoss && e.bossVariant === 'summoner' && now-e.lastShootTime > e.shootCooldown) {
        e.lastShootTime = now;
        const m = new Enemy(this.wave,'swarm');
        m.x = e.x+(Math.random()-0.5)*60; m.y = e.y+(Math.random()-0.5)*60;
        this.enemies.push(m);
        this._enemySpawnVFX(m);
      }

      // Contact damage
      const cdx = this.player.x-e.x; const cdy = this.player.y-e.y;
      if (Math.sqrt(cdx*cdx+cdy*cdy) < this.player.radius+e.radius && now-e.lastContactTime > e.contactCooldown) {
        e.lastContactTime = now;
        const result = this.player.takeDamage(e.damage);
        if (result === 'dodge') {
          floatingText(this, this.player.x, this.player.y-20, 'DODGE!', '#44ffff');
        } else if (result > 0) {
          floatingText(this, this.player.x, this.player.y-20, '-'+Math.ceil(result), '#ff4444');
          playSFX(this, 'playerdamage', 0.5);
          this._playerDamageVFX(this.player.x, this.player.y);
          this.cameras.main.shake(150, 0.003);
          if (e.type === 'freezer') {
            const orig = this.player.moveSpeed; this.player.moveSpeed *= 0.5;
            floatingText(this, this.player.x, this.player.y-40, 'FROZEN!', '#66b3ff');
            this.time.delayedCall(2000, () => { this.player.moveSpeed = orig; });
          }
        }
      }
    }

    this._updateProjectiles(dt);
    this._updateEnemyProjectiles(dt);
    this._updateCoins();
    this._updateChests();
    this._processDeadEnemies();

    if (this.waveActive && this.spawnQueue.length === 0 && this.enemies.filter(e=>!e.dead).length === 0) {
      this.waveActive = false;
      this._onWaveComplete();
    }
    if (this.player.hp <= 0) { this._onGameOver(); return; }

    this.achievements.check('wave', this.wave);
    this.achievements.check('level', this.player.level);
    this._draw();
    this._updateHUD();

    if (this.achievements.pendingNotifications.length > 0) {
      const a = this.achievements.pendingNotifications.shift();
      floatingText(this, this.W/2, 80, '🏆 '+a.name, '#ffdd44', '22px');
    }
    } catch (error) {
      console.error('Error in update loop:', error);
      // Try to continue with minimal functionality
      try {
        if (this.player && this.player.hp <= 0) {
          this._onGameOver();
        }
      } catch (fallbackError) {
        console.error('Critical error in update fallback:', fallbackError);
        this.scene.start('MenuScene');
      }
    }
  }

  // ── VFX - direct conversions from Swift SKEmitterNode ─────────────────────

  // Muzzle flash - Swift: 500 birthRate, 12-20 particles, 0.12s lifetime
  _muzzleFlash(x, y, angle, isCrit) {
    const count = isCrit ? 20 : 12;
    const color = isCrit ? 0xff4d4d : 0xffe666;
    const mx = x + Math.cos(angle) * 18;
    const my = y + Math.sin(angle) * 18;
    for (let i = 0; i < count; i++) {
      const p = this.add.circle(mx, my, isCrit ? 8 : 5, color, 1).setDepth(50);
      const a = angle + Phaser.Math.FloatBetween(-Math.PI/8, Math.PI/8);
      const spd = 120 + Phaser.Math.FloatBetween(-40, 40);
      this.tweens.add({
        targets: p,
        x: mx + Math.cos(a)*spd*0.12,
        y: my + Math.sin(a)*spd*0.12,
        scale: 0, alpha: 0, duration: 120,
        onComplete: () => p.destroy()
      });
    }
    // Shooting ring - Swift: circleOfRadius 18, scales 2.2x over 0.25s
    const ring = this.add.circle(x, y, 18, 0x000000, 0).setDepth(49);
    ring.setStrokeStyle(isCrit ? 4 : 3, isCrit ? 0xff4d4d : 0xffe64d, 0.9);
    this.tweens.add({ targets: ring, scale: 2.2, alpha: 0, duration: 250, onComplete: () => ring.destroy() });
  }

  // Enemy spawn VFX - Swift: 100-200 particles, 0.5s lifetime + ring scales 3x over 0.4s
  _enemySpawnVFX(e) {
    const count = e.isBoss ? 50 : 30;
    for (let i = 0; i < count; i++) {
      const p = this.add.circle(e.x, e.y, e.isBoss ? 8 : 6, e.color, 1).setDepth(50);
      const a = Math.random() * Math.PI * 2;
      const spd = (e.isBoss ? 150 : 100) + Phaser.Math.FloatBetween(-50, 50);
      this.tweens.add({
        targets: p,
        x: e.x + Math.cos(a)*spd*0.5,
        y: e.y + Math.sin(a)*spd*0.5,
        scale: 0, alpha: 0, duration: 500,
        onComplete: () => p.destroy()
      });
    }
    const ring = this.add.circle(e.x, e.y, e.radius, 0x000000, 0).setDepth(49);
    ring.setStrokeStyle(e.isBoss ? 5 : 3, e.color, 0.8);
    this.tweens.add({ targets: ring, scale: 3.0, alpha: 0, duration: 400, onComplete: () => ring.destroy() });
  }

  // Enemy death VFX - Swift: 20-50 particles, death ring for boss
  _enemyDeathVFX(e) {
    const count = e.isBoss ? 50 : 20;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const dist = Phaser.Math.Between(e.isBoss ? 30 : 15, e.isBoss ? 60 : 30);
      const sz = Phaser.Math.Between(e.isBoss ? 5 : 3, e.isBoss ? 10 : 6);
      const p = this.add.circle(e.x, e.y, sz, e.color, 0.9).setDepth(26);
      this.tweens.add({
        targets: p,
        x: e.x + Math.cos(a)*dist, y: e.y + Math.sin(a)*dist,
        scale: 0, alpha: 0, duration: Phaser.Math.Between(400, 800),
        ease: 'Power2', onComplete: () => p.destroy()
      });
    }
    const flash = this.add.circle(e.x, e.y, e.isBoss ? 40 : 20, e.color, 0.6).setDepth(25);
    this.tweens.add({ targets: flash, scale: 1.5, alpha: 0, duration: 400, onComplete: () => flash.destroy() });
    if (e.isBoss) {
      const ring = this.add.circle(e.x, e.y, 20, 0x000000, 0).setDepth(27);
      ring.setStrokeStyle(6, e.color, 0.9);
      this.tweens.add({ targets: ring, scale: 4, alpha: 0, duration: 800, ease: 'Power2', onComplete: () => ring.destroy() });
      this.cameras.main.shake(400, 0.008);
    }
  }

  // Hit VFX - Swift: 50-100 particles, orange/red
  _hitVFX(x, y, isCrit) {
    const color = isCrit ? 0xff3300 : 0xff8800;
    const count = isCrit ? 25 : 15;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const p = this.add.circle(x, y, isCrit ? 6 : 4, color, 0.9).setDepth(26);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(a)*(isCrit ? 30 : 20),
        y: y + Math.sin(a)*(isCrit ? 30 : 20),
        scale: 0, alpha: 0, duration: isCrit ? 400 : 300,
        onComplete: () => p.destroy()
      });
    }
    if (isCrit) this.cameras.main.shake(150, 0.005);
  }

  // Level up VFX - Swift: 200 birthRate, 50 particles, yellow, + text
  // Level up VFX - matching Swift Player.swift addXP() exactly:
  // 200 birthRate, 50 yellow particles, 1.0s lifetime, speed 200±100
  // + "LEVEL UP!" text scales 1.5x and moves +30y over 1.0s
  _levelUpVFX(x, y) {
    // 50 yellow particles burst outward (Swift: particleSpeed 200, range 100)
    for (let i = 0; i < 50; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 200 + Phaser.Math.FloatBetween(-100, 100);
      const sz = Phaser.Math.Between(4, 8);
      const p = this.add.circle(x, y, sz, 0xffff00, 1).setDepth(28);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(a) * spd,
        y: y + Math.sin(a) * spd,
        scale: 0, alpha: 0,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => p.destroy()
      });
    }

    // "LEVEL UP!" text - matching Swift: scale 1.5x, move +30y, fade over 1.0s
    const lvlText = this.add.text(x, y + 40, 'LEVEL UP!', {
      fontSize: '32px', fontFamily: 'Helvetica Neue, sans-serif',
      color: '#ffff00', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(200);
    this.tweens.add({
      targets: lvlText,
      scaleX: 1.5, scaleY: 1.5,
      y: y + 10,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => lvlText.destroy()
    });

    // Screen flash - brief white flash
    const flash = this.add.rectangle(this.W/2, this.H/2, this.W, this.H, 0xffff00, 0.15).setDepth(150);
    this.tweens.add({ targets: flash, alpha: 0, duration: 400, onComplete: () => flash.destroy() });
  }

  // Player damage VFX - Swift: 100 birthRate, 20 particles, dark red
  _playerDamageVFX(x, y) {
    for (let i = 0; i < 20; i++) {
      const a = Math.random() * Math.PI * 2;
      const p = this.add.circle(x, y, Phaser.Math.Between(3, 6), 0xcc1a1a, 0.8).setDepth(99);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(a)*80, y: y + Math.sin(a)*80,
        scale: 0, alpha: 0, duration: 500,
        onComplete: () => p.destroy()
      });
    }
  }

  // Coin collect VFX
  _coinVFX(x, y) {
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI * 2 * i) / 8;
      const p = this.add.circle(x, y, 3, 0xffdd00, 1).setDepth(28);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(a)*20, y: y + Math.sin(a)*20,
        scale: 0, alpha: 0, duration: 400,
        onComplete: () => p.destroy()
      });
    }
  }

  // Explosion VFX - for explosive enemies
  _explosionVFX(x, y, radius) {
    const ring = this.add.circle(x, y, 10, 0x000000, 0).setDepth(27);
    ring.setStrokeStyle(4, 0xff6600, 0.8);
    this.tweens.add({ targets: ring, scale: radius/10, alpha: 0, duration: 600, ease: 'Power2', onComplete: () => ring.destroy() });
    const flash = this.add.circle(x, y, radius*0.6, 0xff6600, 0.7).setDepth(26);
    this.tweens.add({ targets: flash, scale: 1.5, alpha: 0, duration: 300, onComplete: () => flash.destroy() });
    for (let i = 0; i < 20; i++) {
      const a = Math.random() * Math.PI * 2;
      const p = this.add.circle(x, y, Phaser.Math.Between(4, 8), 0xff6600, 0.9).setDepth(26);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(a)*Phaser.Math.Between(radius*0.5, radius),
        y: y + Math.sin(a)*Phaser.Math.Between(radius*0.5, radius),
        scale: 0, alpha: 0, duration: Phaser.Math.Between(400, 700),
        onComplete: () => p.destroy()
      });
    }
    this.cameras.main.shake(300, 0.006);
  }

  // Bullet trail - Swift: 40 birthRate, 0.25s lifetime
  _bulletTrail(x, y, angle, isCrit) {
    if (Math.random() > 0.4) return;
    const p = this.add.circle(x, y, 3, isCrit ? 0xff3333 : 0xffe64d, isCrit ? 0.7 : 0.5).setDepth(19);
    const ba = angle + Math.PI;
    this.tweens.add({
      targets: p,
      x: x + Math.cos(ba)*15, y: y + Math.sin(ba)*15,
      scale: 0, alpha: 0, duration: 250,
      onComplete: () => p.destroy()
    });
  }

  // ── Combat ────────────────────────────────────────────────────────────────
  _spawnEnemyProjectile(enemy) {
    const dx = this.player.x-enemy.x; const dy = this.player.y-enemy.y;
    const dist = Math.sqrt(dx*dx+dy*dy); if (dist === 0) return;
    this.enemyProjectiles.push({ x:enemy.x, y:enemy.y, vx:(dx/dist)*280, vy:(dy/dist)*280, damage:enemy.damage, life:4.0 });
  }

  _updateProjectiles(dt) {
    for (let i = this.projectiles.length-1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx*dt; p.y += p.vy*dt; p.life -= dt;
      // Bullet trail VFX
      this._bulletTrail(p.x, p.y, p.angle, p.isCrit);
      // Bouncing
      if (p.bounces > 0) {
        if (p.x < 0 || p.x > this.W) { p.vx *= -1; p.bounces--; p.x = Math.max(0,Math.min(this.W,p.x)); }
        if (p.y < 0 || p.y > this.H) { p.vy *= -1; p.bounces--; p.y = Math.max(0,Math.min(this.H,p.y)); }
      }
      if (p.life <= 0 || (p.bounces === 0 && (p.x < -50 || p.x > this.W+50 || p.y < -50 || p.y > this.H+50))) {
        this.projectiles.splice(i,1); continue;
      }
      for (const e of this.enemies) {
        if (e.dead || p.piercedEnemies.has(e)) continue;
        const dx = e.x-p.x; const dy = e.y-p.y;
        if (Math.sqrt(dx*dx+dy*dy) < e.radius+p.size) {
          e.takeDamage(p.damage); this.runDamage += p.damage;
          if (this.player.lifesteal > 0) {
            const heal = p.damage * this.player.lifesteal;
            this.player.heal(heal);
            floatingText(this, this.player.x, this.player.y-20, '+'+Math.ceil(heal), '#00ff88', '14px');
          }
          this._hitVFX(e.x, e.y, p.isCrit);
          playSFX(this, 'enemytakedamage', 0.15);
          floatingText(this, e.x, e.y-15, p.isCrit ? '💥'+Math.ceil(p.damage) : ''+Math.ceil(p.damage), p.isCrit ? '#ff8800' : '#ffffff', p.isCrit ? '20px' : '16px');
          if (p.piercing > 0) { p.piercedEnemies.add(e); p.piercing--; }
          else { this.projectiles.splice(i,1); break; }
        }
      }
    }
  }

  _updateEnemyProjectiles(dt) {
    for (let i = this.enemyProjectiles.length-1; i >= 0; i--) {
      const p = this.enemyProjectiles[i];
      p.x += p.vx*dt; p.y += p.vy*dt; p.life -= dt;
      if (p.life <= 0 || p.x < -50 || p.x > this.W+50 || p.y < -50 || p.y > this.H+50) { this.enemyProjectiles.splice(i,1); continue; }
      const dx = this.player.x-p.x; const dy = this.player.y-p.y;
      if (Math.sqrt(dx*dx+dy*dy) < this.player.radius+8) {
        const result = this.player.takeDamage(p.damage);
        if (result === 'dodge') floatingText(this, this.player.x, this.player.y-20, 'DODGE!', '#44ffff');
        else if (result > 0) {
          floatingText(this, this.player.x, this.player.y-20, '-'+Math.ceil(result), '#ff4444');
          playSFX(this, 'playerdamage', 0.5);
          this._playerDamageVFX(this.player.x, this.player.y);
          this.cameras.main.shake(150, 0.003);
        }
        this.enemyProjectiles.splice(i,1);
      }
    }
  }

  _updateCoins() {
    const PICKUP_RADIUS = 35;   // pickup range — walk over to collect
    const COIN_LIFETIME = 20.0; // coins disappear after 20 seconds

    for (let i = this.coins.length-1; i >= 0; i--) {
      const c = this.coins[i];

      // Age coins
      if (c.life === undefined) c.life = COIN_LIFETIME;
      c.life -= 1/60;
      if (c.life <= 0) { this.coins.splice(i,1); continue; }

      const dx = this.player.x-c.x; const dy = this.player.y-c.y;
      const dist = Math.sqrt(dx*dx+dy*dy);

      if (dist < PICKUP_RADIUS) {
        const boosted = Math.floor(c.value*(1+this.player.coinBoost));
        this.player.coins += boosted;
        this.achievements.increment('totalCoins', boosted);
        floatingText(this, c.x, c.y-10, '+'+boosted+'💰', '#ffdd44', '14px');
        playSFX(this, 'coin', 0.4);
        this._coinVFX(c.x, c.y);
        this.coins.splice(i,1);
      }
    }
  }

  _processDeadEnemies() {
    for (let i = this.enemies.length-1; i >= 0; i--) {
      const e = this.enemies[i]; if (!e.dead) continue;
      // Death VFX + sound
      this._enemyDeathVFX(e);
      playSFX(this, 'enemydie', e.isBoss ? 0.6 : 0.2);
      // Drop coins — spread them out properly
      const totalCoins = Math.max(1, e.coinValue);
      const numDrops = Math.min(3, totalCoins);
      for (let j = 0; j < numDrops; j++) {
        const spread = 40;
        this.coins.push({
          x: e.x + (Math.random()-0.5)*spread,
          y: e.y + (Math.random()-0.5)*spread,
          value: Math.max(1, Math.floor(totalCoins / numDrops))
        });
      }
      // XP
      const leveled = this.player.addXP(e.xpValue);
      if (leveled) {
        playSFX(this, 'level', 0.8);
        // Save skill points immediately when leveling up
        saveData('savedSkillPoints', this.player.skillPoints);
        this._levelUpVFX(this.player.x, this.player.y);
      }
      if (this.player.healingOnKill > 0) this.player.heal(this.player.healingOnKill);
      // Splitter
      if (e.type === 'splitter') {
        for (let j = 0; j < 2; j++) { const m = new Enemy(this.wave,'tiny'); m.x=e.x+(Math.random()-0.5)*40; m.y=e.y+(Math.random()-0.5)*40; this.enemies.push(m); this._enemySpawnVFX(m); }
      }
      // Slime split - matching Swift: 2->4->6
      if (e.type === 'slime' && e.slimeSize < 4) {
        const numSplits = e.slimeSize === 1 ? 2 : e.slimeSize === 2 ? 4 : 6;
        for (let j = 0; j < numSplits; j++) {
          const m = new Enemy(this.wave,'slime',null,e.slimeSize+1);
          const a = (Math.PI*2*j)/numSplits;
          m.x=e.x+Math.cos(a)*40; m.y=e.y+Math.sin(a)*40;
          this.enemies.push(m); this._enemySpawnVFX(m);
        }
      }
      // Explosive
      if (e.type === 'explosive' || (e.isBoss && e.bossVariant === 'explosive')) {
        const radius = e.isBoss ? 100 : 60; // Reduced radius
        const dmg = e.isBoss ? Math.min(50, e.damage * 0.8) : Math.min(30, e.damage * 1.2); // Much lower damage cap
        this._explosionVFX(e.x, e.y, radius);
        const dx = this.player.x-e.x; const dy = this.player.y-e.y;
        if (Math.sqrt(dx*dx+dy*dy) < radius) { 
          const r = this.player.takeDamage(dmg); 
          if (r > 0) floatingText(this, this.player.x, this.player.y-20, '💥-'+Math.ceil(r), '#ff6600', '22px'); 
        }
      }
      this.runKills++;
      if (e.isBoss && !e._isMiniboss) { 
        this.runBossKills++; 
        this.achievements.increment('bossKills');
        // Award class points for full boss kills only (not minibosses)
        this._classPointsEarned = (this._classPointsEarned || 0) + 1;
      }
      this.achievements.increment('kills');
      // Track in almanac
      const alm = loadData('almanac', {});
      alm[e.type] = true;
      saveData('almanac', alm);
      // Miniboss drops a chest
      if (e._isMiniboss) {
        this._spawnChest(e.x, e.y);
      }
      this.enemies.splice(i,1);
    }
  }

  // ── Chest system — miniboss drops a chest with 3 upgrade choices ─────────
  _spawnChest(x, y) {
    if (!this.chests) this.chests = [];
    // Animated chest graphic
    const g = this.add.graphics().setDepth(16);
    g.fillStyle(0xcc8800, 1); g.fillRoundedRect(x-18, y-14, 36, 28, 5);
    g.fillStyle(0xffcc00, 1); g.fillRect(x-18, y-16, 36, 8);
    g.lineStyle(2, 0xffffff, 0.8); g.strokeRoundedRect(x-18, y-14, 36, 28, 5);
    g.fillStyle(0xffffff, 0.9); g.fillCircle(x, y, 4);
    // Pulsing glow
    const glow = this.add.circle(x, y, 28, 0xffcc00, 0.25).setDepth(15);
    this.tweens.add({ targets: glow, scale: 1.4, alpha: 0.1, duration: 700, yoyo: true, repeat: -1 });
    // Label
    const lbl = this.add.text(x, y-28, 'CHEST', {
      fontSize:'12px', fontFamily:'Helvetica Neue, sans-serif',
      color:'#ffcc00', fontStyle:'bold', stroke:'#000000', strokeThickness:3
    }).setOrigin(0.5).setDepth(17);
    this.chests.push({ x, y, g, glow, lbl, collected: false });
  }

  _updateChests() {
    if (!this.chests) return;
    for (let i = this.chests.length-1; i >= 0; i--) {
      const c = this.chests[i];
      if (c.collected) continue;
      
      // Safety check: if graphics are destroyed but chest still exists, recreate them
      if (!c.g || !c.g.scene || c.g.scene !== this) {
        console.warn('Chest graphics missing, recreating...');
        // Remove the broken chest and recreate it
        this.chests.splice(i, 1);
        this._spawnChest(c.x, c.y);
        continue;
      }
      
      const dx = this.player.x - c.x, dy = this.player.y - c.y;
      if (Math.sqrt(dx*dx+dy*dy) < 40) {
        c.collected = true;
        c.g.destroy(); c.glow.destroy(); c.lbl.destroy();
        this.chests.splice(i, 1);
        playSFX(this, 'shopbuy', 0.6);
        this._showChestUpgradeUI();
      }
    }
  }

  _showChestUpgradeUI() {
    // Pause the game while choosing
    this.paused = true;
    this.pauseOverlay.setVisible(true);

    const W = this.W, H = this.H;
    const container = this.add.container(0, 0).setDepth(300);
    const zones = []; // Track all zones to destroy them properly

    // Panel
    const panel = this.add.graphics();
    panel.fillStyle(0x0a0a1e, 0.97);
    panel.lineStyle(4, 0xffcc00, 1);
    panel.fillRoundedRect(W/2-380, H/2-200, 760, 400, 20);
    panel.strokeRoundedRect(W/2-380, H/2-200, 760, 400, 20);
    container.add(panel);

    container.add(this.add.text(W/2, H/2-165, 'MINIBOSS CHEST', {
      fontSize:'36px', fontFamily:'Helvetica Neue, sans-serif',
      color:'#ffcc00', fontStyle:'bold', stroke:'#000000', strokeThickness:4
    }).setOrigin(0.5));
    container.add(this.add.text(W/2, H/2-125, 'Choose one upgrade for this run:', {
      fontSize:'18px', fontFamily:'Helvetica Neue, sans-serif', color:'#ccccdd'
    }).setOrigin(0.5));

    // Generate 3 random temp upgrades
    const allUpgrades = [
      { name:'Damage Surge',    desc:'+20 Damage this run',       apply: p => { p.tempDamageBoost += 20; } },
      { name:'Speed Rush',      desc:'+1.5 Move Speed this run',  apply: p => { p.moveSpeed += 1.5; } },
      { name:'Rapid Fire',      desc:'+0.8 Attack Speed this run',apply: p => { p.tempFireRateBoost += 0.8; } },
      { name:'Iron Skin',       desc:'+15 Armor this run',        apply: p => { p.armor += 15; } },
      { name:'Lifedrain',       desc:'+8% Lifesteal this run',    apply: p => { p.lifesteal += 0.08; } },
      { name:'Lucky Shot',      desc:'+15% Crit Chance this run', apply: p => { p.critChance += 0.15; } },
      { name:'Burst Mode',      desc:'+1 Extra Shot this run',    apply: p => { p.burstShotLevel += 1; } },
      { name:'Regeneration',    desc:'+3 HP/sec this run',        apply: p => { p.regenerationRate += 3; } },
      { name:'Coin Magnet',     desc:'+40% Coin Gain this run',   apply: p => { p.coinBoost += 0.4; } },
      { name:'Piercing Rounds', desc:'+2 Pierce this run',        apply: p => { p.piercing += 2; } },
      { name:'Big Bullets',     desc:'+60% Bullet Size this run', apply: p => { p.bulletSize += 0.6; } },
      { name:'Dodge Roll',      desc:'+15% Dodge Chance this run',apply: p => { p.dodgeChance += 0.15; } },
    ];
    // Pick 3 unique random upgrades
    const shuffled = Phaser.Utils.Array.Shuffle([...allUpgrades]);
    const choices = shuffled.slice(0, 3);

    const cardW = 210, cardH = 160;
    const startX = W/2 - (cardW + 20);

    choices.forEach((upg, idx) => {
      const cx = startX + idx * (cardW + 20);
      const cy = H/2 + 20;

      const card = this.add.graphics();
      card.lineStyle(3, 0xffcc00, 1);
      card.fillStyle(0x1a1a00, 0.95);
      card.fillRoundedRect(cx - cardW/2, cy - cardH/2, cardW, cardH, 12);
      card.strokeRoundedRect(cx - cardW/2, cy - cardH/2, cardW, cardH, 12);
      container.add(card);

      container.add(this.add.text(cx, cy - 45, upg.name, {
        fontSize:'18px', fontFamily:'Helvetica Neue, sans-serif',
        color:'#ffcc00', fontStyle:'bold', stroke:'#000000', strokeThickness:3,
        wordWrap: { width: cardW - 20 }, align:'center'
      }).setOrigin(0.5));
      container.add(this.add.text(cx, cy - 5, upg.desc, {
        fontSize:'14px', fontFamily:'Helvetica Neue, sans-serif',
        color:'#ccccdd', wordWrap: { width: cardW - 20 }, align:'center'
      }).setOrigin(0.5));

      // Select button
      const btn = this.add.graphics();
      btn.lineStyle(2, 0x44ff44, 1);
      btn.fillStyle(0x1a4d1a, 0.9);
      btn.fillRoundedRect(cx-60, cy+45, 120, 36, 8);
      btn.strokeRoundedRect(cx-60, cy+45, 120, 36, 8);
      container.add(btn);
      container.add(this.add.text(cx, cy+63, 'CHOOSE', {
        fontSize:'16px', fontFamily:'Helvetica Neue, sans-serif',
        color:'#ffffff', fontStyle:'bold'
      }).setOrigin(0.5));

      const zone = this.add.zone(cx, cy+63, 120, 36).setInteractive({ useHandCursor: true }).setDepth(310);
      zones.push(zone); // Track this zone
      
      zone.on('pointerover', () => { btn.clear(); btn.lineStyle(2,0x44ff44,1); btn.fillStyle(0x336633,1); btn.fillRoundedRect(cx-60,cy+45,120,36,8); btn.strokeRoundedRect(cx-60,cy+45,120,36,8); });
      zone.on('pointerout',  () => { btn.clear(); btn.lineStyle(2,0x44ff44,1); btn.fillStyle(0x1a4d1a,0.9); btn.fillRoundedRect(cx-60,cy+45,120,36,8); btn.strokeRoundedRect(cx-60,cy+45,120,36,8); });
      zone.on('pointerdown', () => {
        playSFX(this, 'skillupgrade', 0.6);
        upg.apply(this.player);
        floatingText(this, W/2, H/2, upg.name+' activated!', '#ffcc00', '24px');
        
        // Properly destroy all zones and container
        zones.forEach(z => z.destroy());
        container.destroy();
        this.paused = false;
        this.pauseOverlay.setVisible(false);
        this.saveRunState(); // Save the upgrade
      });
    });
  }

  // ── Flow ──────────────────────────────────────────────────────────────────
  _onWaveComplete() {
    try {
      console.log(`Wave ${this.wave} completed. Current biome: ${this.currentBiome}`);
      floatingText(this, this.W/2, this.H/2-40, 'Wave '+this.wave+' Complete!', '#44ff44', '32px');
      const highWave = loadData('highWave',0);
      if (this.wave > highWave) saveData('highWave', this.wave);
      saveData('totalKills', (loadData('totalKills',0)) + this.runKills);
      this.achievements.check('wave', this.wave);
      // Map changes every 10 waves (after boss wave)
      if (this.wave % 10 === 0) {
        console.log(`Biome changing from ${this.currentBiome} to ${(this.currentBiome + 1) % 10}`);
        this.currentBiome = (this.currentBiome + 1) % 10;
        // Ensure biome is within valid range
        if (this.currentBiome < 0 || this.currentBiome >= BIOMES.length) {
          console.warn(`Invalid biome ${this.currentBiome}, resetting to 0`);
          this.currentBiome = 0;
        }
      }
      // Shop only after boss wave (every 10 waves), otherwise go straight to next wave
      this.time.delayedCall(1500, () => {
        if (this.wave % 10 === 0) {
          this._openShop();
        } else {
          this.nextWave();
        }
      });
    } catch (error) {
      console.error('Error in _onWaveComplete:', error);
      // Fallback: try to continue to next wave
      try {
        this.nextWave();
      } catch (fallbackError) {
        console.error('Critical error in _onWaveComplete fallback:', fallbackError);
        this.scene.start('MenuScene');
      }
    }
  }

  _openShop() {
    // Store current music key so we can resume it after shop
    this._preSopMusicKey = this._currentMusicKey;
    stopMusic();
    playMusic(this, 'shopmusic');
    this.scene.pause();
    this.scene.launch('ShopScene', { gameScene:this });
  }

  nextWave() {
    try {
      console.log(`Starting wave ${this.wave + 1}. Current biome: ${this.currentBiome}`);
      this.wave++;
      this.enemies=[]; this.projectiles=[]; this.enemyProjectiles=[];
      // Don't clear chests - let them persist until collected
      // Only rebuild background + obstacles when biome changes (every 10 waves)
      if (this.wave % 10 === 1 && this.wave > 1) {
        console.log(`Rebuilding map for biome ${this.currentBiome} on wave ${this.wave}`);
        const biome = BIOMES[this.currentBiome] || BIOMES[0];
        floatingText(this, this.W/2, this.H/2+40, 'Entering: '+biome.name, '#ffff44', '28px');
        this.children.list.filter(c => c.depth <= -5).forEach(c => { try { c.destroy(); } catch(ex){} });
        createGameBackground(this, this.currentBiome);
        this._buildMapObstacles();
        console.log(`Map rebuild completed for biome ${this.currentBiome}`);
      }
      // No obstacle rebuild on normal waves — map stays the same
      // Music keeps playing — only changes at start of a new game
      this._startWave();
    } catch (error) {
      console.error('Error in nextWave:', error);
      // Fallback: try to continue with minimal setup
      try {
        this.enemies = [];
        this.projectiles = [];
        this.enemyProjectiles = [];
        this._startWave();
      } catch (fallbackError) {
        console.error('Critical error in nextWave fallback:', fallbackError);
        // Last resort: restart the game
        this.scene.start('MenuScene');
      }
    }
  }

  _buildMapObstacles() {
    try {
      if (this._obstacleGraphics) this._obstacleGraphics.destroy();
      this._obstacleData = [];
      const g = this.add.graphics().setDepth(2);
      this._obstacleGraphics = g;
      const biome = this.currentBiome;

    // Helper: check if a circle at (x,y,r) overlaps any existing obstacle
    const overlaps = (x, y, r, minGap = 10) => {
      for (const o of this._obstacleData) {
        if (o.r) {
          const dx = x - o.x, dy = y - o.y;
          if (Math.sqrt(dx*dx+dy*dy) < r + o.r + minGap) return true;
        } else if (o.w) {
          // Circle vs rect — expand rect by r+gap
          const gap = r + minGap;
          if (x > o.x - o.w/2 - gap && x < o.x + o.w/2 + gap &&
              y > o.y - o.h/2 - gap && y < o.y + o.h/2 + gap) return true;
        }
      }
      return false;
    };

    // Helper: place a solid obstacle with overlap check
    const placeSolid = (r, drawFn, maxTries = 100, minGap = 25) => {
      for (let t = 0; t < maxTries; t++) {
        const x = Phaser.Math.Between(r + 60, this.W - r - 60);
        const y = Phaser.Math.Between(r + 60, this.H - r - 60);
        if (!overlaps(x, y, r, minGap)) {
          drawFn(g, x, y);
          this._obstacleData.push({ x, y, r, type:'solid' });
          return { x, y };
        }
      }
      // Fallback: try with reduced spacing if placement fails
      for (let t = 0; t < 50; t++) {
        const x = Phaser.Math.Between(r + 40, this.W - r - 40);
        const y = Phaser.Math.Between(r + 40, this.H - r - 40);
        if (!overlaps(x, y, r, Math.max(10, minGap * 0.5))) {
          drawFn(g, x, y);
          this._obstacleData.push({ x, y, r, type:'solid' });
          return { x, y };
        }
      }
      return null;
    };

    // Helper: place a zone rect with overlap check
    const placeZone = (hw, hh, type, drawFn, maxTries = 40) => {
      for (let t = 0; t < maxTries; t++) {
        const x = Phaser.Math.Between(hw + 60, this.W - hw - 60);
        const y = Phaser.Math.Between(hh + 60, this.H - hh - 60);
        // Use a circle approximation for overlap check
        const r = Math.max(hw, hh);
        if (!overlaps(x, y, r, 20)) {
          drawFn(g, x, y);
          this._obstacleData.push({ x, y, w: hw*2, h: hh*2, type });
          return { x, y };
        }
      }
      return null;
    };

    // Increased tree count for better map coverage with good spacing
    const treeCount = 7;

    if (biome === 0) { // Forest - Normal Trees
      // Water river first (so trees avoid it)
      placeZone(55, 130, 'water', (g, x, y) => {
        g.fillStyle(0x3366cc, 0.45); g.fillRoundedRect(x-55, y-130, 110, 260, 20);
        g.lineStyle(2, 0x4d80ff, 0.7); g.strokeRoundedRect(x-55, y-130, 110, 260, 20);
      });
      // Normal forest trees
      for (let i = 0; i < treeCount; i++) {
        placeSolid(25, (g, x, y) => {
          // Tree trunk
          g.fillStyle(0x4d2d1a, 0.9); g.fillRect(x-4, y-10, 8, 20);
          // Tree canopy
          g.fillStyle(0x1a5c1a, 0.85); g.fillCircle(x, y-5, 25);
          g.lineStyle(3, 0x0d3d0d, 1); g.strokeCircle(x, y-5, 25);
        }, 100, 35);
      }
    } else if (biome === 1) { // Desert - Cacti (contact damage)
      // Quicksand zones first
      for (let i = 0; i < 3; i++) {
        placeZone(70, 50, 'quicksand', (g, x, y) => {
          g.fillStyle(0xb38600, 0.5); g.fillRoundedRect(x-70, y-50, 140, 100, 25);
          g.lineStyle(2, 0xcc9900, 0.7); g.strokeRoundedRect(x-70, y-50, 140, 100, 25);
        });
      }
      // Cacti with contact damage
      for (let i = 0; i < treeCount; i++) {
        const result = placeSolid(12, (g, x, y) => {
          g.fillStyle(0x2d7a2d, 0.9); g.fillRect(x-8, y-20, 16, 40);
          g.lineStyle(2, 0x1a5c1a, 1); g.strokeRect(x-8, y-20, 16, 40);
          // Add spikes
          g.fillStyle(0x1a4d1a, 1);
          for (let s = 0; s < 6; s++) {
            const angle = (s / 6) * Math.PI * 2;
            const sx = x + Math.cos(angle) * 10;
            const sy = y + Math.sin(angle) * 10;
            g.fillTriangle(sx, sy, sx + Math.cos(angle) * 4, sy + Math.sin(angle) * 4, 
                          sx + Math.cos(angle + 0.5) * 2, sy + Math.sin(angle + 0.5) * 2);
          }
        }, 100, 30);
        if (result) {
          // Mark cactus as damaging obstacle
          this._obstacleData[this._obstacleData.length - 1].damaging = true;
          this._obstacleData[this._obstacleData.length - 1].damage = 5;
        }
      }
    } else if (biome === 2) { // Ice - Snowy Trees
      // Ice patches
      for (let i = 0; i < 4; i++) {
        placeZone(80, 60, 'ice', (g, x, y) => {
          g.fillStyle(0x99ccff, 0.3); g.fillRoundedRect(x-80, y-60, 160, 120, 30);
          g.lineStyle(2, 0xb3d9ff, 0.6); g.strokeRoundedRect(x-80, y-60, 160, 120, 30);
        });
      }
      // Snow patches
      for (let i = 0; i < 3; i++) {
        placeZone(60, 45, 'snow', (g, x, y) => {
          g.fillStyle(0xeef5ff, 0.5); g.fillRoundedRect(x-60, y-45, 120, 90, 20);
          g.lineStyle(1, 0xccddff, 0.7); g.strokeRoundedRect(x-60, y-45, 120, 90, 20);
        });
      }
      // Snowy trees
      for (let i = 0; i < treeCount - 1; i++) {
        placeSolid(28, (g, x, y) => {
          // Tree trunk
          g.fillStyle(0x4d2d1a, 0.9); g.fillRect(x-4, y-10, 8, 20);
          // Snow-covered canopy
          g.fillStyle(0xb3d9f2, 0.9); g.fillCircle(x, y-5, 28);
          g.lineStyle(3, 0x80b3cc, 1); g.strokeCircle(x, y-5, 28);
          // Snow on top
          g.fillStyle(0xffffff, 0.8); g.fillCircle(x, y-15, 15);
        }, 100, 40);
      }
    } else if (biome === 3) { // Lava - Volcanic Rocks
      // Lava pools
      for (let i = 0; i < 3; i++) {
        placeZone(70, 55, 'lava', (g, x, y) => {
          g.fillStyle(0xff4400, 0.65); g.fillRoundedRect(x-70, y-55, 140, 110, 25);
          g.lineStyle(3, 0xff6600, 0.9); g.strokeRoundedRect(x-70, y-55, 140, 110, 25);
        });
      }
      // Magma patches
      for (let i = 0; i < 4; i++) {
        placeZone(50, 40, 'magma', (g, x, y) => {
          g.fillStyle(0x660000, 0.5); g.fillRoundedRect(x-50, y-40, 100, 80, 15);
          g.lineStyle(2, 0x990000, 0.7); g.strokeRoundedRect(x-50, y-40, 100, 80, 15);
        });
      }
      // Volcanic rocks
      for (let i = 0; i < treeCount; i++) {
        placeSolid(26, (g, x, y) => {
          g.fillStyle(0x1a0a0a, 0.9); g.fillCircle(x, y, 26);
          g.lineStyle(3, 0xcc3300, 1); g.strokeCircle(x, y, 26);
          // Lava glow
          g.fillStyle(0xff4400, 0.3); g.fillCircle(x, y, 20);
        }, 100, 35);
      }
    } else if (biome === 4) { // Swamp - Dead Stumps
      for (let i = 0; i < 3; i++) {
        placeZone(55, 45, 'poison', (g, x, y) => {
          g.fillStyle(0x33cc33, 0.45); g.fillRoundedRect(x-55, y-45, 110, 90, 20);
          g.lineStyle(2, 0x44ff44, 0.6); g.strokeRoundedRect(x-55, y-45, 110, 90, 20);
        });
      }
      for (let i = 0; i < 4; i++) {
        placeZone(60, 50, 'mud', (g, x, y) => {
          g.fillStyle(0x664d33, 0.55); g.fillRoundedRect(x-60, y-50, 120, 100, 20);
          g.lineStyle(2, 0x806040, 0.7); g.strokeRoundedRect(x-60, y-50, 120, 100, 20);
        });
      }
      // Dead tree stumps
      for (let i = 0; i < treeCount; i++) {
        placeSolid(20, (g, x, y) => {
          g.fillStyle(0x4d3319, 0.85); g.fillCircle(x, y, 20);
          g.lineStyle(2, 0x331a00, 1); g.strokeCircle(x, y, 20);
          // Dead branches
          g.lineStyle(3, 0x2d1a0d, 0.8);
          g.lineBetween(x-15, y-10, x-20, y-25);
          g.lineBetween(x+12, y-8, x+18, y-22);
        }, 100, 30);
      }
    } else if (biome === 5) { // Cave - Stalagmites
      // Cave rocks/stalagmites
      for (let i = 0; i < treeCount; i++) {
        placeSolid(18, (g, x, y) => {
          g.fillStyle(0x4d4d5c, 0.9); g.fillCircle(x, y, 18);
          g.lineStyle(2, 0x666677, 1); g.strokeCircle(x, y, 18);
          // Stalagmite points
          g.fillStyle(0x666677, 0.8);
          g.fillTriangle(x, y-18, x-8, y+10, x+8, y+10);
        }, 100, 28);
      }
    } else if (biome === 6) { // Crystal - Crystal Formations
      for (let i = 0; i < 2; i++) {
        placeZone(80, 80, 'crystal', (g, x, y) => {
          g.fillStyle(0x6600cc, 0.4); g.fillCircle(x, y, 80);
          g.lineStyle(2, 0x9933ff, 0.6); g.strokeCircle(x, y, 80);
          this._obstacleData[this._obstacleData.length-1].r = 80;
          this._obstacleData[this._obstacleData.length-1].w = undefined;
          this._obstacleData[this._obstacleData.length-1].h = undefined;
        });
      }
      // Crystal formations
      for (let i = 0; i < treeCount; i++) {
        placeSolid(22, (g, x, y) => {
          g.fillStyle(0x9933cc, 0.8); g.fillCircle(x, y, 22);
          g.lineStyle(3, 0xcc66ff, 1); g.strokeCircle(x, y, 22);
          // Crystal spikes
          g.fillStyle(0xcc66ff, 0.6);
          for (let c = 0; c < 6; c++) {
            const angle = (c / 6) * Math.PI * 2;
            const cx = x + Math.cos(angle) * 15;
            const cy = y + Math.sin(angle) * 15;
            g.fillTriangle(cx, cy, cx + Math.cos(angle) * 8, cy + Math.sin(angle) * 8,
                          cx + Math.cos(angle + 1) * 4, cy + Math.sin(angle + 1) * 4);
          }
        }, 100, 32);
      }
    } else if (biome === 7) { // Void - Void Obelisks
      for (let i = 0; i < 3; i++) {
        placeZone(70, 70, 'void', (g, x, y) => {
          g.fillStyle(0x0d0026, 0.6); g.fillCircle(x, y, 70);
          g.lineStyle(2, 0x330066, 0.8); g.strokeCircle(x, y, 70);
          this._obstacleData[this._obstacleData.length-1].r = 70;
          this._obstacleData[this._obstacleData.length-1].w = undefined;
          this._obstacleData[this._obstacleData.length-1].h = undefined;
        });
      }
      // Void obelisks
      for (let i = 0; i < treeCount - 1; i++) {
        placeSolid(20, (g, x, y) => {
          g.fillStyle(0x1a0033, 0.9); g.fillRect(x-20, y-30, 40, 60);
          g.lineStyle(3, 0x6600cc, 1); g.strokeRect(x-20, y-30, 40, 60);
          // Void energy
          g.fillStyle(0x9933ff, 0.4); g.fillRect(x-15, y-25, 30, 50);
        }, 100, 30);
      }
    } else if (biome === 8) { // Corrupted - Corrupted Monoliths
      for (let i = 0; i < 2; i++) {
        placeZone(70, 70, 'corruption', (g, x, y) => {
          g.fillStyle(0x330d1a, 0.5); g.fillRoundedRect(x-70, y-70, 140, 140, 30);
          g.lineStyle(2, 0x660d26, 0.7); g.strokeRoundedRect(x-70, y-70, 140, 140, 30);
        });
      }
      // Corrupted monoliths
      for (let i = 0; i < treeCount; i++) {
        placeSolid(28, (g, x, y) => {
          g.fillStyle(0x4d1a26, 0.85); g.fillCircle(x, y, 28);
          g.lineStyle(3, 0x801a33, 1); g.strokeCircle(x, y, 28);
          // Corruption veins
          g.lineStyle(2, 0xcc3366, 0.6);
          for (let v = 0; v < 4; v++) {
            const angle = (v / 4) * Math.PI * 2;
            g.lineBetween(x, y, x + Math.cos(angle) * 25, y + Math.sin(angle) * 25);
          }
        }, 100, 38);
      }
    } else if (biome === 9) { // Sky - Floating Platforms
      for (let i = 0; i < 2; i++) {
        placeZone(90, 50, 'wind', (g, x, y) => {
          g.fillStyle(0xb3ccff, 0.3); g.fillRoundedRect(x-90, y-50, 180, 100, 20);
          g.lineStyle(2, 0xccddff, 0.5); g.strokeRoundedRect(x-90, y-50, 180, 100, 20);
        });
      }
      // Floating platforms
      for (let i = 0; i < treeCount; i++) {
        placeSolid(25, (g, x, y) => {
          g.fillStyle(0x99a0b3, 0.9); g.fillCircle(x, y, 25);
          g.lineStyle(2, 0xccccdd, 1); g.strokeCircle(x, y, 25);
          // Cloud wisps
          g.fillStyle(0xffffff, 0.4);
          for (let w = 0; w < 3; w++) {
            const wx = x + (Math.random() - 0.5) * 30;
            const wy = y + (Math.random() - 0.5) * 30;
            g.fillCircle(wx, wy, 8);
          }
        }, 100, 35);
      }
    }
    } catch (error) {
      console.error('Error in _buildMapObstacles:', error);
      // Fallback: create minimal obstacles to prevent complete failure
      if (this._obstacleGraphics) {
        try {
          const g = this._obstacleGraphics;
          this._obstacleData = [];
          // Add just a few simple obstacles as fallback
          for (let i = 0; i < 3; i++) {
            const x = Phaser.Math.Between(100, this.W - 100);
            const y = Phaser.Math.Between(100, this.H - 100);
            g.fillStyle(0x666666, 0.8);
            g.fillCircle(x, y, 20);
            this._obstacleData.push({ x, y, r: 20, type: 'solid' });
          }
        } catch (fallbackError) {
          console.error('Fallback obstacle creation failed:', fallbackError);
          this._obstacleData = [];
        }
      }
    }
  }

  // Zone particle VFX - direct conversion from Swift createWaterParticles/createIceParticles etc.
  _zoneParticles(x, y, type) {
    switch(type) {
      case 'water': {
        if (Math.random() > 0.33) return;
        for (let i = 0; i < Phaser.Math.Between(3,5); i++) {
          const p = this.add.circle(x+Phaser.Math.Between(-20,20), y+Phaser.Math.Between(-20,20), Phaser.Math.FloatBetween(3,5), 0x4d80e6, 0.8).setDepth(50);
          p.setStrokeStyle(2, 0x6699ff, 0.9);
          this.tweens.add({ targets:p, x:p.x+Phaser.Math.Between(-15,15), y:p.y-Phaser.Math.Between(15,30), scale:0.2, alpha:0, duration:500, onComplete:()=>p.destroy() });
        }
        if (Math.random() < 0.25) {
          const r = this.add.circle(x,y,15,0x000000,0).setDepth(49);
          r.setStrokeStyle(3,0x6699ff,0.8);
          this.tweens.add({ targets:r, scale:2.0, alpha:0, duration:600, onComplete:()=>r.destroy() });
        }
        break;
      }
      case 'quicksand': {
        if (Math.random() > 0.25) return;
        for (let i = 0; i < Phaser.Math.Between(2,3); i++) {
          const p = this.add.circle(x+Phaser.Math.Between(-15,15), y+Phaser.Math.Between(-15,15), Phaser.Math.FloatBetween(2,4), 0xcc9933, 0.6).setDepth(50);
          this.tweens.add({ targets:p, x:p.x+Phaser.Math.Between(-8,8), y:p.y-Phaser.Math.Between(10,20), alpha:0, duration:700, onComplete:()=>p.destroy() });
        }
        break;
      }
      case 'ice':
      case 'snow': {
        if (Math.random() > 0.33) return;
        for (let i = 0; i < Phaser.Math.Between(2,4); i++) {
          const p = this.add.circle(x+Phaser.Math.Between(-25,25), y+Phaser.Math.Between(-25,25), Phaser.Math.FloatBetween(2,3), 0xe6f2ff, 0.9).setDepth(50);
          p.setStrokeStyle(1,0xffffff,1);
          this.tweens.add({ targets:p, x:p.x+Phaser.Math.Between(-10,10), y:p.y+Phaser.Math.Between(-10,10), alpha:0, duration:400, onComplete:()=>p.destroy() });
        }
        break;
      }
      case 'lava':
      case 'magma': {
        if (Math.random() > 0.33) return;
        for (let i = 0; i < Phaser.Math.Between(2,3); i++) {
          const col = type==='lava' ? 0xff4400 : 0xcc2200;
          const p = this.add.circle(x+Phaser.Math.Between(-20,20), y+Phaser.Math.Between(-20,20), Phaser.Math.FloatBetween(3,6), col, 0.8).setDepth(50);
          p.setStrokeStyle(2,0xff3300,1);
          this.tweens.add({ targets:p, x:p.x+Phaser.Math.Between(-5,5), y:p.y-Phaser.Math.Between(20,35), scale:0.1, alpha:0, duration:600, onComplete:()=>p.destroy() });
        }
        break;
      }
      case 'crystal': {
        if (Math.random() > 0.33) return;
        for (let i = 0; i < Phaser.Math.Between(3,5); i++) {
          const p = this.add.circle(x+Phaser.Math.Between(-25,25), y+Phaser.Math.Between(-25,25), Phaser.Math.FloatBetween(2,4), 0xb366e6, 0.9).setDepth(50);
          p.setStrokeStyle(2,0xe699ff,1);
          this.tweens.add({ targets:p, x:p.x+Phaser.Math.Between(-15,15), y:p.y-Phaser.Math.Between(15,30), scale:0.1, alpha:0, duration:500, onComplete:()=>p.destroy() });
        }
        break;
      }
      case 'void': {
        if (Math.random() > 0.33) return;
        for (let i = 0; i < Phaser.Math.Between(2,4); i++) {
          const p = this.add.circle(x+Phaser.Math.Between(-20,20), y+Phaser.Math.Between(-20,20), Phaser.Math.FloatBetween(3,5), 0x330066, 0.8).setDepth(50);
          p.setStrokeStyle(2,0x660099,1);
          this.tweens.add({ targets:p, x:p.x+Phaser.Math.Between(-20,20), y:p.y+Phaser.Math.Between(-20,20), alpha:0, duration:600, onComplete:()=>p.destroy() });
        }
        break;
      }
      case 'corruption': {
        if (Math.random() > 0.25) return;
        for (let i = 0; i < Phaser.Math.Between(2,3); i++) {
          const p = this.add.circle(x+Phaser.Math.Between(-18,18), y+Phaser.Math.Between(-18,18), Phaser.Math.FloatBetween(4,6), 0x4d1a26, 0.7).setDepth(50);
          p.setStrokeStyle(1,0x801a33,0.8);
          this.tweens.add({ targets:p, x:p.x+Phaser.Math.Between(-10,10), y:p.y-Phaser.Math.Between(15,25), scale:1.5, alpha:0, duration:800, onComplete:()=>p.destroy() });
        }
        break;
      }
      case 'wind': {
        if (Math.random() > 0.5) return;
        for (let i = 0; i < Phaser.Math.Between(2,4); i++) {
          const s = this.add.rectangle(x+Phaser.Math.Between(-30,30), y+Phaser.Math.Between(-20,20), 15, 2, 0xcce6ff, 0.6).setDepth(50);
          this.tweens.add({ targets:s, x:s.x+Phaser.Math.Between(40,60), alpha:0, duration:400, onComplete:()=>s.destroy() });
        }
        break;
      }
      case 'poison': {
        if (Math.random() > 0.33) return;
        for (let i = 0; i < Phaser.Math.Between(2,3); i++) {
          const p = this.add.circle(x+Phaser.Math.Between(-20,20), y+Phaser.Math.Between(-20,20), Phaser.Math.FloatBetween(3,5), 0x33cc33, 0.6).setDepth(50);
          this.tweens.add({ targets:p, y:p.y-Phaser.Math.Between(15,25), alpha:0, duration:600, onComplete:()=>p.destroy() });
        }
        break;
      }
      case 'mud': {
        if (Math.random() > 0.25) return;
        for (let i = 0; i < Phaser.Math.Between(2,3); i++) {
          const p = this.add.circle(x+Phaser.Math.Between(-15,15), y+Phaser.Math.Between(-15,15), Phaser.Math.FloatBetween(3,5), 0x664d33, 0.7).setDepth(50);
          this.tweens.add({ targets:p, y:p.y-Phaser.Math.Between(8,15), alpha:0, duration:700, onComplete:()=>p.destroy() });
        }
        break;
      }
    }
  }

  _checkObstacles(dt) {
    if (!this._obstacleData) return;
    const p = this.player;
    const now = this.time.now/1000;
    let inZone = null;
    for (const o of this._obstacleData) {
      let inside = false;
      if (o.r) {
        const dx=p.x-o.x, dy=p.y-o.y;
        inside = Math.sqrt(dx*dx+dy*dy) < o.r + (o.type==='solid' ? p.radius : 0);
      } else if (o.w) {
        inside = p.x>o.x-o.w/2 && p.x<o.x+o.w/2 && p.y>o.y-o.h/2 && p.y<o.y+o.h/2;
      }
      if (!inside) continue;
      if (o.type === 'solid') {
        if (o.r) {
          const dx=p.x-o.x, dy=p.y-o.y, dist=Math.sqrt(dx*dx+dy*dy)||1;
          p.x=o.x+(dx/dist)*(o.r+p.radius+1); p.y=o.y+(dy/dist)*(o.r+p.radius+1);
          
          // Cactus contact damage
          if (o.damaging) {
            if (!this._lastCactusDmg) this._lastCactusDmg = 0;
            if (now - this._lastCactusDmg >= 0.5) {
              this._lastCactusDmg = now;
              const result = p.takeDamage(o.damage || 5);
              if (result > 0) {
                floatingText(this, p.x, p.y-20, '🌵-' + (o.damage || 5), '#2d7a2d');
                playSFX(this, 'playerdamage', 0.3);
                this._playerDamageVFX(p.x, p.y);
              }
            }
          }
        }
      } else {
        inZone = o;
        this._zoneParticles(p.x, p.y, o.type);
      }
    }
    p._inSlowZone = false; p._inIceZone = false; p._inWindZone = false;
    if (inZone) {
      const t = inZone.type;
      // Slow: water, quicksand, mud, lava, corruption
      if (t==='water'||t==='quicksand'||t==='mud'||t==='corruption') p._inSlowZone=true;
      // Slippery (speed boost): ice AND snow - both slippery like Swift iceZone
      if (t==='ice'||t==='snow') p._inIceZone=true;
      if (t==='wind') p._inWindZone=true;
      if (t==='lava') {
        p._inSlowZone=true;
        if (!this._lastLavaDmg) this._lastLavaDmg=0;
        if (now-this._lastLavaDmg>=1.0) { this._lastLavaDmg=now; const r=p.takeDamage(15); if(r>0) floatingText(this,p.x,p.y-20,'\u{1F525}-15','#ff4400'); }
      }
      if (t==='magma') {
        if (!this._lastMagmaDmg) this._lastMagmaDmg=0;
        if (now-this._lastMagmaDmg>=0.5) { this._lastMagmaDmg=now; const r=p.takeDamage(5); if(r>0) floatingText(this,p.x,p.y-20,'\u{1F525}-5','#ff6600'); }
      }
      if (t==='poison') {
        if (!this._lastPoisonDmg) this._lastPoisonDmg=0;
        if (now-this._lastPoisonDmg>=0.7) { this._lastPoisonDmg=now; const r=p.takeDamage(8); if(r>0) floatingText(this,p.x,p.y-20,'☠️-8','#33cc33'); }
      }
      if (t==='void') {
        if (!this._lastVoidDmg) this._lastVoidDmg=0;
        if (now-this._lastVoidDmg>=0.5) { this._lastVoidDmg=now; const r=p.takeDamage(10); if(r>0) floatingText(this,p.x,p.y-20,'🌀-10','#9933ff'); }
      }
    }
  }

  _onGameOver() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.achievements.increment('deaths');
    const pts = this._classPointsEarned || 0; // Use actual boss kills, not wave-based
    saveData('classPoints', (loadData('classPoints',0))+pts);
    saveData('totalKills', (loadData('totalKills',0))+this.runKills);
    const highWave = loadData('highWave',0);
    if (this.wave > highWave) saveData('highWave', this.wave);

    // Clean up chests
    if (this.chests) {
      this.chests.forEach(c => {
        try {
          if (c.g) c.g.destroy();
          if (c.glow) c.glow.destroy();
          if (c.lbl) c.lbl.destroy();
        } catch (e) {
          console.warn('Error destroying chest graphics:', e);
        }
      });
      this.chests = [];
    }

    this.clearRunState();
    stopMusic();
    playSFX(this, 'over', 0.6);

    // Always go to GameOverScene first — skill tree button is ON that screen
    this.time.delayedCall(800, () => {
      this.scene.start('GameOverScene', {
        wave: this.wave, kills: this.runKills, bossKills: this.runBossKills,
        damage: this.runDamage, coins: this.player.coins,
        level: this.player.level, classPointsEarned: pts,
        skillPoints: this.player.skillPoints  // pass SP so game over screen can show skill tree button
      });
    });
  }

  _togglePause() {
    this.paused = !this.paused;
    this.pauseOverlay.setVisible(this.paused);
    this._pauseContainer.setVisible(this.paused);
    // Enable zones only when paused so they can't be clicked during gameplay
    if (this._pauseZones) {
      this._pauseZones.forEach(z => {
        z.setActive(this.paused).setVisible(this.paused);
        if (this.paused) z.setInteractive({ useHandCursor: true });
        else z.disableInteractive();
      });
    }
    if (this.paused) this.saveRunState();
  }

  // ── Rendering ─────────────────────────────────────────────────────────────
  _draw() {
    // Coins — flash when about to expire
    const cg = this.coinGraphics; cg.clear();
    for (const c of this.coins) {
      const expiring = c.life !== undefined && c.life < 5;
      const alpha = expiring ? (Math.sin(Date.now()/100) * 0.5 + 0.5) : 1;
      cg.fillStyle(0xffd700, alpha); cg.fillCircle(c.x, c.y, 6);
      cg.lineStyle(1, 0xffaa00, alpha); cg.strokeCircle(c.x, c.y, 6);
    }

    // Enemies - matching Swift circle + health bar + icons
    const eg = this.enemyGraphics; eg.clear();
    for (const e of this.enemies) {
      if (e.dead) continue;
      // Shield ring
      if (e.hasShield && e.shieldHP > 0) { eg.lineStyle(3,0x4d99ff,0.8); eg.strokeCircle(e.x,e.y,e.radius+6); }
      // Body
      eg.fillStyle(e.color,1); eg.fillCircle(e.x,e.y,e.radius);
      eg.lineStyle(e.isBoss ? 4 : 2, 0xffffff, 1); eg.strokeCircle(e.x,e.y,e.radius);
      // Boss colored outer ring
      if (e.isBoss) { eg.lineStyle(3, e.color, 0.6); eg.strokeCircle(e.x,e.y,e.radius+8); }
      // Health bar
      const bw = Math.max(e.radius*2.5, 30);
      const hpRatio = e.hp/e.maxHP;
      eg.fillStyle(0x333333,0.8); eg.fillRect(e.x-bw/2, e.y-e.radius-12, bw, 5);
      const hpCol = e.isBoss ? 0xff4444 : (hpRatio > 0.5 ? 0x44ff44 : hpRatio > 0.25 ? 0xffcc00 : 0xff4444);
      eg.fillStyle(hpCol,1); eg.fillRect(e.x-bw/2, e.y-e.radius-12, bw*hpRatio, 5);
    }
    // Draw enemy icons as text objects (cached per enemy)
    if (!this._enemyIconTexts) this._enemyIconTexts = new Map();
    const activeEnemies = new Set(this.enemies.filter(e=>!e.dead));
    // Remove icons for dead enemies
    for (const [e, t] of this._enemyIconTexts) {
      if (!activeEnemies.has(e)) { t.destroy(); this._enemyIconTexts.delete(e); }
    }
    // Add/update icons
    for (const e of activeEnemies) {
      const icon = e.isBoss ? (e.variantIcon || '👑') : (e.icon || '');
      if (!icon) continue;
      if (!this._enemyIconTexts.has(e)) {
        const t = this.add.text(e.x, e.y, icon, { fontSize: e.isBoss ? '18px' : '14px' }).setOrigin(0.5).setDepth(12);
        this._enemyIconTexts.set(e, t);
      } else {
        const t = this._enemyIconTexts.get(e);
        t.setPosition(e.x, e.y);
      }
    }

    // Projectiles - matching Swift colors
    const pg = this.projGraphics; pg.clear();
    for (const p of this.projectiles) {
      const col = p.charged ? 0xff8800 : (p.isCrit ? 0xff6600 : 0xffff44);
      pg.fillStyle(col,1); pg.fillCircle(p.x,p.y,p.size);
      pg.lineStyle(1, p.isCrit ? 0xff0000 : 0xffaa00, 1); pg.strokeCircle(p.x,p.y,p.size);
    }
    for (const p of this.enemyProjectiles) {
      pg.fillStyle(0xff8800,1); pg.fillCircle(p.x,p.y,8);
      pg.lineStyle(2,0xffffff,1); pg.strokeCircle(p.x,p.y,8);
    }

    // UI overlay
    const ug = this.uiGraphics; ug.clear();
    if (this.player.isInvulnerable()) { ug.fillStyle(0xff0000,0.1); ug.fillRect(0,0,this.W,this.H); }
  }
}
