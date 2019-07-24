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
var inputs;
var camera;
var backgroundImage;
var carController = undefined;
var roadController = undefined;

var game = new Phaser.Game(config);
function preload ()
{
    this.load.image('road_blank', 'assets/road_blank.png');
    this.load.image('road_straight_left', 'assets/road_straight_left.png');
    this.load.image('road_straight_right', 'assets/road_straight_right.png');
    this.load.image('car', 'assets/car_red.png');

    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
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

    roadController = this.physics.add.sprite(80, 450, 'road_straight_left').setOrigin(0.5, 0.5);
    roadController.setDepth(DEPTH_ENUM.ROAD);

    //car.setInteractive();
    //car.setDepth(DEPTH_ENUM.CAR);

    /*/  Our car animations, turning, walking left and walking right.
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    car.anims.play('turn');*/

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
    camera.setBackgroundColor(0x9addf3);

    //  Some cities to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    /*cities = this.physics.add.group({
        key: 'car',
        repeat: 11,
        setXY: { x: 25, y: 150, stepX: 70, stepY: 15 }
    });

    cities.children.iterate(function (child) {

        //  Give each cities a slightly different position
        child.x += Phaser.Math.Between(-5, 5);
        child.y = Phaser.Math.Between(100, 700);

        child.setInteractive();
        child.setDepth(DEPTH_ENUM.ROAD);
    });*/

    //car.x = cities.getChildren()[0].x;
    //car.y = cities.getChildren()[0].y;

    //  The score
    //scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

    // Add button
    new TextButton(this, 16, 16, 'Play', { fontSize: '32px', fill: '#000' , fontFamily: DEFAULT_FONT }, function () { console.log("Play");} , DEPTH_ENUM.UI);
    new TextButton(this, 16, 48, 'Options', { fontSize: '32px', fill: '#000' }, function () { console.log("Options");} , DEPTH_ENUM.UI);
    new TextButton(this, 16, 80, 'Info', { fontSize: '32px', fill: '#000' }, function () { console.log("Info");} , DEPTH_ENUM.UI);

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
      carController.update(time, delta);
      roadController.y += carController.forwardSpeed;
      if(roadController.y > config.height){
        roadController.y = 0 - 300;
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

class RoadSegment {
  constructor (scene, width) {

  }
}

class RoadController {
  constructor (scene) {
    this.scene = scene;
    this.roadSegments = [];
  }

  update (delta, carSpeed) {

  }
}

class CarController {
  constructor (scene) {
    this.scene = scene;
    this.car = this.scene.physics.add.sprite(config.width / 2, config.height - config.height * 0.25, 'car').setOrigin(0.5, 0.5);
    this.car.setCollideWorldBounds = false;
    this.car.setInteractive();
    this.car.setDepth(DEPTH_ENUM.CAR);

    this.maxAngle = 25.0;
    this.inputTurnPercent = 0.0;
    this.inputTurnSensitivity = 25.0;
    this.inputTurnFade = 15.0;

    this.carHorizontalPositionPercent = 0.0;
    this.sceneHorizontalSpace = 0.8;

    this.maxFowardSpeed = 10.0;
    this.forwardSpeed = 0.0;
  }

  getTurnSpeed () {
    // Todo return a value based on car speed, braking, grip
    return 0.8 * (this.forwardSpeed / this.maxFowardSpeed);
  }

  getHorizontalMovementSpeed () {
    // Todo return a value based on car speed, braking, grip etc
    return 0.18 * (this.forwardSpeed / this.maxFowardSpeed);
  }

  getCarForwardAcceleration () {
    // Todo return a value based on car's rpm, etc
    return 0.01;
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
    this.car.angle = newAngle;


    if(this.car.angle < 0.0){
      this.carHorizontalPositionPercent = this.carHorizontalPositionPercent - this.getHorizontalMovementSpeed() * delta * (0.0 - this.car.angle / this.maxAngle);
    }

    if(this.car.angle > 0.0){
      this.carHorizontalPositionPercent = this.carHorizontalPositionPercent + this.getHorizontalMovementSpeed() * delta * (this.car.angle / this.maxAngle);
    }

    this.carHorizontalPositionPercent = restrictValue(this.carHorizontalPositionPercent, -100.0, 100.0);


    this.car.x = (config.width * (this.carHorizontalPositionPercent / 100.0) / 2.0 * this.sceneHorizontalSpace) + (config.width / 2);

    // Make sure car hasen't over rotated
    if (this.car.angle < -this.maxAngle) {
      this.car.angle = -this.maxAngle;
    }

    if (this.car.angle > this.maxAngle) {
      this.car.angle = this.maxAngle;
    }

    // Pull turn input back to zero
    this.inputTurnPercent = pullValueTo(this.inputTurnPercent, 0.0, this.inputTurnFade);
  }

  accelerateCar(delta) {
    this.forwardSpeed += this.getCarForwardAcceleration() * delta;

    if(this.forwardSpeed > this.maxFowardSpeed){
      this.forwardSpeed = this.maxFowardSpeed;
    }

    this.yPos += this.forwardSpeed;
  }

  update(time, delta) {
    this.rotateCar(delta);
    this.accelerateCar(delta);
  }
}
