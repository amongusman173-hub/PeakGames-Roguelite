# Audio Setup Instructions

The web version of Roguelite Arena includes a complete audio system with music and sound effects. However, the audio files need to be manually copied from the original game.

## Required Audio Files

Copy all audio files from the original game's sounds folder to the web version:

### Source Location
```
RogueliteGame/RogueliteGame/sounds/
```

### Destination Location
```
web/sounds/
```

## Files to Copy

### Sound Effects (.mp3 and .wav)
- `shoot.mp3` - Shooting sound
- `enemydie.wav` - Enemy death sound
- `enemytakedamage.wav` - Enemy hit sound
- `playerdamage.mp3` - Player damage sound
- `coin.mp3` - Coin collection sound
- `level.mp3` - Level up sound
- `skillupgrade.mp3` - Skill upgrade sound
- `shopbuy.mp3` - Shop purchase sound
- `buttonclick.mp3` - UI button click sound
- `bossspawn.mp3` - Boss spawn sound
- `start.mp3` - Game start sound
- `over.mp3` - Game over sound

### Music (.mp3)
- `maintheme.mp3` - Main menu music
- `gametheme.mp3` - Alternative game music
- `shopmusic.mp3` - Shop music
- `backroundmusicvariant1.mp3` - Gameplay music variant 1
- `backroundmusicvariant2.mp3` - Gameplay music variant 2
- `backroundmusicvariant3.mp3` - Gameplay music variant 3
- `backroundmusicvariant4.mp3` - Gameplay music variant 4

## Copy Command (macOS/Linux)

From the project root directory, run:

```bash
cp RogueliteGame/RogueliteGame/sounds/* web/sounds/
```

## Copy Command (Windows PowerShell)

From the project root directory, run:

```powershell
Copy-Item "RogueliteGame\RogueliteGame\sounds\*" -Destination "web\sounds\" -Recurse
```

## Verification

After copying, verify that the `web/sounds/` directory contains all the audio files listed above.

## Fallback Behavior

The game is designed to work even if audio files are missing:
- Missing sounds will be silently skipped
- The game will continue to function normally
- Console warnings will indicate which sounds failed to load

## Testing

1. Copy all audio files as described above
2. Open `web/index.html` in a web browser
3. Check the browser console for any audio loading errors
4. Test in-game to verify sounds are playing correctly

## Volume Controls

The audio system includes volume controls:
- Master Volume: Controls overall volume
- Music Volume: Controls background music
- SFX Volume: Controls sound effects

These can be adjusted programmatically through the AudioManager class.
