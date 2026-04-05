// SkillTree - direct conversion from Swift SkillTree.swift
class SkillTree {
  constructor() {
    // Skills matching Swift exactly - positions, costs, maxLevels
    this.skills = {
      // Page 1: Basic Stats
      health:         { name:'Max Health',      desc:'+20 HP',              level:0, maxLevel:10, pos:{x:200,y:420}, special:false, baseCost:1, page:1 },
      damage:         { name:'Damage',          desc:'+5 DMG',              level:0, maxLevel:10, pos:{x:350,y:420}, special:false, baseCost:1, page:1 },
      speed:          { name:'Move Speed',      desc:'+0.3 Speed',          level:0, maxLevel:8,  pos:{x:500,y:420}, special:false, baseCost:1, page:1 },
      attackSpeed:    { name:'Attack Speed',    desc:'+15% Fire Rate',      level:0, maxLevel:8,  pos:{x:650,y:420}, special:false, baseCost:1, page:1 },
      projectileSpeed:{ name:'Proj. Speed',     desc:'+50 Speed',           level:0, maxLevel:5,  pos:{x:800,y:420}, special:false, baseCost:1, page:1 },
      bulletSize:     { name:'Bullet Size',     desc:'+30% Size',           level:0, maxLevel:5,  pos:{x:200,y:300}, special:false, baseCost:1, page:1 },
      critChance:     { name:'Crit Chance',     desc:'+5% Crit',            level:0, maxLevel:5,  pos:{x:350,y:300}, special:false, baseCost:2, page:1 },
      armor:          { name:'Armor',           desc:'-2 DMG Taken',        level:0, maxLevel:5,  pos:{x:575,y:300}, special:false, baseCost:2, page:1 },
      xpBoost:        { name:'XP Boost',        desc:'+10% XP',             level:0, maxLevel:5,  pos:{x:800,y:300}, special:false, baseCost:2, page:1 },
      coinBoost:      { name:'Coin Boost',      desc:'+20% Coins',          level:0, maxLevel:5,  pos:{x:200,y:180}, special:false, baseCost:2, page:1 },
      // Page 2: Advanced Stats
      lifesteal:      { name:'Lifesteal',       desc:'+2% Heal on Hit',     level:0, maxLevel:5,  pos:{x:200,y:420}, special:false, baseCost:2, page:2 },
      healing:        { name:'Healing',         desc:'+5 HP on Kill',       level:0, maxLevel:5,  pos:{x:350,y:420}, special:false, baseCost:2, page:2 },
      dashUpgrade:    { name:'Dash Power',      desc:'+Distance & -CD',     level:0, maxLevel:3,  pos:{x:500,y:420}, special:false, baseCost:3, page:2, requires:'dash' },
      piercingShot:   { name:'Piercing Shot',   desc:'+1 Pierce/level',     level:0, maxLevel:3,  pos:{x:650,y:420}, special:false, baseCost:3, page:2, requires:'piercing' },
      critDamage:     { name:'Crit Damage',     desc:'+25% Crit DMG',       level:0, maxLevel:5,  pos:{x:800,y:420}, special:false, baseCost:2, page:2 },
      dodgeChance:    { name:'Dodge',           desc:'+5% Dodge Chance',    level:0, maxLevel:4,  pos:{x:200,y:300}, special:false, baseCost:3, page:2 },
      regeneration:   { name:'Regeneration',    desc:'+1 HP/sec',           level:0, maxLevel:5,  pos:{x:350,y:300}, special:false, baseCost:3, page:2 },
      knockback:      { name:'Knockback',       desc:'+20% Knockback',      level:0, maxLevel:3,  pos:{x:500,y:300}, special:false, baseCost:2, page:2 },
      bounceShot:     { name:'Bounce',          desc:'+1 Bullet Bounce',    level:0, maxLevel:5,  pos:{x:650,y:300}, special:false, baseCost:3, page:2 },
      projectileRange:{ name:'Range',           desc:'+15% Range',          level:0, maxLevel:4,  pos:{x:800,y:300}, special:false, baseCost:2, page:2 },
      invulnTime:     { name:'Invuln Time',     desc:'+0.2s Invuln',        level:0, maxLevel:3,  pos:{x:350,y:180}, special:false, baseCost:3, page:2 },
      luckBoost:      { name:'Luck',            desc:'+10% Drop Rate',      level:0, maxLevel:5,  pos:{x:650,y:180}, special:false, baseCost:2, page:2 },
      // Page 3: Special Abilities
      multishot:      { name:'Multishot',       desc:'Unlock: +1 Projectile',    level:0, maxLevel:1, pos:{x:250,y:380}, special:true, baseCost:5, page:3 },
      piercing:       { name:'Piercing',        desc:'Unlock: Pierce Enemies',   level:0, maxLevel:1, pos:{x:450,y:380}, special:true, baseCost:5, page:3 },
      chargedShot:    { name:'Charged Shot',    desc:'Unlock: Right-Click Charge',level:0,maxLevel:1, pos:{x:650,y:380}, special:true, baseCost:5, page:3 },
      dash:           { name:'Dash',            desc:'Unlock: Space to Dash',    level:0, maxLevel:1, pos:{x:450,y:260}, special:true, baseCost:5, page:3 },
      // Page 4: Master Skills
      masterDamage:   { name:'Master Damage',   desc:'+10 DMG',               level:0, maxLevel:5,  pos:{x:200,y:420}, special:false, baseCost:5, page:4 },
      masterHealth:   { name:'Master Health',   desc:'+50 HP',                level:0, maxLevel:5,  pos:{x:350,y:420}, special:false, baseCost:5, page:4 },
      masterSpeed:    { name:'Master Speed',    desc:'+0.5 Speed',            level:0, maxLevel:3,  pos:{x:500,y:420}, special:false, baseCost:5, page:4 },
      masterCrit:     { name:'Master Crit',     desc:'+10% Crit Chance',      level:0, maxLevel:3,  pos:{x:650,y:420}, special:false, baseCost:5, page:4 },
      // Page 5: Legendary Skills
      legendary1:     { name:'Legendary Power', desc:'Ultimate Enhancement',   level:0, maxLevel:1,  pos:{x:400,y:350}, special:true,  baseCost:15, page:5 }
    };
    this.currentPage = 1;
    this._load();
  }

  getCost(key) {
    const s = this.skills[key];
    if (!s) return 999;
    if (s.special) return s.baseCost;
    return Math.floor(s.baseCost * Math.pow(1.5, s.level));
  }

  canUpgrade(key, player) {
    const s = this.skills[key];
    if (!s || s.level >= s.maxLevel) return false;
    if (s.requires && (!this.skills[s.requires] || this.skills[s.requires].level === 0)) return false;
    return player.skillPoints >= this.getCost(key);
  }

  upgrade(key, player) {
    if (!this.canUpgrade(key, player)) return false;
    const s = this.skills[key];
    const cost = this.getCost(key);
    player.skillPoints -= cost;
    s.level++;
    // Apply stat
    switch (key) {
      case 'health':          player.maxHP += 20; player.hp += 20; break;
      case 'damage':          player.damage += 5; break;
      case 'speed':           player.moveSpeed += 0.3; break;
      case 'attackSpeed':     player.attackSpeed += 0.15; break;
      case 'projectileSpeed': player.projectileSpeed += 50; break;
      case 'bulletSize':      player.bulletSize += 0.3; break;
      case 'critChance':      player.critChance += 0.05; break;
      case 'lifesteal':       player.lifesteal += 0.02; break;
      case 'armor':           player.armor += 2; break;
      case 'multishot':       player.multishot = 1; break;
      case 'piercing':        player.piercing = 1; break;
      case 'xpBoost':         player.xpBoost += 0.1; break;
      case 'coinBoost':       player.coinBoost += 0.2; break;
      case 'healing':         player.healingOnKill += 5; break;
      case 'chargedShot':     player.chargedShotLevel = 1; break;
      case 'dash':            player.dashLevel = 1; break;
      case 'dashUpgrade':     player.dashLevel += 1; break;
      case 'piercingShot':    player.piercing += 1; break;
      case 'critDamage':      player.critDamage += 0.25; break;
      case 'dodgeChance':     player.dodgeChance += 0.05; break;
      case 'regeneration':    player.regenerationRate += 1.0; break;
      case 'bounceShot':      player.bounceLevel += 1; break;
      case 'projectileRange': player.projectileSpeed += 30; break;
      case 'masterDamage':    player.damage += 10; break;
      case 'masterHealth':    player.maxHP += 50; player.hp += 50; break;
      case 'masterSpeed':     player.moveSpeed += 0.5; break;
      case 'masterCrit':      player.critChance += 0.1; break;
      case 'legendary1':      player.damage += 20; player.maxHP += 100; player.hp += 100; break;
    }
    this._save();
    return true;
  }

  applyAllToPlayer(player) {
    for (const [key, skill] of Object.entries(this.skills)) {
      for (let i = 0; i < skill.level; i++) {
        switch (key) {
          case 'health':          player.maxHP += 20; player.hp += 20; break;
          case 'damage':          player.damage += 5; break;
          case 'speed':           player.moveSpeed += 0.3; break;
          case 'attackSpeed':     player.attackSpeed += 0.15; break;
          case 'projectileSpeed': player.projectileSpeed += 50; break;
          case 'bulletSize':      player.bulletSize += 0.3; break;
          case 'critChance':      player.critChance += 0.05; break;
          case 'lifesteal':       player.lifesteal += 0.02; break;
          case 'armor':           player.armor += 2; break;
          case 'multishot':       player.multishot = 1; break;
          case 'piercing':        player.piercing = 1; break;
          case 'xpBoost':         player.xpBoost += 0.1; break;
          case 'coinBoost':       player.coinBoost += 0.2; break;
          case 'healing':         player.healingOnKill += 5; break;
          case 'chargedShot':     player.chargedShotLevel = 1; break;
          case 'dash':            player.dashLevel = 1; break;
          case 'dashUpgrade':     player.dashLevel += 1; break;
          case 'piercingShot':    player.piercing += 1; break;
          case 'critDamage':      player.critDamage += 0.25; break;
          case 'dodgeChance':     player.dodgeChance += 0.05; break;
          case 'regeneration':    player.regenerationRate += 1.0; break;
          case 'bounceShot':      player.bounceLevel += 1; break;
          case 'projectileRange': player.projectileSpeed += 30; break;
          case 'masterDamage':    player.damage += 10; break;
          case 'masterHealth':    player.maxHP += 50; player.hp += 50; break;
          case 'masterSpeed':     player.moveSpeed += 0.5; break;
          case 'masterCrit':      player.critChance += 0.1; break;
          case 'legendary1':      player.damage += 20; player.maxHP += 100; player.hp += 100; break;
        }
      }
    }
  }

  refundPage(page, player) {
    for (const [key, skill] of Object.entries(this.skills)) {
      if (skill.page !== page || skill.level === 0) continue;
      // Refund points
      for (let i = 0; i < skill.level; i++) {
        const tempLevel = i;
        const cost = skill.special ? skill.baseCost : Math.floor(skill.baseCost * Math.pow(1.5, tempLevel));
        player.skillPoints += cost;
      }
      skill.level = 0;
    }
    this._save();
  }

  _save() {
    const data = {};
    for (const [k, s] of Object.entries(this.skills)) data[k] = s.level;
    saveData('skillTree', data);
  }

  _load() {
    const data = loadData('skillTree', {});
    for (const [k, v] of Object.entries(data)) {
      if (this.skills[k]) this.skills[k].level = v;
    }
  }
}
