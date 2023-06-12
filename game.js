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
  }

  startBattle(){
    this.state = 1;
    for (let i=0; i<this.fleet.length; i++){
      this.fleet[i].startBattle();
    }
  }


  render(){
    if (this.state == 0){
      ctx.fillStyle = COLOR.TEXT;
      ctx.textAlign = "left";
      ctx.font = "40px wendy";
      ctx.fillText("Fleet Formation",16,32);
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
          this.heldShip.attributes.fleetx = (mouseX)/4-this.heldShip.dragX;
          this.heldShip.attributes.fleety = (mouseY)/4-this.heldShip.dragY;
        }else{
          this.heldShip = null;
        }
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