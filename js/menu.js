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
  },
  unitKilled: function() {
    this.active = false;
    this.visible = false;
  }
});

var Menu = new Phaser.Class({
  Extends: Phaser.GameObjects.Container,
  initialize:
  function Menu(x, y, scene, heroes) {
    Phaser.GameObjects.Container.call(this, scene, x, y);
    this.menuItems = [];
    this.menuItemIndex = 0;
    this.x = x;
    this.y = y;
    this.selected = false;
  },
  addMenuItem: function(unit) {
    var menuItem = new MenuItem(0, this.menuItems.length * 20, unit, this.scene);
    this.menuItems.push(menuItem);
    this.add(menuItem);
    return menuItem;
  },
  // menu navigation
  moveSelectionUp: function() {
    this.menuItems[this.menuItemIndex].deselect();
    do {
      this.menuItemIndex--;
      if(this.menuItemIndex < 0)
        this.menuItemIndex = this.menuItems.length - 1;
    } while(!this.menuItems[this.menuItemIndex].active);
    this.menuItems[this.menuItemIndex].select();
  },
  moveSelectionDown: function() {
    this.menuItems[this.menuItemIndex].deselect();
    do {
      this.menuItemIndex++;
      if(this.menuItemIndex >= this.menuItems.length)
        this.menuItemIndex = 0;
    } while(!this.menuItems[this.menuItemIndex].active);
    this.menuItems[this.menuItemIndex].select();
  },
  // select the menu as a whole and highlight the choosen element
  select: function(index) {
    if(!index)
      index = 0;
    this.menuItems[this.menuItemIndex].deselect();
    this.menuItemIndex = index;
    while(!this.menuItems[this.menuItemIndex].active) {
      this.menuItemIndex++;
      if(this.menuItemIndex >= this.menuItems.length)
        this.menuItemIndex = 0;
      if(this.menuItemIndex == index)
        return;
    }
    this.menuItems[this.menuItemIndex].select();
    this.selected = true;
  },
  // deselect this menu
  deselect: function() {
    this.menuItems[this.menuItemIndex].deselect();
    this.menuItemIndex = 0;
    this.selected = false;
  },
  confirm: function() {
  },
  // clear menu and remove all menu items
  clear: function() {
    for(var i = 0; i < this.menuItems.length; i++) {
      this.menuItems[i].destroy();
    }
    this.menuItems.length = 0;
    this.menuItemIndex = 0;
  },
  // recreate the menu items
  remap: function(units) {
    this.clear();
    for(var i = 0; i < units.length; i++) {
      var unit = units[i];
      unit.setMenuItem(this.addMenuItem(unit.type));
    }
    this.menuItemIndex = 0;
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
    this.scene.events.emit('SelectedAction');
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
