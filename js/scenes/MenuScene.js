// MenuScene - direct conversion from Swift showStartMenu()
class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  playSFX(key, vol = 0.3) { playSFX(this, key, vol); }

  create() {
    const GW = this.scale.width, GH = this.scale.height;

    // Stop any existing music (gameplay music from previous run)
    stopMusic();

    // AudioContext is unlocked (user clicked in BootScene) — play immediately
    playMusic(this, 'maintheme');

    // Background matching Swift showStartMenu()
    createMenuBackground(this);

    // Title with glow - matching Swift titleGlow + title
    this.add.text(GW/2+2, GH/2-202, 'ROGUELITE ARENA', {
      fontSize:'72px', fontFamily:'Helvetica Neue, sans-serif',
      color:'#3380ff', fontStyle:'bold', alpha:0.3
    }).setOrigin(0.5).setDepth(1);

    const title = this.add.text(GW/2, GH/2-200, 'ROGUELITE ARENA', {
      fontSize:'72px', fontFamily:'Helvetica Neue, sans-serif',
      color:'#66ccff', fontStyle:'bold',
      stroke:'#001133', strokeThickness:4
    }).setOrigin(0.5).setDepth(2);

    // Pulse animation matching Swift
    this.tweens.add({ targets: title, scaleX:1.05, scaleY:1.05, duration:1500, yoyo:true, repeat:-1 });

    // Subtitle
    this.add.text(GW/2, GH/2-150, 'Survive. Upgrade. Conquer.', {
      fontSize:'24px', fontFamily:'Helvetica Neue, sans-serif', color:'#b3b3cc'
    }).setOrigin(0.5).setDepth(2);

    // Stats
    const totalKills = loadData('totalKills',0);
    const highWave = loadData('highWave',0);
    if (totalKills > 0 || highWave > 0) {
      this.add.text(GW/2, GH/2-115, 'Best Wave: '+highWave+'  |  Total Kills: '+totalKills, {
        fontSize:'16px', fontFamily:'Helvetica Neue, sans-serif', color:'#667799'
      }).setOrigin(0.5).setDepth(2);
    }

    const savedRun = loadData('runState', null);
    let nextY = GH/2 - 60;

    if (savedRun) {
      // Continue button - matching Swift startBg with pulse
      const { zone: contZone, bg: contBg } = createButton(this, GW/2, nextY, 320, 70,
        '▶  CONTINUE  (Wave '+savedRun.wave+')', 0x1a6633, 0x33ff66, 'continue');
      this.tweens.add({ targets: contBg, alpha: 0.6, duration: 800, yoyo: true, repeat: -1 });
      contZone.on('pointerdown', () => {
        this.playSFX('buttonclick'); this.playSFX('start', 0.5);
        stopMusic();
        this.scene.start('GameScene', { selectedClass: savedRun.selectedClass, resume: savedRun });
      });
      nextY += 80;

      const { zone: newZone } = createButton(this, GW/2, nextY, 280, 50, '🔄  NEW GAME', 0x4d1a1a, 0xff4444, 'newgame');
      newZone.on('pointerdown', () => {
        this.playSFX('buttonclick');
        // Clear ALL run state so wave resets to 1
        localStorage.removeItem('runState');
        this.scene.start('ClassSelectScene');
      });
      nextY += 65;
    } else {
      const { zone: startZone, bg: startBg } = createButton(this, GW/2, nextY, 320, 70, '▶  START GAME', 0x1a6633, 0x33ff66, 'start');
      this.tweens.add({ targets: startBg, alpha: 0.6, duration: 800, yoyo: true, repeat: -1 });
      startZone.on('pointerdown', () => {
        this.playSFX('buttonclick'); this.playSFX('start', 0.5);
        this.scene.start('ClassSelectScene');
      });
      nextY += 80;
    }

    // Classes button - matching Swift classesBg (purple)
    const { zone: clsZone } = createButton(this, GW/2, nextY, 300, 60, '⚔️  CLASSES', 0x4d1a66, 0xcc66ff, 'cls');
    clsZone.on('pointerdown', () => { this.playSFX('buttonclick'); this.scene.start('ClassSelectScene'); });
    nextY += 70;

    // Skill Tree button - matching Swift skillTreeBg (blue)
    const { zone: stZone } = createButton(this, GW/2, nextY, 300, 60, '🌳  SKILL TREE', 0x1a3366, 0x66b3ff, 'st');
    stZone.on('pointerdown', () => { this.playSFX('buttonclick'); this.scene.start('SkillTreeScene', { fromMenu:true }); });
    nextY += 70;

    // Achievements button - matching Swift achievementsBg (gold)
    const { zone: achZone } = createButton(this, GW/2, nextY, 300, 60, '🏆  ACHIEVEMENTS', 0x4d3300, 0xffcc4d, 'ach');
    achZone.on('pointerdown', () => { this.playSFX('buttonclick'); this.scene.start('AchievementsScene'); });

    // Bottom row - Almanac + Stats (matching Swift)
    const { zone: almZone } = createButton(this, GW/2-160, GH-60, 280, 55, 'ALMANAC', 0x331a4d, 0xb366e6, 'alm');
    almZone.on('pointerdown', () => { this.playSFX('buttonclick'); this.scene.start('AlmanacScene'); });

    const { zone: statsZone } = createButton(this, GW/2+160, GH-60, 280, 55, 'STATS', 0x1a3333, 0x66cccc, 'stats');
    statsZone.on('pointerdown', () => { this.playSFX('buttonclick'); this.scene.start('StatsScene'); });

    // Settings gear button - top right corner (matching Swift settingsButtonBg at x:900,y:650)
    const settingsG = this.add.graphics().setDepth(5);
    settingsG.lineStyle(2, 0x9999aa, 1);
    settingsG.fillStyle(0x333344, 0.85);
    settingsG.fillCircle(GW-45, 45, 28);
    settingsG.strokeCircle(GW-45, 45, 28);
    this.add.text(GW-45, 45, 'SETTINGS', {
      fontSize:'9px', fontFamily:'Helvetica Neue, sans-serif', color:'#aaaacc'
    }).setOrigin(0.5).setDepth(6);
    this.add.text(GW-45, 32, '⚙', {
      fontSize:'20px', color:'#ccccdd'
    }).setOrigin(0.5).setDepth(6);
    const settingsZone = this.add.zone(GW-45, 45, 56, 56).setInteractive({ useHandCursor: true }).setDepth(7);
    settingsZone.on('pointerover', () => { settingsG.clear(); settingsG.lineStyle(2,0xccccdd,1); settingsG.fillStyle(0x555566,1); settingsG.fillCircle(GW-45,45,28); settingsG.strokeCircle(GW-45,45,28); });
    settingsZone.on('pointerout',  () => { settingsG.clear(); settingsG.lineStyle(2,0x9999aa,1); settingsG.fillStyle(0x333344,0.85); settingsG.fillCircle(GW-45,45,28); settingsG.strokeCircle(GW-45,45,28); });
    settingsZone.on('pointerdown', () => { this.playSFX('buttonclick'); this.scene.start('SettingsScene'); });

    this.add.text(GW-10, GH-10, 'v1.0 Web', {
      fontSize:'12px', color:'#334455', fontFamily:'Helvetica Neue, sans-serif'
    }).setOrigin(1,1).setDepth(2);

    // Privacy Policy link (required for AdSense)
    const privText = this.add.text(10, GH-10, 'Privacy Policy', {
      fontSize:'12px', color:'#445566', fontFamily:'Helvetica Neue, sans-serif'
    }).setOrigin(0,1).setDepth(2).setInteractive({ useHandCursor: true });
    privText.on('pointerover', () => privText.setColor('#66aacc'));
    privText.on('pointerout',  () => privText.setColor('#445566'));
    privText.on('pointerdown', () => window.open('privacy.html', '_blank'));
  }
}

// ClassSelectScene - matching Swift showClassManagement()
class ClassSelectScene extends Phaser.Scene {
  constructor() { super('ClassSelectScene'); }

  playSFX(key, vol = 0.3) { playSFX(this, key, vol); }

  create() {
    const GW = this.scale.width, GH = this.scale.height;

    // Background matching Swift classManagement
    this.add.rectangle(GW/2, GH/2, GW, GH, 0x02021a);

    // Animated particles matching Swift
    for (let i = 0; i < 30; i++) {
      const p = this.add.circle(Math.random()*GW, Math.random()*GH, Phaser.Math.FloatBetween(1,3), 0x4d80ff, Phaser.Math.FloatBetween(0.1,0.3));
      this.tweens.add({
        targets: p,
        x: p.x + Phaser.Math.Between(-30,30),
        y: p.y + Phaser.Math.Between(-30,30),
        duration: Phaser.Math.Between(4000,8000),
        yoyo: true, repeat: -1
      });
    }

    // Title with glow matching Swift
    this.add.text(GW/2+2, 42, '⚔️ CLASS MANAGEMENT ⚔️', {
      fontSize:'44px', fontFamily:'Helvetica Neue, sans-serif', color:'#3366cc', fontStyle:'bold'
    }).setOrigin(0.5).setAlpha(0.5);
    const title = this.add.text(GW/2, 40, '⚔️ CLASS MANAGEMENT ⚔️', {
      fontSize:'44px', fontFamily:'Helvetica Neue, sans-serif', color:'#66ccff', fontStyle:'bold'
    }).setOrigin(0.5);
    this.tweens.add({ targets: title, scaleX:1.05, scaleY:1.05, duration:1500, yoyo:true, repeat:-1 });

    const classPoints = loadData('classPoints', 0);
    const unlockedClasses = loadData('unlockedClasses', ['classless']);

    // Points display with glow matching Swift
    const ptsBg = this.add.graphics();
    ptsBg.lineStyle(3, 0xcc9900, 1);
    ptsBg.fillStyle(0x1a1a33, 0.9);
    ptsBg.fillRoundedRect(GW/2-150, 80, 300, 50, 12);
    ptsBg.strokeRoundedRect(GW/2-150, 80, 300, 50, 12);
    this.add.text(GW/2, 105, 'Available Points: '+classPoints, {
      fontSize:'26px', fontFamily:'Helvetica Neue, sans-serif', color:'#ffe64d', fontStyle:'bold'
    }).setOrigin(0.5);

    const classKeys = Object.keys(PLAYER_CLASSES);
    const cols = 3, cw = 280, ch = 130;
    const startX = GW/2 - (cols-1)*(cw+20)/2;
    const startY = 160;

    classKeys.forEach((key, idx) => {
      const cls = PLAYER_CLASSES[key];
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const cx = startX + col*(cw+20);
      const cy = startY + row*(ch+15);
      const unlocked = unlockedClasses.includes(key);

      const g = this.add.graphics();
      const fillCol = unlocked ? 0x142040 : 0x0d0d1a;
      const strokeCol = unlocked ? 0x66ccff : 0x444455;
      g.lineStyle(unlocked ? 4 : 2, strokeCol, 1);
      g.fillStyle(fillCol, 0.95);
      g.fillRoundedRect(cx-cw/2, cy-ch/2, cw, ch, 12);
      g.strokeRoundedRect(cx-cw/2, cy-ch/2, cw, ch, 12);

      // Glow for unlocked - matching Swift
      if (unlocked) {
        const glow = this.add.graphics();
        glow.lineStyle(10, 0x66ccff, 0.3);
        glow.strokeRoundedRect(cx-cw/2-5, cy-ch/2-5, cw+10, ch+10, 14);
        this.tweens.add({ targets: glow, alpha: 0.2, duration: 1500, yoyo: true, repeat: -1 });
      }

      // Class icon + name
      this.add.text(cx-cw/2+20, cy-30, cls.icon, { fontSize:'36px' });
      this.add.text(cx-cw/2+65, cy-28, cls.name, {
        fontSize:'18px', fontFamily:'Helvetica Neue, sans-serif',
        color: unlocked ? '#fffff2' : '#808080', fontStyle:'bold'
      });
      this.add.text(cx-cw/2+65, cy-8, cls.desc, {
        fontSize:'12px', color: unlocked ? '#aabbcc' : '#444444',
        fontFamily:'Helvetica Neue, sans-serif'
      });
      this.add.text(cx-cw/2+65, cy+12, 'HP:'+cls.hp+' DMG:'+cls.dmgMin+'-'+cls.dmgMax+' SPD:'+cls.speed, {
        fontSize:'11px', color: unlocked ? '#88aacc' : '#333333',
        fontFamily:'Helvetica Neue, sans-serif'
      });

      if (!unlocked) {
        this.add.text(cx, cy+38, '🔒 Unlock: '+cls.unlockCost+' pts', {
          fontSize:'13px', color:'#ff6644', fontFamily:'Helvetica Neue, sans-serif'
        }).setOrigin(0.5);
      }

      if (unlocked) {
        const zone = this.add.zone(cx, cy, cw, ch).setInteractive({ useHandCursor: true });
        zone.on('pointerover', () => { g.clear(); g.lineStyle(4,0x99ddff,1); g.fillStyle(0x1a3a55,1); g.fillRoundedRect(cx-cw/2,cy-ch/2,cw,ch,12); g.strokeRoundedRect(cx-cw/2,cy-ch/2,cw,ch,12); });
        zone.on('pointerout',  () => { g.clear(); g.lineStyle(4,strokeCol,1); g.fillStyle(fillCol,0.95); g.fillRoundedRect(cx-cw/2,cy-ch/2,cw,ch,12); g.strokeRoundedRect(cx-cw/2,cy-ch/2,cw,ch,12); });
        zone.on('pointerdown', () => {
          this.playSFX('buttonclick');
          saveData('selectedClass', key);
          stopMusic();
          this.scene.start('GameScene', { selectedClass: key });
        });
      } else if (classPoints >= cls.unlockCost) {
        const zone = this.add.zone(cx, cy, cw, ch).setInteractive({ useHandCursor: true });
        zone.on('pointerdown', () => {
          const pts = loadData('classPoints', 0);
          if (pts >= cls.unlockCost) {
            this.playSFX('shopbuy');
            saveData('classPoints', pts - cls.unlockCost);
            const ul = loadData('unlockedClasses', ['classless']);
            ul.push(key); saveData('unlockedClasses', ul);
            this.scene.restart();
          }
        });
      }
    });

    const { zone: backZone } = createButton(this, 80, GH-40, 120, 40, '← Back', 0x222233, 0x4455aa, 'back');
    backZone.on('pointerdown', () => { this.playSFX('buttonclick'); this.scene.start('MenuScene'); });
  }
}

// AchievementsScene - matching Swift showAchievements()
class AchievementsScene extends Phaser.Scene {
  constructor() { super('AchievementsScene'); }

  playSFX(key, vol = 0.3) { playSFX(this, key, vol); }

  create() {
    const GW = this.scale.width, GH = this.scale.height;
    this.add.rectangle(GW/2, GH/2, GW, GH, 0x02020d);

    this.add.text(GW/2, 35, '🏆  ACHIEVEMENTS  🏆', {
      fontSize:'36px', fontFamily:'Helvetica Neue, sans-serif', color:'#ffcc33', fontStyle:'bold'
    }).setOrigin(0.5);

    const mgr = new AchievementManager();
    const all = mgr.getAll();
    const unlocked = all.filter(a => a.unlocked).length;

    this.add.text(GW/2, 75, unlocked+' / '+all.length+' Unlocked', {
      fontSize:'16px', color:'#aabbcc', fontFamily:'Helvetica Neue, sans-serif'
    }).setOrigin(0.5);

    const cols = 2, cw = 440, ch = 60;
    const startX = GW/2 - (cols-1)*(cw+20)/2;
    const startY = 110;

    all.forEach((a, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const cx = startX + col*(cw+20);
      const cy = startY + row*(ch+8);
      if (cy > GH-60) return;

      const g = this.add.graphics();
      const fill = a.unlocked ? 0x1a2a1a : 0x111111;
      const stroke = a.unlocked ? 0x44ff44 : 0x333333;
      g.lineStyle(1, stroke, 1); g.fillStyle(fill, 0.9);
      g.fillRoundedRect(cx-cw/2, cy-ch/2, cw, ch, 6);
      g.strokeRoundedRect(cx-cw/2, cy-ch/2, cw, ch, 6);

      const icon = a.unlocked ? '✅' : '🔒';
      this.add.text(cx-cw/2+10, cy-12, icon+' '+a.name, {
        fontSize:'14px', fontStyle:'bold', color: a.unlocked ? '#88ff88' : '#555555',
        fontFamily:'Helvetica Neue, sans-serif'
      });
      this.add.text(cx-cw/2+10, cy+8, a.desc, {
        fontSize:'12px', color: a.unlocked ? '#aaccaa' : '#444444',
        fontFamily:'Helvetica Neue, sans-serif'
      });
    });

    const { zone } = createButton(this, 80, GH-40, 120, 40, '← Back', 0x222233, 0x4455aa, 'back');
    zone.on('pointerdown', () => { this.playSFX('buttonclick'); this.scene.start('MenuScene'); });
  }
}

// AlmanacScene - Enemy Almanac with pagination, boss variants, and miniboss entries
class AlmanacScene extends Phaser.Scene {
  constructor() { super('AlmanacScene'); }

  init(data) { this.page = data.page || 0; }

  playSFX(key, vol = 0.3) { playSFX(this, key, vol); }

  create() {
    const GW = this.scale.width, GH = this.scale.height;
    this.add.rectangle(GW/2, GH/2, GW, GH, 0x05020d);

    this.add.text(GW/2, 30, 'ENEMY ALMANAC', {
      fontSize:'36px', fontFamily:'Helvetica Neue, sans-serif', color:'#cc80ff', fontStyle:'bold',
      stroke:'#000000', strokeThickness:3
    }).setOrigin(0.5);

    const discovered = loadData('almanac', {});

    // All entries — regular enemies, miniboss variants, boss variants
    const ALL_ENTRIES = [
      // ── Regular Enemies ──────────────────────────────────────────────────
      { section:'REGULAR ENEMIES', header:true },
      { type:'normal',      name:'Normal',      desc:'Basic enemy. Moves toward player.',                    color:0xff4444, hp:'30×wave', dmg:'10+2×wave', spd:'Medium' },
      { type:'runner',      name:'Runner',       desc:'Fast but very weak. Low HP.',                          color:0x00cccc, hp:'10×wave', dmg:'5',         spd:'Very Fast' },
      { type:'tank',        name:'Tank',         desc:'Slow but high HP and damage.',                         color:0x994d00, hp:'60×wave', dmg:'15+wave',   spd:'Slow' },
      { type:'tiny',        name:'Tiny',         desc:'Small and weak. Cosmetic variant.',                    color:0xff8080, hp:'30×wave', dmg:'5+wave',    spd:'Medium' },
      { type:'giant',       name:'Giant',        desc:'Large. Same stats as normal.',                         color:0xcc3333, hp:'30×wave', dmg:'5+wave',    spd:'Medium' },
      { type:'speedy',      name:'Speedy',       desc:'Slightly faster than normal.',                         color:0xffcc00, hp:'30×wave', dmg:'5+wave',    spd:'Fast' },
      { type:'gold',        name:'Gold',         desc:'Rare. Drops lots of coins. Very fast.',                color:0xffd700, hp:'30+8×wave', dmg:'8+2×wave', spd:'Very Fast' },
      { type:'healer',      name:'Healer',       desc:'Heals nearby enemies 5% HP every 2 seconds.',         color:0x66ff66, hp:'25×wave', dmg:'4+wave',    spd:'Slow' },
      { type:'splitter',    name:'Splitter',     desc:'Splits into 2 tiny enemies on death.',                color:0x9933cc, hp:'40×wave', dmg:'6+wave',    spd:'Medium' },
      { type:'teleporter',  name:'Teleporter',   desc:'Teleports around the player every 3 seconds.',        color:0x8050ff, hp:'28×wave', dmg:'8+wave',    spd:'Teleports' },
      { type:'shield',      name:'Shield',       desc:'Has a shield absorbing 50% HP before taking damage.', color:0x4d80e6, hp:'35×wave', dmg:'6+wave',    spd:'Slow' },
      { type:'explosive',   name:'Explosive',    desc:'Explodes on death dealing 80px area damage.',         color:0xff4d00, hp:'20×wave', dmg:'8+wave',    spd:'Fast' },
      { type:'charger',     name:'Charger',      desc:'Charges at player when within 300 range.',            color:0xe61a1a, hp:'35×wave', dmg:'9+wave',    spd:'Charges' },
      { type:'sniper',      name:'Sniper',       desc:'Shoots from far away. Runs when player gets close.',  color:0x555555, hp:'22×wave', dmg:'10+wave',   spd:'Retreats' },
      { type:'swarm',       name:'Swarm',        desc:'Very weak. Spawns in groups of 3-6.',                 color:0xcc9933, hp:'8×wave',  dmg:'3+wave',    spd:'Fast' },
      { type:'necromancer', name:'Necromancer',  desc:'Revives dead enemies every 8 seconds.',               color:0x9933cc, hp:'30×wave', dmg:'5+wave',    spd:'Slow' },
      { type:'mimic',       name:'Mimic',        desc:'Mirrors player movement patterns.',                   color:0x808080, hp:'28×wave', dmg:'6+wave',    spd:'Medium' },
      { type:'berserker',   name:'Berserker',    desc:'Gets faster as HP decreases. Up to 2.5x speed.',      color:0xcc0000, hp:'40×wave', dmg:'8+wave',    spd:'Rage' },
      { type:'freezer',     name:'Freezer',      desc:'Slows player to 50% speed for 2 seconds on hit.',     color:0x66b3ff, hp:'26×wave', dmg:'12+2×wave', spd:'Fast' },
      { type:'slime',       name:'Slime',        desc:'Splits into 2 → 4 → 6 smaller slimes on death.',     color:0x33cc4d, hp:'30×wave', dmg:'8+wave',    spd:'Scales' },

      // ── Miniboss Variants (every 5 waves) ────────────────────────────────
      { section:'MINIBOSS VARIANTS  (every 5 waves)', header:true },
      { type:'boss_melee',     name:'Melee Miniboss',     desc:'Charges at player. Summons tank minions. 50% HP of full boss.',     color:0xcc00cc, hp:'50% boss HP', dmg:'High',      spd:'Medium', badge:'MINI' },
      { type:'boss_ranged',    name:'Ranged Miniboss',    desc:'Shoots projectiles. Keeps distance. Summons snipers.',              color:0xff3333, hp:'50% boss HP', dmg:'Medium',    spd:'Slow',   badge:'MINI' },
      { type:'boss_tank',      name:'Tank Miniboss',      desc:'Ground slam attack. Reflection shield. Summons shield enemies.',    color:0x996633, hp:'50% boss HP', dmg:'Very High', spd:'Slow',   badge:'MINI' },
      { type:'boss_speedy',    name:'Speedy Miniboss',    desc:'Rapid fire shots. Summons runner enemies.',                         color:0x33cccc, hp:'50% boss HP', dmg:'Medium',    spd:'Fast',   badge:'MINI' },
      { type:'boss_summoner',  name:'Summoner Miniboss',  desc:'Spawns healer minions every 5 seconds.',                           color:0x33cc33, hp:'50% boss HP', dmg:'Low',       spd:'Slow',   badge:'MINI' },
      { type:'boss_explosive', name:'Explosive Miniboss', desc:'Shoots explosive projectiles. Massive death explosion.',            color:0xffff00, hp:'50% boss HP', dmg:'Very High', spd:'Medium', badge:'MINI' },

      // ── Boss Variants (every 10 waves) ───────────────────────────────────
      { section:'BOSS VARIANTS  (every 10 waves)', header:true },
      { type:'boss_melee_full',     name:'Melee Boss',     desc:'Dash attack every 3s. Summons 2 tank minions. Gets faster at low HP.',  color:0xcc00cc, hp:'200+45×(w-1)²', dmg:'30+8×wave', spd:'Medium', badge:'BOSS' },
      { type:'boss_ranged_full',    name:'Ranged Boss',    desc:'Triple shot every 2.5s. Keeps 200px distance. Summons snipers.',        color:0xff3333, hp:'150+38×(w-1)²', dmg:'22+6×wave', spd:'Slow',   badge:'BOSS' },
      { type:'boss_tank_full',      name:'Tank Boss',      desc:'Ground slam shockwave. Reflection shield. Summons shield enemies.',     color:0x996633, hp:'300+60×(w-1)²', dmg:'38+9×wave', spd:'Slow',   badge:'BOSS' },
      { type:'boss_speedy_full',    name:'Speedy Boss',    desc:'5-shot rapid fire. Summons 3 runner enemies. Very fast.',               color:0x33cccc, hp:'150+30×(w-1)²', dmg:'27+6×wave', spd:'Fast',   badge:'BOSS' },
      { type:'boss_twins_full',     name:'Twins Boss',     desc:'Two bosses with split HP. Homing shots. Summons teleporters.',          color:0xff66cc, hp:'Split HP',       dmg:'27+6×wave', spd:'Medium', badge:'BOSS' },
      { type:'boss_summoner_full',  name:'Summoner Boss',  desc:'Spawns healer minions every 5s. Stays back. Hard to reach.',            color:0x33cc33, hp:'180+38×(w-1)²', dmg:'18+5×wave', spd:'Slow',   badge:'BOSS' },
      { type:'boss_berserker_full', name:'Berserker Boss', desc:'360 projectile spray. Summons berserker enemies. Enrages at 30% HP.',   color:0xff8800, hp:'220+42×(w-1)²', dmg:'33+8×wave', spd:'Fast',   badge:'BOSS' },
      { type:'boss_explosive_full', name:'Explosive Boss', desc:'Explosive projectiles. MASSIVE death explosion (150px radius).',        color:0xffff00, hp:'180+40×(w-1)²', dmg:'45+10×wave',spd:'Medium', badge:'BOSS' },
    ];

    // Pagination — 12 entries per page (excluding headers)
    const ENTRIES_PER_PAGE = 12;
    const nonHeaderEntries = ALL_ENTRIES.filter(e => !e.header);
    const totalPages = Math.ceil(nonHeaderEntries.length / ENTRIES_PER_PAGE);
    const discoveredCount = Object.keys(discovered).length;

    this.add.text(GW/2, 68, 'Discovered: '+discoveredCount+' / '+nonHeaderEntries.length+'   Page '+(this.page+1)+'/'+totalPages, {
      fontSize:'16px', color:'#9966cc', fontFamily:'Helvetica Neue, sans-serif'
    }).setOrigin(0.5);

    // Get entries for this page
    let entryIdx = 0;
    const pageEntries = [];
    let currentSection = '';
    for (const e of ALL_ENTRIES) {
      if (e.header) { currentSection = e.section; continue; }
      if (entryIdx >= this.page * ENTRIES_PER_PAGE && entryIdx < (this.page+1) * ENTRIES_PER_PAGE) {
        pageEntries.push({ ...e, section: currentSection });
      }
      entryIdx++;
    }

    // Draw entries
    const cols = 2, cw = 580, ch = 62;
    const startX = GW/2 - (cols-1)*(cw+20)/2;
    let lastSection = '';
    let rowOffset = 0;

    pageEntries.forEach((info, idx) => {
      // Section header
      if (info.section !== lastSection) {
        lastSection = info.section;
        const sy = 100 + rowOffset * (ch + 6);
        this.add.text(startX - cw/2, sy, info.section, {
          fontSize:'13px', fontStyle:'bold', color:'#cc80ff',
          fontFamily:'Helvetica Neue, sans-serif'
        });
        rowOffset += 0.6;
      }

      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const cx = startX + col*(cw+20);
      const cy = 100 + (row + rowOffset) * (ch + 6);
      if (cy > GH - 70) return;

      // Determine if discovered — boss/miniboss variants always show
      const isBossEntry = info.type && (info.type.startsWith('boss_'));
      const isDiscovered = isBossEntry || !!discovered[info.type];

      // Color border by badge type
      const borderCol = info.badge === 'BOSS' ? 0xff4444 : info.badge === 'MINI' ? 0xff8800 : (isDiscovered ? 0x9933cc : 0x333333);
      const fillCol   = info.badge === 'BOSS' ? 0x1a0000 : info.badge === 'MINI' ? 0x1a0d00 : (isDiscovered ? 0x1a0d26 : 0x0d0d0d);

      const g = this.add.graphics();
      g.lineStyle(isDiscovered ? 2 : 1, borderCol, 1);
      g.fillStyle(fillCol, 0.9);
      g.fillRoundedRect(cx-cw/2, cy-ch/2, cw, ch, 6);
      g.strokeRoundedRect(cx-cw/2, cy-ch/2, cw, ch, 6);

      if (isDiscovered) {
        // Colored circle indicator
        g.fillStyle(info.color, 1);
        g.fillCircle(cx-cw/2+20, cy, 10);
        g.lineStyle(2, 0xffffff, 0.5);
        g.strokeCircle(cx-cw/2+20, cy, 10);

        // Badge label
        if (info.badge) {
          const badgeCol = info.badge === 'BOSS' ? '#ff4444' : '#ff8800';
          this.add.text(cx+cw/2-8, cy-ch/2+4, info.badge, {
            fontSize:'10px', fontStyle:'bold', color: badgeCol,
            fontFamily:'Helvetica Neue, sans-serif'
          }).setOrigin(1, 0);
        }

        const hexColor = '#' + info.color.toString(16).padStart(6,'0');
        this.add.text(cx-cw/2+38, cy-14, info.name, {
          fontSize:'14px', fontStyle:'bold', color: hexColor,
          fontFamily:'Helvetica Neue, sans-serif'
        });
        this.add.text(cx-cw/2+38, cy+2, info.desc, {
          fontSize:'11px', color:'#aaaacc', fontFamily:'Helvetica Neue, sans-serif',
          wordWrap: { width: cw - 120 }
        });
        // Stats on right
        if (info.hp) {
          this.add.text(cx+cw/2-8, cy-8, 'HP: '+info.hp, {
            fontSize:'10px', color:'#88ff88', fontFamily:'Helvetica Neue, sans-serif'
          }).setOrigin(1, 0);
          this.add.text(cx+cw/2-8, cy+6, 'SPD: '+info.spd, {
            fontSize:'10px', color:'#88aaff', fontFamily:'Helvetica Neue, sans-serif'
          }).setOrigin(1, 0);
        }
      } else {
        this.add.text(cx-cw/2+12, cy-5, '??? - Defeat this enemy to unlock', {
          fontSize:'13px', color:'#555555', fontFamily:'Helvetica Neue, sans-serif'
        });
      }
    });

    // Navigation buttons
    if (this.page > 0) {
      const { zone: prevZone } = createButton(this, 100, GH-40, 140, 40, '← Prev', 0x222233, 0x4455aa, 'prev');
      prevZone.on('pointerdown', () => { this.playSFX('buttonclick'); this.scene.start('AlmanacScene', { page: this.page-1 }); });
    }
    if (this.page < totalPages-1) {
      const { zone: nextZone } = createButton(this, GW-100, GH-40, 140, 40, 'Next →', 0x222233, 0x4455aa, 'next');
      nextZone.on('pointerdown', () => { this.playSFX('buttonclick'); this.scene.start('AlmanacScene', { page: this.page+1 }); });
    }

    const { zone } = createButton(this, GW/2, GH-40, 130, 40, '← Back', 0x222233, 0x4455aa, 'back');
    zone.on('pointerdown', () => { this.playSFX('buttonclick'); this.scene.start('MenuScene'); });
  }
}

// StatsScene - Player Statistics
class StatsScene extends Phaser.Scene {
  constructor() { super('StatsScene'); }

  playSFX(key, vol = 0.3) { playSFX(this, key, vol); }

  create() {
    const GW = this.scale.width, GH = this.scale.height;
    this.add.rectangle(GW/2, GH/2, GW, GH, 0x020508);

    this.add.text(GW/2, 35, '📊  PLAYER STATISTICS  📊', {
      fontSize:'36px', fontFamily:'Helvetica Neue, sans-serif', color:'#66ccff', fontStyle:'bold'
    }).setOrigin(0.5);

    const totalKills = loadData('totalKills', 0);
    const highWave = loadData('highWave', 0);
    const classPoints = loadData('classPoints', 0);
    const unlockedClasses = loadData('unlockedClasses', ['classless']);
    const achData = loadData('achievements', {});
    const unlockedAch = Object.values(achData).filter(a => a.unlocked).length;

    const stats = [
      ['🏆 Highest Wave Reached', 'Wave ' + highWave],
      ['💀 Total Enemies Killed', '' + totalKills],
      ['⭐ Class Points Available', '' + classPoints],
      ['🔓 Classes Unlocked', unlockedClasses.length + ' / ' + Object.keys(PLAYER_CLASSES).length],
      ['🏅 Achievements Unlocked', unlockedAch + ' / 22'],
      ['💾 Saved Run', loadData('runState', null) ? 'Yes (Wave ' + (loadData('runState',{}).wave||'?') + ')' : 'None'],
    ];

    const startY = 120;
    stats.forEach(([label, val], i) => {
      const y = startY + i * 75;
      const g = this.add.graphics();
      g.lineStyle(2, 0x334466, 1);
      g.fillStyle(0x0d1a2a, 0.9);
      g.fillRoundedRect(GW/2-380, y-25, 760, 60, 10);
      g.strokeRoundedRect(GW/2-380, y-25, 760, 60, 10);
      this.add.text(GW/2-360, y-5, label, {
        fontSize:'20px', fontFamily:'Helvetica Neue, sans-serif', color:'#99bbdd', fontStyle:'bold'
      });
      this.add.text(GW/2+360, y-5, val, {
        fontSize:'22px', fontFamily:'Helvetica Neue, sans-serif', color:'#ffcc33', fontStyle:'bold'
      }).setOrigin(1, 0);
    });

    const { zone } = createButton(this, 80, GH-40, 130, 40, '← Back', 0x222233, 0x4455aa, 'back');
    zone.on('pointerdown', () => { this.playSFX('buttonclick'); this.scene.start('MenuScene'); });
  }
}

// SettingsScene - converted from Swift showSettings()
class SettingsScene extends Phaser.Scene {
  constructor() { super('SettingsScene'); }

  playSFX(key, vol = 0.3) { playSFX(this, key, vol); }

  create() {
    const GW = this.scale.width, GH = this.scale.height;

    // Load saved volumes
    this.masterVol = loadData('masterVolume', 1.0);
    this.musicVol  = loadData('musicVolume',  1.0);
    this.sfxVol    = loadData('sfxVolume',    0.8);

    this.add.rectangle(GW/2, GH/2, GW, GH, 0x01010a);

    // Title matching Swift
    this.add.text(GW/2, 55, 'SETTINGS', {
      fontSize:'52px', fontFamily:'Helvetica Neue, sans-serif', color:'#99aaff', fontStyle:'bold',
      stroke:'#000022', strokeThickness:4
    }).setOrigin(0.5);

    // Volume sliders
    this._makeSlider('Master Volume', 'masterVol', 'masterVolume', GH/2 - 120);
    this._makeSlider('Music Volume',  'musicVol',  'musicVolume',  GH/2);
    this._makeSlider('SFX Volume',    'sfxVol',    'sfxVolume',    GH/2 + 120);

    // Wipe progress button matching Swift
    const { zone: wipeZone } = createButton(this, GW/2, GH/2 + 250, 340, 55, 'WIPE ALL PROGRESS', 0x4d0000, 0xff2222, 'wipe');
    wipeZone.on('pointerdown', () => {
      this.playSFX('buttonclick');
      this._showWipeConfirm();
    });

    // Privacy Policy button (required for AdSense compliance)
    const { zone: privZone } = createButton(this, GW/2, GH/2 + 320, 280, 45, 'Privacy Policy', 0x111122, 0x445566, 'priv');
    privZone.on('pointerdown', () => {
      window.open('privacy.html', '_blank');
    });

    // Back button
    const { zone: backZone } = createButton(this, 90, GH-45, 140, 45, '← Back', 0x222233, 0x4455aa, 'back');
    backZone.on('pointerdown', () => { this.playSFX('buttonclick'); this.scene.start('MenuScene'); });
  }

  _makeSlider(label, prop, saveKey, y) {
    const GW = this.scale.width;
    const sliderX = GW/2 - 200;
    const sliderW = 400;

    this.add.text(GW/2, y - 30, label, {
      fontSize:'24px', fontFamily:'Helvetica Neue, sans-serif', color:'#ffffff', fontStyle:'bold'
    }).setOrigin(0.5);

    // Track background
    const track = this.add.graphics();
    track.fillStyle(0x333344, 1);
    track.fillRoundedRect(sliderX, y - 5, sliderW, 10, 5);

    // Fill bar
    const fill = this.add.graphics();
    const drawFill = (val) => {
      fill.clear();
      fill.fillStyle(0x6699ff, 1);
      fill.fillRoundedRect(sliderX, y - 5, sliderW * val, 10, 5);
    };
    drawFill(this[prop]);

    // Handle
    const handle = this.add.circle(sliderX + sliderW * this[prop], y, 14, 0xffffff, 1).setDepth(5);
    handle.setStrokeStyle(3, 0x6699ff, 1);

    // Value label
    const valLabel = this.add.text(GW/2, y + 28, Math.round(this[prop] * 100) + '%', {
      fontSize:'18px', fontFamily:'Helvetica Neue, sans-serif', color:'#aabbcc'
    }).setOrigin(0.5);

    // Drag zone
    const dragZone = this.add.zone(GW/2, y, sliderW + 28, 40).setInteractive({ draggable: true, useHandCursor: true }).setDepth(6);
    dragZone.on('drag', (pointer) => {
      const newX = Phaser.Math.Clamp(pointer.x, sliderX, sliderX + sliderW);
      const val = (newX - sliderX) / sliderW;
      this[prop] = val;
      handle.setPosition(newX, y);
      drawFill(val);
      valLabel.setText(Math.round(val * 100) + '%');
      saveData(saveKey, val);
      // Apply immediately
      this._applyVolumes();
    });
    // Also allow clicking anywhere on track
    dragZone.on('pointerdown', (pointer) => {
      const newX = Phaser.Math.Clamp(pointer.x, sliderX, sliderX + sliderW);
      const val = (newX - sliderX) / sliderW;
      this[prop] = val;
      handle.setPosition(newX, y);
      drawFill(val);
      valLabel.setText(Math.round(val * 100) + '%');
      saveData(saveKey, val);
      this._applyVolumes();
    });
  }

  _applyVolumes() {
    applyVolumes(this.masterVol, this.musicVol, this.sfxVol);
  }

  _showWipeConfirm() {
    const GW = this.scale.width, GH = this.scale.height;

    const overlay = this.add.rectangle(GW/2, GH/2, GW, GH, 0x000000, 0.85).setDepth(50);
    const box = this.add.graphics().setDepth(51);
    box.lineStyle(4, 0xff2222, 1);
    box.fillStyle(0x1a0000, 0.98);
    box.fillRoundedRect(GW/2-250, GH/2-150, 500, 300, 20);
    box.strokeRoundedRect(GW/2-250, GH/2-150, 500, 300, 20);

    this.add.text(GW/2, GH/2-100, 'WIPE ALL PROGRESS?', {
      fontSize:'28px', fontFamily:'Helvetica Neue, sans-serif', color:'#ff4444', fontStyle:'bold'
    }).setOrigin(0.5).setDepth(52);
    this.add.text(GW/2, GH/2-55, 'This deletes skill tree, achievements,\nclass unlocks and all stats.', {
      fontSize:'16px', fontFamily:'Helvetica Neue, sans-serif', color:'#ccaaaa', align:'center'
    }).setOrigin(0.5).setDepth(52);
    this.add.text(GW/2, GH/2-5, 'This CANNOT be undone!', {
      fontSize:'18px', fontFamily:'Helvetica Neue, sans-serif', color:'#ff6666', fontStyle:'bold'
    }).setOrigin(0.5).setDepth(52);

    const { zone: yesZone } = createButton(this, GW/2-90, GH/2+80, 160, 50, 'YES, WIPE', 0x660000, 0xff2222, 'yes');
    yesZone.setDepth(53);
    yesZone.on('pointerdown', () => {
      // Wipe everything except audio settings
      const keysToKeep = ['masterVolume','musicVolume','sfxVolume'];
      const saved = {};
      keysToKeep.forEach(k => { saved[k] = localStorage.getItem(k); });
      localStorage.clear();
      keysToKeep.forEach(k => { if (saved[k] !== null) localStorage.setItem(k, saved[k]); });
      this.playSFX('buttonclick');
      this.scene.start('MenuScene');
    });

    const { zone: noZone } = createButton(this, GW/2+90, GH/2+80, 160, 50, 'CANCEL', 0x003300, 0x33ff33, 'no');
    noZone.setDepth(53);
    noZone.on('pointerdown', () => {
      overlay.destroy(); box.destroy();
      // Remove the confirm UI elements (last 6 added)
      const children = this.children.list;
      // Just restart the scene to clean up
      this.scene.restart();
    });
  }
}
