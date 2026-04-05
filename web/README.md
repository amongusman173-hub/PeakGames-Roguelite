# Roguelite Arena - Web Version

A high-quality web port of the Swift/SpriteKit roguelite game, built with Phaser 3.

## Features

### Complete Game Mechanics
- **20+ Enemy Types**: Normal, runner, tank, boss (8 variants), gold, healer, splitter, teleporter, shield, explosive, charger, sniper, swarm, necromancer, mimic, berserker, freezer, slime
- **9 Player Classes**: Classless, Warrior, Gambler, Assassin, Tank, Mage, Ranger, Necromancer, Berserker
- **Full Skill Tree**: 3 pages with 20+ skills including basic stats, advanced stats, and special abilities
- **Shop System**: Rarity-weighted items with persistent shop state
- **Achievement System**: Track progress across runs
- **Wave Progression**: Boss waves every 5 waves with increasing difficulty

### Visual Polish
- **Particle Effects**: Shooting, explosions, level-ups, enemy deaths, skill upgrades, coin collection
- **Animated Backgrounds**: Stars, floating particles, animated grid
- **Screen Shake**: Impact feedback for explosions and boss deaths
- **Projectile Trails**: Visual feedback for bullets
- **Muzzle Flash**: Shooting visual effects
- **Hit Effects**: Crit and normal hit particles
- **Dash Effects**: Trail particles for dash ability

### Audio System
- **Background Music**: Main menu theme, 4 gameplay music variants, shop music
- **Sound Effects**: Shooting, enemy damage, player damage, coin collection, level up, skill upgrade, shop purchase, button clicks, boss spawn
- **Volume Controls**: Master, music, and SFX volume controls
- **Fallback Support**: Game works even if audio files are missing

### Save System
- **Persistent Progress**: Skill tree, achievements, class unlocks, high scores
- **Mid-Run Save**: Save at wave start, pause, shop purchases, skill upgrades
- **Continue Feature**: Resume from last saved wave

## Setup

### 1. Copy Audio Files

The game requires audio files from the original Swift game. See [AUDIO_SETUP.md](AUDIO_SETUP.md) for detailed instructions.

Quick command (from project root):
```bash
cp RogueliteGame/RogueliteGame/sounds/* web/sounds/
```

### 2. Run Locally

#### Option A: Python HTTP Server
```bash
cd web
python3 -m http.server 8000
```
Then open http://localhost:8000

#### Option B: Node.js HTTP Server
```bash
cd web
npx http-server -p 8000
```
Then open http://localhost:8000

### 3. Deploy to Netlify

The project includes a `netlify.toml` configuration file for easy deployment.

#### Deploy via Netlify CLI
```bash
cd web
netlify deploy --prod
```

#### Deploy via Netlify Dashboard
1. Connect your repository to Netlify
2. Set build directory to `web`
3. No build command needed (static site)
4. Deploy!

## Controls

### Movement
- **WASD** or **Arrow Keys**: Move player
- **Mouse**: Aim
- **Left Click**: Shoot
- **Right Click (Hold)**: Charge shot (when unlocked)
- **Space**: Dash (when unlocked)
- **ESC**: Pause game

### UI
- Click buttons to navigate menus
- Click skills to upgrade in skill tree
- Click items to purchase in shop

## Game Mechanics

### Player Progression
- Gain XP by killing enemies
- Level up to earn skill points
- Spend skill points in the skill tree
- Unlock special abilities (multishot, piercing, charged shot, dash)

### Wave System
- Waves increase in difficulty
- Boss waves every 5 waves
- Shop opens after each wave
- Skill tree opens when you have skill points

### Classes
- Start with Classless (unlocked by default)
- Unlock other classes with class points
- Earn class points by reaching higher waves
- Each class has unique stats and playstyle

### Shop
- Random items each wave
- Rarity system (common, uncommon, rare, epic, legendary)
- Temporary buffs (damage, fire rate, burst shot)
- Permanent upgrades (crit chance, lifesteal, armor)
- Reroll option available

## Technical Details

### Technologies
- **Phaser 3.60.0**: Game framework
- **JavaScript ES6**: Game logic
- **HTML5 Canvas**: Rendering
- **LocalStorage**: Save system

### File Structure
```
web/
├── index.html              # Main HTML file
├── css/
│   └── style.css          # Styling
├── js/
│   ├── main.js            # Phaser config
│   ├── constants.js       # Game constants
│   ├── audioManager.js    # Audio system
│   ├── particleEffects.js # Particle effects
│   ├── backgroundEffects.js # Background animations
│   ├── player.js          # Player class
│   ├── enemy.js           # Enemy class
│   ├── skillTree.js       # Skill tree system
│   ├── shop.js            # Shop system
│   ├── achievements.js    # Achievement system
│   ├── ui.js              # UI helpers
│   └── scenes/            # Phaser scenes
│       ├── MenuScene.js
│       ├── GameScene.js
│       ├── SkillTreeScene.js
│       ├── ShopScene.js
│       └── GameOverScene.js
├── sounds/                # Audio files (copy from original)
└── netlify.toml          # Netlify config
```

### Performance
- Optimized particle system
- Efficient rendering with Phaser graphics
- Minimal DOM manipulation
- Responsive scaling with Phaser Scale Manager

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ⚠️ Playable but not optimized for touch

## Known Issues

- Audio files must be manually copied (not included in repository)
- Mobile touch controls not yet implemented
- Some particle effects may impact performance on older devices

## Credits

Original game design and mechanics by the Swift/SpriteKit version.
Web port with enhanced visual effects and audio system.

## License

See main project LICENSE file.
