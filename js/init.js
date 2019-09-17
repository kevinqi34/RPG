var config = {
    type: Phaser.AUTO,
    parent: 'content',
    width: 480,
    height: 360,
    zoom: 2,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: true
        }
    },
    scene: [
      BootScene,
      WorldScene,
      BattleScene,
      UIScene
    ]
};

var game = new Phaser.Game(config);
