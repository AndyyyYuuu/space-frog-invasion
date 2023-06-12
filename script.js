// Andy Yu
// June 9th, 2023
// Super Space Frog Invasion

const VERSION = "Beta";
const canvas = document.querySelector("canvas");
canvas.setAttribute('width', 512);
canvas.setAttribute('height', 512);
ctx = canvas.getContext("2d", {alpha: false});
ctx.imageSmoothingEnabled = false;
//label.textContent = "geometricPrecision";
ctx.textRendering = "geometricPrecision";
ctx.textRendering = "optimizeLegibility";

const PIXEL = 4;

const RANDWORDS = {
  adj: ["Crunchy ", "Space ", "Froggy ", "Froggy ", "Green ", "Super ", "Bio-", "Mega", "Slimy ", "Jazzy "],
  n: ["Planet", "Frogs", "Croak", "Gravity", "Fleet", "War", "Ships", "Pond", "Star", "Plasma"]
}

const COLOR = {
  TEXT: "#98C1E3", 
  UI: [
    "#6A76C9", 
    "#362B87"
  ]
}

var settings = {
  pixelChecker: true,
}

function randChoice(list){
  return list[Math.floor(Math.random()*list.length)];
}

function randName(){
  return randChoice(RANDWORDS.adj) + randChoice(RANDWORDS.n);
}

function newImage(src){
  img = new Image();
  img.src = src;
  return img;
}

var mode = "start";
var newGameWindow = {
  createdSlot:-1,
  name:randName()
}

var mouseX = -1;
var mouseY = -1;
var mouseIsDown = false;
var newSaveName = null;
var IMAGE = {
  /*
  SHIP:{
    newImage()
  }*/
}



var game;



var saveSlots = [
  new Game("Test Save"),
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
  mouseIsDown = true;
  if (mode == "start"){
    if (newGameWindow.createdSlot == -1){
      for (let i=0; i<3; i++){
        if (mouseInRect(128, 256+80*i, 256, 64)){
          if (saveSlots[i] == null){
            newGameWindow.createdSlot = i;
            newGameWindow.name = randName();
            break;
          }else{
            game = saveSlots[i];
            mode = "game";
          }
        }
      }
    }else{
      if (mouseInRect(128, 312, 112, 32)){
        newGameWindow.createdSlot = -1;
      }else if (mouseInRect(256, 312, 112, 32)){
        saveSlots[newGameWindow.createdSlot] = new Game(newGameWindow.name);
        newGameWindow.createdSlot = -1;
      }else if (mouseInRect(208, 272, 224, 16)){
        newGameWindow.name = randName();
      }
    }
  }
}

canvas.onmouseup=function(){
  mouseIsDown = false
}

document.addEventListener("keydown", event => {
  
});

function uiRect(x, y, w, h){
  ctx.lineWidth = 4;
  ctx.strokeStyle = COLOR.UI[0];
  ctx.beginPath();
  ctx.rect(x-2, y-2, w+4, h+4);
  ctx.stroke();
  ctx.strokeStyle = COLOR.UI[1];
  ctx.beginPath();
  ctx.rect(x+2, y+2, w-4, h-4);
  ctx.stroke();
}

function buttonRect(x, y, w, h){
  if (mouseInRect(x, y, w, h) && !mouseIsDown){
    uiRect(x, y, w, h);
  }else{
    
    ctx.lineWidth = 4;
    ctx.strokeStyle = COLOR.UI[1];
    ctx.beginPath();
    ctx.rect(x-2, y-2, w+4, h+4);
    ctx.stroke();
    ctx.strokeStyle = COLOR.UI[0];
    ctx.beginPath();
    ctx.rect(x+2, y+2, w-4, h-4);
    ctx.stroke();
  }
}

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
    ctx.fillStyle = COLOR.TEXT;
    ctx.textAlign = "center";
    ctx.fillText("SPACE FROG",256,96);
    ctx.fillText("INVASION",256,144)
    ctx.font = "24px tiny";
    ctx.textAlign = "left";
    if (newGameWindow.createdSlot == -1){
      ctx.strokeStyle = COLOR.UI;
      
      for (let i=0; i<3; i++){
        uiRect(128, 256+80*i, 256, 64);
        //ctx.rect(128, 256+80*i, 256, 64);
        //ctx.lineWidth = 4;
        //ctx.stroke();

        ctx.fillStyle = COLOR.TEXT;
        ctx.fillText("Save Slot "+(i+1), 144, 280+80*i);
        if (saveSlots[i] == null){
          ctx.globalAlpha = 0.6;
          if (mouseInRect(128, 256+80*i, 256, 64)){
            ctx.fillText("< Create New >", 144, 304+80*i);
          }else{
            ctx.fillText("  Empty Save  ", 144, 304+80*i);
          }
          ctx.globalAlpha = 1;
        }else{
          
          if (mouseInRect(128, 256+80*i, 256, 64)){
            ctx.fillText("> "+saveSlots[i].name, 144, 304+80*i);
          }else{
            ctx.fillText("  "+saveSlots[i].name, 144, 304+80*i);
          }
        }
      }
    }else{
      ctx.fillText("Create game in Slot "+(newGameWindow.createdSlot+1), 128, 256);
      if (mouseInRect(208, 272, 224, 16)){
        ctx.fillText("Name: < "+newGameWindow.name+" >", 128, 288);
      }else{
        ctx.fillText("Name:   "+newGameWindow.name, 128, 288);
      }
      
      buttonRect(128, 312, 112, 32);
      buttonRect(256, 312, 112, 32);
      ctx.fillText(" Cancel", 128, 336);
      ctx.fillText(" Create", 256, 336);
    }
  }
  if (settings.pixelChecker){
    ctx.fillStyle = "white";
    ctx.globalAlpha = 0.5;
    ctx.fillRect(Math.round(mouseX/4)*4-16, Math.round(mouseY/4)*4-16, 4, 4);
    ctx.globalAlpha = 1;
  }
  previousDelta = currentDelta;
}

window.addEventListener("load",function(){
  renderLoop();
  console.log("------------------");
  console.log("SUPER SPACE-FROG INVASION:  "+VERSION);
});

