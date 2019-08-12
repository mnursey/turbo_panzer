var config = {
    type: Phaser.AUTO,
    width: 750,
  	height: 1334,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var cursors;
var controlConfig;
var inputs;
var camera;
var backgroundImage;

var carController = undefined;
var borderController = undefined;
var gameController = undefined;
var obstacleController = undefined;

var gameColliders = undefined;

var game = new Phaser.Game(config);
function preload ()
{
    this.load.image('road_blank', 'assets/road_blank.png');
    this.load.image('road_straight_left', 'assets/road_straight_left.png');
    this.load.image('road_straight_right', 'assets/road_straight_right.png');

    this.load.image('purple_building', 'assets/scene_art/purple_building.png');
    this.load.image('dark_blue_building', 'assets/scene_art/dark_blue_building.png');
    this.load.image('building_shadow', 'assets/scene_art/building_shadow.png');

    this.load.image('car', 'assets/scene_art/orange_car_0.png');
    this.load.image('car_shadow', 'assets/scene_art/car_shadow.png');

    this.load.image('wide_barrier', 'assets/scene_art/wide_barrier.png');
    this.load.image('barrier_light', 'assets/scene_art/barrier_light.png');

    this.load.image('barrel', 'assets/barrel_blue.png');
    this.load.image('barrel_down', 'assets/barrel_blue_down.png');
    this.load.image('sky', 'assets/sky.png');
    this.load.bitmapFont('main_font', 'assets/fonts/main_font_one.png', 'assets/fonts/main_font_one.fnt');
    //this.load.bitmapFont('second_font', 'assets/fonts/second_font_one.png', 'assets/fonts/second_font_one.fnt');

}

function hitCollider(car, collider) {

  if( collider.prevHit === null || collider.prevHit === undefined) {
    //collider.setTexture('barrel_down');
    collider.y -= carController.forwardSpeed;
    carController.forwardSpeed = 1.0;
    //collider.angle = -90;
    collider.prevHit = true;

    if(gameController.gameState === GAME_STATE_ENUM.RUNNING) {

      gameController.life += -1;
    }

  } else {
    if(gameController.gameState === GAME_STATE_ENUM.RUNNING) {
      if(carController.forwardSpeed > 5) {
        carController.forwardSpeed = 5.0;
      }
    }
  }
}

function create ()
{
    //  A simple background for our game
    //backgroundImage = this.add.image(config.width / 2, config.height / 2, 'sky');
    //backgroundImage.setScale(config.width / 800, config.height / 600);

    // Define inputs
    inputs = [
      this.input.keyboard.addKey('LEFT'),
      this.input.keyboard.addKey('RIGHT'),
      this.input.keyboard.addKey('DOWN')
    ]

    // The car and its settings
    carController = new CarController(this);

    // Set camera
    camera = this.cameras.main;

    // road controller
    borderController = new BorderController(this);

    // obstacle controller
    obstacleController = new ObstacleController(this);

    gameColliders = this.physics.add.collider(carController.car, obstacleController.physicsGroup, hitCollider, null, this);
    gameColliders.overlapOnly = true;

    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();

    // Setup control config
    controlConfig = {
      camera : this.cameras.main,
      left : cursors.left,
      right : cursors.right,
      up : cursors.up,
      down : cursors.down,
      acceleration : 0.04,
      drag : 0.0008,
      maxSpeed : 0.5
    };

    // Set Background colour
    camera.setBackgroundColor("#101823");

    // Create game controller
    gameController = new GameController(this, carController, obstacleController);
}

function update (time, delta)
{

  if(gameController !== undefined) {

    if(carController !== undefined) {
      if(inputs[INPUT_ENUM.KEY_LEFT].isDown){
        if (gameController.gameState === GAME_STATE_ENUM.RUNNING) {
          carController.inputTurn(TURN_ENUM.LEFT);
        }

        if (gameController.gameState === GAME_STATE_ENUM.IDLE) {
          gameController.startGame();
        }
      }

      if(inputs[INPUT_ENUM.KEY_RIGHT].isDown){
        if (gameController.gameState === GAME_STATE_ENUM.RUNNING) {
          carController.inputTurn(TURN_ENUM.RIGHT);
        }

        if (gameController.gameState === GAME_STATE_ENUM.IDLE) {
          gameController.startGame();
        }
      }
    }

    gameController.update(delta, time);

    if(carController !== undefined) {
      carController.update(delta, time);

      if(borderController !== undefined){
        borderController.update(delta, time, carController.forwardSpeed);
      }

      if (obstacleController !== undefined) {
        obstacleController.update(delta, time, carController.forwardSpeed);
      }
    }
  }
}

function pullValueTo(value, target, pull) {
  // Pull value towards target
  if (value < target) {
    value += pull;
    if (value > target) {
      value = target;
    }
  }

  if (value > target) {
    value += -pull;
    if (value < target) {
      value = target;
    }
  }

  return value;
}

function restrictValue(value, min, max) {
  if (value < min) {
    value = min;
  }

  if (value > max) {
    value = max;
  }

  return value;
}

class GameController {
  constructor (scene, carController, obstacleController){
    this.scene = scene;
    this.carController = carController;
    this.obstacleController = obstacleController;

    this.tutText = "Press Left Arror or Right Arrow to play!";

    // S E N D    N U D E S

    // Game UI
    this.gameUI = {};
    this.gameUI["lifeUI"] = new BitmapTextButton(this.scene, config.width / 2, 46, "", "main_font", undefined , 64, 1, DEPTH_ENUM.UI).setOrigin(0.5);

    this.gameUI["scoreUI"] = new BitmapTextButton(this.scene, config.width  - 128 - 60, 16 * 4, "", "main_font", undefined , 46, 1, DEPTH_ENUM.UI);

    this.gameUI["speedUI"] = new BitmapTextButton(this.scene, config.width  - 128 - 60, 16, "", "main_font", undefined , 46, 1, DEPTH_ENUM.UI);

    // Add buttons
    this.playMenu = {};
    this.playMenu["playButton"] = new BitmapTextButton(this.scene,  config.width / 2, config.height / 2 - 200, 'Restart', "main_font",

    function () {
       if (gameController.gameState === GAME_STATE_ENUM.IDLE) {
         gameController.startGame();
       }

       if (gameController.gameState === GAME_STATE_ENUM.GAMEOVER) {
         carController.engineOn = true;
         gameController.gameUI["scoreUI"].fadeOut();
         gameController.gameUI["speedUI"].fadeOut();
         gameController.resetGame();
       }
    }

     , 46, 1, DEPTH_ENUM.UI).setOrigin(0.5);


    this.playMenu["optionsButton"] = new BitmapTextButton(this.scene, 16 * 3, 48, '', "main_font", undefined , 46, 1, DEPTH_ENUM.UI);

    this.playMenu["infoButton"] = new BitmapTextButton(this.scene, config.width / 2, config.height / 2 - 200, this.tutText, "main_font", undefined , 46, 1, DEPTH_ENUM.UI).setOrigin(0.5);
    this.playMenu["infoButton"].fadeIn();

    this.playMenu["infoButton"].tint = 0xd3e6e6;
    this.playMenu["playButton"].tint = 0xd3e6e6;
    this.playMenu["optionsButton"].tint = 0xd3e6e6;
    this.gameUI["speedUI"].tint = 0xd3e6e6;
    this.gameUI["scoreUI"].tint = 0xd3e6e6;
    this.gameUI["lifeUI"].tint = 0xd3e6e6;

    this.resetGame();
  }

  update (delta, time) {

    if(this.gameState === GAME_STATE_ENUM.RESETTING) {

      if (this.carController.forwardSpeed > 6.0) {
        this.carController.forwardSpeed = 6.0;
      }

      if (this.obstacleController.obstacles.length === 0) {
        this.obstacleController.reset();
        this.carController.reset();

        this.gameUI["lifeUI"].fadeOut();
        this.playMenu["infoButton"].fadeIn();
        this.gameState = GAME_STATE_ENUM.IDLE;
      }
    }

    if (this.gameState === GAME_STATE_ENUM.RUNNING) {
      if (this.life > 0) {
        this.distance += delta * this.carController.forwardSpeed * 4 / (1000.0 * 60.0 * 60.0) ;

        this.gameUI["lifeUI"].text = 'X'.repeat(this.life);
        this.gameUI["scoreUI"].text = this.distance.toFixed(2) + " KM";

      } else {
        this.endGame();
      }
    }

    this.gameUI["speedUI"].text = 4 * this.carController.forwardSpeed.toFixed(0) + " KM/H";
  }

  resetGame () {
    this.life = 3;
    this.distance = 0.0;
    this.gameState = GAME_STATE_ENUM.RESETTING;
    this.obstacleController.spawn = false;
    this.playMenu["playButton"].fadeOut();
  }

  startGame () {
    if (this.gameState === GAME_STATE_ENUM.IDLE) {
      this.gameState = GAME_STATE_ENUM.RUNNING;
      carController.engineOn = true;
      this.obstacleController.start();
      this.playMenu["infoButton"].fadeOut();
      this.gameUI["scoreUI"].fadeIn();
      this.gameUI["lifeUI"].fadeIn();
      this.gameUI["speedUI"].fadeIn();
    }
  }

  endGame () {
    this.gameUI["lifeUI"].text = "GAME OVER";
    this.carController.engineOn = false;
    this.gameState = GAME_STATE_ENUM.GAMEOVER;
    this.playMenu["playButton"].fadeIn();
  }
}

class ObstacleController {
  constructor(scene) {
    this.scene = scene;
    this.obstacles = [];
    this.IDsToDelete = [];
    this.hightestId = 0;
    this.physicsGroup = this.scene.physics.add.group({});
    this.speedMultiplier = ROAD_OBJECT_SPEED_MULTIPLIER;
    this.spawn = false;

    this.reset();
  }

  update (delta, time, carSpeed) {

    this.distance += carSpeed * delta * ROAD_OBJECT_SPEED_MULTIPLIER;

    for(let i = 0; i < this.obstacles.length; ++i){
      if(this.obstacles[i] !== null) {
        this.obstacles[i].update(delta, time, carSpeed);
      }
    }

    for(let i = 0; i < this.IDsToDelete.length; ++i){
      this.removeObstacle(this.IDsToDelete[i]);
    }

    this.IDsToDelete = [];

    if(this.distance - this.lastSpawnDistance > this.maxDeltaDistance && this.spawn) {
      this.lastSpawnDistance = this.distance;

      let wC = Math.random();

      if(wC <= this.wallChance) {
        this.createWall();
      }else{
        this.createObstacle();
      }

      this.obstaclesUntilChangeChance += -1;

      if(this.obstaclesUntilChangeChance < 1) {
        this.obstaclesUntilChangeChance = 5 + Math.ceil(Math.random() * this.obstaclesUntilChangeChanceMax);

        //this.wallChance = Math.random();
        this.wallChance = 0.0;
      }
    }
  }

  start (){
    this.spawn = true;
  }

  reset (){
    this.lastSpawnDistance = 0.0;
    this.maxDeltaDistance = 550.0;
    this.distance = 0.0;
    this.wallChance = 0.0;
    this.obstaclesUntilChangeChance = 10;
    this.obstaclesUntilChangeChanceMax = 15;

    for(let i = 0; i < this.obstacles.length; ++i) {
      this.markObstacleForRemoval(this.obstacles[i].id);
    }

    for(let i = 0; i < this.IDsToDelete.length; ++i){
      this.removeObstacle(this.IDsToDelete[i]);
    }

    this.IDsToDelete = [];
  }

  markObstacleForRemoval (id) {
    this.IDsToDelete.push(id);
  }

  removeObstacle(id){

    let index =  this.obstacles.findIndex(function(o){
      if(o.id === id) {
        return true;
      } else {
        return false;
      }
    });

    let obstacle = this.obstacles[index];
    this.obstacles.splice(index, 1);


    obstacle.remove();
    obstacle = null;
  }


  createObstacle() {
    let p = Math.min( 1.0, Math.max(0.0, ((Math.random() - 0.5) * 0.3 + (carController.car.x / config.width))));
    let ob = new Obstacle(this.scene, this, this.hightestId++, p);
    this.obstacles.push(ob);
    this.physicsGroup.add(ob.sprite);
  }

  createWall() {
    let startingPercent = Math.min( 1.0, Math.max(0.0, ((Math.random() - 0.5) * 0.5 + (carController.car.x / config.width))));
    let direction = Math.random() > 0.5 ? 1.0 : -1.0;
    let obstacleWidthPercent = 56.0 / (config.width - 2 * SCREEN_ROAD_OFFSET);
    let s = obstacleWidthPercent / 10.0;

    for(let i = 0; i < 4; ++i) {
      let p = startingPercent + (direction * obstacleWidthPercent * i) + (direction * s * i);

      if (p < 0.0) {
        continue;
      }

      if (p > 1.0) {
        continue;
      }

      let ob = new Obstacle(this.scene, this, this.hightestId++, p);
      this.obstacles.push(ob);
      this.physicsGroup.add(ob.sprite);
    }
  }
}

class BorderController {
  constructor (scene) {
    this.scene = scene;
    this.borderSegments = [];
    this.expiredSegments = [];
    this.speedMultiplier = ROAD_OBJECT_SPEED_MULTIPLIER;
    this.distanceSinceLastSegmentLeft = 333.0;
    this.distanceSinceLastSegmentRight = 333.0;

    this.nextLeftDistance = 0;
    this.nextRightDistance = 0;

    this.minXPosDiff = 20;

    this.prevLeftV = 0;
    this.prevRightV = 0;

    for(let i = 0; i < 5; ++i) {
      this.addSegment(i * 300, LR_ENUM.LEFT);
      this.addSegment(i * 300, LR_ENUM.RIGHT);
    }
  }

  update (delta, time, carSpeed) {

    let deltaDistane = carSpeed * delta * this.speedMultiplier;

    this.distanceSinceLastSegmentLeft += deltaDistane;
    this.distanceSinceLastSegmentRight += deltaDistane;

    if(this.distanceSinceLastSegmentLeft > this.nextLeftDistance) {
        this.addSegment(-300, LR_ENUM.LEFT);
        this.distanceSinceLastSegmentLeft = 0.0;

        this.nextLeftDistance = getRndInteger(160, 360);
    }

    if(this.distanceSinceLastSegmentRight > this.nextRightDistance) {
        this.addSegment(-300, LR_ENUM.RIGHT);
        this.distanceSinceLastSegmentRight = 0.0;

        this.nextRightDistance = getRndInteger(160, 360);
    }

    for(let i = 0; i < this.borderSegments.length; ++i){
      let segment = this.borderSegments[i];
      segment.update(delta, time, carSpeed);
    }

    for(let i = 0; i < this.expiredSegments.length; ++i){
      this.removeSegment(this.expiredSegments[i]);
    }

    this.expiredSegments = [];
  }

  markSegmentForDelete(roadSegment) {
    this.expiredSegments.push(roadSegment);
  }

  removeSegment(roadSegment){

    let index = this.borderSegments.findIndex(function(o){
      if(o === roadSegment) {
        return true;
      } else {
        return false;
      }
    });

    let segment = this.borderSegments[index];
    this.borderSegments.splice(index, 1);

    segment.remove();
    segment = null;
  }

  addSegment(yPos, side){

    let v = getRndInteger(0, SCREEN_BUILDING_OFFSET_VARIANCE) * SCREEN_BUILDING_OFFSET_VARIANCE_WIDTH;

    if (side === LR_ENUM.LEFT) {
      if (this.prevLeftV === v) {
        v += -SCREEN_BUILDING_OFFSET_VARIANCE_WIDTH;

        if (v < 0){
          v = SCREEN_BUILDING_OFFSET_VARIANCE * SCREEN_BUILDING_OFFSET_VARIANCE_WIDTH;
        }
      }

      this.prevLeftV = v;
    }

    if (side === LR_ENUM.RIGHT) {
      if (this.prevRightV === v) {
        v += -SCREEN_BUILDING_OFFSET_VARIANCE_WIDTH;

        if (v < 0){
          v = SCREEN_BUILDING_OFFSET_VARIANCE * SCREEN_BUILDING_OFFSET_VARIANCE_WIDTH;
        }
      }

      this.prevRightV = v;
    }

    let xPos = side === LR_ENUM.LEFT ? SCREEN_BUILDING_OFFSET + v : config.width - SCREEN_BUILDING_OFFSET - v;

    let segment = new Building(this.scene, this, this.borderSegments.length, side, xPos, yPos);

    this.borderSegments.push(segment)
  }
}

class CarController {
  constructor (scene) {
    this.scene = scene;
    this.car = this.scene.physics.add.sprite(config.width / 2, config.height - config.height * 0.15, 'car').setOrigin(0.5, 0.5);
    this.car.setScale(0.8);
    this.car.body.moves = false;
    this.car.setCollideWorldBounds = false;
    this.car.setInteractive();
    this.car.setDepth(DEPTH_ENUM.CAR);

    this.carShadow = this.scene.physics.add.sprite(config.width / 2, config.height - config.height * 0.15, 'car_shadow').setOrigin(0.5, 0.5);
    this.carShadow.setScale(0.6);
    this.carShadow.body.moves = false;
    this.carShadow.setDepth(DEPTH_ENUM.CAR_SHADOW);

    this.maxAngle = 25.0;
    this.inputTurnPercent = 0.0;
    this.inputTurnSensitivity = 25.0;
    this.inputTurnFade = 15.0;

    this.carHorizontalPositionPercent = 0.0;
    this.sceneHorizontalSpace = 0.9;

    this.maxFowardSpeed = 12.0;
    this.forwardSpeed = 0.0;

    this.engineOn = false;
  }

  reset() {
    this.engineOn = false;
    this.forwardSpeed = 0.0;
    this.inputTurnPercent = 0.0;
  }

  getTurnSpeed () {
    // Todo return a value based on car speed, braking, grip
    return 0.9 * (this.forwardSpeed / this.maxFowardSpeed);
  }

  getHorizontalMovementSpeed () {
    // Todo return a value based on car speed, braking, grip etc
    return 0.19 * (this.forwardSpeed / this.maxFowardSpeed);
  }

  getCarForwardAcceleration () {
    // Todo return a value based on car's rpm, etc

    if(this.engineOn) {
      return 0.01;
    } else {
      return -0.0005;
    }
  }

  getCarTurnSlow() {
    let value = -0.01;

    if (this.forwardSpeed < this.maxFowardSpeed / 2) {
      value = -0.005;
    }

    return value;
  }

  brake() {

  }

  inputTurn(turnDirection) {
    this.inputTurnPercent += turnDirection * this.inputTurnSensitivity;

    this.inputTurnPercent = restrictValue(this.inputTurnPercent, -100.0, 100.0);
  }

  rotateCar(delta) {

    // Rotate car
    let oldAngle = this.car.angle;
    let newAngle = pullValueTo(this.car.angle,  30.0 * (this.inputTurnPercent / 100.0), this.getTurnSpeed() * delta);


    if(newAngle < 0.0){
      this.carHorizontalPositionPercent = this.carHorizontalPositionPercent - this.getHorizontalMovementSpeed() * delta * (0.0 - newAngle / this.maxAngle);
    }

    if(newAngle > 0.0){
      this.carHorizontalPositionPercent = this.carHorizontalPositionPercent + this.getHorizontalMovementSpeed() * delta * (newAngle / this.maxAngle);
    }

    this.carHorizontalPositionPercent = restrictValue(this.carHorizontalPositionPercent, -100.0, 100.0);

    let prevX = this.car.x;

    this.car.x = (config.width * (this.carHorizontalPositionPercent / 100.0) / 2.0 * this.sceneHorizontalSpace) + (config.width / 2);
    this.carShadow.x = this.car.x;

    // If car has not moved centre to straight
    if (this.car.x == prevX) {
      this.car.angle = pullValueTo(this.car.angle, 0, this.getTurnSpeed() * delta);
    }else{
      this.car.angle = newAngle;
    }

    // Make sure car hasen't over rotated
    if (this.car.angle < -this.maxAngle) {
      this.car.angle = -this.maxAngle;
    }

    if (this.car.angle > this.maxAngle) {
      this.car.angle = this.maxAngle;
    }

    this.carShadow.angle = this.car.angle;

    // Pull turn input back to zero
    this.inputTurnPercent = pullValueTo(this.inputTurnPercent, 0.0, this.inputTurnFade);

    // Slow car down
    if( this.inputTurnPercent < 0){
      this.forwardSpeed += -this.inputTurnPercent / 100.0 * this.getCarTurnSlow() * delta;

    }else{
      this.forwardSpeed += this.inputTurnPercent / 100.0 * this.getCarTurnSlow() * delta;
    }
  }

  accelerateCar(delta) {
    this.forwardSpeed += this.getCarForwardAcceleration() * delta;

    if(this.forwardSpeed > this.maxFowardSpeed){
      this.forwardSpeed = this.maxFowardSpeed;
    }

    if(this.forwardSpeed < 0){
      this.forwardSpeed = 0;
    }

    this.yPos += this.forwardSpeed;
  }

  update(delta, time) {
    this.rotateCar(delta);
    this.accelerateCar(delta);
  }
}
