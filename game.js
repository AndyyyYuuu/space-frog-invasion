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
    drawImage(this.attributes.image, this.attributes.fleetx-this.attributes.image.naturalWidth/2, this.attributes.fleety-this.attributes.image.naturalHeight/2, this.attributes.image.naturalWidth, this.attributes.image.naturalHeight);
    
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
    drawImage(this.attributes.image, this.x-this.attributes.image.naturalWidth/2, this.y+offset-this.attributes.image.naturalHeight/2, this.attributes.image.naturalWidth, this.attributes.image.naturalHeight);
  }

  attributeInRect(){
    return mouseInRect(Math.round(this.attributes.fleetx-this.attributes.width/2), Math.round(this.attributes.fleety-this.attributes.height/2), this.attributes.width, this.attributes.height)
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
      x: 16, y: 24, w: 96, h: 48
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
      if (mouseInRect(95,4,29,8)){
        this.startBattle();
      }
    }
  }

  render(){
    if (this.state == 0){
      buttonRect(95,4,29,8); // Battle button
      ctx.fillStyle = COLOR.TEXT;
      ctx.textAlign = "left";
      drawText("FLEET FORMATION",4,8,"large");
      drawText("BATTLE!",97,10,"small");
      for (let i=0; i<this.fleet.length; i++){
        this.fleet[i].layoutDraw();
        if (mouseIsDown && this.heldShip == null){
          if (this.fleet[i].attributeInRect()){
            this.heldShip = this.fleet[i];
            this.heldShip.dragX = mouseX - this.heldShip.attributes.fleetx;
            this.heldShip.dragY = mouseY - this.heldShip.attributes.fleety;
          }
        }
      }
      if (this.heldShip != null){
        if (mouseIsDown){
          this.heldShip.attributes.fleetx = Math.min(Math.max(mouseX-this.heldShip.dragX, this.FORMATION_SCREEN.x+Math.floor(this.heldShip.attributes.width/2)), this.FORMATION_SCREEN.x + this.FORMATION_SCREEN.w - Math.ceil(this.heldShip.attributes.width/2));
          this.heldShip.attributes.fleety = Math.min(Math.max(mouseY-this.heldShip.dragY, this.FORMATION_SCREEN.y+Math.floor(this.heldShip.attributes.height/2)), this.FORMATION_SCREEN.y + this.FORMATION_SCREEN.h - Math.ceil(this.heldShip.attributes.height/2));

        }else{
          this.heldShip = null;
        }
        ctx.globalAlpha = 0.5;
        uiRect(this.FORMATION_SCREEN.x, this.FORMATION_SCREEN.y, this.FORMATION_SCREEN.w, this.FORMATION_SCREEN.h);
        ctx.globalAlpha = 1;
      }

      
      uiRect(4, 80, 120, 44);
      

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