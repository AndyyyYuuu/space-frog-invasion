


// Background Star class
class Star{

  constructor(){
    this.x = Math.random() * 128;
    this.y = Math.random() * 192 - 64;
    this.opacity = Math.random()*0.5+0.25;
  }

  // Draw the star. Offset is used during parallax scrolling. 
  draw(offset){
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = "white";
    ctx.fillRect(Math.round(this.x)*PIXEL, Math.round(this.y+offset)*PIXEL, PIXEL, PIXEL);
    ctx.globalAlpha = 1;
  }
}


// Particle class (during battle)
class Particle{

  constructor(x, y, dx, dy, life, color, dim = 1){
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.life = life;
    this.color = color;
    this.dim = dim;
  }

  update(){
    this.x += this.dx;
    this.y += this.dy;
    this.life -= 1;
  }

  draw(){
    ctx.fillStyle = this.color;
    ctx.globalAlpha = Math.max(0,Math.min(50, this.life)/50);
    ctx.fillRect(Math.round(this.x)*PIXEL, Math.round(this.y)*PIXEL, PIXEL, PIXEL);
    ctx.globalAlpha = 1;
  }
}

// Bullet class (during battle)
class Bullet{
  constructor(x, y, dx, dy, damage){
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.life = 100;
    this.damage = damage;
  }

  // Updates the bullet
  update(){
    this.x += this.dx;
    this.y += this.dy;
    this.life --;
  }

  // Draws the bullet
  draw(){
    ctx.fillStyle = `rgba(255, 0, 255, ${Math.min(50, this.life)/50})`;
    //ctx.fillRect(Math.round(this.x-1)*PIXEL, Math.round(this.y-1)*PIXEL, PIXEL*2, PIXEL*2);
    ctx.fillRect(Math.floor(this.x)*PIXEL, Math.floor(this.y)*PIXEL, PIXEL, PIXEL);
  }

  // Checks if this has hit entity and applies damage
  checkHit(entity){
    if (!entity.dead && entity.isInRect(this.x, this.y)){
      entity.damage(this.damage);
      this.life = 0;
      return true;
    }
    return false;
  }
}

class Phage{
  constructor(x, y, dx, dy, damage){
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.life = 100;
    this.damage = damage;
    this.latching = false;
    this.latch_x = null;
    this.latch_y = null;
    this.latched_entity = null;
    this.explosion_time = 64;
  }

  update(){
    if (this.latching){
      this.x = this.latched_entity.x + this.latch_x;
      this.y = this.latched_entity.y + this.latch_y;
      this.explosion_time --;
    }else{
      this.x += this.dx;
      this.y += this.dy;
      this.dy += 0.1;
      this.life --;
    }
  }

  draw(){
    drawImage(IMAGE.frog.phage, this.x-IMAGE.frog.phage.naturalWidth/2, this.y-IMAGE.frog.phage.naturalHeight/2);
  }

  checkHit(entity){
    if (!this.latching){
      if (!entity.dead && entity.isInRect(this.x, this.y)){
        this.latching = true;
        this.latch_x = this.x - entity.x;
        this.latch_y = this.y - entity.y;
        this.latched_entity = entity;
        entity.dy = (entity.dy + this.dy)/3;
        entity.dx = (entity.dx + this.dx)/3;
        this.dx = 0;
        this.dy = 0;
        return false; 
      }
    }else if (this.latching && this.latched_entity == entity){
      if (this.latched_entity.health <= 0){
        return true;
      }
      if (this.explosion_time <= 0){
        entity.health -= this.damage;
        entity.dx += -this.latch_x/3;
        entity.dy += -this.latch_y/3;
        return true;
      }
    }
    return false
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
    this.isShip = attributes.isShip;
    this.damageCooldown = 0;
  }

  // Draws an entity during battle. Offset is used during paralex scrolling. 
  battleDraw(offset){
    if (!this.dead){
      drawImage(this.attributes.image, this.x-this.attributes.image.naturalWidth/2, this.y+offset-this.attributes.image.naturalHeight/2, this.attributes.image.naturalWidth, this.attributes.image.naturalHeight);
    }
  }

  // Runs every frame during battle. 
  update(){
    this.y += this.dy;
    this.x += this.dx;
    this.dx *= 0.95;
    this.dy *= 0.95;
    if (this.damageCooldown > 0){
      this.damageCooldown --;
    }
  }

  // Returns whether the bounding boxes of `this` and `entity` overlap in the formation screen
  isTouchingLayout(entity){
    return Math.round(Math.abs(this.attributes.fleetx - entity.attributes.fleetx)) <= Math.round((this.getWidth()+entity.getWidth())/2) && Math.round(Math.abs(this.attributes.fleety - entity.attributes.fleety)) < Math.round((this.getHeight()+entity.getHeight())/2);
  }

  // Returns whether the bounding boxes of `this` and `entity` overlap in battle
  isTouching(entity){
    return Math.round(Math.abs(this.x - entity.x)) <= Math.round((this.getWidth()+entity.getWidth())/2) && Math.round(Math.abs(this.y - entity.y)) < Math.round((this.getHeight()+entity.getHeight())/2);
  }

  // Returns whether (x,y) is inside the Entity's bounding box
  isInRect(x,y){
    return (Math.abs(x - this.x) < this.getWidth()/2 && Math.abs(y - this.y) < this.getHeight()/2);
  }

  // Damages the Entity
  damage(dmg){
    if (this.damageCooldown <= 0){
      this.health -= dmg;
      this.damageCooldown = 16;
    }
  }

  // Returns whether Entity and other are colliding. If so, emits collision particles and applies knockback and damage. 
  collideWith(other, particles){
    if (!this.dead && !other.dead && this !== other && this.isTouching(other)){
      this.dx += (this.x-other.x)/distance(this.x, this.y, other.x, other.y)*0.75//*Math.abs(other.dx/2);
      this.dy += (this.y-other.y)/distance(this.x, this.y, other.x, other.y)*0.75//*Math.abs(other.dy/2);
      if (this.attributes.typeName == "Collider" && other.isShip != this.isShip){
        other.damage(this.attributes.damage);
        // Additional knockback
        other.dx += (other.x-this.x)/distance(this.x, this.y, other.x, other.y)*this.attributes.knockback//*Math.abs(other.dx/2);
        other.dy += (other.y-this.y)/distance(this.x, this.y, other.x, other.y)*this.attributes.knockback//*Math.abs(other.dy/2);
      }
      this.health *= 0.75;
      this.damage(0.25);
      if (Object.hasOwn(this, 'enginesStunned')){
        this.enginesStunned = 50;
      }

      // Particles
      for (var i=0;i<5;i++){
        particles.push(other.newParticle((other.x+this.x)/2, (other.y+this.y)/2));
      }
      return true;
    }
    return false;
  }

  getWidth(){
    return this.attributes.image.naturalWidth;
  }

  getHeight(){
    return this.attributes.image.naturalHeight;
  }

  // Starts the battle for the Entity
  // Runs on every entity at the beginning of a battle
  startBattle(){
    this.dx = 0;
    this.dy = 0;
    this.health = this.attributes.health;
    this.dead = false;
  }
}



// FROG CLASSES

class Frog extends Entity{
  constructor(attributes){
    attributes.isShip = false;
    super(attributes);
    this.ddy = 0.02;
  }

  draw(){
    if (!this.dead){
      drawImage(this.attributes.image, this.attributes.fleetx-this.attributes.image.naturalWidth/2, this.attributes.fleety-this.attributes.image.naturalHeight/2, this.attributes.image.naturalWidth, this.attributes.image.naturalHeight);
    }
  }
  startBattle(){
    this.x = this.attributes.fleetx;
    this.y = this.attributes.fleety-TRANSITION_MOVE+48;
    super.startBattle();
  }

  // Updates from during battle, returns false when frog dies
  update(){
    super.update();
    
    if (this.dy < 0.2){
      this.dy += this.ddy
    }
    if (this.health <= 0 && this.dead == false){
      this.dead = true;
      return false;
    }
    return true;
  }

  // Returns a new collision particle unique to Frogs
  newParticle(x,y){
    //return new Particle(x, y, Math.random()-0.5, Math.random()-0.5, 30, `hsl(${Math.random()*30+80}, 100%, ${Math.random()*10+50}%`);
    return new Particle(x, y, Math.random()-0.5, Math.random()-0.5, 40, randChoice(COLOR.GREEN));
    
  }
  attemptShoot(){
    return null;
  }

}


class ColliderFrog extends Frog{
  constructor(x, y, lvl){
    super({
      fleetx:x,
      fleety:y,
      image:IMAGE.frog.collider[lvl],
      health: 2+lvl*2,
      damage: 1+lvl,
      lvl:lvl
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
      fireSpeed: 200/(lvl+4)+40,
      lvl:lvl
    })
    this.shootCooldown = Math.random()*100+25;
  }
  attemptShoot(){
    
    if (this.dead){
      return null;
    }
    
    if (this.shootCooldown > 0){
      this.shootCooldown --;
      return null;
    }
    this.shootCooldown = this.attributes.fireSpeed;
    return new Phage(this.x, this.y, 0, 0, this.attributes.damage);
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
    }else if (this.assignment == "Healer"){
      return new HealerShip(target.attributes.fleetx, target.attributes.fleety, target.attributes.lvl+1);
    }
    return null;
  }

  draw(x, y, isTactile = true){

    buttonRect(x, y, 48, 16, isTactile);
    ctx.fillStyle = COLOR.TEXT;
    drawText(this.name, x+2, y+6, "small");
    drawText(this.price, x+10, y+14, "large");
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
    attributes.isShip = true;
    super(attributes);
    this.thrust = 0;
    this.dragX = -1;
    this.dragY = -1;
    this.shootCooldown = 10+Math.random()*50;
    this.enginesStunned = 0;
  }

  layoutDraw(){
    drawImage(this.attributes.image, this.attributes.fleetx-this.attributes.image.naturalWidth/2, this.attributes.fleety-this.attributes.image.naturalHeight/2, this.attributes.image.naturalWidth, this.attributes.image.naturalHeight);
    
  }

  startBattle(){
    this.x = this.attributes.fleetx;
    this.y = this.attributes.fleety + TRANSITION_MOVE;
    this.health = this.attributes.health;
    this.thrust = 0;
    this.shootCooldown = 10+Math.random()*50;
    this.enginesStunned = 0;
    super.startBattle();
  }

  // Updates ship during battle. Returns false when ship dies. 
  update(targetThrust){
    super.update();
    if (this.enginesStunned > 0){
      this.enginesStunned --;
    }else{
      if (this.dy >= -0.05){
        this.thrust = 7;
      }
    }

    if (this.thrust > 0){
      this.thrust --;
      this.dy -= 0.1;
    }

    if (this.health <= 0){
      this.dead = true;
      return false;
    }
    return true;
    
  }
  layoutCollide(){
    if (this.isTouching(other)){
      this.attributes.fleetx += (this.attributes.fleetx-other.attributes.fleetx)/distance(this.attributes.fleetx, this.attributes.fleety, other.attributes.fleetx, other.attributes.fleety)//*Math.abs(other.dx/2);
      this.attributes.fleety += (this.attributes.fleety-other.attributes.fleety)/distance(this.attributes.fleetx, this.attributes.fleety, other.attributes.fleetx, other.attributes.fleety)//*Math.abs(other.dy/2);
    }
  }

  newParticle(x,y){
    //return new Particle(x, y, Math.random()-0.5, Math.random()-0.5, 30, `hsl(${Math.random()*35+20}, 100%, ${Math.random()*10+40}%`);
    return new Particle(x, y, Math.random()-0.5, Math.random()-0.5, 40, randChoice(COLOR.GOLD));
  }
  
  
  /*
  battleDraw(offset){
    drawImage(this.attributes.image, this.x-this.attributes.image.naturalWidth/2, this.y+offset-this.attributes.image.naturalHeight/2, this.attributes.image.naturalWidth, this.attributes.image.naturalHeight);
  }*/
  
  attributeInRect(){
    return mouseInRect(Math.round(this.attributes.fleetx-this.getWidth()/2), Math.round(this.attributes.fleety-this.getHeight()/2), this.getWidth(), this.getHeight())
  }
}

class ShooterShip extends Ship{
  constructor(x, y, lvl){
    super({
      price: 2,
      health: 2+lvl,
      damage: 2+lvl*2,
      image: IMAGE.ship.shooter[lvl], 
      fleetx: x,
      fleety: y,
      typeName: "Shooter",
      lvl: lvl,
      upgrade: lvl < 4 ? new Upgrade("Strengthen", 3+lvl*2, 0, lvl+1, "Shooter") : null,
      fireSpeed: 600/(lvl**2+10)+5
    })
  }
  attemptShoot(){
    if (this.dead){
      return null;
    }
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
      price: 1,
      health: 2+lvl*2,
      damage: 1+lvl,
      image: IMAGE.ship.collider[lvl], 
      fleetx: x,
      fleety: y,
      typeName: "Collider",
      lvl: lvl,
      upgrade: lvl < 5 ? new Upgrade("Fortify", 2+lvl*2, 0, lvl+1, "Collider") : null, 
      knockback: lvl*0.15
    })
  }
  attemptShoot(){
    return null;
  }
}

class HealerShip extends Ship{
  constructor(x, y, lvl){
    super({
      price: 3,
      health: 2+lvl*2,
      damage: 1+lvl,
      image: IMAGE.ship.collider[lvl], 
      fleetx: x,
      fleety: y,
      typeName: "Healer",
      lvl: lvl,
      upgrade: new Upgrade("Upgrade", 2+lvl*3, 0, lvl+1, "Healer")
    })
  }
  attemptShoot(){
    return null;
  }
}



// MAIN GAME CLASS

class Game{
  constructor(name){

    this.TRANSITION_SPEED = 0.05;

    this.name = name;
    this.state = 0;
    this.fleet = [new ShooterShip(64, 32, 0),new ColliderShip(48, 44, 0),new ColliderShip(80, 44, 0)];
    this.frogs = [];
    this.bullets = [];
    this.particles = [];
    this.phages = [];
    this.entities = this.fleet.concat(this.frogs); // All entities, frogs and ships
    this.heldShip = null;
    this.selectedShip = null;
    this.selectedIndex = null;
    this.battleFrames = 0;
    this.gameOverFrames = 0;
    this.endBattleFrames = 56;
    this.frogCount = 0;
    this.shipCount = 0;
    this.frogsPassed = false;
    this.shipsPassed = false;
    this.inOptions = false;
    this.uiAlpha = 1;
    this.currency = {
      biomatter:100,
      metal:100
    }
    this.newShip = {
      type: null,
      mouseX: null,
      mouseY: null
    }
    this.starMap = [];
    this.currentLevel = 0;
    this.frogLevels = [this.newLevel(this.currentLevel)];
    for (var i=0;i<100;i++){
      this.starMap.push(new Star());
    }

    this.FORMATION_SCREEN = {
      x: 16, y: 16, w: 96, h: 48
    }
  }


  // Horrible, messy, ostrich algorithm that should never had existed but does anyway
  // Gets two mirrored frogs to append to a level
  getNewFrogs(level,frog1,frog2,num){
    const FROGS_PLACEMENT = -8; 
    var newFrog = frog1;
    var mirroredFrog = frog2;
    var spaceIsTaken = true;
    var attempts = 0;
    while (spaceIsTaken && attempts < 100){
      attempts ++;
      newFrog.attributes.fleetx = (56-4*num)+Math.random()*(1+4*num);
      newFrog.attributes.fleety = FROGS_PLACEMENT+Math.random()*32;
      mirroredFrog.attributes.fleetx = 128-newFrog.attributes.fleetx;
      mirroredFrog.attributes.fleety = newFrog.attributes.fleety;
      spaceIsTaken = false;
      for (let j=0;j<level.length;j++){

        if (newFrog.isTouchingLayout(level[j])){
          spaceIsTaken = true;
        }
      }
    }
    return [newFrog, mirroredFrog]
  }

  numFrogs(num, most, min_lvl, max_lvl){
    return Math.floor(parabola(num, most, min_lvl, max_lvl) + 1);
  }

  // Creates new level with difficulty of num
  newLevel(num){
    //num = 1;
    var level = [];
    var randX, randY;
    var spaceIsTaken;
    // level.push.apply(level,this.getNewFrogs(level, new ShooterFrog(0,0,0), new ShooterFrog(0,0,0), num)); // Test shooter frogs

    for (let frog_lvl=0;frog_lvl<10;frog_lvl++){
      for (let j=0;j<this.numFrogs(num, 3, frog_lvl*4, frog_lvl*4+5);j++){
        level.push.apply(level,this.getNewFrogs(level, new ColliderFrog(0,0,frog_lvl), new ColliderFrog(0,0,frog_lvl), num));
      }
    }

    for (let frog_lvl=0;frog_lvl<10;frog_lvl++){
      for (let j=0;j<this.numFrogs(num, 2, frog_lvl*4+3, frog_lvl*4+13);j++){
        level.push.apply(level,this.getNewFrogs(level, new ShooterFrog(0,0,frog_lvl), new ShooterFrog(0,0,frog_lvl), num));
      }
    }

    return level;
  }

  // Starts battle
  startBattle(){
    this.state = 1;
    this.gameOverFrames = 0;
    this.battleFrames = 0;
    this.heldShip = null;
    this.selectedShip = null;
    this.particles = [];
    this.bullets = [];
    this.phages = [];
    
    this.frogs = this.frogLevels[this.currentLevel];
    for (let i=0; i<this.fleet.concat(this.frogs).length; i++){
      this.fleet.concat(this.frogs)[i].startBattle();
    }
  }


  // Ends battle. If victory, apply rewards and advance level. 
  endBattle(victory){
    this.state = 0;
    this.battleFrames = 0;
    this.gameOverFrames = 0;
    this.endBattleFrames = 0;
    
    if (victory){
      this.currentLevel ++;
      this.currency.metal += 1;
    }
    if (this.frogLevels.length <= this.currentLevel){
      this.frogLevels.push(this.newLevel(this.currentLevel))
    }
    for (var i = 0; i < this.frogs.length; i ++){
      this.frogs[i].ddy = 0.02;
    }
  }

  // Runs on mousemove event
  mouseMove(){
    for (let i=0; i<this.fleet.length; i++){
      if (mouseIsDown && this.heldShip == null && this.newShip.type == null){
        if (this.fleet[i].attributeInRect()){
          this.heldShip = this.fleet[i];

          this.heldShip.dragX = mouseX - this.heldShip.attributes.fleetx;
          this.heldShip.dragY = mouseY - this.heldShip.attributes.fleety;
        }
      }
    }
  }

  // Runs on mousedown event
  click(){
    if (this.state == 0){
      if (this.inOptions){
        if (!mouseInRect(32, 32, 64, 64)){
          this.inOptions = false;
        }
      }else{
        if (mouseInRect(this.FORMATION_SCREEN.x,this.FORMATION_SCREEN.y,this.FORMATION_SCREEN.w,this.FORMATION_SCREEN.h)){

          for (let i=0; i<this.fleet.length; i++){
            if (this.fleet[i].attributeInRect()){
              this.selectedShip = this.fleet[i];
              this.selectedIndex = i;
              return;
            }
          }
          this.selectedShip = null;
        }else{
          for (let i=0; i<3; i++){
            if (mouseInRect(20+i*38, 96, 7, 7)){
              if (this.currency.metal >= i+1){
                switch (i){
                case 0:
                  this.newShip.type = new ColliderShip(-1, -1, 0);
                  break;
                case 1:
                  this.newShip.type = new ShooterShip(-1, -1, 0);
                  break;
                case 2:
                  this.newShip.type = new HealerShip(-1, -1, 0);
                  break;
                }
                this.newShip.mouseX = mouseX-(20+i*38)-1;
                this.newShip.mouseY = mouseY-96;
              }
            }
          }
        }
      }
    }
  }


  // Runs on mouse release event
  release(){
    if (this.state == 0 && this.endBattleFrames >= 56){
      if (!this.inOptions){
        if (this.newShip.type != null){
          if (mouseInRect(this.FORMATION_SCREEN.x,this.FORMATION_SCREEN.y,this.FORMATION_SCREEN.w,this.FORMATION_SCREEN.h)){
            this.newShip.type.attributes.fleetx = mouseX-this.newShip.mouseX+this.newShip.type.getWidth()/2;
            this.newShip.type.attributes.fleety = mouseY-this.newShip.mouseY+this.newShip.type.getHeight()/2;
            this.fleet.push(this.newShip.type);
            this.currency.metal -= this.newShip.type.attributes.price;
          }
          this.newShip.type = null;
          return;
        }
        if (mouseInRect(83,68,29,8)){ // Battle button
          this.startBattle();
        }else if (mouseInRect(64, 100, 48, 16)){
          if (this.selectedShip != null){
            if (this.selectedShip.attributes.upgrade != null){
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
        }else if (mouseInRect(4, 6, 9, 9)){
          this.inOptions = true;
        }

        this.newShip.type = null;
        this.newShip.mouseX = null;
        this.newShip.mouseY = null;
      }else{ // Options screen clicking
        if (mouseInRect(36, 36, 56, 8)){ // back to game
          this.inOptions = false;
        }else if (mouseInRect(36, 84, 56, 8)){ // save and quit
          this.inOptions = false;
          game = null;
          mode = "start";
        }
      }
    }
  }

  // Game render loop
  render(){

    for (let i=0;i<this.starMap.length;i++){
      this.starMap[i].draw(Math.min(Math.round(Math.min(0,this.battleFrames/2-this.endBattleFrames/2)),TRANSITION_MOVE/2));
    }
    if (this.state == 0 && this.endBattleFrames < TRANSITION_MOVE){
      this.endBattleFrames ++;
    }
    

    if (this.state == 0 || this.uiAlpha != 0){

      ctx.globalAlpha = Math.round(this.uiAlpha*6)/6;

      if (this.state == 0){

        if (this.uiAlpha < 1){
          this.uiAlpha = Math.round((this.uiAlpha+this.TRANSITION_SPEED)*100)/100; // Prevent rounding errors
        }

        // Draw fleet
        for (let i=0; i<this.fleet.length; i++){
          this.fleet[i].layoutDraw();
        }

        if (this.selectedShip != null){// draw box around selected ship
          selectRect(Math.round(this.selectedShip.attributes.fleetx-this.selectedShip.getWidth()/2), Math.round(this.selectedShip.attributes.fleety-this.selectedShip.getHeight()/2), this.selectedShip.getWidth(), this.selectedShip.getHeight());
        }

        if (this.heldShip != null){
          this.selectedShip = this.heldShip;
          //selectRect(Math.round(this.heldShip.attributes.fleetx-this.heldShip.getWidth()/2), Math.round(this.heldShip.attributes.fleety-this.heldShip.getHeight()/2), this.heldShip.getWidth(), this.heldShip.getHeight());
          if (mouseIsDown){
            this.heldShip.attributes.fleetx = Math.min(Math.max(mouseX-this.heldShip.dragX, this.FORMATION_SCREEN.x+Math.floor(this.heldShip.getWidth()/2)), this.FORMATION_SCREEN.x + this.FORMATION_SCREEN.w - Math.ceil(this.heldShip.getWidth()/2));
            this.heldShip.attributes.fleety = Math.min(Math.max(mouseY-this.heldShip.dragY, this.FORMATION_SCREEN.y+Math.floor(this.heldShip.getHeight()/2)), this.FORMATION_SCREEN.y + this.FORMATION_SCREEN.h - Math.ceil(this.heldShip.getHeight()/2));

          }else{
            this.heldShip = null;
          }
          ctx.globalAlpha *= 0.5;
          uiRect(this.FORMATION_SCREEN.x, this.FORMATION_SCREEN.y, this.FORMATION_SCREEN.w, this.FORMATION_SCREEN.h, true);
          ctx.globalAlpha *= 2;
        }

        // Draw frog indicators
        for (let i = 0; i < this.frogLevels[this.currentLevel].length; i++){
          drawImage(IMAGE.frog.indicator, this.frogLevels[this.currentLevel][i].attributes.fleetx - 2, (16 + Math.sin(frames*0.3)*0.6))
        }

      }
      

      

      // Bottom UI menu 
      uiRect(4, 80, 120, 44);
      buttonRect(83, 68, 29, 8, !this.inOptions); // Battle button
      buttonRect2(4, 6, 9, 9, !this.inOptions);
      ctx.fillStyle = COLOR.TEXT;
      drawImage(IMAGE.ui.settingsIcon, 6, 8);
      drawImage(IMAGE.currency.metal, 2, 70);
      drawText(this.currency.metal, 12, 76, "large");
      drawImage(IMAGE.currency.biomatter, 34, 70);
      drawText(this.currency.biomatter, 44, 76, "large");

      //drawImage(IMAGE.ui.sidebar.frame, 118, 0);

      drawText("FLEET FORMATION",this.FORMATION_SCREEN.x,this.FORMATION_SCREEN.y - 4,"small");
      drawText("BATTLE!",85,74,"small");
      
      


      // Bottom ui, text
      if (this.selectedShip != null){
        ctx.fillStyle = COLOR.TEXT;
        drawText(this.selectedShip.attributes.typeName+" Ship", 8, 88, "large");
        drawText("HP: ", 8, 96, "small");
        drawText(this.selectedShip.attributes.health, 20, 96, "large");
        drawText("DMG: ", 8, 104, "small")
        drawText(this.selectedShip.attributes.damage, 26, 104, "large");
        drawText("Lvl. "+this.selectedShip.attributes.lvl, 88, 88, "small");
        if (this.selectedShip.attributes.upgrade != null){
          console.log(this.selectedShip.attributes.upgrade)
          drawText("Upgrade:", 64, 96, "small");
          this.selectedShip.attributes.upgrade.draw(64, 100, !this.inOptions);
        }
          
      }else{
        ctx.fillStyle = COLOR.TEXT;
        drawText("Build new ship...", 8, 88, "large");
        drawText("Collider", 12, 112, "small");
        drawText("Shooter", 50, 112, "small");
        drawText("Healer", 88, 112, "small");
        for (let i=0; i<3; i++){
          if (mouseIsDown && mouseInRect(20+i*38, 96, 7, 7)){
            selectRect(21+i*38, 97, 5, 5);
          }else{
            selectRect(20+i*38, 96, 7, 7);
          }
          
          drawImage(IMAGE.currency.metal, 12+i*38, 113);
          drawText(i+1, 22+i*38, 119, "large")
        }

      }

      ctx.globalAlpha = 1;

      // Options window
      if (this.inOptions){
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, 512, 512);
        uiRect(32, 32, 64, 64);
        ctx.fillStyle = COLOR.TEXT;
        drawText("OPTIONS", 48, 28, "small");
        buttonRect(36, 36, 56, 8); // Back to game
        buttonRect(36, 84, 56, 8); // Save & exit
        ctx.fillStyle = COLOR.TEXT;
        drawText("Back to Game", 40, 42, "small");
        drawText("SAVE & EXIT", 42, 90, "small");
      }
    }

    if (this.state == 1){
      if (this.gameOverFrames > 64){
        ctx.globalAlpha = Math.min(1,Math.round(20-(this.gameOverFrames-64)/8)/30);
      }
      if (this.uiAlpha > 0){
        this.uiAlpha = Math.round((this.uiAlpha-this.TRANSITION_SPEED)*100)/100;
      }
      this.battleFrames ++;
      this.shipCount = 0;

      this.shipsPassed = true;

      // Update fleet
      for (var i=0; i<this.fleet.length; i++){
        if (!this.fleet[i].dead){
          this.shipCount++;
          this.fleet[i].battleDraw(Math.min(0, this.battleFrames-TRANSITION_MOVE));
          if (this.battleFrames > 64){
            if (this.fleet[i].update(0.02) == false){
              for (let k=0;k<20;k++){
                this.particles.push(this.fleet[i].newParticle(this.fleet[i].x+this.fleet[i].getWidth()*(Math.random()-0.5), this.fleet[i].y+this.fleet[i].getHeight()*(Math.random()-0.5)))
              }
            }
            var nextBullet = this.fleet[i].attemptShoot();
            if (nextBullet!=null){
              this.bullets.push(nextBullet);
            }
          }
          /*
          if (Math.random() < this.fleet[i].thrust/15){
            this.particles.push(new Particle(this.fleet[i].x, this.fleet[i].y, 0, this.fleet[i].dy/2, 10,"cyan"));
          }*/
          for (var j = 0; j < this.frogs.length; j ++){
            this.fleet[i].collideWith(this.frogs[j], this.particles);
            this.frogs[j].collideWith(this.fleet[i], this.particles);
          }

          for (var j = 0; j < this.fleet.length; j ++){
            this.fleet[i].collideWith(this.fleet[j], this.particles);
          }

          // this.shipsPassed is set to true by default before every update
          for (var j = 0; j < this.frogs.length; j ++){
            if (this.fleet[i].y > this.frogs[j].y && !this.fleet[i].dead && !this.frogs[j].dead){
              this.shipsPassed = false;
              break;
            }
          }
        }
      }

      // Count frogs + update frogs
      this.frogCount = 0;
      this.frogsPassed = false;
      for (let i=0; i<this.frogs.length; i++){
        if (!this.frogs[i].dead){
          this.frogCount++;
          this.frogs[i].battleDraw(Math.min(0, this.battleFrames-TRANSITION_MOVE));

          // Frog dead condition: update returns false -- > add to currency
          if (this.frogs[i].update() == false){
            this.currency.biomatter += this.frogs[i].attributes.lvl+1;
            for (let k=0;k<20;k++){
              this.particles.push(this.frogs[i].newParticle(this.frogs[i].x+this.frogs[i].getWidth()*(Math.random()-0.5), this.frogs[i].y+this.frogs[i].getHeight()*(Math.random()-0.5)))
            }
            
          }
          
          // Shoot phages
          if (this.battleFrames > 64){
            var nextPhage = this.frogs[i].attemptShoot();
            if (nextPhage != null){
              this.phages.push(nextPhage);
            }
          }

          // Collide with other frogs
          for (var j=0;j<this.frogs.length;j++){
            this.frogs[i].collideWith(this.frogs[j], this.particles);
          }

          // Check if frogs have won
          if (this.frogs[i].y > 132){
            this.frogsPassed = true;
          }
        }
        
      }

      // Game over checks
      if (this.frogCount == 0 || this.shipCount == 0 || this.frogsPassed || this.shipsPassed){
        this.gameOverFrames ++; 
        if (this.gameOverFrames == 1){
          for (var i = 0; i < this.frogs.length; i ++){
            this.frogs[i].ddy = 0.8;
          }
        }
        if (this.gameOverFrames > 120){
          this.endBattle(this.frogCount == 0);
        }
        ctx.globalAlpha = Math.max(0,Math.round((48-Math.abs(this.gameOverFrames-48))/6)*6/48); // Math.round(this.gameOverFrames/8)*8/100
        ctx.fillStyle = COLOR.TEXT;
        drawText(this.frogCount == 0 ? "Victory" : "Defeat", 48, 64, "large");
        ctx.globalAlpha = 1;
      }
        
        
      // Draw and update bullets
      for (let i=0;i<this.bullets.length; i++){
        this.bullets[i].draw();
        this.bullets[i].update();

        // Bullet trail particles
        if (Math.random() < 0.5){
          this.particles.push(new Particle(this.bullets[i].x, this.bullets[i].y, (-this.bullets[i].dx+Math.random()-0.5)/4, (-this.bullets[i].dy+Math.random()-0.5)/4, 15, "magenta"));
        }

        // Check if bullet hits a frog
        for (let j=0; j<this.frogs.length; j++){
          if (this.bullets[i].checkHit(this.frogs[j])){
            // Bullet explosion particles
            for (let k=0;k<20;k++){
              this.particles.push(new Particle(this.bullets[i].x, this.bullets[i].y, (Math.random()-0.5), (Math.random()-0.5), 20, "magenta"));
            }
          }
        }

        // Remove dead bullets
        if (this.bullets[i].life <= 0){
          this.bullets.splice(i,1);
          i--;
        }
      }

      for (let i=0;i<this.phages.length; i++){
        this.phages[i].draw();
        this.phages[i].update();

        // Check if phage hits a ship
        for (let j=0; j<this.fleet.length; j++){
          if (this.phages[i].checkHit(this.fleet[j])){
            this.phages[i].life = 0;
            for (let k=0;k<20;k++){
              this.particles.push(new Particle(this.phages[i].x, this.phages[i].y, (Math.random()), (Math.random()), 20, randChoice(COLOR.GREEN)));
            }
          }
        }

        // Remove dead phages
        if (this.phages[i].life <= 0){
          this.phages.splice(i,1);
          i--;
        }
      }

      // Draw and update particles
      for (let i=0;i<this.particles.length; i++){
        this.particles[i].draw();
        this.particles[i].update();
        if (this.life <= 0.05){
          this.particles.splice(i,1);
          i--;
        }
      }

      // Draw start battle title text
      ctx.globalAlpha = Math.max(0,Math.round((48-Math.abs(this.battleFrames-48))/6)*6/48);
      ctx.textAlign = "center";
      ctx.fillStyle = COLOR.TEXT;
      drawText("WAVE "+String(this.currentLevel+1), 64, 56, "large");
      //drawText(LEVEL_NAMES[this.currentLevel], 64, 64);
      ctx.textAlign = "left";
      ctx.globalAlpha = 1;
      
    }

    // Draw purchased ship held by mouse
    ctx.globalAlpha = 1;
    if (this.newShip.type != null){
      drawImage(this.newShip.type.attributes.image, mouseX-this.newShip.mouseX, mouseY-this.newShip.mouseY)
    }
  }
}

// Export Game as global class
window.Game = Game;
