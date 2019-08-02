var DEFAULT_FONT = '"Lucida Sans Unicode", "Lucida Grande", sans-serif';

var DEPTH_ENUM = {
  BACKGROUND : 0,
  ROAD : 50,
  CAR : 75,
  OBSTACLE : 74,
  UI : 100
}

var TURN_ENUM = {
  LEFT : -1,
  FORWARD : 0,
  RIGHT : 1
}

var INPUT_ENUM = {
  KEY_LEFT : 0,
  KEY_RIGHT : 1,
  KEY_DOWN : 2
}

var ROAD_OBJECT_SPEED_MULTIPLIER = 0.055;
var SCREEN_ROAD_OFFSET = 80;

var GAME_STATE_ENUM = {
  IDLE : 0,
  RUNNING : 1,
  RESETTING : 2,
  GAMEOVER : 3,
}

var FADE_STATE_ENUM = {
  NONE : 0,
  IN : 1,
  OUT : 2
}
