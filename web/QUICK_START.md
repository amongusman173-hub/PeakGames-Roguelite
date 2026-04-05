# Quick Start Guide

## ✅ Setup Complete!

All sound files have been copied and the game is ready to play.

## Run Locally

### Option 1: Python (Recommended)
```bash
cd web
python3 -m http.server 8000
```
Then open: http://localhost:8000

### Option 2: Node.js
```bash
cd web
npx http-server -p 8000
```
Then open: http://localhost:8000

### Option 3: PHP
```bash
cd web
php -S localhost:8000
```
Then open: http://localhost:8000

## Deploy to Netlify

### Method 1: Drag & Drop
1. Go to https://app.netlify.com/drop
2. Drag the `web` folder onto the page
3. Done! Your game is live

### Method 2: CLI
```bash
cd web
netlify deploy --prod
```

### Method 3: Git
1. Push to GitHub
2. Connect repository to Netlify
3. Set publish directory to `web`
4. Deploy!

## Controls

- **WASD / Arrow Keys**: Move
- **Mouse**: Aim
- **Left Click**: Shoot
- **Right Click (Hold)**: Charge shot (when unlocked)
- **Space**: Dash (when unlocked)
- **ESC**: Pause

## Features

- 20+ enemy types
- 9 player classes
- Full skill tree (3 pages)
- Shop system
- Achievements
- Wave progression
- Boss waves every 5 waves
- Save/load system
- Full audio and visual effects

## Troubleshooting

### No Sound?
- Check browser console for errors
- Make sure you clicked/interacted with the page first (browser policy)
- Verify files exist in `web/sounds/` directory

### Game Not Loading?
- Make sure you're running a local server (not opening file:// directly)
- Check browser console for errors
- Try a different browser

### Performance Issues?
- Close other tabs
- Try a different browser
- Reduce browser zoom to 100%

## File Structure

```
web/
├── index.html          ← Main file
├── css/style.css       ← Styling
├── js/                 ← Game code
│   ├── main.js
│   ├── audioManager.js
│   ├── particleEffects.js
│   ├── backgroundEffects.js
│   └── scenes/
└── sounds/             ← 22 audio files ✅
```

## Next Steps

1. Run locally to test
2. Deploy to Netlify
3. Share with friends!

## Support

For issues or questions, check:
- `web/README.md` - Full documentation
- `WEB_VERSION_COMPLETE.md` - Implementation details
- Browser console for error messages

Enjoy the game! 🎮
