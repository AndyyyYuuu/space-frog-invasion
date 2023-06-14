// Andy Yu
// June 9th, 2023
// Super Space Frog Invasion

const VERSION = "Alpha";
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
  pixelChecker: false, 
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
  
  ship:{

    shooter: [newImage("ship/collider0.png"), newImage("ship/shooter1.png")],
    collider: [newImage("ship/collider0.png")],
    healer: [newImage("ship/collider0.png")]
  },
  debug: {
    pixelChecker: newImage("misc/pixel-checker.png")
  },
  ui: {
    selectCorner: newImage("misc/select-corner.png"),
    selectFrame: newImage("misc/select-frame.png")
  },
  currency: {
    biomatter: newImage("item/debris-frog.png"),
    metal: newImage("item/debris-ship.png")
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
  mouseX = mousePos.x/4;
  mouseY = mousePos.y/4;
}, false);

// Checks if mouse is inside a rectangle
function mouseInRect(x, y, w, h){
  return mouseX > x && mouseX < x+w && mouseY > y && mouseY < y+h;
}

canvas.onmousemove=function(){
  if (mode == "game"){
    game.mouseMove();
  }
}


canvas.onmousedown=function(){
  mouseIsDown = true;
  if (mode == "start"){
    // If a slot is not being created / no slot creation window
    if (newGameWindow.createdSlot == -1){
      for (let i=0; i<3; i++){
        if (mouseInRect(32, 64+20*i, 64, 16)){
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
      if (mouseInRect(32, 78, 28, 8)){ // Cancel button
        newGameWindow.createdSlot = -1;
      }else if (mouseInRect(64, 78, 28, 8)){ // Create new game button
        saveSlots[newGameWindow.createdSlot] = new Game(newGameWindow.name);
        newGameWindow.createdSlot = -1;
      }else if (mouseInRect(52, 68, 56, 4)){ // Switch random name
        newGameWindow.name = randName();
      }
    }
  }else if (mode == "game"){
    game.click();
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
  ctx.rect(x*PIXEL-2, y*PIXEL-2, w*PIXEL+4, h*PIXEL+4);
  ctx.stroke();
  ctx.strokeStyle = COLOR.UI[1];
  ctx.beginPath();
  ctx.rect(x*PIXEL+2, y*PIXEL+2, w*PIXEL-4, h*PIXEL-4);
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
    ctx.rect(x*PIXEL-2, y*PIXEL-2, w*PIXEL+4, h*PIXEL+4);
    ctx.stroke();
    ctx.strokeStyle = COLOR.UI[0];
    ctx.beginPath();
    ctx.rect(x*PIXEL+2, y*PIXEL+2, w*PIXEL-4, h*PIXEL-4);
    ctx.stroke();
  }
}

function selectRect(x, y, w, h){
  ctx.drawImage(IMAGE.ui.selectFrame, 0, 0, 2, 2, Math.round(x-1)*PIXEL, Math.round(y-1)*PIXEL, 2*PIXEL, 2*PIXEL);
  ctx.drawImage(IMAGE.ui.selectFrame, 0, 2, 2, 2, Math.round(x-1)*PIXEL, (Math.round(y-1)+h)*PIXEL, 2*PIXEL, 2*PIXEL);
  ctx.drawImage(IMAGE.ui.selectFrame, 2, 2, 2, 2, (Math.round(x-1)+w)*PIXEL, (Math.round(y-1)+h)*PIXEL, 2*PIXEL, 2*PIXEL);
  ctx.drawImage(IMAGE.ui.selectFrame, 2, 0, 2, 2, (Math.round(x-1)+w)*PIXEL, Math.round(y-1)*PIXEL, 2*PIXEL, 2*PIXEL);
}

function drawText(txt, x, y, size){
  if (size == "small"){
    ctx.font = "24px small";
  }else if (size == "display"){
    ctx.font = "32px display";
  }else if (size == "large"){
    ctx.font = "64px large";
  }
  ctx.fillText(txt, Math.round(x)*PIXEL, Math.round(y)*PIXEL);
}

function drawImage(img, x, y){
  ctx.drawImage(img, Math.round(x)*PIXEL, Math.round(y)*PIXEL, img.naturalWidth*PIXEL, img.naturalHeight*PIXEL);
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
    game.render(); // runs render loop of the game

  }else if (mode == "start"){
    ctx.fillStyle = COLOR.TEXT;
    ctx.textAlign = "center";
    drawText("SPACE FROG",64,24,"display");
    drawText("INVASION",64,36,"display");
    ctx.textAlign = "left";
    if (newGameWindow.createdSlot == -1){ // Home page, not creating save
      ctx.strokeStyle = COLOR.UI;
      
      for (let i=0; i<3; i++){
        uiRect(32, 64+20*i, 64, 16);
        //ctx.rect(128, 256+80*i, 256, 64);
        //ctx.lineWidth = 4;
        //ctx.stroke();

        ctx.fillStyle = COLOR.TEXT;
        drawText("Save Slot "+(i+1), 36, 70+20*i, "small");
        if (saveSlots[i] == null){
          ctx.globalAlpha = 0.6;
          if (mouseInRect(32, 64+20*i, 64, 16)){ // Tactile save slot buttons
            drawText("< Create New >", 36, 76+20*i, "small");
          }else{
            drawText("  Empty Save  ", 36, 76+20*i, "small");
          }
          ctx.globalAlpha = 1;
        }else{
          
          if (mouseInRect(32, 64+20*i, 64, 16)){
            drawText("> "+saveSlots[i].name, 36, 76+20*i);
          }else{
            drawText("  "+saveSlots[i].name, 36, 76+20*i);
          }
        }
      }

    }else{ // Home page, with create save 
      drawText("Create game in Slot "+(newGameWindow.createdSlot+1), 32, 64, "small");
      if (mouseInRect(52, 68, 56, 4)){ // Tactile name switcher
        drawText("Name: < "+newGameWindow.name+" >", 32, 72, "small");
      }else{
        drawText("Name:   "+newGameWindow.name, 32, 72, "small");
      }
      
      buttonRect(32, 78, 28, 8);
      buttonRect(64, 78, 28, 8);
      drawText(" Cancel", 32, 84, "small");
      drawText(" Create", 64, 84, "small");
    }
  }else if (mode == "credits"){
    
  }

  if (settings.pixelChecker){ // Pixel checker tool
    ctx.globalAlpha = 0.5;
    drawImage(IMAGE.debug.pixelChecker, mouseX-4, mouseY-4);
    ctx.globalAlpha = 1;
  }

  previousDelta = currentDelta;
}

window.addEventListener("load",function(){
  renderLoop();
  console.log("------------------");
  console.log("SUPER SPACE-FROG INVASION:  "+VERSION);
});

