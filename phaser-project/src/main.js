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
var roadController = undefined;
var gameController = undefined;
var obstacleController = undefined;

var gameColliders = undefined;

var game = new Phaser.Game(config);
function preload ()
{
    this.load.image('road_blank', 'assets/road_blank.png');
    this.load.image('road_straight_left', 'assets/road_straight_left.png');
    this.load.image('road_straight_right', 'assets/road_straight_right.png');
    this.load.image('car', 'assets/car_red.png');
    this.load.image('barrel', 'assets/barrel_blue.png');
    this.load.image('barrel_down', 'assets/barrel_blue_down.png');
    this.load.image('sky', 'assets/sky.png');
}

function hitCollider(car, collider) {

  if( collider.prevHit === null || collider.prevHit === undefined) {
    collider.setTexture('barrel_down');
    collider.y -= carController.forwardSpeed;
    carController.forwardSpeed = 1.0;
    collider.angle = -90;
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
    backgroundImage = this.add.image(config.width / 2, config.height / 2, 'sky');
    backgroundImage.setScale(config.width / 800, config.height / 600);

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
    roadController = new RoadController(this);

    // obstacle controller
    obstacleController = new ObstacleController(this);

    gameColliders = this.physics.add.collider(carController.car, obstacleController.physicsGroup, hitCollider, null, this);
    gameColliders.overlapOnly = true;
    console.log(gameColliders);

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
    camera.setBackgroundColor("#003441");

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

      if(roadController !== undefined){
        roadController.update(delta, carController.forwardSpeed);
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
    this.gameUI["lifeUI"] = new TextButton(this.scene, config.width / 2, 32, "", { fontSize: '32px', fill: '#e1eeee' }, undefined , DEPTH_ENUM.UI).setOrigin(0.5);
    new TextButton(this.scene, config.width  - 128 - 60, 16 * 4, "", { fontSize: '32px', fill: '#e1eeee' }, undefined , DEPTH_ENUM.UI);
    this.gameUI["scoreUI"] = new TextButton(this.scene, config.width  - 128 - 60, 16 * 4, "", { fontSize: '32px', fill: '#e1eeee' }, undefined , DEPTH_ENUM.UI);
    this.gameUI["speedUI"] = new TextButton(this.scene, config.width  - 128 - 60, 16, "", { fontSize: '32px', fill: '#e1eeee' }, undefined , DEPTH_ENUM.UI);

    // Add buttons
    this.playMenu = {};
    this.playMenu["playButton"] = new TextButton(this.scene,  config.width / 2, config.height / 2 - 200, '', { fontSize: '32px', fill: '#e1eeee' , fontFamily: DEFAULT_FONT },

    function () {
       if (gameController.gameState === GAME_STATE_ENUM.IDLE) {
         gameController.startGame();
       }

       if (gameController.gameState === GAME_STATE_ENUM.GAMEOVER) {
         carController.engineOn = true;
         gameController.gameUI["scoreUI"].text = "";
         gameController.resetGame();
       }
    }

     , DEPTH_ENUM.UI).setOrigin(0.5);

    this.playMenu["optionsButton"] = new TextButton(this.scene, 16 * 3, 48, '', { fontSize: '32px', fill: '#ffffff' }, function () { console.log("Options");} , DEPTH_ENUM.UI);
    this.playMenu["infoButton"] = new TextButton(this.scene, config.width / 2, config.height / 2 - 200, this.tutText, { fontSize: '32px', fill: '#e1eeee' }, undefined , DEPTH_ENUM.UI).setOrigin(0.5);

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

        this.gameUI["lifeUI"].text = "";
        this.playMenu["infoButton"].text = this.tutText;
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
    this.playMenu["playButton"].text = "";
  }

  startGame () {
    if (this.gameState === GAME_STATE_ENUM.IDLE) {
      this.gameState = GAME_STATE_ENUM.RUNNING;
      carController.engineOn = true;
      this.obstacleController.start();
      this.playMenu["infoButton"].text = "";
    }
  }

  endGame () {
    this.gameUI["lifeUI"].text = "GAME OVER";
    this.carController.engineOn = false;
    this.gameState = GAME_STATE_ENUM.GAMEOVER;
    this.playMenu["playButton"].text = "Restart";
  }
}

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
    this.sprite.body.position.y = this.sprite.y - 56 / 2;
    if (this.sprite.y - 28 * 2 > config.height) {
      this.controller.markObstacleForRemoval(this.id);
    }
  }
}

class ObstacleController {
  constructor(scene) {
    this.scene = scene;
    this.obstacles = [];
    this.IDsToDelete = [];
    this.hightestId = 0;
    this.lastSpawnDistance = 0.0;
    this.maxDeltaDistance = 350.0;
    this.distance = 0.0;
    this.physicsGroup = this.scene.physics.add.group({});
    this.speedMultiplier = ROAD_OBJECT_SPEED_MULTIPLIER;
    this.wallChance = 0.0;
    this.obstaclesUntilChangeChance = 10;
    this.obstaclesUntilChangeChanceMax = 15;
    this.spawn = false;
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

        this.wallChance = Math.random();
      }
    }
  }

  start (){
    this.spawn = true;
  }

  reset (){
    this.lastSpawnDistance = 0.0;
    this.maxDeltaDistance = 350.0;
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

    obstacle.sprite.destroy(true);
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

class RoadController {
  constructor (scene) {
    this.scene = scene;
    this.roadSegments = [];
    this.speedMultiplier = ROAD_OBJECT_SPEED_MULTIPLIER;

    for(let i = 0 ; i < 20; i += 1){
      this.addSegment(i * 128);
    }
  }

  update (delta, carSpeed) {
    for(let i = 0; i < this.roadSegments.length; ++i){
      let roadSegment = this.roadSegments[i];
      roadSegment.y += carSpeed * delta * this.speedMultiplier;

      if(roadSegment.y - 128 / 2 > config.height){
        roadSegment.y = -830 + (roadSegment.y - config.height);
      }
    }
  }

  addSegment(yOffset){
    let leftRoad = this.scene.physics.add.sprite(SCREEN_ROAD_OFFSET, 0, 'road_straight_left').setOrigin(0.5, 0.5);
    let rightRoad = this.scene.physics.add.sprite(config.width - SCREEN_ROAD_OFFSET, 0, 'road_straight_right').setOrigin(0.5, 0.5);

    let roadTiles = [leftRoad, rightRoad];

    for(let i = SCREEN_ROAD_OFFSET + 128 / 2; i < config.width - SCREEN_ROAD_OFFSET - 128 / 2; i += 128 / 2) {
      roadTiles.push(this.scene.physics.add.sprite(i, 0, 'road_blank').setOrigin(0.5, 0.5));

    }


    for(let i = 0; i < roadTiles.length; ++i){
      roadTiles[i].setDepth(DEPTH_ENUM.ROAD);
    }

    let segment = this.scene.add.container(0, 450 + yOffset, roadTiles);

    this.roadSegments.push(segment)
  }
}

class CarController {
  constructor (scene) {
    this.scene = scene;
    this.car = this.scene.physics.add.sprite(config.width / 2, config.height - config.height * 0.25, 'car').setOrigin(0.5, 0.5);
    this.car.body.moves = false;
    this.car.setCollideWorldBounds = false;
    this.car.setInteractive();
    this.car.setDepth(DEPTH_ENUM.CAR);

    this.maxAngle = 25.0;
    this.inputTurnPercent = 0.0;
    this.inputTurnSensitivity = 25.0;
    this.inputTurnFade = 15.0;

    this.carHorizontalPositionPercent = 0.0;
    this.sceneHorizontalSpace = 0.8;

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
    return 0.29 * (this.forwardSpeed / this.maxFowardSpeed);
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
