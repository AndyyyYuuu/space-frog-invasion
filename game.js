class Ship{
  constructor(x, y, attributes){
    this.x = x;
    this.y = y;
    this.attributes = attributes;
    this.dx = 1;
    this.dy = 0;
    this.dead = false;
  }

  draw(){
    ctx.fillStyle = "gray";
    ctx.fillRect(Math.round(this.x)*PIXEL, Math.round(this.y)*PIXEL, this.attributes.width*PIXEL, this.attributes.height*PIXEL);
    
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
    ctx.fillStyle = COLOR.TEXT;
    ctx.textAlign = "left";
    ctx.font = "40px wendy";
    ctx.fillText("Fleet Formation",16,32);
    for (let i=0; i<this.fleet.length; i++){
      this.fleet[i].draw();
    }
    uiRect(16, 320, 480, 176);
  }
}

window.Game = Game;