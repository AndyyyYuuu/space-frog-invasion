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
  battleDraw(offset){
    drawImage(this.attributes.image, this.x-this.attributes.image.naturalWidth/2, this.y+offset-this.attributes.image.naturalHeight/2, this.attributes.image.naturalWidth, this.attributes.image.naturalHeight);
  }
  isTouching(entity){
    return Math.round(Math.abs(this.attributes.fleetx - entity.attributes.fleetx)) <= Math.round((this.attributes.width+entity.attributes.width)/2) && Math.round(Math.abs(this.attributes.fleety - entity.attributes.fleety)) < Math.round((this.attributes.height+entity.attributes.height)/2);
  }
}

class Frog extends Entity{
  constructor(attributes){
    super(attributes);
  }

  draw(){
    drawImage(this.attributes.image, this.attributes.fleetx-this.attributes.image.naturalWidth/2, this.attributes.fleety-this.attributes.image.naturalHeight/2, this.attributes.image.naturalWidth, this.attributes.image.naturalHeight)
  }
  startBattle(){
    this.x = this.attributes.fleetx;
    this.y = this.attributes.fleety;
  }
  update(){
    this.y += 0.1;
  }

}

class ColliderFrog extends Frog{
  constructor(x, y, lvl){
    super({
      fleetx:x,
      fleety:y,
      image:IMAGE.frog.collider[lvl],
      health: 1+lvl*2,
      damage: 1+lvl,
      width: 5, 
      height: 8,
    })
  }
}



class Ship extends Entity{
  constructor(attributes){
    super(attributes);
    this.thrust = 0;
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

  update(targetThrust){
    this.x += this.dx*0.5;
    this.y += this.dy*0.5;
    this.dx *= 0.95;
    this.dy *= 0.95;
    if (this.dy >= -targetThrust){
      this.thrust = 20;
    }

    if (this.thrust > 0){
      this.thrust --;
      this.dy -= 0.1;
    }
  }
  /*
  battleDraw(offset){
    drawImage(this.attributes.image, this.x-this.attributes.image.naturalWidth/2, this.y+offset-this.attributes.image.naturalHeight/2, this.attributes.image.naturalWidth, this.attributes.image.naturalHeight);
  }*/
  
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
    this.fleet = [new BasicShip(64, 32),new BasicShip(48, 48),new BasicShip(80, 48)];
    this.frogs = [];
    this.entities = this.fleet.concat(this.frogs); // All entities, frogs and ships
    this.heldShip = null;
    this.selectedShip = null;
    this.battleFrames = 0;
    this.gameOverFrames = 0;
    this.currency = {
      biomatter:0,
      metal:0
    }
    this.starMap = [];
    this.frogLevels = [];
    this.currentLevel = 0;
    for (var i=0;i<100;i++){
      this.starMap.push(new Star());
    }

    this.FORMATION_SCREEN = {
      x: 16, y: 24, w: 96, h: 48
    }

  }

  newLevel(num){
    num = 1;
    var level = [];
    var randX, randY;
    var spaceIsTaken;
    
    for (let i=0;i<num/2+1;i++){
      level.push(new ColliderFrog(0, 0, 0));
      spaceIsTaken = true;
      while (spaceIsTaken){

        level[level.length-1].attributes.fleetx = (56-4*num)+Math.random()*(1+4*num);
        level[level.length-1].attributes.fleety = 8+Math.random()*32;
        spaceIsTaken = false;
        for (let j=0;j<level.length;j++){

          if (j != level.length-1 && level[level.length-1].isTouching(level[j])){
            spaceIsTaken = true;
          }
        }
        console.log("*")
      }
      level.push(new ColliderFrog(128-level[level.length-1].attributes.fleetx, level[level.length-1].attributes.fleety, 0));
      
      
    }
    console.log(level)
    //level.push(new ColliderFrog(Math.round(64), Math.round(8+Math.random()*32), 0));
    return level;
  }

  startBattle(){
    this.state = 1;
    this.battleFrames = 0;
    this.heldShip = null;
    this.selectedShip = null;
    if (this.frogLevels.length <= this.currentLevel){
      this.frogLevels.push(this.newLevel(this.currentLevel))
    }
    this.frogs = this.frogLevels[this.currentLevel];
    console.log(this.frogLevels, this.currentLevel);
    for (let i=0; i<this.fleet.concat(this.frogs).length; i++){
      this.fleet.concat(this.frogs)[i].startBattle();
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
      this.starMap[i].draw(Math.min(Math.round(this.battleFrames/2),24));
    }
    // Bottom UI menu
    uiRect(4, 80+Math.min(64,this.battleFrames*3), 120, 44);

    if (this.state == 0){
      buttonRect(95,4,29,8); // Battle button
      ctx.fillStyle = COLOR.TEXT;
      ctx.textAlign = "left";
      drawImage(IMAGE.currency.metal, 2, 2);
      drawText(this.currency.metal, 12, 8);
      drawImage(IMAGE.currency.biomatter, 32, 2);
      drawText(this.currency.biomatter, 42, 8);
      drawText("FLEET FORMATION",this.FORMATION_SCREEN.x,this.FORMATION_SCREEN.y - 4,"small");
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


      // Bottom ui, text
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
        if (this.battleFrames > 64){
          this.fleet[i].update(0.1);
        }
      }

      for (let i=0; i<this.frogs.length; i++){

        this.frogs[i].battleDraw(Math.min(0, this.battleFrames-48));
        this.frogs[i].update();
      }

      this.battleFrames ++;
    }

  }
}

window.Game = Game;