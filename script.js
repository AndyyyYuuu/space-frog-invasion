// Andy Yu
// June 9th, 2023
// Super Space Frog Invasion

const VERSION = "Beta";
const canvas = document.querySelector("canvas");
canvas.setAttribute('width', 512);
canvas.setAttribute('height', 512);
ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

var page = "home";
var mouseX = -1;
var mouseY = -1;

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

canvas.onmousedown=function(){
}

document.addEventListener("keydown", event => {
  
});

function renderLoop(currentDelta){
  updateId = requestAnimationFrame(renderLoop);
  var delta = currentDelta - previousDelta;
  if (FPS_LIMIT && delta < 1000 / FPS_LIMIT) {
    return;
  }
  ctx.clearRect(0,0,1000,1000);
  frames+=1;
  if(page == "game"){
    ctx.font = '40px';
    ctx.fillStyle = "black"
    ctx.fillText("Game",125,100);
  }else if (page == "home"){
    ctx.font = '40px';
    ctx.fillStyle = "black";
    ctx.fillText("Title",125,100);
    if(mouseX>181 && mouseX<331 && mouseY>300 && mouseY<400){
      ctx.fillStyle = "gray";
    }
    ctx.fillRect(181,300,150,100);
  }
  previousDelta = currentDelta;
}

window.addEventListener("load",function(){
  renderLoop();
  console.log("------------------");
  console.log("SUPER SPACE-FROG INVASION:  "+VERSION);
});

