// Game constants - converted from Swift GameScene
const W = 1280;
const H = 800;

// Boss variants matching Swift BossVariant enum
const BOSS_VARIANTS = ['melee','ranged','tank','speedy','twins','summoner','berserker','explosive'];

// Boss colors matching Swift exactly
const BOSS_COLORS = {
  melee:    0xcc00cc,  // Purple  (0.8,0,0.8)
  ranged:   0xff3333,  // Red     (1,0.2,0.2)
  tank:     0x996633,  // Brown   (0.6,0.4,0.2)
  speedy:   0x33cccc,  // Cyan    (0.2,0.8,0.8)
  twins:    0xff66cc,  // Pink    (1,0.4,0.8)
  summoner: 0x33cc33,  // Green   (0.2,0.8,0.2)
  berserker:0xff8800,  // Orange  (1,0.5,0)
  explosive:0xffff00   // Yellow  (1,1,0)
};

// Enemy colors matching Swift exactly
const ENEMY_COLORS = {
  normal:      0xff0000,  // Red
  runner:      0x00cccc,  // Cyan    (0,0.8,0.8)
  tank:        0x994d00,  // Brown   (0.6,0.3,0)
  tiny:        0xff8080,  // Light red (1,0.5,0.5)
  giant:       0xcc3333,  // Dark red (0.8,0.2,0.2)
  speedy:      0xffcc00,  // Yellow  (1,0.8,0)
  gold:        0xffd700,  // Gold    (1,0.84,0)
  healer:      0x66ff66,  // Bright green (0.4,1,0.4)
  splitter:    0x9933cc,  // Purple  (0.6,0.2,0.8)
  teleporter:  0x8050ff,  // Blue-purple (0.5,0.3,1)
  shield:      0x4d80e6,  // Blue    (0.3,0.5,0.9)
  explosive:   0xff4d00,  // Orange-red (1,0.3,0)
  charger:     0xe61a1a,  // Dark red (0.9,0.1,0.1)
  sniper:      0x333333,  // Dark gray (0.2,0.2,0.2)
  swarm:       0xcc9933,  // Orange-brown (0.8,0.6,0.2)
  necromancer: 0x330066,  // Dark purple (0.2,0,0.4)
  mimic:       0x808080,  // Gray    (0.5,0.5,0.5)
  berserker:   0xcc0000,  // Blood red (0.8,0,0)
  freezer:     0x66b3ff,  // Ice blue (0.4,0.7,1)
  slime:       0x33cc4d   // Green   (0.2,0.8,0.3)
};

// Player class colors matching Swift applyClass()
const CLASS_COLORS = {
  classless:   { fill: 0x808080, stroke: 0xffffff },
  warrior:     { fill: 0x0000ff, stroke: 0x00ffff },
  gambler:     { fill: 0x999900, stroke: 0xffff00 },
  assassin:    { fill: 0x1a1a1a, stroke: 0xffffff },
  tank:        { fill: 0x4d804d, stroke: 0x00ff00 },
  mage:        { fill: 0x6633cc, stroke: 0x800080 },
  ranger:      { fill: 0x339933, stroke: 0x00ff00 },
  necromancer: { fill: 0x4d1a4d, stroke: 0x993399 },
  berserker:   { fill: 0x991a1a, stroke: 0xff0000 }
};

// Player classes matching Swift PlayerClass.swift exactly
const PLAYER_CLASSES = {
  classless:   { name:'Classless',   icon:'👤', desc:'No class - basic stats',          hp:80,  dmgMin:15, dmgMax:20, speed:4,   atkSpd:2.0, crit:0.00, unlockCost:0,  color:0x808080, stroke:0xffffff },
  warrior:     { name:'Warrior',     icon:'⚔️', desc:'Balanced fighter',                hp:100, dmgMin:20, dmgMax:30, speed:4,   atkSpd:2.0, crit:0.00, unlockCost:5,  color:0x0000ff, stroke:0x00ffff },
  gambler:     { name:'Gambler',     icon:'🎲', desc:'High risk, high reward',           hp:80,  dmgMin:1,  dmgMax:10, speed:5,   atkSpd:2.5, crit:0.15, unlockCost:10, color:0x999900, stroke:0xffff00 },
  assassin:    { name:'Assassin',    icon:'🗡️', desc:'Fast attacks, high crit',          hp:90,  dmgMin:15, dmgMax:20, speed:6,   atkSpd:3.0, crit:0.25, unlockCost:15, color:0x1a1a1a, stroke:0xffffff },
  tank:        { name:'Tank',        icon:'🛡️', desc:'Slow but tanky',                   hp:180, dmgMin:25, dmgMax:35, speed:3,   atkSpd:1.5, crit:0.05, unlockCost:20, color:0x4d804d, stroke:0x00ff00 },
  mage:        { name:'Mage',        icon:'🔮', desc:'Powerful projectiles',             hp:70,  dmgMin:30, dmgMax:40, speed:4,   atkSpd:1.8, crit:0.12, unlockCost:25, color:0x6633cc, stroke:0x800080 },
  ranger:      { name:'Ranger',      icon:'🏹', desc:'Long range specialist',            hp:85,  dmgMin:18, dmgMax:25, speed:4.5, atkSpd:2.2, crit:0.18, unlockCost:30, color:0x339933, stroke:0x00ff00 },
  necromancer: { name:'Necromancer', icon:'💀', desc:'Summons minions, drains life',     hp:75,  dmgMin:12, dmgMax:18, speed:3.5, atkSpd:1.6, crit:0.08, unlockCost:35, color:0x4d1a4d, stroke:0x993399 },
  berserker:   { name:'Berserker',   icon:'⚔️', desc:'Gains power as HP decreases',     hp:120, dmgMin:22, dmgMax:32, speed:4.2, atkSpd:2.3, crit:0.15, unlockCost:40, color:0x991a1a, stroke:0xff0000 }
};

// Biome definitions matching Swift generateMap()
const BIOMES = [
  { name:'🌲 FOREST',           bg:0x1a4d1a },
  { name:'🏜️ DESERT',           bg:0xccb266 },
  { name:'❄️ ICE LANDS',        bg:0xb3d9f2 },
  { name:'🌋 LAVA FIELDS',      bg:0x4d1a1a },
  { name:'🌿 SWAMP',            bg:0x334d33 },
  { name:'🗻 CAVE',             bg:0x1a1a26 },
  { name:'💎 CRYSTAL CAVERNS',  bg:0x33264d },
  { name:'🌌 VOID REALM',       bg:0x0d0d1a },
  { name:'☠️ CORRUPTED LANDS',  bg:0x331a26 },
  { name:'☁️ SKY ISLANDS',      bg:0x80b3e6 }
];

// Save/load helpers
function saveData(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch(e) {}
}
function loadData(key, def) {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : def;
  } catch(e) { return def; }
}
