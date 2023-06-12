// Andy Yu
// June 9th, 2023
// Super Space Frog Invasion

const VERSION = "Beta";
const canvas = document.querySelector("canvas");
canvas.setAttribute('width', 512);
canvas.setAttribute('height', 512);
ctx = canvas.getContext("2d", {alpha: false});
ctx.imageSmoothingEnabled = false;


const PIXEL = 4;

// Random word generator for save slot names
const RANDWORDS = {
  adj: ["Crunchy ", "Space ", "Froggy ", "Froggy ", "Green ", "Super ", "Bio-", "Mega", "Slimy ", "Jazzy "],
  n: ["Planet", "Frogs", "Croak", "Gravity", "Fleet", "War", "Ships", "Pond", "Star", "Plasma"]
}

// Stores important colors in the game
const COLOR = {
  TEXT: "#98C1E3", 
  UI: [
    "#6A76C9", 
    "#362B87"
  ]
}

// Some settings
var settings = {
  pixelChecker: true, 
  // Pixel checker: a pixel that follows the mouse, useful to make sure pixels are aligned
}

// Returns a random element from list
function randChoice(list){
  return list[Math.floor(Math.random()*list.length)];
}

// Returns a randomly generated save slot name
function randName(){
  return randChoice(RANDWORDS.adj) + randChoice(RANDWORDS.n);
}

// Returns a new image object with path "assets/image/src"
function newImage(src){
  img = new Image();
  img.src = "assets/image/"+src;
  return img;
}

var mode = "start";
var newGameWindow = {//Stores variables for creating a new game
  createdSlot:-1, // The slot the player is creating a game in, -1 when not creating slot
  name:randName() // The currently selected name
}

var mouseX = -1;
var mouseY = -1;
var mouseIsDown = false;

// Structure to contain and pre-load all images
var IMAGE = {
  /*
  SHIP:{
    newImage()
  }*/
  debug: {
    pixelChecker: newImage("misc/pixel-checker.png")
  }
}



var game; // The currently played game


// 3 save slots for <Game>
var saveSlots = [
  new Game("Test Save"),
  null,
  null
]

// Gets mouse position
function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

// Updates mouse position to mouseX and mouseY
canvas.addEventListener('mousemove', function(evt) {
  var mousePos = getMousePos(canvas, evt);
  mouseX = mousePos.x;
  mouseY = mousePos.y;
}, false);

// Checks if mouse is inside a rectangle
function mouseInRect(x, y, w, h){
  return mouseX > x && mouseX < x+w && mouseY > y && mouseY < y+h;
}


canvas.onmousedown=function(){
  mouseIsDown = true;
  if (mode == "start"){
    // If a slot is not being created / no slot creation window
    if (newGameWindow.createdSlot == -1){
      for (let i=0; i<3; i++){
        if (mouseInRect(128, 256+80*i, 256, 64)){
          if (saveSlots[i] == null){ // If slot is empty
            newGameWindow.createdSlot = i;
            newGameWindow.name = randName();
            break;
          }else{
            game = saveSlots[i];
            mode = "game";
          }
        }
      }
    }else{ // If a slot is being created / slot creation window
      if (mouseInRect(128, 312, 112, 32)){ // Cancel button
        newGameWindow.createdSlot = -1;
      }else if (mouseInRect(256, 312, 112, 32)){ // Create new game button
        saveSlots[newGameWindow.createdSlot] = new Game(newGameWindow.name);
        newGameWindow.createdSlot = -1;
      }else if (mouseInRect(208, 272, 224, 16)){ // Switch random name
        newGameWindow.name = randName();
      }
    }
  }
}

canvas.onmouseup=function(){ // You know what this does
  mouseIsDown = false
}

document.addEventListener("keydown", event => {
  
});

// Draws a rectangle in UI style
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

// Draws a tactile rectangle in UI style
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

  // Limit FPS under FPS_LIMIT
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
    if (newGameWindow.createdSlot == -1){ // Home page, not creating save
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
          if (mouseInRect(128, 256+80*i, 256, 64)){ // Tactile save slot buttons
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
    }else{ // Home page, with create save 
      ctx.fillText("Create game in Slot "+(newGameWindow.createdSlot+1), 128, 256);
      if (mouseInRect(208, 272, 224, 16)){ // Tactile name switcher
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

  if (settings.pixelChecker){ // Pixel checker tool
    ctx.fillStyle = "white";
    ctx.globalAlpha = 0.5;
    ctx.drawImage(IMAGE.debug.pixelChecker, Math.round(mouseX/4)*4-16, Math.round(mouseY/4)*4-16, 4*PIXEL, 4*PIXEL);
    ctx.globalAlpha = 1;
  }

  previousDelta = currentDelta;
}

window.addEventListener("load",function(){
  renderLoop();
  console.log("------------------");
  console.log("SUPER SPACE-FROG INVASION:  "+VERSION);
});

