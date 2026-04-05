// Player - direct conversion from Swift Player.swift
class Player {
  constructor(scene) {
    this.scene = scene;
    this.x = W / 2;
    this.y = H / 2;
    this.radius = 15;

    // Core stats matching Swift defaults
    this.maxHP = 100;
    this.hp = 100;
    this.damage = 25;
    this.moveSpeed = 4;
    this.attackSpeed = 2.0;
    this.attackCooldown = 0;
    this.projectileSpeed = 400;
    this.bulletSize = 1.0;
    this.critChance = 0.0;
    this.critDamage = 1.5;
    this.armor = 0;
    this.lifesteal = 0;
    this.dodgeChance = 0;
    this.piercing = 0;
    this.multishot = 0;
    this.bounceLevel = 0;
    this.xpBoost = 0;
    this.coinBoost = 0;
    this.healingOnKill = 0;
    this.regenerationRate = 0;
    this.chargedShotLevel = 0;
    this.dashLevel = 0;

    // Temp shop boosts (reset each run)
    this.tempDamageBoost = 0;
    this.tempFireRateBoost = 0;
    this.burstShotLevel = 0;

    // Progression
    this.xp = 0;
    this.level = 1;
    this.skillPoints = 0;
    this.coins = 0;

    // State
    this.invulnerableUntil = 0;
    this.dashCooldown = 0;
    this.isCharging = false;
    this.chargeTime = 0;
    this.regenAccum = 0;

    // Class info
    this._classKey = 'classless';
    this._fillColor = 0x808080;
    this._strokeColor = 0xffffff;

    // Graphics
    this.graphics = scene.add.graphics().setDepth(30);
    this.draw();
  }

  applyClass(classKey) {
    const cls = PLAYER_CLASSES[classKey];
    if (!cls) return;
    this._classKey = classKey;
    this._fillColor = cls.color;
    this._strokeColor = cls.stroke;
    const dmg = (cls.dmgMin + cls.dmgMax) / 2;
    this.maxHP = cls.hp;
    this.hp = cls.hp;
    this.damage = dmg;
    this.moveSpeed = cls.speed;
    this.attackSpeed = cls.atkSpd;
    this.critChance = cls.crit;
    this.draw();
  }

  draw() {
    const g = this.graphics;
    g.clear();

    // Invulnerability flash - matching Swift alpha = 0.5 + sin(time*20)*0.3
    const alpha = this.isInvulnerable() ? (0.5 + Math.sin(Date.now() / 50) * 0.3) : 1.0;

    // Player circle - blue fill, cyan stroke (matching Swift)
    g.lineStyle(2, this._strokeColor, alpha);
    g.fillStyle(this._fillColor, alpha);
    g.fillCircle(this.x, this.y, this.radius);
    g.strokeCircle(this.x, this.y, this.radius);

    // Charge indicator - yellow circle, 20 radius (matching Swift chargeIndicator)
    if (this.isCharging && this.chargedShotLevel > 0) {
      const prog = Math.min(this.chargeTime / 2.0, 1.0);
      const chargeRadius = 20 + prog * 10;
      g.lineStyle(3, 0xffff00, prog);
      g.strokeCircle(this.x, this.y, chargeRadius);
    }

    // Dash cooldown indicator
    if (this.dashLevel > 0 && this.dashCooldown > 0) {
      g.lineStyle(2, 0x00ccff, 0.4);
      g.strokeCircle(this.x, this.y, this.radius + 5);
    }
  }

  update(delta, keys, mouseX, mouseY, mouseDown) {
    const dt = delta / 1000;
    const spd = (this.moveSpeed * 60) * dt;

    let dx = 0, dy = 0;
    if (keys.W || keys.UP)    dy -= spd;
    if (keys.S || keys.DOWN)  dy += spd;
    if (keys.A || keys.LEFT)  dx -= spd;
    if (keys.D || keys.RIGHT) dx += spd;
    if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }

    // Apply zone speed modifiers matching Swift checkObstacleEffects()
    let speedMult = 1.0;
    if (this._inSlowZone)  speedMult = 0.5;   // water/quicksand/mud/snow/lava/corruption
    if (this._inIceZone)   speedMult = 1.5;   // ice = slippery, faster
    if (this._inWindZone)  speedMult = 1.5;   // wind = speed boost

    this.x = Math.max(this.radius, Math.min(W - this.radius, this.x + dx * speedMult));
    this.y = Math.max(this.radius, Math.min(H - this.radius, this.y + dy * speedMult));

    if (this.attackCooldown > 0) this.attackCooldown -= dt;
    if (this.dashCooldown > 0)   this.dashCooldown -= dt;

    // Regeneration
    if (this.regenerationRate > 0) {
      this.regenAccum += this.regenerationRate * dt;
      if (this.regenAccum >= 1) {
        const amt = Math.floor(this.regenAccum);
        this.hp = Math.min(this.maxHP, this.hp + amt);
        this.regenAccum -= amt;
      }
    }

    // Charge shot
    if (this.chargedShotLevel > 0) {
      if (mouseDown === 'right') {
        this.isCharging = true;
        this.chargeTime += dt;
      } else if (this.isCharging) {
        this.isCharging = false;
        this.chargeTime = 0;
      }
    }

    this.draw();
  }

  shoot(mouseX, mouseY) {
    if (this.attackCooldown > 0) return null;
    const baseAngle = Math.atan2(mouseY - this.y, mouseX - this.x);
    const isCrit = Math.random() < this.critChance;
    const baseDmg = this.damage + this.tempDamageBoost;
    const finalDmg = isCrit ? baseDmg * this.critDamage : baseDmg;
    const shots = 1 + this.multishot + this.burstShotLevel;
    const spread = 0.2;
    const projectiles = [];

    for (let i = 0; i < shots; i++) {
      const offset = (i - Math.floor(shots / 2)) * spread;
      projectiles.push({
        x: this.x, y: this.y,
        angle: baseAngle + offset,
        damage: finalDmg,
        isCrit,
        piercing: this.piercing,
        bounces: this.bounceLevel,
        size: this.bulletSize,
        speed: this.projectileSpeed
      });
    }

    const effectiveAtkSpd = this.attackSpeed + this.tempFireRateBoost;
    this.attackCooldown = 1.0 / effectiveAtkSpd;
    return projectiles;
  }

  releaseCharge(mouseX, mouseY) {
    if (!this.isCharging || this.chargedShotLevel === 0) return null;
    const mult = 1.0 + Math.min(this.chargeTime / 2.0, 1.0) * this.chargedShotLevel;
    const angle = Math.atan2(mouseY - this.y, mouseX - this.x);
    const baseDmg = this.damage + this.tempDamageBoost; // Include temp damage boost like regular shots
    this.isCharging = false;
    this.chargeTime = 0;
    return [{
      x: this.x, y: this.y,
      angle,
      damage: baseDmg * mult,
      isCrit: false,
      piercing: this.piercing + 2,
      bounces: 0,
      size: this.bulletSize * (1 + mult * 0.5),
      speed: this.projectileSpeed * 0.7,
      charged: true
    }];
  }

  takeDamage(amount) {
    if (this.isInvulnerable()) return false;
    if (Math.random() < this.dodgeChance) return 'dodge';
    const reduced = Math.max(1, amount - this.armor);
    this.hp -= reduced;
    if (this.hp < 0) this.hp = 0;
    this.invulnerableUntil = Date.now() + 1000;
    return reduced;
  }

  heal(amount) {
    this.hp = Math.min(this.maxHP, this.hp + amount);
  }

  addXP(amount) {
    const boosted = Math.floor(amount * (1 + this.xpBoost));
    this.xp += boosted;
    const needed = this.level * 100;
    if (this.xp >= needed) {
      this.xp -= needed;
      this.level++;
      this.skillPoints++;
      this.hp = this.maxHP;
      return true;
    }
    return false;
  }

  isInvulnerable() {
    return Date.now() < this.invulnerableUntil;
  }

  dash(keys) {
    if (this.dashLevel === 0 || this.dashCooldown > 0) return;
    const dist = 120 + this.dashLevel * 30;
    const cooldown = Math.max(1.5, 3.0 - this.dashLevel * 0.3);
    let dx = 0, dy = 0;
    if (keys.W || keys.UP)    dy -= 1;
    if (keys.S || keys.DOWN)  dy += 1;
    if (keys.A || keys.LEFT)  dx -= 1;
    if (keys.D || keys.RIGHT) dx += 1;
    if (dx === 0 && dy === 0) dx = 1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const startX = this.x, startY = this.y;
    this.x = Math.max(this.radius, Math.min(W - this.radius, this.x + (dx / len) * dist));
    this.y = Math.max(this.radius, Math.min(H - this.radius, this.y + (dy / len) * dist));
    this.dashCooldown = cooldown;
    this.invulnerableUntil = Date.now() + 150;

    // Dash VFX - afterimages matching Swift
    if (this.scene) {
      for (let i = 0; i < 5; i++) {
        const t = i / 5;
        const ax = startX + (this.x - startX) * t;
        const ay = startY + (this.y - startY) * t;
        const afterimage = this.scene.add.circle(ax, ay, 15, 0x4d99ff, 0.6).setDepth(19);
        afterimage.setStrokeStyle(2, 0x00ffff, 0.8);
        this.scene.tweens.add({
          targets: afterimage,
          alpha: 0,
          scale: 1.3,
          duration: 200,
          delay: i * 30,
          onComplete: () => afterimage.destroy()
        });
      }
    }
  }
}
