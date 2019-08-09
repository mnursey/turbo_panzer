class Obstacle {
  constructor(scene, controller, id, posPercent){
    this.scene = scene;
    this.sprite = this.scene.physics.add.sprite((config.width - ( 2 * SCREEN_ROAD_OFFSET)) * posPercent + SCREEN_ROAD_OFFSET,  -50, 'barrel').setOrigin(0.5, 0.5);
    this.sprite.body.isCircle = true;
    this.sprite.body.moves = false;
    this.sprite.setDepth(DEPTH_ENUM.OBSTACLE);
    this.controller = controller;
    this.speedMultiplier = ROAD_OBJECT_SPEED_MULTIPLIER;
    this.id = id;
  }

  update (delta, time, carSpeed) {
    this.sprite.y += carSpeed * delta * this.speedMultiplier;
    this.sprite.body.position.y = this.sprite.y - this.sprite.displayHeight / 2;
    if (this.sprite.y - 28 * 2 > config.height) {
      this.controller.markObstacleForRemoval(this.id);
    }
  }
}

class Building {
  constructor(scene, controller, id, side, xPos, yPos){
    this.scene = scene;

    let flip = side === LR_ENUM.LEFT ? true : false;

    let spriteOptions = [
      'dark_blue_building',
      'purple_building'
    ];

    let spriteIndex = getRndInteger(0, spriteOptions.length);

    this.sprite = this.scene.physics.add.sprite(xPos, yPos, spriteOptions[spriteIndex]).setOrigin(0.5, 0.5).setFlipX(flip);
    this.sprite.scale = 0.8;

    this.shadowSprite = this.scene.physics.add.sprite(xPos, yPos, 'building_shadow').setOrigin(0.5, 0.5);
    this.shadowSprite.scale = 0.8;

    this.sprite.body.moves = false;
    this.shadowSprite.body.moves = false;

    this.sprite.setDepth(DEPTH_ENUM.BUILDING);
    this.shadowSprite.setDepth(DEPTH_ENUM.BUILDING);

    this.controller = controller;
    this.speedMultiplier = ROAD_OBJECT_SPEED_MULTIPLIER;
    this.id = id;
  }

  update (delta, time, carSpeed) {
    this.sprite.y += carSpeed * delta * this.speedMultiplier;
    this.sprite.body.position.y = this.sprite.y - this.sprite.displayHeight / 2;

    this.shadowSprite.y = this.sprite.y;
    this.shadowSprite.body.position.y = this.shadowSprite.y - this.shadowSprite.displayHeight / 2;

    let depthMod = 1.0 - this.sprite.y / config.height;

    this.sprite.setDepth(DEPTH_ENUM.BUILDING + depthMod);
    this.shadowSprite.setDepth(DEPTH_ENUM.BUILDING + depthMod - 0.00001);

    if (this.sprite.y - 300 > config.height) {
      this.controller.markSegmentForDelete(this);
    }
  }

  remove() {
    this.sprite.destroy(true);
    this.shadowSprite.destroy(true);
  }
}
