var BattleScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize:
  function BattleScene()
  {
    Phaser.Scene.call(this, {key: 'BattleScene'});
  },
  create: function() {
    this.cameras.main.setBackgroundColor('rgba(0, 200, 0, 0.5)');
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
    this.scene.launch('UIScene');
    this.index = -1;
  },
  nextTurn: function() {
    this.index++;
    // if there are no more units, we start again from the first one
    if(this.index >= this.units.length) {
      this.index = 0;
    }
    if(this.units[this.index]) {
      // if its player hero
      if(this.units[this.index] instanceof PlayerCharacter) {
        this.events.emit('PlayerSelect', this.index);
      } else { // else if its enemy unit
        // pick random hero
        var r = Math.floor(Math.random() * this.heroes.length);
        // call the enemy's attack function
        this.units[this.index].attack(this.heroes[r]);
        // add timer for the next turn, so will have smooth gameplay
        this.time.addEvent({ delay: 3000, callback: this.nextTurn, callbackScope: this });
      }
    }
  },
  receivePlayerSelection: function(action, target) {
    if(action == 'attack') {
      this.units[this.index].attack(this.enemies[target]);
    }
    this.time.addEvent({ delay: 3000, callback: this.nextTurn, callbackScope: this });
  }
});

var Unit = new Phaser.Class({
  Extends: Phaser.GameObjects.Sprite,
  initialize:
  function Unit(scene, x, y, texture, frame, type, hp, damage)
  {
    Phaser.GameObjects.Sprite.call(this, scene, x, y, texture, frame)
    this.type = type;
    this.maxHp = this.hp = hp;
    this.damage = damage;
  },
  attack: function(target) {
    target.takeDamage(this.damage);
    this.scene.events.emit("Message", this.type + " attacks " + target.type +
      " for " + this.damage + " damage");
  },
  takeDamage: function(damage) {
    this.hp-=damage;
    if(this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
  }
});

var Enemy = new Phaser.Class({
  Extends: Unit,
  initialize:
  function Enemy(scene, x, y, texture, frame, type, hp, damage)
  {
    Unit.call(this, scene, x, y, texture, frame, type, hp, damage);
  }
});

var PlayerCharacter = new Phaser.Class({
  Extends: Unit,
  initialize:
  function PlayerCharacter(scene, x, y, texture, frame, type, hp, damage) {
    Unit.call(this, scene, x, y, texture, frame, type, hp, damage);
    this.flipX = true;
    this.setScale(2);
  }
});

var MenuItem = new Phaser.Class({
  Extends: Phaser.GameObjects.Text,
  initialize:
  function MenuItem(x, y, text, scene) {
    Phaser.GameObjects.Text.call(this, scene, x, y, text, { color: '#ffffff', align: 'left', fontSize: 15});
  },
  select: function() {
    this.setColor('#f8ff38');
  },
  deselect: function() {
    this.setColor('#ffffff');
  }
});

var Menu = new Phaser.Class({
  Extends: Phaser.GameObjects.Container,
  initialize:
  function Menu(x, y, scene, heroes) {
    Phaser.GameObjects.Container.call(this, scene, x, y);
    this.menuItems = [];
    this.menuItemIndex = 0;
    this.heroes = heroes;
    this.x = x;
    this.y = y;
  },
  addMenuItem: function(unit) {
    var menuItem = new MenuItem(0, this.menuItems.length * 20, unit, this.scene);
    this.menuItems.push(menuItem);
    this.add(menuItem);
  },
  moveSelectionUp: function() {
    this.menuItems[this.menuItemIndex].deselect();
    this.menuItemIndex--;
    if(this.menuItemIndex < 0)
        this.menuItemIndex = this.menuItems.length - 1;
    this.menuItems[this.menuItemIndex].select();
  },
  moveSelectionDown: function() {
    this.menuItems[this.menuItemIndex].deselect();
    this.menuItemIndex++;
    if(this.menuItemIndex >= this.menuItems.length)
        this.menuItemIndex = 0;
    this.menuItems[this.menuItemIndex].select();
  },
  // select the menu as a whole and an element with index from it
  select: function(index) {
    if(!index)
        index = 0;
    this.menuItems[this.menuItemIndex].deselect();
    this.menuItemIndex = index;
    this.menuItems[this.menuItemIndex].select();
  },
  // deselect this menu
  deselect: function() {
    this.menuItems[this.menuItemIndex].deselect();
    this.menuItemIndex = 0;
  },
  confirm: function() {
  },
  clear: function() {
    for(var i = 0; i < this.menuItems.length; i++) {
      this.menuItems[i].destroy();
    }
    this.menuItems.length = 0;
    this.menuItemIndex = 0;
  },
  remap: function(units) {
    this.clear();
    for(var i = 0; i < units.length; i++) {
      var unit = units[i];
      this.addMenuItem(unit.type);
    }
  }
});

var HeroesMenu = new Phaser.Class({
  Extends: Menu,
  initialize:
  function HeroesMenu(x, y, scene) {
    Menu.call(this, x, y, scene);
  }
});

var ActionsMenu = new Phaser.Class({
  Extends: Menu,
  initialize:
  function ActionsMenu(x, y, scene) {
    Menu.call(this, x, y, scene);
    this.addMenuItem('Attack');
  },
  confirm: function() {
    this.scene.events.emit('SelectEnemies');
  }
});

var EnemiesMenu = new Phaser.Class({
  Extends: Menu,
  initialize:
  function EnemiesMenu(x, y, scene) {
    Menu.call(this, x, y, scene);
  },
  confirm: function() {
    this.scene.events.emit("Enemy", this.menuItemIndex);
  }
});



var UIScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize:
  function UIScene()
  {
    Phaser.Scene.call(this, {key: 'UIScene'});
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
    if(this.currentMenu) {
      if(event.code === "ArrowUp") {
        this.currentMenu.moveSelectionUp();
      } else if(event.code === "ArrowDown") {
        this.currentMenu.moveSelectionDown();
      } else if(event.code === "ArrowRight" || event.code === "Shift") {

      } else if(event.code === "Space" || event.code === "ArrowLeft") {
        this.currentMenu.confirm();
      }
    }
  },
  onPlayerSelect: function(id) {
    this.heroesMenu.select(id);
    this.actionsMenu.select(0);
    this.currentMenu = this.actionsMenu;
  },
  onSelectEnemies: function() {
    this.currentMenu = this.enemiesMenu;
    this.enemiesMenu.select(0);
  },
  onEnemy: function(index) {
    this.heroesMenu.deselect();
    this.actionsMenu.deselect();
    this.enemiesMenu.deselect();
    this.currentMenu = null;
    this.battleScene.receivePlayerSelection('attack', index);
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
    this.remapHeroes();
    this.remapEnemies();
    this.input.keyboard.on('keydown', this.onKeyInput, this);
    this.battleScene.events.on("PlayerSelect", this.onPlayerSelect, this);
    this.events.on("SelectEnemies", this.onSelectEnemies, this)
    this.events.on("Enemy", this.onEnemy, this);
    this.message = new Message(this, this.battleScene.events);
    this.add.existing(this.message);
    this.battleScene.nextTurn();
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
