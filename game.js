
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