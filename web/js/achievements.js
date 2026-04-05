// Achievements - direct conversion from Swift Achievement.swift
class AchievementManager {
  constructor() {
    this.pendingNotifications = [];
    this._data = loadData('achievements', {});
    this._stats = loadData('achStats', {
      kills:0, bossKills:0, totalCoins:0, shopPurchases:0,
      deaths:0, runs:0, highWave:0
    });
  }

  getAll() {
    return ACHIEVEMENTS.map(a => ({
      ...a,
      unlocked: !!(this._data[a.id] && this._data[a.id].unlocked),
      progress: (this._data[a.id] && this._data[a.id].progress) || 0
    }));
  }

  increment(stat, amount = 1) {
    this._stats[stat] = (this._stats[stat] || 0) + amount;
    saveData('achStats', this._stats);
  }

  check(type, value) {
    // Check wave achievements
    if (type === 'wave') {
      this._unlock('wave_5',  value >= 5);
      this._unlock('wave_10', value >= 10);
      this._unlock('wave_20', value >= 20);
      this._unlock('wave_25', value >= 25);
      this._unlock('wave_30', value >= 30);
      this._unlock('immortal', value >= 50);
    }
    if (type === 'level') {
      this._unlock('level_10', value >= 10);
      this._unlock('level_20', value >= 20);
    }
  }

  _unlock(id, condition) {
    if (!condition) return;
    if (this._data[id] && this._data[id].unlocked) return;
    if (!this._data[id]) this._data[id] = {};
    this._data[id].unlocked = true;
    saveData('achievements', this._data);
    const ach = ACHIEVEMENTS.find(a => a.id === id);
    if (ach) this.pendingNotifications.push(ach);
  }
}

// All achievements matching Swift Achievement.swift
const ACHIEVEMENTS = [
  { id:'first_blood',   name:'First Blood',        desc:'Kill your first enemy' },
  { id:'wave_5',        name:'Survivor',            desc:'Reach wave 5' },
  { id:'wave_10',       name:'Veteran',             desc:'Reach wave 10' },
  { id:'wave_20',       name:'Legend',              desc:'Reach wave 20' },
  { id:'wave_25',       name:'Champion',            desc:'Reach wave 25' },
  { id:'wave_30',       name:'Elite Warrior',       desc:'Reach wave 30' },
  { id:'immortal',      name:'💎 IMMORTAL 💎',      desc:'Reach wave 50 - The Ultimate Challenge' },
  { id:'kill_100',      name:'Slayer',              desc:'Kill 100 enemies' },
  { id:'kill_500',      name:'Executioner',         desc:'Kill 500 enemies' },
  { id:'kill_1000',     name:'Mass Destruction',    desc:'Kill 1000 enemies' },
  { id:'boss_killer',   name:'Boss Slayer',         desc:'Kill 10 bosses' },
  { id:'boss_hunter',   name:'Boss Hunter',         desc:'Kill 25 bosses' },
  { id:'level_10',      name:'Power Up',            desc:'Reach level 10' },
  { id:'level_20',      name:'Ascended',            desc:'Reach level 20' },
  { id:'no_damage_wave',name:'Untouchable',         desc:'Complete a wave without taking damage' },
  { id:'speed_runner',  name:'Speed Runner',        desc:'Complete a wave in under 30 seconds' },
  { id:'rich',          name:'Wealthy',             desc:'Collect 1000 coins in total' },
  { id:'shopaholic',    name:'Shopaholic',          desc:'Purchase 50 shop upgrades' },
  { id:'glass_cannon',  name:'Glass Cannon',        desc:'Deal 100+ damage with less than 50 HP' },
  { id:'tank',          name:'Unstoppable Tank',    desc:'Have 500+ max HP' },
  { id:'dodge_master',  name:'Dodge Master',        desc:'Dodge 50 attacks' },
  { id:'how_did_we_get_here', name:'🥇 How Did We Get Here? 🥇', desc:'Have every possible upgrade active at once' }
];
