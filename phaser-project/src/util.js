var moveToPosition = function (parameters) {

  let x = parameters['target'].x;
  let y = parameters['target'].y;
  let gameobject = parameters['source'];
  let speed = parameters['speed'];

  let changeX = 0;
  let changeY = 0;

  let speedX = Math.abs(x - gameobject.x) > speed ? speed : Math.abs(x - gameobject.x);
  let speedY = Math.abs(y - gameobject.y) > speed ? speed : Math.abs(y - gameobject.y);

  if(x < gameobject.x){
    changeX = -speedX;
    gameobject.anims.play('left', true);
  }else if (x > gameobject.x) {
    changeX = speedX;
    gameobject.anims.play('right', true);
  }

  if(y < gameobject.y){
    changeY = -speedY;
  }else{
    changeY = speedY;
  }

  gameobject.x += changeX;
  gameobject.y += changeY;

  if(gameobject.x === x && gameobject.y === y){
    gameobject.anims.play('turn');
    gameobject.order = undefined;
    return STATE_ENUM.FINISHED;
  }else{
    return STATE_ENUM.RUNNING;
  }
}
