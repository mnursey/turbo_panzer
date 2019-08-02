class TextButton extends Phaser.GameObjects.Text {
  constructor (scene, x, y, text, style, clickCallback, depth){

    if(style.fontFamily === undefined){
      style.fontFamily = DEFAULT_FONT;
    }

    super(scene, x, y, text, style);
    this.defaultStyle = style;
    this.setDepth(DEPTH_ENUM.UI);
    this.setInteractive();
    this.on('pointerover', () => this.hoverState());
    this.on('pointerout', () => this.resetState());
    this.on('pointerdown', () => this.activeState());
    this.setScrollFactor(0);
    this.fadeRate = 0.01;
    this.clickCallback = clickCallback;
    this.fadeState = FADE_STATE_ENUM.NONE;
    this.enabled = false;
    this.alpha = 0;

    this.on('pointerup', () => {
        this.hoverState();
        if(this.clickCallback !== undefined && this.clickCallback !== undefined && this.enabled){
          clickCallback();
        }
    });

    scene.add.existing(this);
  }

  hoverState() {
    if(this.clickCallback !== undefined && this.clickCallback !== undefined){
      //this.setStyle({fontSize: '36px', fill : '#FFA500'});
      this.setStyle({fontSize: '36px'});

    }
  }

  resetState(){
    if(this.clickCallback !== undefined && this.clickCallback !== undefined){
      this.setStyle(this.defaultStyle);
    }
  }

  activeState(){
    if(this.clickCallback !== undefined && this.clickCallback !== undefined){
      //this.setStyle({fontSize: '38px', fill : '#ffffff'});
      this.setStyle({fontSize: '38px'});
    }
  }

  fadeIn() {
    this.enabled = true;
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 750,
      ease: 'Power2'
    });
  }

  fadeOut() {
    this.enabled = false;
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 750,
      ease: 'Power2'
    });
  }
}


class BitmapTextButton extends Phaser.GameObjects.BitmapText {
  constructor (scene, x, y, text, font, clickCallback, size, align, depth){
    super(scene, x, y, font, text, size, align);
    this.setDepth(DEPTH_ENUM.UI);
    this.setInteractive();
    this.on('pointerover', () => this.hoverState());
    this.on('pointerout', () => this.resetState());
    this.on('pointerdown', () => this.activeState());
    this.setScrollFactor(0);
    this.fadeRate = 0.01;
    this.clickCallback = clickCallback;
    this.fadeState = FADE_STATE_ENUM.NONE;
    this.enabled = false;
    this.alpha = 0;

    this.on('pointerup', () => {
        this.hoverState();
        if(this.clickCallback !== undefined && this.clickCallback !== undefined && this.enabled){
          clickCallback();
        }
    });

    scene.add.existing(this);
  }

  hoverState() {
    if(this.clickCallback !== undefined && this.clickCallback !== undefined){
      this.size = 36;
    }
  }

  resetState(){
    if(this.clickCallback !== undefined && this.clickCallback !== undefined){
      this.size = 30;
    }
  }

  activeState(){
    if(this.clickCallback !== undefined && this.clickCallback !== undefined){
      this.size = 32;
    }
  }

  fadeIn() {
    this.enabled = true;
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 750,
      ease: 'Power2'
    });
  }

  fadeOut() {
    this.enabled = false;
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 750,
      ease: 'Power2'
    });
  }
}
