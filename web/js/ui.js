// Shared UI helpers - matching Swift visual style exactly

function createButton(scene, x, y, w, h, text, fillColor, strokeColor, name) {
  const bg = scene.add.graphics();
  bg.lineStyle(3, strokeColor, 1);
  bg.fillStyle(fillColor, 0.85);
  bg.fillRoundedRect(x - w/2, y - h/2, w, h, 12);
  bg.strokeRoundedRect(x - w/2, y - h/2, w, h, 12);

  const label = scene.add.text(x, y, text, {
    fontSize: '20px', fontFamily: 'Helvetica Neue, sans-serif',
    color: '#ffffff', fontStyle: 'bold'
  }).setOrigin(0.5);

  const zone = scene.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });
  zone.name = name;

  zone.on('pointerover', () => {
    bg.clear();
    bg.lineStyle(3, strokeColor, 1);
    bg.fillStyle(fillColor, 1.0);
    bg.fillRoundedRect(x - w/2, y - h/2, w, h, 12);
    bg.strokeRoundedRect(x - w/2, y - h/2, w, h, 12);
    label.setScale(1.05);
  });
  zone.on('pointerout', () => {
    bg.clear();
    bg.lineStyle(3, strokeColor, 1);
    bg.fillStyle(fillColor, 0.85);
    bg.fillRoundedRect(x - w/2, y - h/2, w, h, 12);
    bg.strokeRoundedRect(x - w/2, y - h/2, w, h, 12);
    label.setScale(1.0);
  });
  zone.on('pointerdown', () => {
    bg.clear();
    bg.lineStyle(3, strokeColor, 1);
    bg.fillStyle(fillColor, 0.6);
    bg.fillRoundedRect(x - w/2, y - h/2, w, h, 12);
    bg.strokeRoundedRect(x - w/2, y - h/2, w, h, 12);
    label.setScale(0.95);
  });
  zone.on('pointerup', () => {
    bg.clear();
    bg.lineStyle(3, strokeColor, 1);
    bg.fillStyle(fillColor, 1.0);
    bg.fillRoundedRect(x - w/2, y - h/2, w, h, 12);
    bg.strokeRoundedRect(x - w/2, y - h/2, w, h, 12);
    label.setScale(1.0);
  });

  return { bg, label, zone };
}

function drawHealthBar(graphics, x, y, w, h, current, max, color = 0x00ff44) {
  graphics.fillStyle(0x222222, 0.8);
  graphics.fillRect(x, y, w, h);
  const ratio = Math.max(0, current / max);
  // Color changes based on HP like Swift
  let barColor = color;
  if (color === 0x44ff44 || color === 0x00ff44) {
    if (ratio > 0.5)       barColor = 0x33cc33;
    else if (ratio > 0.25) barColor = 0xe6b200;
    else                   barColor = 0xe63333;
  }
  graphics.fillStyle(barColor, 1);
  graphics.fillRect(x, y, w * ratio, h);
  graphics.lineStyle(1, 0x444444, 1);
  graphics.strokeRect(x, y, w, h);
}

// Floating text matching Swift SKLabelNode animations
function floatingText(scene, x, y, text, color = '#ffffff', size = '18px') {
  const t = scene.add.text(x, y, text, {
    fontSize: size, fontFamily: 'Helvetica Neue, sans-serif',
    color, fontStyle: 'bold',
    stroke: '#000000', strokeThickness: 3
  }).setOrigin(0.5).setDepth(200);

  scene.tweens.add({
    targets: t,
    y: y - 40,
    alpha: 0,
    duration: 900,
    ease: 'Power2',
    onComplete: () => t.destroy()
  });
}

// Animated background particles matching Swift showStartMenu()
function createMenuBackground(scene) {
  const GW = scene.scale.width, GH = scene.scale.height;

  // Deep blue/purple background matching Swift
  scene.add.rectangle(GW/2, GH/2, GW, GH, 0x0d1426).setDepth(-20);

  // 30 animated stars matching Swift
  for (let i = 0; i < 30; i++) {
    const r = Phaser.Math.FloatBetween(1, 3);
    const alpha = Phaser.Math.FloatBetween(0.3, 0.8);
    const star = scene.add.circle(
      Math.random() * GW, Math.random() * GH, r, 0xffffff, alpha
    ).setDepth(-10);
    scene.tweens.add({
      targets: star,
      alpha: 0.2,
      duration: Phaser.Math.Between(1000, 3000),
      yoyo: true, repeat: -1,
      delay: Math.random() * 2000
    });
  }

  // 15 floating blue particles matching Swift
  for (let i = 0; i < 15; i++) {
    const p = scene.add.circle(
      Phaser.Math.Between(100, GW-100),
      Phaser.Math.Between(100, GH-100),
      4, 0x66b3ff, 0.4
    ).setDepth(-5);
    scene.tweens.add({
      targets: p,
      x: p.x + Phaser.Math.Between(-30, 30),
      y: p.y + Phaser.Math.Between(20, 50),
      alpha: 0.1,
      duration: 3000,
      yoyo: true, repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  // 8 decorative circles matching Swift
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const radius = 350;
    const cx = GW/2 + Math.cos(angle) * radius;
    const cy = GH/2 + Math.sin(angle) * radius;
    const circle = scene.add.circle(cx, cy, 15, 0x4d80cc, 0.3).setDepth(-8);
    circle.setStrokeStyle(2, 0x80b3ff, 0.5);
    scene.tweens.add({ targets: circle, scale: 1.3, duration: 2000, yoyo: true, repeat: -1 });
  }
}

// Animated game background matching Swift biome backgrounds
function createGameBackground(scene, biomeIndex = 0) {
  const biome = BIOMES[biomeIndex] || BIOMES[0];
  scene.add.rectangle(W/2, H/2, W, H, biome.bg).setDepth(-20);

  // Animated grid
  const grid = scene.add.graphics().setDepth(-15);
  scene.time.addEvent({
    delay: 50,
    callback: () => {
      if (!scene.sys || !scene.sys.isActive()) return;
      grid.clear();
      grid.lineStyle(1, 0x000000, 0.15);
      const off = (Date.now() / 50) % 50;
      for (let x = -off; x < W; x += 50) grid.lineBetween(x, 0, x, H);
      for (let y = -off; y < H; y += 50) grid.lineBetween(0, y, W, y);
    },
    loop: true
  });

  // Biome ambient particles
  spawnBiomeAmbient(scene, biomeIndex);
}

function spawnBiomeAmbient(scene, biomeIndex) {
  // Matching Swift spawnAmbientBiomeVFX()
  const spawnAmbient = () => {
    if (!scene.sys || !scene.sys.isActive()) return;
    if (Math.random() > 0.03) return; // ~3% chance per tick

    const rx = Phaser.Math.Between(100, W-100);
    const ry = Phaser.Math.Between(100, H-100);

    switch (biomeIndex) {
      case 2: { // Ice - snowflakes
        const flake = scene.add.circle(rx, 0, 3, 0xf2f9ff, 0.8).setDepth(-5);
        scene.tweens.add({
          targets: flake,
          x: flake.x + Phaser.Math.Between(-30, 30),
          y: H + 20,
          alpha: 0,
          duration: 8000,
          onComplete: () => flake.destroy()
        });
        break;
      }
      case 3: { // Lava - embers
        const ember = scene.add.circle(rx, H-20, 2, 0xff6600, 0.9).setDepth(-5);
        scene.tweens.add({
          targets: ember,
          x: ember.x + Phaser.Math.Between(-20, 20),
          y: -20,
          alpha: 0,
          duration: 6000,
          onComplete: () => ember.destroy()
        });
        break;
      }
      case 6: { // Crystal - sparkles
        const sparkle = scene.add.circle(rx, ry, 2, 0xb366ff, 0.9).setDepth(-5);
        scene.tweens.add({
          targets: sparkle,
          x: sparkle.x + Phaser.Math.Between(-40, 40),
          y: sparkle.y + Phaser.Math.Between(-40, 40),
          alpha: 0,
          scale: 0,
          duration: 3000,
          onComplete: () => sparkle.destroy()
        });
        break;
      }
      case 7: { // Void - wisps
        const wisp = scene.add.circle(rx, ry, 4, 0x330066, 0.7).setDepth(-5);
        scene.tweens.add({
          targets: wisp,
          x: wisp.x + Phaser.Math.Between(-60, 60),
          y: wisp.y + Phaser.Math.Between(-60, 60),
          alpha: 0,
          duration: 4000,
          yoyo: false,
          onComplete: () => wisp.destroy()
        });
        break;
      }
    }
  };

  scene.time.addEvent({ delay: 100, callback: spawnAmbient, loop: true });
}
