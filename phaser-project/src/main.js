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
var score = 0;
var gameOver = false;
var scoreText;
var lifeText;
var inputs;
var camera;
var backgroundImage;
var carController = undefined;
var roadController = undefined;
var c;
var obstacleController;

var life = 3;

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
    collider.y -= carController.forwardSpeed;
    carController.forwardSpeed = 0.0;
    collider.setTexture('barrel_down');
    collider.angle = -90;
    collider.prevHit = true;
    life += -1;

    lifeText.text = "GAME OVER";

  } else {
    if(carController.forwardSpeed > 5) {
      carController.forwardSpeed = 5.0;
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

    c = this.physics.add.collider(carController.car, obstacleController.physicsGroup, hitCollider, null, this);
    c.overlapOnly = true;
    console.log(c);

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

    //  The score
    scoreText = this.add.text(config.width  - 128 - 16, 16, '0 KM', { fontSize: '32px', fill: '#ffffff' , fontFamily: DEFAULT_FONT });
    scoreText.setDepth(DEPTH_ENUM.UI);

    //  The score
    let lt = 'X'.repeat(life);
    lifeText = this.add.text(config.width / 2, 32, lt, { fontSize: '32px', fill: '#ffffff' , fontFamily: DEFAULT_FONT, align: 'center'});
    lifeText.setOrigin﻿(0.5);
    lifeText.setDepth(DEPTH_ENUM.UI);

    // Add button
    new TextButton(this, 16 * 3, 16, 'Play', { fontSize: '32px', fill: '#ffffff' , fontFamily: DEFAULT_FONT }, function () { console.log("Race");} , DEPTH_ENUM.UI);
    new TextButton(this, 16 * 3, 48, 'Options', { fontSize: '32px', fill: '#ffffff' }, function () { console.log("Leadboard");} , DEPTH_ENUM.UI);
    new TextButton(this, 16 * 3, 80, 'Info', { fontSize: '32px', fill: '#ffffff' }, function () { console.log("Options");} , DEPTH_ENUM.UI);
}

function update (time, delta)
{
  if(carController !== undefined) {
    if(inputs[INPUT_ENUM.KEY_LEFT].isDown){
      carController.inputTurn(TURN_ENUM.LEFT);
    }

    if(inputs[INPUT_ENUM.KEY_RIGHT].isDown){
      carController.inputTurn(TURN_ENUM.RIGHT);
    }
  }

  if (gameOver) {
    return;
  }else{

    if(carController !== undefined) {
      carController.update(delta, time);

      if(roadController !== undefined){
        roadController.update(delta, carController.forwardSpeed);
      }

      if (obstacleController !== undefined) {
        obstacleController.update(delta, time, carController.forwardSpeed);
      }

      if (life > 0) {
        lifeText.text = 'X'.repeat(life);
      }

      scoreText.text = 4 * carController.forwardSpeed.toFixed(0) + " KM";
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

class Obstacle {
  constructor(scene, controller, id, posPercent){
    this.scene = scene;
    this.sprite = this.scene.physics.add.sprite((config.width - ( 2 * SCREEN_ROAD_OFFSET)) * posPercent + SCREEN_ROAD_OFFSET,  -100, 'barrel').setOrigin(0.5, 0.5);
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
    this.obstaclesUntilChangeChanceMax = 20;
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

    if(this.distance - this.lastSpawnDistance > this.maxDeltaDistance) {
      this.lastSpawnDistance = this.distance;

      let wC = Math.random();

      if(wC <= this.wallChance) {
        this.createWall();
      }else{
        this.createObstacle();
      }

      this.obstaclesUntilChangeChance += -1;

      if(this.obstaclesUntilChangeChance < 1) {
        this.obstaclesUntilChangeChance = Math.ceil(Math.random() * this.obstaclesUntilChangeChanceMax);

        this.wallChance = Math.random();
      }
    }
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
    let p = Math.min( 1.0, Math.max(0.0, ((Math.random() - 0.5) * 0.6 + (carController.car.x / config.width))));
    let ob = new Obstacle(this.scene, this, this.hightestId++, p);
    this.obstacles.push(ob);
    this.physicsGroup.add(ob.sprite);
  }

  createWall() {
    let startingPercent = Math.random();
    let direction = Math.random() > 0.5 ? 1.0 : -1.0;
    let obstacleWidthPercent = 56.0 / (config.width - 2 * SCREEN_ROAD_OFFSET);
    let s = obstacleWidthPercent / 10.0;

    for(let i = 0; i < 5; ++i) {
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
  }

  getTurnSpeed () {
    // Todo return a value based on car speed, braking, grip
    return 0.9 * (this.forwardSpeed / this.maxFowardSpeed);
  }

  getHorizontalMovementSpeed () {
    // Todo return a value based on car speed, braking, grip etc
    return 0.27 * (this.forwardSpeed / this.maxFowardSpeed);
  }

  getCarForwardAcceleration () {
    // Todo return a value based on car's rpm, etc
    return 0.01;
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
