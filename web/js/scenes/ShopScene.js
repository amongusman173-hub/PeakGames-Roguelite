// ShopScene - direct conversion from Swift refreshShopUI()
class ShopScene extends Phaser.Scene {
  constructor() { super('ShopScene'); }

  init(data) {
    this.gameScene = data.gameScene || this.gameScene;
  }

  playSFX(key, vol = 0.3) { playSFX(this, key, vol); }

  create() {
    this._buildUI();
  }

  _buildUI() {
    // Clear all children and rebuild
    this.children.removeAll(true);

    const W = this.scale.width, H = this.scale.height;
    const gs = this.gameScene;
    const shop = gs.shop;
    const player = gs.player;

    if (shop.items.length === 0) shop.generate();

    this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.92);

    // Title
    this.add.text(W/2, 40, '🛒  SHOP  🛒', {
      fontSize:'48px', fontFamily:'Helvetica Neue, sans-serif', color:'#ffcc33', fontStyle:'bold',
      stroke:'#000000', strokeThickness:4
    }).setOrigin(0.5);

    // Coins display
    this.add.text(W/2, 85, 'Your Coins: 💰 '+player.coins, {
      fontSize:'24px', fontFamily:'Helvetica Neue, sans-serif', color:'#ffcc33', fontStyle:'bold'
    }).setOrigin(0.5);

    // Wave info
    this.add.text(W/2, 115, 'Wave '+gs.wave+' complete!  Next boss: Wave '+(Math.ceil(gs.wave/10)*10), {
      fontSize:'16px', fontFamily:'Helvetica Neue, sans-serif', color:'#aabbcc'
    }).setOrigin(0.5);

    // Items in 2 rows of 3 - centered properly
    const itemsPerRow = 3;
    const itemWidth = 200;
    const itemSpacing = 250;
    const startX = W/2 - (itemsPerRow - 1) * itemSpacing / 2;
    
    const positions = [
      {x:startX,y:230},{x:startX+itemSpacing,y:230},{x:startX+itemSpacing*2,y:230},
      {x:startX,y:385},{x:startX+itemSpacing,y:385},{x:startX+itemSpacing*2,y:385}
    ];

    const rarityColors = {
      common:    { fill:0x1a3350, stroke:0x999999 },
      rare:      { fill:0x1a2d66, stroke:0x4d80ff },
      epic:      { fill:0x4d1a66, stroke:0xb34dff },
      legendary: { fill:0x664d1a, stroke:0xffcc33 }
    };

    shop.items.forEach((item, idx) => {
      if (idx >= positions.length) return;
      const pos = positions[idx];
      const rc = rarityColors[item.rarity] || rarityColors.common;
      
      // Special styling for uncap items
      const isUncap = item.type && item.type.startsWith('uncap_');
      const finalColors = isUncap ? 
        { fill: 0x4d1a4d, stroke: 0xff44ff } : // Purple/magenta for uncaps
        rc;

      const g = this.add.graphics();
      g.lineStyle(3, finalColors.stroke, 1);
      g.fillStyle(finalColors.fill, 0.9);
      g.fillRoundedRect(pos.x-100, pos.y-65, 200, 130, 12);
      g.strokeRoundedRect(pos.x-100, pos.y-65, 200, 130, 12);
      
      // Add special glow for uncap items
      if (isUncap) {
        g.lineStyle(1, 0xff44ff, 0.3);
        g.strokeRoundedRect(pos.x-103, pos.y-68, 206, 136, 15);
      }

      const rarityLabel = { common:'COMMON', rare:'RARE', epic:'EPIC', legendary:'LEGENDARY' };
      const displayRarity = isUncap ? 'UNCAP' : (rarityLabel[item.rarity] || '');
      this.add.text(pos.x, pos.y-52, displayRarity, {
        fontSize:'11px', fontFamily:'Helvetica Neue, sans-serif',
        color:'#'+finalColors.stroke.toString(16).padStart(6,'0'), fontStyle:'bold'
      }).setOrigin(0.5);

      this.add.text(pos.x, pos.y-32, item.name, {
        fontSize:'18px', fontFamily:'Helvetica Neue, sans-serif', color:'#ffffff', fontStyle:'bold'
      }).setOrigin(0.5);
      this.add.text(pos.x, pos.y-10, item.desc, {
        fontSize:'13px', color:'#ccccdd', fontFamily:'Helvetica Neue, sans-serif'
      }).setOrigin(0.5);
      if (item.max < 99) {
        this.add.text(pos.x, pos.y+8, '('+item.cur+'/'+item.max+')', {
          fontSize:'12px', color:'#aaaaaa', fontFamily:'Helvetica Neue, sans-serif'
        }).setOrigin(0.5);
      }
      this.add.text(pos.x, pos.y+26, '💰 '+item.cost, {
        fontSize:'20px', fontFamily:'Helvetica Neue, sans-serif', color:'#ffcc33', fontStyle:'bold'
      }).setOrigin(0.5);

      const canAfford = player.coins >= item.cost;
      const buyBg = this.add.graphics();
      buyBg.lineStyle(2, canAfford ? 0x44ff44 : 0x666666, 1);
      buyBg.fillStyle(canAfford ? 0x1a4d1a : 0x333333, 0.8);
      buyBg.fillRoundedRect(pos.x-60, pos.y+45, 120, 30, 8);
      buyBg.strokeRoundedRect(pos.x-60, pos.y+45, 120, 30, 8);
      this.add.text(pos.x, pos.y+60, 'BUY', {
        fontSize:'16px', fontFamily:'Helvetica Neue, sans-serif', color:'#ffffff', fontStyle:'bold'
      }).setOrigin(0.5);

      if (canAfford) {
        const zone = this.add.zone(pos.x, pos.y+60, 120, 30).setInteractive({ useHandCursor: true });
        zone.on('pointerdown', () => {
          if (shop.buy(item.type, player)) {
            this.playSFX('shopbuy', 0.5);
            gs.saveRunState();
            
            // Enhanced purchase VFX
            // Coin burst VFX
            for (let i = 0; i < 20; i++) {
              const a = Math.random() * Math.PI * 2;
              const dist = 50 + Math.random() * 100;
              const p = this.add.circle(pos.x, pos.y, 6, 0xffcc33, 0.9).setDepth(150);
              this.tweens.add({
                targets: p,
                x: pos.x + Math.cos(a) * dist, 
                y: pos.y + Math.sin(a) * dist,
                scale: 0, alpha: 0, duration: 600 + Math.random() * 400,
                onComplete: () => p.destroy()
              });
            }
            
            // Success flash
            const flash = this.add.rectangle(pos.x, pos.y, 200, 130, 0x44ff44, 0.3).setDepth(140);
            this.tweens.add({
              targets: flash,
              alpha: 0,
              duration: 300,
              onComplete: () => flash.destroy()
            });
            
            // Floating text
            const upgradeText = this.add.text(pos.x, pos.y - 30, 'UPGRADED!', {
              fontSize: '18px', fontFamily: 'Helvetica Neue, sans-serif', 
              color: '#44ff44', fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(160);
            
            this.tweens.add({
              targets: upgradeText,
              y: pos.y - 80,
              alpha: 0,
              duration: 1000,
              onComplete: () => upgradeText.destroy()
            });
            
            // Rebuild UI in place (no scene.restart which loses gameScene ref)
            this._buildUI();
          }
        });
      }
    });

    // Reroll button
    const rerollCost = shop.getRerollCost();
    const canReroll = player.coins >= rerollCost;
    const rerollFill = canReroll ? 0x333366 : 0x222233;
    const rerollStroke = canReroll ? 0x8080cc : 0x444455;
    const { zone: rerollZone } = createButton(this, W/2, H-135, 220, 50, '🔄 REROLL  💰'+rerollCost, rerollFill, rerollStroke, 'reroll');
    if (canReroll) {
      rerollZone.on('pointerdown', () => {
        if (shop.reroll(player)) {
          this.playSFX('shopbuy', 0.3);
          gs.saveRunState();
          this._buildUI();
        }
      });
    }

    // Continue button
    const { zone: contZone } = createButton(this, W/2, H-60, 320, 65, 'CONTINUE →', 0x1a4d22, 0x33ff66, 'cont');
    contZone.on('pointerdown', () => {
      this.playSFX('buttonclick');
      gs.shop.items = [];
      stopMusic();
      this.scene.stop();
      this.scene.resume('GameScene');
      resumeGameplayMusic(gs);
      gs.nextWave();
    });
  }
}
