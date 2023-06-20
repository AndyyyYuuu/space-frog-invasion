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

class Particle{
  constructor(x, y, dx, dy, life){
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.life = life;
  }

  update(){
    this.x += this.dx;
    this.y += this.dy;
    this.life --;
  }

  draw(){
    ctx.fillStyle = `rgba(255, 0, 255, ${Math.min(50, this.life)/50})`;
    ctx.fillRect(Math.round(this.x)*PIXEL, Math.round(this.y)*PIXEL, PIXEL, PIXEL);
  }
}

class Bullet{
  constructor(x, y, dx, dy, damage){
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.life = 100;
    this.damage = damage;
  }

  update(){
    this.x += this.dx;
    this.y += this.dy;
    this.life --;
  }

  draw(){
    ctx.fillStyle = `rgba(255, 0, 255, ${Math.min(50, this.life)/50})`;
    //ctx.fillRect(Math.round(this.x-1)*PIXEL, Math.round(this.y-1)*PIXEL, PIXEL*2, PIXEL*2);
    ctx.fillRect(Math.floor(this.x)*PIXEL, Math.floor(this.y)*PIXEL, PIXEL, PIXEL);
  }

  checkHit(entity){
    if (!entity.dead && entity.isInRect(this.x, this.y)){
      entity.health -= this.damage;
      this.life = 0;
    }
  }
}




// ENTITIES

class Entity{
  constructor(attributes){
    this.x = -1;
    this.y = -1; 
    this.dx = 0;
    this.dy = 0;
    this.dead = false;
    this.attributes = attributes;
    this.health = -1;
  }
  battleDraw(offset){
    if (!this.dead){
      drawImage(this.attributes.image, this.x-this.attributes.image.naturalWidth/2, this.y+offset-this.attributes.image.naturalHeight/2, this.attributes.image.naturalWidth, this.attributes.image.naturalHeight);
    }
  }
  isTouching(entity){
    return Math.round(Math.abs(this.attributes.fleetx - entity.attributes.fleetx)) <= Math.round((this.attributes.width+entity.attributes.width)/2) && Math.round(Math.abs(this.attributes.fleety - entity.attributes.fleety)) < Math.round((this.attributes.height+entity.attributes.height)/2);
  }
  isInRect(x,y){
    return (Math.abs(x - this.x) < this.attributes.width/2 && Math.abs(y - this.y) < this.attributes.height/2);
  }
}



// FROG CLASSES

class Frog extends Entity{
  constructor(attributes){
    super(attributes);
  }

  draw(){
    if (!this.dead){
      drawImage(this.attributes.image, this.attributes.fleetx-this.attributes.image.naturalWidth/2, this.attributes.fleety-this.attributes.image.naturalHeight/2, this.attributes.image.naturalWidth, this.attributes.image.naturalHeight);
    }
  }
  startBattle(){
    this.x = this.attributes.fleetx;
    this.y = this.attributes.fleety;
    this.health = this.attributes.health;
  }
  update(){
    this.y += 0.1;
    if (this.health <= 0){
      this.dead = true;
    }
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
      width: IMAGE.frog.collider[lvl].naturalWidth, 
      height: IMAGE.frog.collider[lvl].naturalHeight,
    })
  }
}

class ShooterFrog extends Frog{
  constructor(x, y, lvl){
    super({
      fleetx:x,
      fleety:y,
      image:IMAGE.frog.shooter[lvl],
      health: 1+lvl,
      damage: 1+lvl,
      width: IMAGE.frog.collider[lvl].naturalWidth, 
      height: IMAGE.frog.collider[lvl].naturalHeight,
    })
  }
}



// SHIP UPGRADE

class Upgrade {
  constructor(name, price, currencyType, newLevel, assignment){
    this.name = name;
    this.price = price;
    this.currencyType = currencyType;
    this.newLevel = newLevel;
    this.assignment = assignment;
  }

  upgrade(target){
    if (this.assignment == "Shooter"){
      return new ShooterShip(target.attributes.fleetx, target.attributes.fleety, target.attributes.lvl+1);
    }else if (this.assignment == "Collider"){
      return new ColliderShip(target.attributes.fleetx, target.attributes.fleety, target.attributes.lvl+1);
    }
    return null;
  }

  draw(x, y){

    buttonRect(x, y, 48, 16);
    
    drawText(this.name, x+2, y+6, "small");
    drawText(this.price, x+10, y+14, "small");
    if (this.currencyType == 0){
      drawImage(IMAGE.currency.biomatter, x+1, y+7);
    }else if (this.currencyType == 1){
      drawImage(IMAGE.currency.metal, x+1, y+7);
    }
  }
}



// SHIP CLASSES

class Ship extends Entity{
  constructor(attributes){
    super(attributes);
    this.thrust = 0;
    this.dragX = -1;
    this.dragY = -1;
    this.shootCooldown = 10+Math.random()*50;
  }

  layoutDraw(){
    drawImage(this.attributes.image, this.attributes.fleetx-this.attributes.image.naturalWidth/2, this.attributes.fleety-this.attributes.image.naturalHeight/2, this.attributes.image.naturalWidth, this.attributes.image.naturalHeight);
    
  }

  startBattle(){
    this.x = this.attributes.fleetx;
    this.y = this.attributes.fleety + 48;
    this.health = this.attributes.health;
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
      health: 2+lvl,
      damage: 1+lvl*2,
      width: 5, //IMAGE.ship.shooter[lvl].naturalWidth,
      height: 6, //IMAGE.ship.shooter[lvl].naturalHeight,
      image: IMAGE.ship.shooter[lvl], 
      fleetx: x,
      fleety: y,
      typeName: "Shooter",
      lvl: lvl,
      upgrade: new Upgrade("Strengthen", 2+lvl*2, 1, lvl+1, "Shooter"),
      fireSpeed: 1000/(lvl+8)
    })
  }
  attemptShoot(){
    if (this.shootCooldown > 0){
      this.shootCooldown --;
      return null;
    }
    this.shootCooldown = this.attributes.fireSpeed;
    return new Bullet(this.x, this.y, 0, -2, this.attributes.damage);
    
  }
}

class ColliderShip extends Ship{
  constructor(x, y, lvl){
    super({
      health: 2+lvl*2,
      damage: 1+lvl,
      width: 5, //IMAGE.ship.collider[lvl].naturalWidth,
      height: 6, //IMAGE.ship.collider[lvl].naturalHeight,
      image: IMAGE.ship.collider[lvl], 
      fleetx: x,
      fleety: y,
      typeName: "Collider",
      lvl: lvl,
      upgrade: new Upgrade("Fortify", 2+lvl*2, 1, lvl+1, "Collider")
    })
  }
  attemptShoot(){
    return null;
  }
}

/*class BasicShip extends Ship{
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
      lvl: 0,
      upgrades: [
        new Upgrade("Artillary", 3, 0, new ShooterShip(x, y, 1)), 
        new Upgrade("Hardness", 2, 0, new ColliderShip(x, y, 1)), 
        new Upgrade("Repair", 5, 0, new ShooterShip(x, y, 1)), 
      ]
    })

  }
}*/




// MAIN GAME CLASS

class Game{
  constructor(name){
    this.name = name;
    this.state = 0;
    this.fleet = [new ShooterShip(64, 32, 0),new ColliderShip(48, 48, 0),new ColliderShip(80, 48, 0)];
    this.frogs = [];
    this.bullets = [];
    this.particles = [];
    this.entities = this.fleet.concat(this.frogs); // All entities, frogs and ships
    this.heldShip = null;
    this.selectedShip = null;
    this.selectedIndex = null;
    this.battleFrames = 0;
    this.gameOverFrames = 0;
    this.currency = {
      biomatter:99999,
      metal:99999
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

  // Horrible, messy, ostrich algorithm
  // Gets two mirrored frogs to append to a level
  getNewFrogs(level,frog1,frog2,num){
    var newFrog = frog1;
    var mirroredFrog = frog2;
    var spaceIsTaken = true;
    while (spaceIsTaken){

      newFrog.attributes.fleetx = (56-4*num)+Math.random()*(1+4*num);
      newFrog.attributes.fleety = 8+Math.random()*32;
      mirroredFrog.attributes.fleetx = 128-newFrog.attributes.fleetx;
      mirroredFrog.attributes.fleety = newFrog.attributes.fleety;
      spaceIsTaken = false;
      for (let j=0;j<level.length;j++){

        if (newFrog.isTouching(level[j])){
          spaceIsTaken = true;
        }
      }
    }
    return [newFrog, mirroredFrog]
  }

  newLevel(num){
    //num = 1;
    var level = [];
    var randX, randY;
    var spaceIsTaken;
    for (let i=0;i<num/2+1;i++){
      level.push.apply(level,this.getNewFrogs(level, new ColliderFrog(0,0,0), new ColliderFrog(0,0,0), num))
    }
    for (let i=0;i<num/2-1;i++){
      level.push.apply(level,this.getNewFrogs(level, new ColliderFrog(0,0,1), new ColliderFrog(0,0,1), num))
    }
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
    for (let i=0; i<this.fleet.concat(this.frogs).length; i++){
      this.fleet.concat(this.frogs)[i].startBattle();
    }
  }

  endBattle(){
    this.state = 0;
    this.battleFrames = 0;
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
            this.selectedIndex = i;
            return;
          }
        }
        this.selectedShip = null;
      // Upgrade ship
      }else if (mouseInRect(64, 100, 48, 16)){
        if (this.selectedShip!=null){
          if (this.selectedShip.attributes.upgrade.currencyType == 0){
            if (this.currency.biomatter >= this.selectedShip.attributes.upgrade.price){
              this.currency.biomatter -= this.selectedShip.attributes.upgrade.price
              this.fleet[this.selectedIndex] = this.selectedShip.attributes.upgrade.upgrade(this.selectedShip);
              this.selectedShip = this.fleet[this.selectedIndex];
            }
          } else if (this.selectedShip.attributes.upgrade.currencyType == 1){

            if (this.currency.metal >= this.selectedShip.attributes.upgrade.price){
              this.currency.metal -= this.selectedShip.attributes.upgrade.price;
              this.fleet[this.selectedIndex] = this.selectedShip.attributes.upgrade.upgrade(this.selectedShip);
              this.selectedShip = this.fleet[this.selectedIndex];
            }
          }
        }
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
        drawText("Upgrade:", 64, 96, "small");
        this.selectedShip.attributes.upgrade.draw(64, 100);
        
      }
      

    }else if (this.state == 1){

      for (var i=0; i<this.fleet.length; i++){
        this.fleet[i].battleDraw(Math.min(0, this.battleFrames-48));
        if (this.battleFrames > 64){
          this.fleet[i].update(0.1);
          var nextBullet = this.fleet[i].attemptShoot();
          if (nextBullet!=null){
            this.bullets.push(nextBullet);
          }
          
          
        }
      }

      for (let i=0; i<this.frogs.length; i++){
        if (!this.frogs[i].dead){
          this.frogs[i].battleDraw(Math.min(0, this.battleFrames-48));
          this.frogs[i].update();
        }
      }

      for (let i=0;i<this.bullets.length; i++){
        this.bullets[i].draw();
        this.bullets[i].update();
        if (Math.random() < 0.5){
          this.particles.push(new Particle(this.bullets[i].x, this.bullets[i].y, (Math.random()-0.5)/2, (Math.random()-0.5)/2, 20));
        }
        for (let j=0; j<this.frogs.length; j++){
          this.bullets[i].checkHit(this.frogs[j]);
          
        }
        if (this.bullets[i].life <= 0){
          this.bullets.splice(i,1);
          i--;
        }
      }

      for (let i=0;i<this.particles.length; i++){
        this.particles[i].draw();
        this.particles[i].update();
      }

      this.battleFrames ++;
    }

  }
}

window.Game = Game;