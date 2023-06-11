// Andy Yu
// June 9th, 2023
// Super Space Frog Invasion

const VERSION = "Beta";
const canvas = document.querySelector("canvas");
canvas.setAttribute('width', 512);
canvas.setAttribute('height', 512);
ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const RANDWORDS = {
  adj: ["Crunchy ", "Space ", "Froggy ", "Froggy ", "Green ", "Super ", "Bio-", "Mega", "Slimy ", ],
  n: ["Planet", "Frogs", "Croak", "Gravity", "Fleet", "War", "Ships"]
}

function randChoice(list){
  return list[Math.floor(Math.random()*list.length)];
}

function randName(){
  return randChoice(RANDWORDS.adj) + randChoice(RANDWORDS.n);
}
console.log(randName());

function newImage(src){
  img = new Image();
  img.src = src;
  return img;
}

var mode = "start";
var page = 0;
var mouseX = -1;
var mouseY = -1;
var newSaveName = null;
var IMAGE = {
  /*
  SHIP:{
    newImage()
  }*/
}



var game;

class Ship{
  constructor(x, y, attributes){
    this.x = x;
    this.y = y;
    this.dx = 1;
    this.dy = 0;

  }

  draw(){

  }
}

class ShootyShip extends Ship{
  constructor(x, y){
    super(x, y, {
      health: 1,

      image: null
    })
  }
}


class Game{
  constructor(name){
    this.name = name;
  }

  render(){
    ctx.fillStyle = "white"
    ctx.font = "32px pixel-advanced";
    ctx.fillText("Game",125,100);
  }
}


var saveSlots = [
  null,
  null,
  null
]

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}
canvas.addEventListener('mousemove', function(evt) {
  var mousePos = getMousePos(canvas, evt);
  mouseX = mousePos.x;
  mouseY = mousePos.y;
}, false);

function mouseInRect(x, y, w, h){
  return mouseX > x && mouseX < x+w && mouseY > y && mouseY < y+h;
}

canvas.onmousedown=function(){
  if (mode == "start"){
    
    for (let i=0; i<3; i++){
      if (mouseInRect(128, 256+80*i, 256, 64)){
        if (saveSlots[i] == null){
          console.log("Create new game")
          saveSlots[i] = new Game("Crunchy Frogs");
        }
      }
    }
  }
}


document.addEventListener("keydown", event => {
  
});


var frames = 1;
const FPS_LIMIT = 40;
var updateId,
    previousDelta = 0;

function renderLoop(currentDelta){
  updateId = requestAnimationFrame(renderLoop);
  var delta = currentDelta-previousDelta;
  if (FPS_LIMIT && delta < 1000/FPS_LIMIT){
    return;
  }

  ctx.clearRect(0,0,1000,1000);
  frames+=1;

  if(mode == "game"){
    game.render();

  }else if (mode == "start"){
    ctx.font = "32px pixel-advanced";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("SPACE FROG",256,96);
    ctx.fillText("INVASION",256,144)
    if (page == 0){
      ctx.strokeStyle = "white";
      ctx.font = "20px tiny";
      ctx.textAlign = "left";
      for (let i=0; i<3; i++){
        
        ctx.rect(128, 256+80*i, 256, 64);
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.fillStyle = "white";
        ctx.fillText("Save Slot "+(i+1), 144, 280+80*i);
        if (saveSlots[i] == null){
          ctx.fillStyle = "grey";
          if (mouseInRect(128, 256+80*i, 256, 64)){
            ctx.fillText("< Create New >", 144, 304+80*i);
          }else{
            ctx.fillText("  Empty Save  ", 144, 304+80*i);
          }
          
        }else{
          
          if (mouseInRect(128, 256+80*i, 256, 64)){
            ctx.fillText("> "+saveSlots[i].name, 144, 304+80*i);
          }else{
            ctx.fillText("  "+saveSlots[i].name, 144, 304+80*i);
          }
          
        }
      }
    }else if (page == 1){

    }
  }
  previousDelta = currentDelta;
}

window.addEventListener("load",function(){
  renderLoop();
  console.log("------------------");
  console.log("SUPER SPACE-FROG INVASION:  "+VERSION);
});

