// Particle Effects System - Direct conversion from Swift SKEmitterNode
class ParticleEffects {
  // Muzzle flash VFX - converted from Player.swift shoot()
  static createShootEffect(scene, x, y, angle, isCrit = false) {
    const numParticles = isCrit ? 20 : 12;
    const color = isCrit ? 0xff4d4d : 0xffe666;
    
    // Muzzle flash particles
    for (let i = 0; i < numParticles; i++) {
      const particle = scene.add.circle(
        x + Math.cos(angle) * 18,
        y + Math.sin(angle) * 18,
        isCrit ? 8 : 5,
        color,
        1.0
      ).setDepth(50);
      
      const spreadAngle = angle + Phaser.Math.FloatBetween(-Math.PI/8, Math.PI/8);
      const speed = 120 + Phaser.Math.FloatBetween(-40, 40);
      
      scene.tweens.add({
        targets: particle,
        x: particle.x + Math.cos(spreadAngle) * speed * 0.12,
        y: particle.y + Math.sin(spreadAngle) * speed * 0.12,
        scale: 0,
        alpha: 0,
        duration: 120,
        onComplete: () => particle.destroy()
      });
    }
    
    // Shooting ring effect around player
    const shootRing = scene.add.circle(x, y, 18, 0x000000, 0).setDepth(49);
    shootRing.setStrokeStyle(isCrit ? 4 : 3, isCrit ? 0xff4d4d : 0xffe64d, 0.9);
    
    scene.tweens.add({
      targets: shootRing,
      scale: 2.2,
      alpha: 0,
      duration: 250,
      onComplete: () => shootRing.destroy()
    });
  }

  // Bullet trail VFX - converted from Player.swift
  static createProjectileTrail(scene, x, y, angle, isCrit = false) {
    const particle = scene.add.circle(
      x,
      y,
      3,
      isCrit ? 0xff3333 : 0xffe64d,
      isCrit ? 0.7 : 0.5
    ).setDepth(19);
    
    const backAngle = angle + Math.PI;
    const speed = 15 + Phaser.Math.FloatBetween(-8, 8);
    
    scene.tweens.add({
      targets: particle,
      x: x + Math.cos(backAngle) * speed * 0.25,
      y: y + Math.sin(backAngle) * speed * 0.25,
      scale: 0,
      alpha: 0,
      duration: 250,
      onComplete: () => particle.destroy()
    });
  }

  // Hit effect - converted from projectile collision in Swift
  static createHitEffect(scene, x, y, isCrit = false) {
    const color = isCrit ? 0xff4400 : 0xffff00;
    const count = isCrit ? 12 : 6;
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const particle = scene.add.circle(x, y, isCrit ? 4 : 3, color, 0.9).setDepth(26);
      scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * (isCrit ? 30 : 20),
        y: y + Math.sin(angle) * (isCrit ? 30 : 20),
        scale: 0,
        alpha: 0,
        duration: isCrit ? 400 : 300,
        onComplete: () => particle.destroy()
      });
    }

    // Impact flash
    const flash = scene.add.circle(x, y, isCrit ? 15 : 10, color, 0.6).setDepth(25);
    scene.tweens.add({
      targets: flash,
      scale: isCrit ? 2.5 : 1.8,
      alpha: 0,
      duration: 200,
      onComplete: () => flash.destroy()
    });
  }

  // Enemy spawn VFX - converted from Enemy.swift init
  static createEnemySpawnEffect(scene, x, y, radius, color, isBoss = false) {
    const numParticles = isBoss ? 50 : 30;
    
    // Spawn particles
    for (let i = 0; i < numParticles; i++) {
      const particle = scene.add.circle(
        x,
        y,
        isBoss ? 8 : 6,
        color,
        1.0
      ).setDepth(50);
      
      const angle = Math.random() * Math.PI * 2;
      const speed = (isBoss ? 150 : 100) + Phaser.Math.FloatBetween(-50, 50);
      
      scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed * 0.5,
        y: y + Math.sin(angle) * speed * 0.5,
        scale: 0,
        alpha: 0,
        duration: 500,
        onComplete: () => particle.destroy()
      });
    }
    
    // Spawn ring effect
    const spawnRing = scene.add.circle(x, y, radius, 0x000000, 0).setDepth(49);
    spawnRing.setStrokeStyle(isBoss ? 5 : 3, color, 0.8);
    
    scene.tweens.add({
      targets: spawnRing,
      scale: 3.0,
      alpha: 0,
      duration: 400,
      onComplete: () => spawnRing.destroy()
    });
  }

  // Enemy death effect - converted from Enemy death handling
  static createEnemyDeathEffect(scene, x, y, color, isBoss = false) {
    const count = isBoss ? 30 : 15;
    const radius = isBoss ? 60 : 30;

    // Burst particles
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Phaser.Math.Between(radius * 0.5, radius);
      const size = Phaser.Math.Between(isBoss ? 5 : 3, isBoss ? 10 : 6);
      const particle = scene.add.circle(x, y, size, color, 0.9).setDepth(26);
      
      scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        scale: 0,
        alpha: 0,
        duration: Phaser.Math.Between(400, 800),
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }

    // Flash
    const flash = scene.add.circle(x, y, radius * 0.8, color, 0.6).setDepth(25);
    scene.tweens.add({
      targets: flash,
      scale: 1.5,
      alpha: 0,
      duration: 400,
      onComplete: () => flash.destroy()
    });

    if (isBoss) {
      // Boss death ring
      const ring = scene.add.circle(x, y, 20, 0x000000, 0).setDepth(27);
      ring.setStrokeStyle(6, color, 0.9);
      scene.tweens.add({
        targets: ring,
        scale: 4,
        alpha: 0,
        duration: 800,
        ease: 'Power2',
        onComplete: () => ring.destroy()
      });
    }
  }

  // Explosion effect - for explosive enemies
  static createExplosionEffect(scene, x, y, radius = 80, color = 0xff6600) {
    // Expanding ring
    const ring = scene.add.circle(x, y, 10, 0x000000, 0).setDepth(27);
    ring.setStrokeStyle(4, color, 0.8);
    scene.tweens.add({
      targets: ring,
      scale: radius / 10,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => ring.destroy()
    });

    // Flash
    const flash = scene.add.circle(x, y, radius * 0.6, color, 0.7).setDepth(26);
    scene.tweens.add({
      targets: flash,
      scale: 1.5,
      alpha: 0,
      duration: 300,
      onComplete: () => flash.destroy()
    });

    // Particles
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Phaser.Math.Between(radius * 0.5, radius);
      const particle = scene.add.circle(x, y, Phaser.Math.Between(4, 8), color, 0.9).setDepth(26);
      scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        scale: 0,
        alpha: 0,
        duration: Phaser.Math.Between(400, 700),
        onComplete: () => particle.destroy()
      });
    }
  }

  // Level up effect - converted from Player.swift addXP()
  static createLevelUpEffect(scene, x, y) {
    const numParticles = 50;
    
    // Level up particles
    for (let i = 0; i < numParticles; i++) {
      const particle = scene.add.circle(
        x,
        y,
        Phaser.Math.Between(4, 8),
        0xffff44,
        1.0
      ).setDepth(28);
      
      const angle = Math.random() * Math.PI * 2;
      const speed = 150 + Phaser.Math.FloatBetween(-50, 50);
      
      scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        scale: 0,
        alpha: 0,
        duration: 1000,
        onComplete: () => particle.destroy()
      });
    }
    
    // Expanding rings
    for (let i = 0; i < 3; i++) {
      const ring = scene.add.circle(x, y, 20, 0x000000, 0).setDepth(28);
      ring.setStrokeStyle(3, 0xffff00, 0.8);
      scene.tweens.add({
        targets: ring,
        scale: 4,
        alpha: 0,
        duration: 1000,
        delay: i * 200,
        ease: 'Power2',
        onComplete: () => ring.destroy()
      });
    }

    // Star burst
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 * i) / 16;
      const star = scene.add.circle(x, y, 4, 0xffff44, 1).setDepth(28);
      scene.tweens.add({
        targets: star,
        x: x + Math.cos(angle) * 60,
        y: y + Math.sin(angle) * 60,
        scale: 0,
        alpha: 0,
        duration: 800,
        ease: 'Power2',
        onComplete: () => star.destroy()
      });
    }

    // Central glow
    const glow = scene.add.circle(x, y, 30, 0xffff00, 0.7).setDepth(27);
    scene.tweens.add({
      targets: glow,
      scale: 2,
      alpha: 0,
      duration: 600,
      onComplete: () => glow.destroy()
    });
  }

  // Coin collection effect
  static createCoinCollectEffect(scene, x, y) {
    // Sparkles
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const sparkle = scene.add.circle(x, y, 3, 0xffdd00, 1).setDepth(28);
      scene.tweens.add({
        targets: sparkle,
        x: x + Math.cos(angle) * 20,
        y: y + Math.sin(angle) * 20,
        scale: 0,
        alpha: 0,
        duration: 400,
        onComplete: () => sparkle.destroy()
      });
    }

    // Glow
    const glow = scene.add.circle(x, y, 12, 0xffdd00, 0.6).setDepth(27);
    scene.tweens.add({
      targets: glow,
      scale: 2,
      alpha: 0,
      duration: 300,
      onComplete: () => glow.destroy()
    });
  }

  // Skill upgrade effect - converted from SkillTree.swift
  static createSkillUpgradeEffect(scene, x, y, isSpecial = false) {
    const color = isSpecial ? 0xffaa00 : 0x44ff44;
    const count = isSpecial ? 30 : 20;

    // Burst particles
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Phaser.Math.Between(50, 120);
      const size = Phaser.Math.Between(2, 4);
      const particle = scene.add.circle(x, y, size, color, 1).setDepth(100);
      
      scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        scale: 0,
        alpha: 0,
        duration: Phaser.Math.Between(500, 1000),
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }

    // Expanding ring
    const ring = scene.add.circle(x, y, 40, 0x000000, 0).setDepth(99);
    ring.setStrokeStyle(4, color, 0.8);
    scene.tweens.add({
      targets: ring,
      scale: 2.5,
      alpha: 0,
      duration: 600,
      onComplete: () => ring.destroy()
    });

    // Flash
    const flash = scene.add.circle(x, y, 45, color, 0.6).setDepth(98);
    scene.tweens.add({
      targets: flash,
      scale: 1.5,
      alpha: 0,
      duration: 150,
      onComplete: () => flash.destroy()
    });
  }

  // Dash effect - converted from Player.swift dash()
  static createDashEffect(scene, startX, startY, endX, endY) {
    // Trail particles
    const steps = 8;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const x = startX + (endX - startX) * t;
      const y = startY + (endY - startY) * t;
      const trail = scene.add.circle(x, y, 8, 0x00ccff, 0.6).setDepth(19);
      
      scene.tweens.add({
        targets: trail,
        scale: 0,
        alpha: 0,
        duration: 400,
        delay: i * 30,
        onComplete: () => trail.destroy()
      });
    }
  }

  // Player damage effect - converted from Player.swift takeDamage()
  static createPlayerDamageEffect(scene, x, y, damage) {
    const numParticles = 20;
    
    // Blood/impact particles
    for (let i = 0; i < numParticles; i++) {
      const particle = scene.add.circle(
        x,
        y,
        Phaser.Math.Between(3, 6),
        0xff3333,
        0.8
      ).setDepth(99);
      
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Phaser.Math.FloatBetween(-30, 30);
      
      scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed * 0.5,
        y: y + Math.sin(angle) * speed * 0.5,
        scale: 0,
        alpha: 0,
        duration: 500,
        onComplete: () => particle.destroy()
      });
    }
  }

  // Screen shake effect
  static screenShake(scene, intensity = 5, duration = 200) {
    if (scene.cameras && scene.cameras.main) {
      scene.cameras.main.shake(duration, intensity / 1000);
    }
  }
}
