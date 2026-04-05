// Enemy - direct conversion from Swift Enemy.swift
class Enemy {
  constructor(wave, type = 'normal', bossVariant = null, slimeSize = 1) {
    this.type = type;
    this.wave = wave;
    this.isBoss = (type === 'boss');
    this.bossVariant = bossVariant;
    this.slimeSize = slimeSize;
    this.dead = false;
    this.lastContactTime = 0;
    this.contactCooldown = 0.5;
    this.lastShootTime = 0;
    this.shootCooldown = 2.0;
    this.lastTeleportTime = 0;
    this.lastHealTime = 0;
    this.lastNecroTime = 0;
    this.hasShield = false;
    this.shieldHP = 0;
    this._initStats();
    this._spawnAtEdge();
  }

  _initStats() {
    const w = this.wave;
    switch (this.type) {
      case 'boss': {
        const variant = this.bossVariant || BOSS_VARIANTS[Math.floor(Math.random() * BOSS_VARIANTS.length)];
        this.bossVariant = variant;
        this.color = BOSS_COLORS[variant];
        this.radius = 25;
        switch (variant) {
          case 'melee':     this.moveSpeed = 0.5+w*0.03; this.maxHP = 200+Math.pow(Math.max(0,w-1),2)*45; this.damage = 25+w*6;  this.shootCooldown=3.0; break;  // Reduced from 30+w*8
          case 'ranged':    this.moveSpeed = 0.4+w*0.02; this.maxHP = 150+Math.pow(Math.max(0,w-1),2)*38; this.damage = 18+w*5;  this.shootCooldown=2.5; break;  // Reduced from 22+w*6
          case 'tank':      this.moveSpeed = 0.3+w*0.02; this.maxHP = 300+Math.pow(Math.max(0,w-1),2)*60; this.damage = 30+w*7;  this.shootCooldown=4.0; break;  // Reduced from 38+w*9
          case 'speedy':    this.moveSpeed = 1.2+w*0.05; this.maxHP = 150+Math.pow(Math.max(0,w-1),2)*30; this.damage = 22+w*5;  this.shootCooldown=3.5; break;  // Reduced from 27+w*6
          case 'twins':     this.moveSpeed = 0.5+w*0.03; this.maxHP = (200+Math.pow(Math.max(0,w-1),2)*45)/2; this.damage = 22+w*5; this.shootCooldown=2.0; break;  // Reduced from 27+w*6
          case 'summoner':  this.moveSpeed = 0.4+w*0.02; this.maxHP = 180+Math.pow(Math.max(0,w-1),2)*38; this.damage = 15+w*4;  this.shootCooldown=5.0; break;  // Reduced from 18+w*5
          case 'berserker': this.moveSpeed = 0.4+w*0.02; this.maxHP = 220+Math.pow(Math.max(0,w-1),2)*42; this.damage = 28+w*6;  this.shootCooldown=3.0; break;  // Reduced from 33+w*8
          case 'explosive': this.moveSpeed = 0.7+w*0.04; this.maxHP = 180+Math.pow(Math.max(0,w-1),2)*40; this.damage = 35+w*7;  this.shootCooldown=3.5; break;  // Reduced from 45+w*10
        }
        this.hp = this.maxHP;
        this.xpValue = 200;
        this.coinValue = 5+w+Math.floor(Math.random()*(10+w*2));
        this.icon = '👑';
        const variantIcons = {melee:'⚔️',ranged:'🏹',tank:'🛡️',speedy:'⚡',twins:'👯',summoner:'🔮',berserker:'💢',explosive:'💥'};
        this.variantIcon = variantIcons[variant] || '';
        break;
      }
      case 'runner':
        this.moveSpeed=1.5+w*0.09; this.maxHP=10*w; this.damage=5; this.xpValue=15;
        this.coinValue=Math.max(1, 1+w) + Math.floor(Math.random()*(Math.max(1, 5+w)));
        this.color=ENEMY_COLORS.runner; this.radius=10; break;
      case 'tank':
        this.moveSpeed=0.4+w*0.02; this.maxHP=60*w; this.damage=15+w; this.xpValue=40;
        this.coinValue=Math.max(1, 1+w) + Math.floor(Math.random()*(Math.max(1, 5+w)));
        this.color=ENEMY_COLORS.tank; this.radius=16; break;
      case 'tiny':
        this.moveSpeed=0.7+w*0.05; this.maxHP=30*w; this.damage=5+w; this.xpValue=25;
        this.coinValue=Math.max(1, 1+w) + Math.floor(Math.random()*(Math.max(1, 5+w)));
        this.color=ENEMY_COLORS.tiny; this.radius=6; break;
      case 'giant':
        this.moveSpeed=0.7+w*0.05; this.maxHP=30*w; this.damage=5+w; this.xpValue=25;
        this.coinValue=Math.max(1, 1+w) + Math.floor(Math.random()*(Math.max(1, 5+w)));
        this.color=ENEMY_COLORS.giant; this.radius=18; break;
      case 'speedy':
        this.moveSpeed=0.9+w*0.05; this.maxHP=30*w; this.damage=5+w; this.xpValue=25;
        this.coinValue=Math.max(1, 1+w) + Math.floor(Math.random()*(Math.max(1, 5+w)));
        this.color=ENEMY_COLORS.speedy; this.radius=12; break;
      case 'gold':
        this.moveSpeed=3.5; this.maxHP=30+w*8; this.damage=8+w*2; this.xpValue=50+w*10;
        this.coinValue=5+w+Math.floor(Math.random()*(10+w*2));
        this.color=ENEMY_COLORS.gold; this.radius=12; this.icon='💰'; break;
      case 'healer':
        this.moveSpeed=0.5+w*0.03; this.maxHP=25*w; this.damage=4+w; this.xpValue=35;
        this.coinValue=Math.max(1, 1+w) + Math.floor(Math.random()*(Math.max(1, 5+w)));
        this.color=ENEMY_COLORS.healer; this.radius=11; break;
      case 'splitter':
        this.moveSpeed=0.6+w*0.04; this.maxHP=40*w; this.damage=6+w; this.xpValue=30;
        this.coinValue=Math.max(1, 1+w) + Math.floor(Math.random()*(Math.max(1, 5+w)));
        this.color=ENEMY_COLORS.splitter; this.radius=13; break;
      case 'teleporter':
        this.moveSpeed=0.5+w*0.03; this.maxHP=28*w; this.damage=8+w; this.xpValue=40;
        this.coinValue=Math.max(1, 1+w) + Math.floor(Math.random()*(Math.max(1, 5+w)));
        this.color=ENEMY_COLORS.teleporter; this.radius=11; this.shootCooldown=3.0; break;
      case 'shield':
        this.moveSpeed=0.5+w*0.03; this.maxHP=35*w; this.damage=6+w; this.xpValue=35;
        this.coinValue=Math.max(1, 1+w) + Math.floor(Math.random()*(Math.max(1, 5+w)));
        this.color=ENEMY_COLORS.shield; this.radius=12;
        this.hasShield=true; this.shieldHP=this.maxHP*0.5; break;
      case 'explosive':
        this.moveSpeed=0.8+w*0.05; this.maxHP=20*w; this.damage=8+w; this.xpValue=30;
        this.coinValue=Math.max(1, 1+w) + Math.floor(Math.random()*(Math.max(1, 5+w)));
        this.color=ENEMY_COLORS.explosive; this.radius=10; break;
      case 'charger':
        this.moveSpeed=0.4+w*0.03; this.maxHP=35*w; this.damage=9+w; this.xpValue=35;
        this.coinValue=Math.max(1, 1+w) + Math.floor(Math.random()*(Math.max(1, 5+w)));
        this.color=ENEMY_COLORS.charger; this.radius=13; this.shootCooldown=4.0;
        this.icon='🐃'; break;
      case 'sniper':
        this.moveSpeed=0.6+w*0.04; this.maxHP=22*w; this.damage=10+w; this.xpValue=40;
        this.coinValue=Math.max(1, 1+w) + Math.floor(Math.random()*(Math.max(1, 5+w)));
        this.color=ENEMY_COLORS.sniper; this.radius=10; this.shootCooldown=3.0;
        this.icon='🎯'; break;
      case 'swarm':
        this.moveSpeed=0.9+w*0.06; this.maxHP=8*w; this.damage=3+w; this.xpValue=10;
        this.coinValue=Math.max(1, 1+w) + Math.floor(Math.random()*(Math.max(1, 5+w)));
        this.color=ENEMY_COLORS.swarm; this.radius=7; this.icon='🐝'; break;
      case 'necromancer':
        this.moveSpeed=0.5+w*0.03; this.maxHP=30*w; this.damage=5+w; this.xpValue=50;
        this.coinValue=Math.max(1, 1+w) + Math.floor(Math.random()*(Math.max(1, 5+w)));
        this.color=ENEMY_COLORS.necromancer; this.radius=12; this.shootCooldown=8.0;
        this.icon='💀'; break;
      case 'mimic':
        this.moveSpeed=0.7+w*0.04; this.maxHP=28*w; this.damage=6+w; this.xpValue=35;
        this.coinValue=Math.max(1, 1+w) + Math.floor(Math.random()*(Math.max(1, 5+w)));
        this.color=ENEMY_COLORS.mimic; this.radius=12; this.icon='👤'; break;
      case 'berserker':
        this.moveSpeed=0.5+w*0.04; this.maxHP=40*w; this.damage=8+w; this.xpValue=40;
        this.coinValue=Math.max(1, 1+w) + Math.floor(Math.random()*(Math.max(1, 5+w)));
        this.color=ENEMY_COLORS.berserker; this.radius=13; this.icon='😡'; break;
      case 'freezer':
        this.moveSpeed=1.0+w*0.06; this.maxHP=26*w; this.damage=12+w*2; this.xpValue=35;
        this.coinValue=Math.max(1, 1+w) + Math.floor(Math.random()*(Math.max(1, 5+w)));
        this.color=ENEMY_COLORS.freezer; this.radius=11; this.icon='❄️'; break;
      case 'slime': {
        const sm = slimeSize;
        const sizeMult = (5 - sm) / 4.0;
        const speedMult = sm;
        this.moveSpeed=(0.8+w*0.05)*speedMult; this.maxHP=30*w*sizeMult; this.damage=(8+w)*sizeMult;
        this.xpValue=Math.floor(20*sizeMult);
        this.coinValue=Math.max(1,Math.floor((1+w/5)*sizeMult));
        this.color=ENEMY_COLORS.slime;
        this.radius=14*(5-sm)/4.0;
        this.icon='🟢'; break;
      }
      default: // normal
        this.moveSpeed=1.2+w*0.08; this.maxHP=30*w; this.damage=10+w*2; this.xpValue=25;
        this.coinValue=Math.max(1, 1+w) + Math.floor(Math.random()*(Math.max(1, 5+w)));
        this.color=ENEMY_COLORS.normal; this.radius=12; break;
    }
    this.hp = this.maxHP;
    this._baseSpeed = this.moveSpeed;
  }

  _spawnAtEdge() {
    const side = Math.floor(Math.random() * 4);
    switch (side) {
      case 0: this.x = Math.random() * W; this.y = -20; break;
      case 1: this.x = W + 20; this.y = Math.random() * H; break;
      case 2: this.x = Math.random() * W; this.y = H + 20; break;
      default: this.x = -20; this.y = Math.random() * H; break;
    }
  }

  takeDamage(amount) {
    if (this.hasShield && this.shieldHP > 0) {
      this.shieldHP -= amount;
      if (this.shieldHP <= 0) { this.hasShield = false; this.shieldHP = 0; }
      return;
    }
    this.hp -= amount;
    if (this.hp <= 0) { this.hp = 0; this.dead = true; }
  }

  update(dt, player, enemies, now) {
    if (this.dead) return;

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx*dx + dy*dy);

    // Enemy-to-enemy collision
    for (const other of enemies) {
      if (other === this || other.dead) continue;
      const odx = other.x - this.x;
      const ody = other.y - this.y;
      const odist = Math.sqrt(odx*odx + ody*ody);
      const minDist = this.radius + other.radius + 5;
      
      if (odist < minDist && odist > 0) {
        const pushForce = (minDist - odist) * 0.5;
        const pushX = (odx / odist) * pushForce;
        const pushY = (ody / odist) * pushForce;
        
        this.x -= pushX;
        this.y -= pushY;
        other.x += pushX;
        other.y += pushY;
      }
    }

    // Berserker gets faster as HP decreases (both regular and boss)
    if (this.type === 'berserker' || (this.isBoss && this.bossVariant === 'berserker')) {
      const hpPct = this.hp / this.maxHP;
      this.moveSpeed = this._baseSpeed * (1.0 + (1.0 - hpPct) * 1.5);
    }

    // Tank boss - slower but charges occasionally
    if (this.isBoss && this.bossVariant === 'tank') {
      // Charge attack every 4 seconds when close
      if (dist < 150 && now - this.lastShootTime > 4.0) {
        this.lastShootTime = now;
        // Charge toward player at 3x speed for 1 second
        this._charging = true;
        this._chargeEndTime = now + 1.0;
      }
      
      if (this._charging && now < this._chargeEndTime) {
        // Charging at player
        if (dist > 0) {
          const speedMult = (this._zoneSlow || 1.0) * 3.0;
          this.x += (dx / dist) * this.moveSpeed * speedMult;
          this.y += (dy / dist) * this.moveSpeed * speedMult;
        }
        return;
      } else if (this._charging) {
        this._charging = false;
      }
    }

    // Speedy boss - faster movement and occasional dash
    if (this.isBoss && this.bossVariant === 'speedy') {
      // Dash attack every 3 seconds
      if (dist < 200 && now - this.lastShootTime > 3.0) {
        this.lastShootTime = now;
        this._dashing = true;
        this._dashEndTime = now + 0.5;
      }
      
      if (this._dashing && now < this._dashEndTime) {
        // Dashing at player
        if (dist > 0) {
          const speedMult = (this._zoneSlow || 1.0) * 4.0;
          this.x += (dx / dist) * this.moveSpeed * speedMult;
          this.y += (dy / dist) * this.moveSpeed * speedMult;
        }
        return;
      } else if (this._dashing) {
        this._dashing = false;
      }
    }

    // Teleporter
    if (this.type === 'teleporter' && now - this.lastTeleportTime > this.shootCooldown) {
      this.lastTeleportTime = now;
      const angle = Math.random() * Math.PI * 2;
      const r = 80 + Math.random() * 80;
      this.x = Math.max(20, Math.min(W-20, player.x + Math.cos(angle) * r));
      this.y = Math.max(20, Math.min(H-20, player.y + Math.sin(angle) * r));
      return;
    }

    // Sniper - run away when close
    if (this.type === 'sniper' && dist < 150 && dist > 0) {
      this.x -= (dx / dist) * this.moveSpeed * 1.5;
      this.y -= (dy / dist) * this.moveSpeed * 1.5;
      return;
    }

    // Ranged boss - keep distance
    if (this.isBoss && this.bossVariant === 'ranged') {
      if (dist < 100 && dist > 0) {
        this.x += (dx / dist) * this.moveSpeed * 3.0;
        this.y += (dy / dist) * this.moveSpeed * 3.0;
      } else if (dist < 200 && dist > 0) {
        this.x -= (dx / dist) * this.moveSpeed;
        this.y -= (dy / dist) * this.moveSpeed;
      } else if (dist > 0) {
        this.x += (dx / dist) * this.moveSpeed * 0.5;
        this.y += (dy / dist) * this.moveSpeed * 0.5;
      }
      return;
    }

    // Default: move toward player
    if (dist > 0) {
      const speedMult = this._zoneSlow || 1.0;
      this._zoneSlow = 1.0; // reset each frame
      this.x += (dx / dist) * this.moveSpeed * speedMult;
      this.y += (dy / dist) * this.moveSpeed * speedMult;
    }

    // Keep in bounds
    this.x = Math.max(-30, Math.min(W+30, this.x));
    this.y = Math.max(-30, Math.min(H+30, this.y));
  }

  healNearby(enemies) {
    if (this.type !== 'healer' || this.dead) return;
    const now = Date.now() / 1000;
    if (now - this.lastHealTime < 2.0) return;
    this.lastHealTime = now;
    for (const e of enemies) {
      if (e === this || e.dead) continue;
      const dx = e.x - this.x; const dy = e.y - this.y;
      if (Math.sqrt(dx*dx+dy*dy) < 100) {
        e.hp = Math.min(e.maxHP, e.hp + e.maxHP * 0.05);
      }
    }
  }
}