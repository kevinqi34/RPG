var Unit = new Phaser.Class({
  Extends: Phaser.GameObjects.Sprite,
  initialize:
  function Unit(scene, x, y, texture, frame, type, hp, damage)
  {
    Phaser.GameObjects.Sprite.call(this, scene, x, y, texture, frame)
    this.type = type;
    this.maxHp = this.hp = hp;
    this.damage = damage;
    this.living = true;
    this.menuItem = null;
  },
  setMenuItem: function(item) {
    this.menuItem = item;
  },
  attack: function(target) {
    if (target.living) {
      target.takeDamage(this.damage);
      this.scene.events.emit("Message", this.type + " attacks " + target.type +
        " for " + this.damage + " damage");
    }
  },
  takeDamage: function(damage) {
    this.hp -= damage;
    if(this.hp <= 0) {
      this.hp = 0;
      this.menuItem.unitKilled();
      this.living = false;
      this.visible = false;
      this.menuItem = null;
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
