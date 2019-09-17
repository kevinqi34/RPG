var BootScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize:
  function BootScene()
  {
    Phaser.Scene.call(this, {key: 'BootScene'});
  },
  preload: function()
  {
    this.load.image('tiles', 'assets/map/spritesheet.png');
    this.load.tilemapTiledJSON('map', 'assets/map/map.json');
    this.load.spritesheet('player', 'assets/RPG_assets.png', { frameWidth: 16, frameHeight: 16 });
    this.load.image('dragonblue', 'assets/dragonblue.png');
    this.load.image('dragonorange', 'assets/dragonorange.png');
  },
  create: function()
  {
    // start the world scene
    this.scene.start('WorldScene');
  }
});

var WorldScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize:
  function WorldScene()
  {
    Phaser.Scene.call(this, {key: 'WorldScene'});
  },
  preload: function()
  {
    // Load resources
  },
  create: function()
  {
    var map = this.make.tilemap({ key: 'map' });
    var tiles = map.addTilesetImage('spritesheet', 'tiles');
    var grass = map.createStaticLayer('Grass', tiles, 0, 0);
    var obstacles = map.createStaticLayer('Obstacles', tiles, 0, 0);
    obstacles.setCollisionByExclusion([-1]);
    // animations
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('player', {frames: [1, 7, 1, 13]}),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('player', {frames: [1, 7, 1, 13]}),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'up',
        frames: this.anims.generateFrameNumbers('player', {frames: [2, 8, 2, 14]}),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'down',
        frames: this.anims.generateFrameNumbers('player', {frames: [ 0, 6, 0, 12 ]}),
        frameRate: 10,
        repeat: -1
    });
    // player
    this.player = this.physics.add.sprite(30, 50, 'player', 1);
    this.physics.world.bounds.width = map.widthInPixels;
    this.physics.world.bounds.height = map.heightInPixels;
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, obstacles);
    // camera
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player);
    this.cameras.main.roundPixels = true;
    // user input
    this.cursors = this.input.keyboard.createCursorKeys();
    // spawns
    this.spawns = this.physics.add.group({classType: Phaser.GameObjects.Zone });
    for (var i = 0; i < 10; i++) {
      var x = Phaser.Math.RND.between(0, this.physics.world.bounds.width);
      var y = Phaser.Math.RND.between(0, this.physics.world.bounds.height);
      this.spawns.create(x, y, 20, 20);
    }
    this.physics.add.overlap(this.player, this.spawns, this.onMeetEnemy, false, this);
  },
  onMeetEnemy: function(player, zone) {
    zone.x = Phaser.Math.RND.between(0, this.physics.world.bounds.width);
    zone.y = Phaser.Math.RND.between(0, this.physics.world.bounds.height);
    this.cameras.main.shake(300);
    // start battle
    // this.scene.switch('BattleScene');
  },
  update: function(time, delta)
  {
    this.player.body.setVelocity(0);
    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-80);
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(80);
    }
    if (this.cursors.up.isDown) {
      this.player.body.setVelocityY(-80);
    } else if (this.cursors.down.isDown) {
      this.player.body.setVelocityY(80);
    }
    if (this.cursors.left.isDown) {
      this.player.flipX = true;
      this.player.anims.play('left', true);
    } else if (this.cursors.right.isDown) {
      this.player.flipX = false;
      this.player.anims.play('right', true);
    } else if (this.cursors.up.isDown) {
      this.player.anims.play('up', true);
    } else if (this.cursors.down.isDown) {
      this.player.anims.play('down', true);
    } else {
      this.player.anims.stop();
    }
  }
});

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
