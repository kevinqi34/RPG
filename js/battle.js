var BattleScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize:
  function BattleScene()
  {
    Phaser.Scene.call(this, {key: 'BattleScene'});
  },
  create: function() {
    this.cameras.main.setBackgroundColor('rgba(0, 200, 0, 0.5)');
    this.startBattle();
    this.sys.events.on('wake', this.startBattle, this);
  },
  startBattle: function() {
    // player character - warrior
    var warrior = new PlayerCharacter(this, 400, 50, 'player', 1, 'Warrior', 100, 20);
    this.add.existing(warrior);
    // player character - mage
    var mage = new PlayerCharacter(this, 400, 100, 'player', 4, 'Mage', 80, 8);
    this.add.existing(mage);
    var dragonblue = new Enemy(this, 50, 50, 'dragonblue', null, 'Dragon', 50, 3);
    this.add.existing(dragonblue);
    var dragonOrange = new Enemy(this, 50, 100, 'dragonorange', null,'Charizard', 50, 3);
    this.add.existing(dragonOrange);
    this.heroes = [warrior, mage];
    this.enemies = [dragonblue, dragonOrange];
    this.units = this.heroes.concat(this.enemies);
    // launch
    this.index = -1;
    this.scene.launch('UIScene');
  },
  nextTurn: function() {
    if(this.checkEndBattle()) {
      this.endBattle();
      return;
    }
    do {
      this.index++;
      // if there are no more units, we start again from the first one
      if(this.index >= this.units.length) {
        this.index = 0;
      }
    } while (!this.units[this.index].living);
    // if its player hero
    if(this.units[this.index] instanceof PlayerCharacter) {
      // we need the player to select action and then enemy
      this.events.emit("PlayerSelect", this.index);
    } else { // else if its enemy unit
      // pick random living hero to be attacked
      var r;
      do {
        r = Math.floor(Math.random() * this.heroes.length);
      } while(!this.heroes[r].living)
      // call the enemy's attack function
      this.units[this.index].attack(this.heroes[r]);
      // add timer for the next turn, so will have smooth gameplay
      this.time.addEvent({ delay: 3000, callback: this.nextTurn, callbackScope: this });
    }
  },
  receivePlayerSelection: function(action, target) {
    if(action == 'attack') {
      this.units[this.index].attack(this.enemies[target]);
    }
    this.time.addEvent({ delay: 3000, callback: this.nextTurn, callbackScope: this });
  },
  checkEndBattle: function() {
    var victory = true;
    // if all enemies are dead we have victory
    for(var i = 0; i < this.enemies.length; i++) {
      if(this.enemies[i].living)
        victory = false;
    }
    var gameOver = true;
    // if all heroes are dead we have game over
    for(var i = 0; i < this.heroes.length; i++) {
      if(this.heroes[i].living)
        gameOver = false;
    }
    return victory || gameOver;
  },
  endBattle: function() {
    // clear state, remove sprites
    this.heroes.length = 0;
    this.enemies.length = 0;
    for(var i = 0; i < this.units.length; i++) {
      // link item
      this.units[i].destroy();
    }
    this.units.length = 0;
    // sleep the UI
    this.scene.sleep('UIScene');
    // return to WorldScene and sleep current BattleScene
    this.scene.switch('WorldScene');
   }
});

var UIScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize:
  function UIScene()
  {
    Phaser.Scene.call(this, {key: 'UIScene'});
  },
  create: function() {
    this.graphics = this.add.graphics();
    this.graphics.lineStyle(1, 0xffffff);
    this.graphics.fillStyle(0x031f4c, 1);
    this.graphics.strokeRect(3, 225, 135, 150);
    this.graphics.fillRect(3, 225, 135, 150);
    this.graphics.strokeRect(142, 225, 136, 150);
    this.graphics.fillRect(142, 225, 136, 150);
    this.graphics.strokeRect(282, 225, 195, 150);
    this.graphics.fillRect(282, 225, 195, 150);
    // basic container to hold all menus
    this.menus = this.add.container();
    this.heroesMenu = new HeroesMenu(290, 230, this);
    this.actionsMenu = new ActionsMenu(150, 230, this);
    this.enemiesMenu = new EnemiesMenu(8, 230, this);
    // the currently selected menu
    this.currentMenu = this.actionsMenu;
    // add menus to the container
    this.menus.add(this.heroesMenu);
    this.menus.add(this.actionsMenu);
    this.menus.add(this.enemiesMenu);
    this.battleScene = this.scene.get('BattleScene');
    this.input.keyboard.on('keydown', this.onKeyInput, this);
    this.battleScene.events.on("PlayerSelect", this.onPlayerSelect, this);
    this.events.on("SelectedAction", this.onSelectedAction, this);
    this.events.on("Enemy", this.onEnemy, this);
    this.sys.events.on('wake', this.createMenu, this);
    this.message = new Message(this, this.battleScene.events);
    this.add.existing(this.message);
    this.createMenu();
  },
  createMenu: function() {
    this.remapHeroes();
    this.remapEnemies();
    this.battleScene.nextTurn();
  },
  onEnemy: function(index) {
    this.heroesMenu.deselect();
    this.actionsMenu.deselect();
    this.enemiesMenu.deselect();
    this.currentMenu = null;
    this.battleScene.receivePlayerSelection('attack', index);
  },
  onSelectedAction: function() {
    this.currentMenu = this.enemiesMenu;
    this.enemiesMenu.select(0);
  },
  onPlayerSelect: function(id) {
    this.heroesMenu.select(id);
    this.actionsMenu.select(0);
    this.currentMenu = this.actionsMenu;
  },
  remapHeroes: function() {
    var heroes = this.battleScene.heroes;
    this.heroesMenu.remap(heroes);
  },
  remapEnemies: function() {
    var enemies = this.battleScene.enemies;
    this.enemiesMenu.remap(enemies);
  },
  onKeyInput: function(event) {
    if(this.currentMenu && this.currentMenu.selected) {
      if(event.code === "ArrowUp") {
        this.currentMenu.moveSelectionUp();
      } else if(event.code === "ArrowDown") {
        this.currentMenu.moveSelectionDown();
      } else if(event.code === "ArrowRight" || event.code === "Shift") {
      } else if(event.code === "Space" || event.code === "ArrowLeft") {
        this.currentMenu.confirm();
      }
    }
  }
});

var Message = new Phaser.Class({
  Extends: Phaser.GameObjects.Container,
  initialize:
  function Message(scene, events) {
    Phaser.GameObjects.Container.call(this, scene, 160, 30);
    var graphics = this.scene.add.graphics();
    this.add(graphics);
    graphics.lineStyle(1, 0xffffff, 0.8);
    graphics.fillStyle(0x031f4c, 0.3);
    graphics.strokeRect(-45, -15, 250, 60);
    graphics.fillRect(-45, -15, 250, 60);
    this.text = new Phaser.GameObjects.Text(scene, 0, 0, "", { color: '#ffffff', align: 'center', fontSize: 13, wordWrap: { width: 200, useAdvancedWrap: true }});
    this.add(this.text);
    events.on("Message", this.showMessage, this);
    this.visible = false;
  },
  showMessage: function(text) {
    this.text.setText(text);
    this.visible = true;
    if(this.hideEvent)
      this.hideEvent.remove(false);
    this.hideEvent = this.scene.time.addEvent({ delay: 2000, callback: this.hideMessage, callbackScope: this });
  },
  hideMessage: function() {
    this.hideEvent = null;
    this.visible = false;
  }
});
