const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 1280,
  height: 800,
  backgroundColor: '#050810',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 800
  },
  scene: [
    BootScene,      // loads all audio first
    MenuScene,
    ClassSelectScene,
    AchievementsScene,
    AlmanacScene,
    StatsScene,
    SettingsScene,
    GameScene,
    SkillTreeScene,
    ShopScene,
    GameOverScene
  ],
  input: {
    mouse: { preventDefaultDown: false }
  },
  audio: {
    disableWebAudio: false,
    noAudio: false
  }
};

const game = new Phaser.Game(config);
