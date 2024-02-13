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
const TRANSITION_MOVE = 56;
const BUTTONS_Y = 56//56; // The Y level of home page slot buttons

// Scrolling frogs and ships on the home screen
const V_SCROLLERS = true;
const H_SCROLLERS = false;

// Random word generator for save slot names

const RANDWORDS = {
  adj: ["Crunchy ", "Space ", "Froggy ", "Green ", "Super ", "Bio-", "Mega", "Hyper", "Slimy ", "Jazzy ", "Singing ", "Shooter ", "Starry ", "Funky ", "Pixel ", "Swingin' ", "Boppy ", "Bluesy ", "Shiny ", "Imperial ", "Solar ", "NASA ", "I Got ", "Poly", "Leapin'"],
  n: ["Planet", "Frogs", "Croak", "Gravity", "Fleets", "War", "Ships", "Stars", "Plasma", "Spheres", "Battle", "Slime", "Nebula", "Toads", "Blast", "Force", "Aliens", "Trek", "Nights", "Tech", "Music", "Borg", "Flares", "Mule", "Rhythm", "Sax", "Horn", "Chords"]
}


// Stores important colors in the game
const COLOR = {
  TEXT: "#98C1E3", 
  UI: [
    "#6A76C9", 
    "#362B87",
    "#CCDDFF"
  ],
  TITLE: "#fc8d3d", 
  GREEN: ["#ADFF94","#71ED66","#23B84A","#07734F","#023138","#011824"], 
  GOLD: ["#240013","#4D041C","#822D11","#96561E","#C4A64B","#E0DE77"]
}

const LEVEL_NAMES = `I have eaten
The plums
That were in
The icebox
In which
You were probably
Saving for breakfast
Forgive me
They were delicious
So sweet
And so cold`.split(/\r?\n|\r|\n/g);

// Some settings
var settings = {
  pixelChecker: false, 
  // Pixel checker: a pixel that follows the mouse, useful to make sure pixels are aligned
  saving: true
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

// Runs a parabolic function with max/min and x intercepts
function parabola(x, max, int1, int2){
  return -4*max/(int1-int2)**2*(x-int1)*(x-int2);
}

var mode = "start";
var newGameWindow = {// Stores variables for creating a new game
  createdSlot: -1, // The slot the player is creating a game in, -1 when not creating slot
  name:randName() // The currently selected name
};

var clickedSlot = -1;
var deletionStage = -1;

var titleY = 96;
var dTitleY = 4;

var mouseX = -1;
var mouseY = -1;
var mouseIsDown = false;
var mouseOnCanvas = true;

// Structure to contain and pre-load all images
var IMAGE = {
  
  ship:{

    shooter: [newImage("ship/shooter0.png"), newImage("ship/shooter1.png"), newImage("ship/shooter2.png"), newImage("ship/shooter3.png"), newImage("ship/shooter4.png"), newImage("ship/shooter5.png")],
    collider: [newImage("ship/collider0.png"), newImage("ship/collider1.png"), newImage("ship/collider2.png"), newImage("ship/collider3.png"), newImage("ship/collider4.png"), newImage("ship/collider5.png")],
    tractor: [newImage("ship/tractor0.png"), newImage("ship/tractor1.png"), newImage("ship/tractor2.png"), newImage("ship/tractor3.png"), newImage("ship/tractor4.png"), newImage("ship/tractor5.png")]
  },
  frog:{
    collider: [newImage("frog/collider0.png"), newImage("frog/collider1.png"), newImage("frog/collider2.png")],
    shooter: [newImage("frog/shooter0.png"), newImage("frog/shooter1.png"), newImage("frog/shooter2.png")],
    spawner: [newImage("frog/spawner0.png"),],
    phage: newImage("frog/phage.png"), 
    indicator: newImage("frog/indicator.png")
  },
  debug: {
    pixelChecker: newImage("misc/pixel-checker.png")
  },
  ui: {
    selectCorner: newImage("misc/select-corner.png"),
    selectFrame: newImage("misc/select-frame.png"),
    settingsIcon: newImage("ui/settings.png"), 
    title: newImage("ui/title.png"),
    sidebar: {
      frame: newImage("ui/sidebar/frame.png"),
      ship: newImage("ui/sidebar/ship.png"),
      frog: newImage("ui/sidebar/frog.png")
    },
    cursor: newImage("misc/cursor.png"), 
    shipsH: newImage("ui/shipsh.png"), 
    frogsH: newImage("ui/frogsh.png"), 
    shipsV: newImage("ui/shipsv.png"), 
    frogsV: newImage("ui/frogsv.png"), 
  },
  currency: {
    biomatter: newImage("item/debris-frog.png"),
    metal: newImage("item/debris-ship.png")
  },
  credits: {
    andy: newImage("credits/andy.png"),
    barry: newImage("credits/barry.png")
  }
}

function copyInstanceVars(copy, original){
  for (var instanceVar in original){
    copy[instanceVar] = original[instanceVar];
  }
}


var game; // The currently played game

var saveSlots = [null, null, null];

function loadGames(){

  // if nothing has been stored yet, load default games
  if (
    (localStorage.getItem("game0") === null && 
    localStorage.getItem("game1") === null && 
    localStorage.getItem("game2") === null) ||
    !settings.saving
  ){
    saveSlots = [
      new Game("Test Save"),
      null,
      null
    ]
    return;
  }
  for (var i = 0; i < 3; i ++){
    if (localStorage.getItem("game" + i) != null){ // if the slot is not empty
      var loadedSlot = JSON.parse(localStorage.getItem("game" + i)); // parse JSON for instance vars
      saveSlots[i] = new Game(); // create game
      for (var instanceVar in saveSlots[i]){ // iterate thru all instance vars in parsed game
        copyInstanceVars(saveSlots[i], loadedSlot) // copy all instance vars from parsed game onto new game
        console.log(loadedSlot[instanceVar])
        if (saveSlots[instanceVar] instanceof Ship){
          console.log("copying fleet");
          for (var ship in loadedSlot.fleet){
            copyInstanceVars(saveSlots[i].fleet[ship], ship);
          }
        }else if (instanceVar[0] instanceof Frog){
          console.log("copying frogs");
          for (var frog in loadedSlot.frogs){
            copyInstanceVars(saveSlots[i].frogs[frog], frog);
          }
        }else if (loadedSlot[instanceVar] instanceof Array && loadedSlot[instanceVar][0] instanceof Star){ // if the instance variable is of
          console.log("copying starmap");
          for (var star in loadedSlot.starMap){
            copyInstanceVars(saveSlots[i].starMap[star], star);
          }
        }
      }
    }
  }
}

function saveGames(){
  if (!settings.saving) return;
  for (var i = 0; i < 3; i ++){
    if (saveSlots[i] != null){
      localStorage.setItem("game" + i, JSON.stringify(saveSlots[i])); // for each game, save as JSON
    }
    else{
      localStorage.removeItem("game" + i);
    }
    console.log(localStorage.getItem("game" + i))
  }
}

// 3 save slots for <Game>
loadGames()


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

canvas.addEventListener("mouseleave", function(evt) {
  mouseOnCanvas = false;
})

canvas.addEventListener("mouseenter", function(evt) {
  mouseOnCanvas = true;
})


// Checks if mouse is inside a rectangle
function mouseInRect(x, y, w, h){
  return mouseX > x && mouseX < x+w && mouseY > y && mouseY < y+h;
}


// Returns distance between (x1, y1) and (x2, y2)
function distance(x1, y1, x2, y2){
  return Math.sqrt((x1-x2)**2 + (y1-y2)**2);
}


// Rounds a number to the nearest denom (default 1)
function round(num, denom = 1){
  return Math.round(num*denom)/denom;
}


canvas.onmousemove = function(){
  if (mode == "game"){
    game.mouseMove();
  }
}


canvas.onmousedown = function(){
  mouseIsDown = true;
  if (mode == "game"){
    game.click();
  }else if (mode == "start"){

    if (newGameWindow.createdSlot != -1){ // "new game" window is open
      if (mouseInRect(52, 67, ctx.measureText(newGameWindow.name).width/PIXEL+12, 6)){ // mouse is on the change name button
        newGameWindow.name = randName();
      }
    }else if (clickedSlot != -1 && deletionStage == -1){

    }else{ // If a slot is not being created / no slot creation window
      
    }
  }
}


canvas.onmouseup = function(){ // You know what this does
  mouseIsDown = false;
  if (mode == "game"){
    game.release(); // trigger mouseup in game class

  }else if (mode == "start"){
    // If a slot is not being created / no slot creation window


    if (newGameWindow.createdSlot != -1){ // If a slot is being created / slot creation window
      if (mouseInRect(32, 78, 28, 8)){ // Cancel button
        newGameWindow.createdSlot = -1;
      }else if (mouseInRect(64, 78, 28, 8)){ // Create new game button
        saveSlots[newGameWindow.createdSlot] = new Game(newGameWindow.name);
        saveGames();
        newGameWindow.createdSlot = -1;
      }

    }else if (clickedSlot != -1){ // Enter game window
      if (deletionStage == -1){
        if (mouseInRect(32, 68, 28, 8)){ // Cancel button
          clickedSlot = -1;
        }else if (mouseInRect(64, 68, 28, 8)){ // Play game button
          mode = "game"
          clickedSlot = -1;
        }else if (mouseInRect(32, 90, 48, 8)){ // Delete save button
          //saveSlots[clickedSlot] = null;
          //clickedSlot = -1;
          deletionStage = 0;
        }
      }else if (deletionStage == 0){

        if (mouseInRect(39, 78, 27, 8)){ // Delete button
          saveSlots[clickedSlot] = null;
          deletionStage = -1;
          clickedSlot = -1;
          saveGames();
        }else if (mouseInRect(70, 78, 20, 8) || !mouseInRect(32, 32, 64, 64)){ // Cancel
          deletionStage = -1;
        }
      }

    }else{ // Title screen
      for (let i=0; i<3; i++){
        if (mouseInRect(26, BUTTONS_Y+20*i, 76, 16)){
          if (saveSlots[i] == null){ // If slot is empty
            newGameWindow.createdSlot = i;
            newGameWindow.name = randName();
            break;
          }else{
            game = saveSlots[i];
            console.log(game.render);
            clickedSlot = i;
          }
        }
      }
    }
  }
}

document.addEventListener("keydown", event => {
  
});


// Draws a rectangle in UI style
function uiRect(x, y, w, h, hollow = false){
  if (!hollow){
    ctx.fillStyle = "black";
    ctx.fillRect(x*PIXEL,y*PIXEL,w*PIXEL,h*PIXEL);
  }
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
function buttonRect(x, y, w, h, isTactile = true, isRed = false){
  
  if (mouseInRect(x, y, w, h) && !mouseIsDown && isTactile){
    uiRect(x, y, w, h);
  }else{
    ctx.fillStyle = "black";
    ctx.fillRect(x*PIXEL,y*PIXEL,w*PIXEL,h*PIXEL);
    ctx.lineWidth = 4;

    if (isRed){
      ctx.strokeStyle = "#fc4e03"
    }else{
      ctx.strokeStyle = COLOR.UI[1];
    }
    ctx.beginPath();
    ctx.rect(x*PIXEL-2, y*PIXEL-2, w*PIXEL+4, h*PIXEL+4);
    ctx.stroke();

    if (isRed){
      ctx.strokeStyle = "#b52407"
    }else{

    }ctx.strokeStyle = COLOR.UI[0];
    ctx.beginPath();
    ctx.rect(x*PIXEL+2, y*PIXEL+2, w*PIXEL-4, h*PIXEL-4);
    ctx.stroke();
  }
}


// Alternate style for buttonRect
function buttonRect2(x, y, w, h, isTactile = true){
  if (mouseInRect(x, y, w, h) && !mouseIsDown && isTactile){
    ctx.lineWidth = 4;
    ctx.strokeStyle = COLOR.UI[2];
    ctx.fillStyle = COLOR.UI[2];
    ctx.fillRect(x*PIXEL, y*PIXEL, w*PIXEL, h*PIXEL);
    ctx.fillStyle = "black";
    ctx.fillRect(x*PIXEL+4, y*PIXEL+4, w*PIXEL-8, h*PIXEL-8);
    
  }
}


// Draws a selection frame in specified rect
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


// Return the opacity the credits are supposed to be right now
function creditsOpacity(currentFrame, startAt, duration){

  // currentFrame - startAt = how many frames since the start of this credit
  if (currentFrame-startAt <= duration*0.6){
    return Math.min(round((currentFrame-startAt)/20, 8),1);
  }
  return Math.max(1-round((currentFrame-startAt-duration*0.6)/20, 8),0);
}

// Background Star class
class TitleStar{
  constructor(y = (Math.random() * 192 - 64)){
    this.x = Math.random() * 128;
    this.y = Math.round(y);
    this.opacity = Math.random()*0.5+0.25;
    this.speed = 0.5;
    this.isRed = Math.random() < 0.001;
    if (this.isRed){
      this.opacity += 0.5;
    }
  }

  // Draw the star and update its position
  draw(){
    this.y += this.speed;
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.isRed ? "red":"white";
    ctx.fillRect(Math.round(this.x)*PIXEL, Math.round(this.y)*PIXEL, PIXEL, PIXEL);
    ctx.globalAlpha = 1;
  }
}

var frames = 1;
var creditsFrames = 0;
const FPS_LIMIT = 40;
var updateId,
    previousDelta = 0;
var bgStars = []; 
for (var i=0; i<100; i++){
  bgStars.push(new TitleStar());
}

function renderLoop(currentDelta){


  // Limit FPS under FPS_LIMIT
  updateId = requestAnimationFrame(renderLoop);
  var delta = currentDelta-previousDelta;
  if (FPS_LIMIT && delta < 1000/FPS_LIMIT){
    return;
  }

  if (!mouseOnCanvas){
    mouseX = -1;
    mouseY = -1;
  }

  ctx.clearRect(0,0,1000,1000);
  frames += 1;

  if (mode == "start" || mode == "credits"){
    for (let i = 0; i < bgStars.length; i++){
      bgStars[i].draw();
      if (bgStars[i].y > 128){
        bgStars.splice(i, 1);
        i--;
      }
    }
    if (Math.random() < 0.15){
      bgStars.push(new TitleStar(y = -2));
    }
  }

  if(mode == "game"){
    game.render(); // runs (1 tick of) render loop of the game 

  }else if (mode == "start"){
    
    // newGameWindow.createdSlot: the index of the slot the player is trying to create a game in

    if (clickedSlot != -1){ // Home page, with "enter game" window open

      ctx.fillStyle = COLOR.TEXT; 
      drawText("Slot "+(clickedSlot+1), 32, 54, "small");
      drawText("- " + saveSlots[clickedSlot].name + " -", 32, 62, "small");
      
      if (deletionStage == -1){
        buttonRect(32, 68, 28, 8, true);
        buttonRect(64, 68, 28, 8, true);
        buttonRect(32, 90, 48, 8, true);
      }else{
        buttonRect(32, 68, 28, 8, false);
        buttonRect(64, 68, 28, 8, false);
        buttonRect(32, 90, 48, 8, false);
      }

      ctx.fillStyle = COLOR.TEXT;
      drawText(" Cancel", 32, 74, "small");
      drawText(" Play", 68, 74, "small");
      drawText(" Delete Save", 33, 96, "small");

      if (deletionStage >= 0){ // "ARE YOU SURE???" window
        ctx.fillStyle = "rgb(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, 512, 512);
        uiRect(32, 32, 64, 64);
        ctx.fillStyle = COLOR.TEXT;
        drawText("Are you SURE?", 38, 46, "small");
        drawText("You will NEVER ", 38, 58, "small");
        drawText("get your save", 38, 64, "small");
        drawText("back!!!", 38, 70, "small");
        buttonRect(39, 78, 27, 8, true);
        buttonRect(70, 78, 20, 8, true);
        ctx.fillStyle = COLOR.TEXT;
        drawText("DELETE", 41, 84, "small");
        drawText("nvm", 73, 84, "small");
      }

    }else if (newGameWindow.createdSlot != -1){ // Home page, with "create save" window open
      ctx.fillStyle = COLOR.TEXT; 
      drawText("Create game in Slot "+(newGameWindow.createdSlot+1), 32, 64, "small");
      if (mouseInRect(52, 67, ctx.measureText(newGameWindow.name).width/PIXEL+12, 6)){ // Tactile name switcher
        drawText("Name: >"+newGameWindow.name+"<", 32, 72, "small");
      }else{
        drawText("Name:  "+newGameWindow.name, 32, 72, "small");
      }
      
      buttonRect(32, 78, 28, 8);
      buttonRect(64, 78, 28, 8);
      ctx.fillStyle = COLOR.TEXT;
      drawText(" Cancel", 32, 84, "small");
      drawText(" Create", 64, 84, "small");

    
    }else{ // Home page, "create save" window not open

      titleY = Math.round((Math.sin(frames/12)*11+96)/4)*4; // Do you like this, Barry? 
      ctx.drawImage(IMAGE.ui.title, 256 - IMAGE.ui.title.naturalWidth/2*PIXEL, titleY, IMAGE.ui.title.naturalWidth*PIXEL, IMAGE.ui.title.naturalHeight*PIXEL);
      if (H_SCROLLERS){
        for (let i=0; i<4; i++){
          ctx.drawImage(IMAGE.ui.frogsH, (576-((Math.floor(frames/2)+i*54)%216)*4), 208, IMAGE.ui.frogsH.naturalWidth*PIXEL, IMAGE.ui.frogsH.naturalHeight*PIXEL);
        }
        for (let i=0; i<4; i++){
          ctx.drawImage(IMAGE.ui.shipsH, (-192+((Math.floor(frames/2)+i*54)%216)*4), 52, IMAGE.ui.shipsH.naturalWidth*PIXEL, IMAGE.ui.shipsH.naturalHeight*PIXEL);
        }
      }
      if (V_SCROLLERS){
        for (let i=0; i<4; i++){
          ctx.drawImage(IMAGE.ui.frogsV, 436, (-192+((Math.floor(frames/2)+i*54)%216)*4), IMAGE.ui.frogsV.naturalWidth*PIXEL, IMAGE.ui.frogsV.naturalHeight*PIXEL);
        }
        
        for (let i=0; i<4; i++){
          ctx.drawImage(IMAGE.ui.shipsV, 48, (576-((Math.floor(frames/2)+i*54)%216)*4), IMAGE.ui.shipsV.naturalWidth*PIXEL, IMAGE.ui.shipsV.naturalHeight*PIXEL);
        }
      }
      ctx.strokeStyle = COLOR.UI;

      if (frames % 10 == 0){
        if (titleY == 88 || titleY == 100){
          dTitleY = -dTitleY;
        }
        titleY += dTitleY;
      }

      
      for (let i = 0; i < 3; i ++){
        buttonRect(26, BUTTONS_Y + 20 * i, 76, 16);

        ctx.fillStyle = COLOR.TEXT;
        drawText("Save Slot "+(i+1), 36, BUTTONS_Y+7+20*i, "small");
        if (saveSlots[i] == null){
          ctx.globalAlpha = 0.6;
          if (mouseInRect(26, BUTTONS_Y+20*i, 76, 16)){ // Tactile save slot buttons
            drawText("< Create New >", 36, BUTTONS_Y+13+20*i, "small");
          }else{
            drawText("  Empty Save  ", 36, BUTTONS_Y+13+20*i, "small");
          }
          ctx.globalAlpha = 1;
        }else{
          
          if (mouseInRect(26, BUTTONS_Y+20*i, 76, 16)){
            drawText("> "+saveSlots[i].name, 36, BUTTONS_Y+13+20*i);
          }else{
            drawText("  "+saveSlots[i].name, 36, BUTTONS_Y+13+20*i);
          }
        }
      }
    }
  }else if (mode == "credits"){
    creditsFrames ++;

    ctx.textAlign = "center";
    ctx.fillStyle = COLOR.TEXT;
    
    if (creditsFrames >= 40 && creditsFrames < 160){
      ctx.globalAlpha = creditsOpacity(creditsFrames, 40, 120);

      drawText("SPACE FROG INVASION", 64, 64, "large");

    }else if (creditsFrames >= 160 && creditsFrames < 280){
      ctx.globalAlpha = creditsOpacity(creditsFrames, 160, 120);

      drawText("Created by", 64, 56, "small");
      drawText("BLUE SQUARE DUO", 64, 72, "large");

    }else if (creditsFrames >= 280 && creditsFrames < 400){
      ctx.globalAlpha = creditsOpacity(creditsFrames, 280, 120);

      drawText("Programmers", 64, 48, "small");
      drawText("ANDY YU", 64, 64, "large");
      drawText("BARRY YU", 64, 80, "large");

    }else if (creditsFrames >= 400 && creditsFrames < 520){
      ctx.globalAlpha = creditsOpacity(creditsFrames, 400, 120);

      drawText("Gameplay Designer", 64, 56, "small");
      drawText("ANDY YU", 64, 72, "large");

    }else if (creditsFrames >= 520 && creditsFrames < 640){
      ctx.globalAlpha = creditsOpacity(creditsFrames, 520, 120);

      drawText("Assets", 64, 56, "small");
      drawText("BARRY YU", 64, 72, "large");
    }
    else if (creditsFrames >= 680){
      mode = "start";
      ctx.textAlign = "left";
    }
    ctx.textAlign = "left";
  }
  
  if (settings.pixelChecker){ // Pixel checker tool
    ctx.globalAlpha = 0.5;
    drawImage(IMAGE.debug.pixelChecker, mouseX-4, mouseY-4);
    ctx.globalAlpha = 1;
  }
  drawImage(IMAGE.ui.cursor, Math.round(mouseX-2.5), Math.round(mouseY-2.5))

  previousDelta = currentDelta;
}

window.addEventListener("load",function(){
  renderLoop();
  console.log("------------------");
  console.log("SUPER SPACE-FROG INVASION:  "+VERSION);
});

window.addEventListener("keydown", (event) => {
  if (event.key == "c" && mode == "start" && clickedSlot == -1 && newGameWindow.createdSlot == -1){
    mode = "credits";
    creditsFrames = 0;
  }else if (event.key == "Escape" && mode == "credits"){
    mode = "start";
  }
});

