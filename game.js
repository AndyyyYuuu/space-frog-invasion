class Star{
  constructor(){
    this.x = Math.random() * 128;
    this.y = Math.random() * 192 - 64;
    this.opacity = Math.random()*0.5+0.25;
  }
  draw(offset){
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = "white";
    ctx.fillRect(Math.round(this.x)*PIXEL, Math.round(this.y+offset)*PIXEL, PIXEL, PIXEL);
    ctx.globalAlpha = 1;
  }
}


class Entity{
  constructor(attributes){
    this.x = -1;
    this.y = -1; 
    this.dx = 0;
    this.dy = 0;
    this.dead = false;
    this.attributes = attributes;
  }
  draw(offset){
    drawImage(this.attributes.image, this.x-this.attributes.image.naturalWidth/2, this.y+offset-this.attributes.image.naturalHeight/2, this.attributes.image.naturalWidth, this.attributes.image.naturalHeight);
  }

}

class Frog extends Entity{
  constructor(attributes){
    super(attributes);
  }

  draw(){
    drawImage(this.attributes.image, this.attributes.fleetx-this.attributes.image.naturalWidth/2, this.attributes.fleety-this.attributes.image.naturalHeight/2, this.attributes.image.naturalWidth, this.attributes.image.naturalHeight)
  }


}



class Ship extends Entity{
  constructor(attributes){
    super(attributes);
    
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

class ShooterShip extends Ship{
  constructor(x, y, lvl){
    super({
      health: 2+lvl*2,
      damage: 1+lvl,
      width: 5,
      height: 6,
      image: IMAGE.ship.collider[0], 
      fleetx: x,
      fleety: y,
      typeName: "Shooter",
      lvl: lvl
    })
  }
}

class BasicShip extends Ship{
  constructor(x, y){
    super({
      health: 3,
      damage: 1,
      width: 5,
      height: 6,
      image: IMAGE.ship.collider[0], 
      fleetx: x,
      fleety: y,
      typeName: "Basic",
      lvl: 0
    })
  }
}


class Game{
  constructor(name){
    this.name = name;
    this.state = 0;
    this.fleet = [new ShooterShip(32, 32, 1),new BasicShip(64, 32),new BasicShip(32, 64),new BasicShip(64, 64)];
    this.heldShip = null;
    this.selectedShip = null;
    this.battleFrames = 0;

    this.starMap = [];
    for (var i=0;i<100;i++){
      this.starMap.push(new Star());
    }

    this.FORMATION_SCREEN = {
      x: 16, y: 24, w: 96, h: 48
    }

  }

  startBattle(){
    this.state = 1;
    this.battleFrames = 0;
    this.heldShip = null;
    this.selectedShip = null;
    for (let i=0; i<this.fleet.length; i++){
      this.fleet[i].startBattle();
    }
  }

  mouseMove(){
    for (let i=0; i<this.fleet.length; i++){
      if (mouseIsDown && this.heldShip == null){
        if (this.fleet[i].attributeInRect()){
          this.heldShip = this.fleet[i];
          this.heldShip.dragX = mouseX - this.heldShip.attributes.fleetx;
          this.heldShip.dragY = mouseY - this.heldShip.attributes.fleety;
        }
      }
    }
  }

  click(){
    if (this.state == 0){
      if (mouseInRect(95,4,29,8)){ // Battle button
        this.startBattle();
      }else if (mouseInRect(this.FORMATION_SCREEN.x,this.FORMATION_SCREEN.y,this.FORMATION_SCREEN.w,this.FORMATION_SCREEN.h)){

        for (let i=0; i<this.fleet.length; i++){
          if (this.fleet[i].attributeInRect()){
            this.selectedShip = this.fleet[i];
            return;
          }
        }
        this.selectedShip = null;
      }
    }
  }

  render(){
    for (let i=0;i<this.starMap.length;i++){
      this.starMap[i].draw(Math.min(this.battleFrames,48));
    }
    if (this.state == 0){
      buttonRect(95,4,29,8); // Battle button
      ctx.fillStyle = COLOR.TEXT;
      ctx.textAlign = "left";
      drawText("FLEET FORMATION",4,8,"large");
      drawText("BATTLE!",97,10,"small");
      for (let i=0; i<this.fleet.length; i++){
        this.fleet[i].layoutDraw();
        
      }
      if (this.selectedShip != null){// draw box around selected ship
        selectRect(Math.round(this.selectedShip.attributes.fleetx-this.selectedShip.attributes.width/2), Math.round(this.selectedShip.attributes.fleety-this.selectedShip.attributes.height/2), this.selectedShip.attributes.width, this.selectedShip.attributes.height);
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


      // Bottom UI menu
      uiRect(4, 80, 120, 44);
      if (this.selectedShip!=null){
        drawText(this.selectedShip.attributes.typeName+" Ship", 8, 88, "large");
        drawText("HP: ", 8, 96, "small");
        drawText(this.selectedShip.attributes.health, 20, 96, "large");
        drawText("DMG: ", 8, 104, "small")
        drawText(this.selectedShip.attributes.damage, 26, 104, "large");
        drawText("Lvl. "+this.selectedShip.attributes.lvl, 88, 88, "small");

      }
      

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