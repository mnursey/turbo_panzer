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
    this.on('pointerup', () => {
        this.hoverState();
        if(clickCallback !== undefined){
          clickCallback();
        }
    });

    scene.add.existing(this);
  }

  hoverState() {
    this.setStyle({fontSize: '32px', fill : '#FFA500'});
  }

  resetState(){
    this.setStyle(this.defaultStyle);
  }

  activeState(){
    this.setStyle({fontSize: '32px', fill : '#ffffff'});
  }
}
