class Ship{
  constructor(x, y, attributes){
    this.x = x;
    this.y = y;
    this.attributes = attributes;
    this.dx = 1;
    this.dy = 0;
    this.dead = false;
    this.dragX = -1;
    this.dragY = -1;
  }

  draw(){
    ctx.fillStyle = "gray";
    ctx.fillRect(Math.round(this.x)*PIXEL, Math.round(this.y)*PIXEL, this.attributes.width*PIXEL, this.attributes.height*PIXEL);
    
  }

  checkDrag(){
    if (mouseInRect(Math.round(this.x)*PIXEL, Math.round(this.y)*PIXEL, this.attributes.width*PIXEL, this.attributes.height*PIXEL)){
      return true;
    }
    return false;
  }
}

class ShootyShip extends Ship{
  constructor(x, y){
    super(x, y, {
      health: 1,
      width: 8,
      height: 8,
      image: null // Replace with actual image later
    })
  }
}



class Game{
  constructor(name){
    this.name = name;
    this.state = 0;
    this.fleet = [new ShootyShip(64, 64)];
    this.heldShip = null;
  }
  
  render(){
    if (this.state == 0){
      ctx.fillStyle = COLOR.TEXT;
      ctx.textAlign = "left";
      ctx.font = "40px wendy";
      ctx.fillText("Fleet Formation",16,32);
      for (let i=0; i<this.fleet.length; i++){
        this.fleet[i].draw();
        if (mouseIsDown && this.heldShip == null){
          if (this.fleet[i].checkDrag()){
            this.heldShip = this.fleet[i];
            this.heldShip.dragX = mouseX/4 - this.heldShip.x;
            this.heldShip.dragY = mouseY/4 - this.heldShip.y;
          }
        }
      }
      if (this.heldShip != null){
        if (mouseIsDown){
          this.heldShip.x = (mouseX)/4-this.heldShip.dragX;
          this.heldShip.y = (mouseY)/4-this.heldShip.dragY;
        }else{
          this.heldShip = null;
        }
      }
      uiRect(16, 320, 480, 176);
    }else if (this.state == 1){
      
    }
  }
}

window.Game = Game;