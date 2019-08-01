class TextButton extends Phaser.GameObjects.Text {
  constructor (scene, x, y, text, style, clickCallback, depth){

    if(style.fontFamily === undefined){
      style.fontFamily = DEFAULT_FONT;
    }

    super(scene, x, y, text, style);
    this.defaultStyle = style;
    this.setDepth(DEPTH_ENUM.UNIT);
    this.setInteractive();
    this.on('pointerover', () => this.hoverState());
    this.on('pointerout', () => this.resetState());
    this.on('pointerdown', () => this.activeState());
    this.setScrollFactor(0);
    this.clickCallback = clickCallback;
    this.on('pointerup', () => {
        this.hoverState();
        if(this.clickCallback !== undefined && this.clickCallback !== undefined){
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
}
