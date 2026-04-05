// Shop - direct conversion from Swift GameScene.swift generateShopItems()
class Shop {
  constructor() {
    this.items = [];
    this.rerollCount = 0;
    // Purchase counters matching Swift
    this.purchases = {
      damage:0, health:0, speed:0, firerate:0, burst:0,
      critchance:0, critdamage:0, lifesteal:0, armor:0,
      projectilesize:0, dodge:0, regen:0, xpboost:0,
      coinboost:0, piercing:0, bounce:0
    };
    // Uncap levels - how many times each stat has been uncapped
    this.uncaps = {
      damage:0, health:0, speed:0, firerate:0, burst:0,
      critchance:0, critdamage:0, lifesteal:0, armor:0,
      projectilesize:0, dodge:0, regen:0, xpboost:0,
      coinboost:0, piercing:0, bounce:0
    };
  }

  generate() {
    const p = this.purchases;
    const u = this.uncaps;
    
    // Calculate max levels (base + uncaps * 5)
    const getMaxLevel = (type) => {
      const baseLimits = {
        damage:5, health:5, speed:4, firerate:4, burst:3,
        critchance:5, critdamage:4, lifesteal:3, armor:4,
        projectilesize:3, dodge:3, regen:3, xpboost:4,
        coinboost:4, piercing:3, bounce:4
      };
      return baseLimits[type] + (u[type] * 5);
    };
    
    // All items matching Swift generateShopItems() exactly
    const all = [
      // Common
      { name:'Damage Boost',    desc:`+${10+p.damage*5} Damage`,          cost:30+p.damage*20,    type:'damage',        max:getMaxLevel('damage'),  cur:p.damage,        rarity:'common' },
      { name:'Health Boost',    desc:`+${50+p.health*25} Max HP`,          cost:25+p.health*15,    type:'health',        max:getMaxLevel('health'),  cur:p.health,        rarity:'common' },
      { name:'Speed Boost',     desc:`+${(1.0+p.speed*0.5).toFixed(1)} Speed`, cost:20+p.speed*15, type:'speed',         max:getMaxLevel('speed'),   cur:p.speed,         rarity:'common' },
      { name:'Skill Point',     desc:'+1 Skill Point',                     cost:100,               type:'skillpoint',    max:99, cur:0,               rarity:'common' },
      { name:'Heal',            desc:'Restore 50% HP',                     cost:40,                type:'heal',          max:99, cur:0,               rarity:'common' },
      // Rare
      { name:'Fire Rate Up',    desc:`+${(0.5+p.firerate*0.3).toFixed(1)} Atk Speed`, cost:35+p.firerate*20, type:'firerate', max:getMaxLevel('firerate'), cur:p.firerate, rarity:'rare' },
      { name:'Projectile Size', desc:'+20% Bullet Size',                   cost:45+p.projectilesize*25, type:'projectilesize', max:getMaxLevel('projectilesize'), cur:p.projectilesize, rarity:'rare' },
      { name:'Armor',           desc:'+10% Damage Reduction',              cost:50+p.armor*25,     type:'armor',         max:getMaxLevel('armor'),   cur:p.armor,         rarity:'rare' },
      { name:'XP Boost',        desc:'+15% XP Gain',                       cost:60+p.xpboost*30,   type:'xpboost',       max:getMaxLevel('xpboost'), cur:p.xpboost,       rarity:'rare' },
      { name:'Coin Boost',      desc:'+15% Coin Gain',                     cost:60+p.coinboost*30, type:'coinboost',     max:getMaxLevel('coinboost'), cur:p.coinboost,   rarity:'rare' },
      { name:'Piercing Shot',   desc:'+1 Enemy Pierce',                    cost:80+p.piercing*40,  type:'piercing',      max:getMaxLevel('piercing'), cur:p.piercing,     rarity:'rare' },
      { name:'Bounce Shot',     desc:'+1 Bullet Bounce',                   cost:70+p.bounce*35,    type:'bounce',        max:getMaxLevel('bounce'),  cur:p.bounce,        rarity:'rare' },
      // Epic
      { name:'Crit Chance',     desc:'+10% Crit Chance',                   cost:60+p.critchance*30, type:'critchance',   max:getMaxLevel('critchance'), cur:p.critchance,  rarity:'epic' },
      { name:'Crit Damage',     desc:'+50% Crit Damage',                   cost:70+p.critdamage*35, type:'critdamage',   max:getMaxLevel('critdamage'), cur:p.critdamage,  rarity:'epic' },
      { name:'Lifesteal',       desc:'+5% Lifesteal',                      cost:80+p.lifesteal*40, type:'lifesteal',     max:getMaxLevel('lifesteal'), cur:p.lifesteal,   rarity:'epic' },
      { name:'Dodge Chance',    desc:'+8% Dodge Chance',                   cost:90+p.dodge*45,     type:'dodge',         max:getMaxLevel('dodge'),   cur:p.dodge,         rarity:'epic' },
      { name:'Regeneration',    desc:'+2 HP per second',                   cost:70+p.regen*35,     type:'regen',         max:getMaxLevel('regen'),   cur:p.regen,         rarity:'epic' },
      // Legendary
      { name:'Burst Shot',      desc:'+1 Extra Shot',                      cost:100+p.burst*50,    type:'burst',         max:getMaxLevel('burst'),   cur:p.burst,         rarity:'legendary' }
    ];

    // Add uncap options for maxed items
    const uncapItems = [];
    Object.keys(p).forEach(type => {
      const baseLimits = {
        damage:5, health:5, speed:4, firerate:4, burst:3,
        critchance:5, critdamage:4, lifesteal:3, armor:4,
        projectilesize:3, dodge:3, regen:3, xpboost:4,
        coinboost:4, piercing:3, bounce:4
      };
      if (p[type] >= baseLimits[type] + (u[type] * 5)) {
        const uncapCost = 500 + (u[type] * 300);
        const names = {
          damage:'Damage Uncap', health:'Health Uncap', speed:'Speed Uncap',
          firerate:'Fire Rate Uncap', burst:'Burst Uncap', critchance:'Crit Chance Uncap',
          critdamage:'Crit Damage Uncap', lifesteal:'Lifesteal Uncap', armor:'Armor Uncap',
          projectilesize:'Bullet Size Uncap', dodge:'Dodge Uncap', regen:'Regen Uncap',
          xpboost:'XP Boost Uncap', coinboost:'Coin Boost Uncap', piercing:'Piercing Uncap',
          bounce:'Bounce Uncap'
        };
        uncapItems.push({
          name: names[type] || (type + ' Uncap'),
          desc: `+5 Max Upgrades (${u[type] + 1}x)`,
          cost: uncapCost,
          type: 'uncap_' + type,
          max: 99,
          cur: u[type],
          rarity: 'legendary'
        });
      }
    });

    // Filter maxed items (but include uncaps)
    const available = [...all.filter(i => i.cur < i.max), ...uncapItems];

    // Weighted random selection matching Swift
    const weights = { common:50, rare:30, epic:15, legendary:5 };
    const selected = [];
    const pool = [...available];

    for (let i = 0; i < Math.min(6, pool.length); i++) {
      const totalW = pool.reduce((s, item) => s + (weights[item.rarity] || 10), 0);
      let rand = Math.random() * totalW;
      let idx = 0;
      for (let j = 0; j < pool.length; j++) {
        rand -= (weights[pool[j].rarity] || 10);
        if (rand <= 0) { idx = j; break; }
      }
      selected.push(pool[idx]);
      pool.splice(idx, 1);
    }

    this.items = selected;
    this.rerollCount = 0;
  }

  buy(type, player) {
    const p = this.purchases;
    const u = this.uncaps;
    
    // Calculate max levels (base + uncaps * 5)
    const getMaxLevel = (statType) => {
      const baseLimits = {
        damage:5, health:5, speed:4, firerate:4, burst:3,
        critchance:5, critdamage:4, lifesteal:3, armor:4,
        projectilesize:3, dodge:3, regen:3, xpboost:4,
        coinboost:4, piercing:3, bounce:4
      };
      return baseLimits[statType] + (u[statType] * 5);
    };
    
    // Handle uncap purchases
    if (type.startsWith('uncap_')) {
      const statType = type.replace('uncap_', '');
      const cost = 500 + (u[statType] * 300);
      if (player.coins >= cost) {
        player.coins -= cost;
        u[statType]++;
        return true;
      }
      return false;
    }
    
    // Check if upgrade is at max level (except for consumables)
    const consumables = ['heal', 'skillpoint'];
    if (!consumables.includes(type) && p[type] >= getMaxLevel(type)) {
      return false; // Already at max level
    }
    
    switch (type) {
      case 'damage':        if (player.coins >= 30+p.damage*20)        { player.tempDamageBoost += 10+p.damage*5;   player.coins -= 30+p.damage*20;   p.damage++;        return true; } break;
      case 'health':        if (player.coins >= 25+p.health*15)        { player.maxHP += 50+p.health*25; player.hp += 50+p.health*25; player.coins -= 25+p.health*15; p.health++; return true; } break;
      case 'speed':         if (player.coins >= 20+p.speed*15)         { player.moveSpeed += 1.0+p.speed*0.5;      player.coins -= 20+p.speed*15;    p.speed++;         return true; } break;
      case 'firerate':      if (player.coins >= 35+p.firerate*20)      { player.tempFireRateBoost += 0.5+p.firerate*0.3; player.coins -= 35+p.firerate*20; p.firerate++; return true; } break;
      case 'burst':         if (player.coins >= 100+p.burst*50)        { player.burstShotLevel++;                   player.coins -= 100+p.burst*50;   p.burst++;         return true; } break;
      case 'critchance':    if (player.coins >= 60+p.critchance*30)    { player.critChance += 0.10;                 player.coins -= 60+p.critchance*30; p.critchance++;  return true; } break;
      case 'critdamage':    if (player.coins >= 70+p.critdamage*35)    { player.critDamage += 0.50;                 player.coins -= 70+p.critdamage*35; p.critdamage++;  return true; } break;
      case 'lifesteal':     if (player.coins >= 80+p.lifesteal*40)     { player.lifesteal += 0.05;                  player.coins -= 80+p.lifesteal*40;  p.lifesteal++;   return true; } break;
      case 'armor':         if (player.coins >= 50+p.armor*25)         { player.armor += 0.10;                      player.coins -= 50+p.armor*25;     p.armor++;         return true; } break;
      case 'projectilesize':if (player.coins >= 45+p.projectilesize*25){ player.bulletSize += 0.20;                 player.coins -= 45+p.projectilesize*25; p.projectilesize++; return true; } break;
      case 'dodge':         if (player.coins >= 90+p.dodge*45)         { player.dodgeChance += 0.08;                player.coins -= 90+p.dodge*45;     p.dodge++;         return true; } break;
      case 'regen':         if (player.coins >= 70+p.regen*35)         { player.regenerationRate += 2;              player.coins -= 70+p.regen*35;     p.regen++;         return true; } break;
      case 'xpboost':       if (player.coins >= 60+p.xpboost*30)       { player.xpBoost += 0.15;                    player.coins -= 60+p.xpboost*30;   p.xpboost++;       return true; } break;
      case 'coinboost':     if (player.coins >= 60+p.coinboost*30)     { player.coinBoost += 0.15;                  player.coins -= 60+p.coinboost*30;  p.coinboost++;    return true; } break;
      case 'piercing':      if (player.coins >= 80+p.piercing*40)      { player.piercing++;                         player.coins -= 80+p.piercing*40;  p.piercing++;      return true; } break;
      case 'bounce':        if (player.coins >= 70+p.bounce*35)        { player.bounceLevel++;                      player.coins -= 70+p.bounce*35;    p.bounce++;        return true; } break;
      case 'heal':          if (player.coins >= 40)                    { player.heal(player.maxHP * 0.5);           player.coins -= 40;                                   return true; } break;
      case 'skillpoint':    if (player.coins >= 100)                   { player.skillPoints++;                      player.coins -= 100; saveData('savedSkillPoints', player.skillPoints); return true; } break;
    }
    return false;
  }

  reroll(player) {
    const cost = 50 + this.rerollCount * 25;
    if (player.coins < cost) return false;
    player.coins -= cost;
    this.rerollCount++;
    this.generate();
    return true;
  }

  getRerollCost() {
    return 50 + this.rerollCount * 25;
  }
}
