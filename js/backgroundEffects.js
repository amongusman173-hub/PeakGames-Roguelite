// Background Effects for visual atmosphere
class BackgroundEffects {
  static createAnimatedBackground(scene) {
    const W = scene.scale.width;
    const H = scene.scale.height;

    // Animated grid
    const gridGraphics = scene.add.graphics().setDepth(-10);
    scene.time.addEvent({
      delay: 50,
      callback: () => {
        if (!scene || !scene.sys || !scene.sys.isActive()) return;
        gridGraphics.clear();
        gridGraphics.lineStyle(1, 0x1a2a44, 0.3);
        const offset = (Date.now() / 50) % 50;
        for (let x = -offset; x < W; x += 50) {
          gridGraphics.lineBetween(x, 0, x, H);
        }
        for (let y = -offset; y < H; y += 50) {
          gridGraphics.lineBetween(0, y, W, y);
        }
      },
      loop: true
    });

    // Floating stars
    for (let i = 0; i < 60; i++) {
      const star = scene.add.circle(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H),
        Phaser.Math.FloatBetween(0.5, 2),
        0xffffff,
        Phaser.Math.FloatBetween(0.2, 0.8)
      ).setDepth(-9);

      scene.tweens.add({
        targets: star,
        alpha: Phaser.Math.FloatBetween(0.1, 0.9),
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000)
      });
    }

    // Floating particles
    for (let i = 0; i < 20; i++) {
      const particle = scene.add.circle(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H),
        4,
        0x4488ff,
        0.3
      ).setDepth(-8);

      const floatX = Phaser.Math.Between(-30, 30);
      const floatY = Phaser.Math.Between(20, 50);

      scene.tweens.add({
        targets: particle,
        x: particle.x + floatX,
        y: particle.y + floatY,
        alpha: 0.1,
        duration: 3000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    return { gridGraphics };
  }

  static createMenuBackground(scene) {
    const W = scene.scale.width;
    const H = scene.scale.height;

    // Gradient background
    const bg = scene.add.rectangle(W/2, H/2, W, H, 0x050810).setDepth(-20);

    // Animated stars
    for (let i = 0; i < 60; i++) {
      const star = scene.add.circle(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H),
        Phaser.Math.FloatBetween(1, 3),
        0xffffff,
        Phaser.Math.FloatBetween(0.3, 0.8)
      ).setDepth(-10);

      scene.tweens.add({
        targets: star,
        alpha: Phaser.Math.FloatBetween(0.2, 0.8),
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000)
      });
    }

    // Floating particles
    for (let i = 0; i < 15; i++) {
      const particle = scene.add.circle(
        Phaser.Math.Between(100, W - 100),
        Phaser.Math.Between(100, H - 100),
        4,
        0x4488ff,
        0.4
      ).setDepth(-5);

      scene.tweens.add({
        targets: particle,
        x: particle.x + Phaser.Math.Between(-30, 30),
        y: particle.y + Phaser.Math.Between(-30, 30),
        alpha: 0.1,
        duration: 3000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Decorative circles
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const radius = 350;
      const circle = scene.add.circle(
        W/2 + Math.cos(angle) * radius,
        H/2 + Math.sin(angle) * radius,
        15,
        0x3366aa,
        0.3
      ).setDepth(-8);
      circle.setStrokeStyle(2, 0x5588cc, 0.5);

      scene.tweens.add({
        targets: circle,
        scale: 1.3,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      scene.tweens.add({
        targets: circle,
        angle: 360,
        duration: 20000,
        repeat: -1
      });
    }

    return { bg };
  }

  static createWaveStartEffect(scene, wave) {
    const W = scene.scale.width;
    const H = scene.scale.height;

    // Flash
    const flash = scene.add.rectangle(W/2, H/2, W, H, 0xffffff, 0.3).setDepth(150);
    scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 300,
      onComplete: () => flash.destroy()
    });

    // Particles from edges
    for (let i = 0; i < 20; i++) {
      const side = Phaser.Math.Between(0, 3);
      let x, y, targetX, targetY;
      
      switch(side) {
        case 0: x = Phaser.Math.Between(0, W); y = 0; break;
        case 1: x = W; y = Phaser.Math.Between(0, H); break;
        case 2: x = Phaser.Math.Between(0, W); y = H; break;
        case 3: x = 0; y = Phaser.Math.Between(0, H); break;
      }
      
      targetX = W/2;
      targetY = H/2 - 60;

      const particle = scene.add.circle(x, y, 4, 0xffdd44, 0.8).setDepth(151);
      scene.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        scale: 0,
        alpha: 0,
        duration: 800,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }
}
