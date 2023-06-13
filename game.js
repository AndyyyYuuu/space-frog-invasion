class Ship{
  constructor(attributes){
    this.x = -1;
    this.y = -1;
    this.dx = 
    this.attributes = attributes;
    this.dx = 0;
    this.dy = 0;
    this.dead = false;
    this.dragX = -1;
    this.dragY = -1;
  }

  layoutDraw(){
    ctx.drawImage(this.attributes.image, Math.round(this.attributes.fleetx-this.attributes.image.naturalWidth/2)*PIXEL, Math.round(this.attributes.fleety-this.attributes.image.naturalHeight/2)*PIXEL, this.attributes.image.naturalWidth*PIXEL, this.attributes.image.naturalHeight*PIXEL);
    
  }

  

  startBattle(){
    this.x = this.attributes.fleetx;
    this.y = this.attributes.fleety + 48;
  }

  update(){
    this.x += this.dx*0.5;
    this.y += this.dy*0.5;
    this.dx *= 0.99;
    this.dy *= 0.99;
  }

  battleDraw(offset){
    ctx.drawImage(this.attributes.image, Math.round(this.x-this.attributes.image.naturalWidth/2)*PIXEL, Math.round(this.y+offset-this.attributes.image.naturalHeight/2)*PIXEL, this.attributes.image.naturalWidth*PIXEL, this.attributes.image.naturalHeight*PIXEL);
  }

  attributeInRect(){
    return mouseInRect(Math.round(this.attributes.fleetx-this.attributes.width/2)*PIXEL, Math.round(this.attributes.fleety-this.attributes.height/2)*PIXEL, this.attributes.width*PIXEL, this.attributes.height*PIXEL)
  }
}

class ShootyShip extends Ship{
  constructor(x, y){
    super({
      health: 1,
      width: 5,
      height: 6,
      image: IMAGE.ship.collider[0], 
      fleetx: x,
      fleety: y
    })
  }
}

class Game{
  constructor(name){
    this.name = name;
    this.state = 0;
    this.fleet = [new ShootyShip(32, 32),new ShootyShip(64, 32),new ShootyShip(32, 64),new ShootyShip(64, 64)];
    this.heldShip = null;
    this.battleFrames = 0;

    this.FORMATION_SCREEN = {
      x: 32, y: 96, w: 448, h: 192
    }
  }

  startBattle(){
    this.state = 1;
    for (let i=0; i<this.fleet.length; i++){
      this.fleet[i].startBattle();
    }
  }

  click(){
    if (this.state == 0){
      if (mouseInRect(380,16,116,32)){
        this.startBattle();
      }
    }
  }

  render(){
    if (this.state == 0){
      buttonRect(380,16,116,32); // Battle button
      ctx.fillStyle = COLOR.TEXT;
      ctx.textAlign = "left";
      ctx.font = "64px wendy";
      ctx.fillText("FLEET FORMATION",16,32);
      ctx.font = "24px tiny";
      ctx.fillText("BATTLE!",388,40);
      for (let i=0; i<this.fleet.length; i++){
        this.fleet[i].layoutDraw();
        if (mouseIsDown && this.heldShip == null){
          if (this.fleet[i].attributeInRect()){
            this.heldShip = this.fleet[i];
            this.heldShip.dragX = mouseX/4 - this.heldShip.attributes.fleetx;
            this.heldShip.dragY = mouseY/4 - this.heldShip.attributes.fleety;
          }
        }
      }
      if (this.heldShip != null){
        if (mouseIsDown){
          this.heldShip.attributes.fleetx = Math.min(Math.max(mouseX-this.heldShip.dragX*4, this.FORMATION_SCREEN.x), this.FORMATION_SCREEN.x + this.FORMATION_SCREEN.w)/4;
          this.heldShip.attributes.fleety = Math.min(Math.max(mouseY-this.heldShip.dragY*4, this.FORMATION_SCREEN.y), this.FORMATION_SCREEN.y + this.FORMATION_SCREEN.h)/4;

        }else{
          this.heldShip = null;
        }
        ctx.globalAlpha = 0.5;
        uiRect(this.FORMATION_SCREEN.x, this.FORMATION_SCREEN.y, this.FORMATION_SCREEN.w, this.FORMATION_SCREEN.h);
        ctx.globalAlpha = 1;
      }

      
      uiRect(16, 320, 480, 176);
      

    }else if (this.state == 1){

      for (let i=0; i<this.fleet.length; i++){
        this.fleet[i].battleDraw(Math.min(0, this.battleFrames-48));
        this.fleet[i].update();
      }

      this.battleFrames ++;
    }
  }
}

window.Game = Game;