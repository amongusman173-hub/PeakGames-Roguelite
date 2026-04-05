// ─── Audio Helper ────────────────────────────────────────────────────────────
// NOTE: Uses var (not let/const) so variables are truly global across script tags.
// In Phaser 3, this.sound IS the global sound manager — same object in all scenes.

var _currentMusic    = null;
var _currentMusicKey = null;
var _pendingMusic    = null;
var _audioUnlocked   = false;  // named _audioUnlocked to avoid any collision

function _vols() {
  return {
    master: parseFloat(loadData('masterVolume', 1.0)) || 1.0,
    music:  parseFloat(loadData('musicVolume',  0.6)) || 0.6,
    sfx:    parseFloat(loadData('sfxVolume',    0.3)) || 0.3
  };
}

function _playMusicNow(scene, key) {
  // Stop any existing music first
  if (_currentMusic) {
    try { _currentMusic.stop(); _currentMusic.destroy(); } catch(e) {}
    _currentMusic = null;
    _currentMusicKey = null;
  }
  try {
    var v = _vols();
    _currentMusic = scene.sound.add(key, { loop: true, volume: v.master * v.music });
    _currentMusic.play();
    _currentMusicKey = key;
    console.log('[Audio] Playing music:', key);
  } catch(e) {
    console.warn('[Audio] playMusic error:', key, e && e.message);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

function playSFX(scene, key, vol) {
  if (vol === undefined) vol = 0.3;
  try {
    // Force resume AudioContext if suspended
    if (scene.sound && scene.sound.context && scene.sound.context.state === 'suspended') {
      scene.sound.context.resume();
    }
    var v = _vols();
    var adjusted = Math.min(1.0, v.master * v.sfx * (vol / 0.3));
    scene.sound.play(key, { volume: adjusted });
    // Mark as unlocked since user interacted
    if (!_audioUnlocked) {
      _audioUnlocked = true;
      if (_pendingMusic) {
        var p = _pendingMusic;
        _pendingMusic = null;
        _playMusicNow(p.scene, p.key);
      }
    }
  } catch(e) {}
}

function playMusic(scene, key) {
  // Force resume AudioContext if suspended
  try {
    if (scene.sound && scene.sound.context && scene.sound.context.state === 'suspended') {
      scene.sound.context.resume().then(function() {
        _audioUnlocked = true;
        _playMusicNow(scene, key);
      }).catch(function() {
        // Queue for later
        _pendingMusic = { scene: scene, key: key };
      });
      return;
    }
  } catch(e) {}

  if (!_audioUnlocked) {
    // Queue — will play after first user interaction
    _pendingMusic = { scene: scene, key: key };
    // Also hook Phaser's unlock event
    try {
      scene.sound.once('unlocked', function() {
        _audioUnlocked = true;
        if (_pendingMusic) {
          var p = _pendingMusic;
          _pendingMusic = null;
          _playMusicNow(p.scene, p.key);
        }
      });
    } catch(e) {}
    return;
  }

  _playMusicNow(scene, key);
}

function playRandomGameplayMusic(scene) {
  var v = Phaser.Math.Between(1, 4);
  playMusic(scene, 'bgm' + v);
}

function resumeGameplayMusic(scene) {
  if (_currentMusicKey && _currentMusicKey.indexOf('bgm') === 0) {
    playMusic(scene, _currentMusicKey);
  } else {
    playRandomGameplayMusic(scene);
  }
}

function stopMusic() {
  _pendingMusic = null;
  if (_currentMusic) {
    try { _currentMusic.stop(); _currentMusic.destroy(); } catch(e) {}
    _currentMusic    = null;
    _currentMusicKey = null;
  }
}

function isMusicPlaying() {
  try { return _currentMusic !== null && _currentMusic.isPlaying; } catch(e) { return false; }
}

function applyVolumes(masterVol, musicVol, sfxVol) {
  saveData('masterVolume', masterVol);
  saveData('musicVolume',  musicVol);
  saveData('sfxVolume',    sfxVol);
  if (_currentMusic) {
    try { _currentMusic.setVolume(masterVol * musicVol); } catch(e) {}
  }
}
