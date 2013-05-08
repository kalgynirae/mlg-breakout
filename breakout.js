var width = 200;
var height = 200;
var hwidth = 100;
var hheight = 100;
var scale = 2;
var scalesetting = 2;

function rescale() {
    cwidth = Math.ceil(width * scale);
    cheight = Math.ceil(height * scale);
    console.log([cwidth, cheight]);
    $canvas.width = cwidth;
    $canvas.height = cheight;
    disableSmoothing();
    if(game.modifiers.spin) {
        scale /= SQRT_2;
        calcSpinOffset();
    }
}

$('#scale2').click(function() {
    scale = 2;
    scalesetting = 2;
    rescale();
});

$('#scale3').click(function() {
    scale = 3;
    scalesetting = 3;
    rescale();
});

$('#scale4').click(function() {
    scale = 4;
    scalesetting = 4;
    rescale();
});

var cwidth = width * scale;
var cheight = height * scale;

var offx = 0;
var offy = 0;
const SQRT_2 = Math.sqrt(2);
const PI_OVER_2 = Math.PI / 2;

var $canvas = $('#game')[0];
$canvas.width = cwidth;
$canvas.height = cheight;
$('#game').contextmenu(function() { return false; });
var context = $canvas.getContext('2d');

var sopro = new Audio("sopro.ogg");
var effects = [
    [79000, {colorize: true}],
    [92500, {colorize: true, tilt: true, zoom: true}],
    [97500, {colorize: true, shake: true}],
    [102000, {colorize: true, tilt: true, zoom: true}],
    [107000, {colorize: true, shake: true}],
    [112000, {colorize: true, tilt: true, zoom: true}],
    [117000, {colorize: true, shake: true}],
    [122000, {colorize: true, tilt: true, zoom: true}],
    [127000, {colorize: true, shake: true}],
    [132000, {colorize: true, tilt: true, zoom: true}],
    [145000, {}],
];
setTimeout(function() {
    sopro.play();
    for(var i = 0; i < effects.length; i++) {
        setTimeout(function() {
            game.modifiers = this;
        }.bind(effects[i][1]), effects[i][0]);
    }
}, 2000);

// No smoothing, please
function disableSmoothing() {
    context.imageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false;
    context.webkitImageSmoothingEnabled = false;
}

disableSmoothing();

// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

var framebuffer = document.createElement('canvas');
framebuffer.width = width;
framebuffer.height = height;
var screen = framebuffer.getContext('2d');

var State = {
    game: 0,
    lose: 1,
    win: 2
};
var state = State.game;

function lose() {
    state = State.lose;
    offx = 0;
    offy = 0;
    scale = scalesetting;
    rescale();
}

function levelComplete() {
    state = State.win;
    offx = 0;
    offy = 0;
    if(game.modifiers.spin)
        scale *= SQRT_2;
}

function startGame() {
    state = State.game;
    game = new Game();
}

function keydown(ev) {
    if(state == State.game) {
        game.keydown(ev);
    }
    else if(state == State.lose && ev.keyCode == 32) {
        startGame();
    }
    else if(state == State.win && ev.keyCode == 32) {
        startGame();
    }
}

function keyup(ev) {
    if(state == State.game) {
        game.keyup(ev);
    }
}

$(document).keydown(function(ev) { keydown(ev); });
$(document).keyup(function(ev) { keyup(ev); });

function gameTick() {
    game.tick();
    screen.save(); screen.fillStyle = "#000000";
    screen.fillRect(0, 0, width, height);

    screen.drawImage(bg, 0, 0);
    game.render(screen);
    screen.restore();

    if(game.modifiers.spin) {
        rotate(context, spinAng);
        spinAng += 0.01;
    }
    if(game.modifiers.rotated) {
        if(spinAng < rotAng) {
            spinAng += 0.01;
            rotate(context, spinAng);
        }
        else rotate(context, rotAng);
    }
    /*
    if(game.modifiers.horizsplit) {
        horizsplit();
    }
    if(game.modifiers.vertsplit) {
        vertsplit();
    }
    */
    font.render("SCORE:" + game.getScore(), screen, 3, height - 11);
    var balls = "BALLS:" + game.lives;
    font.render(balls, screen, width - 4 - balls.length * 8, height - 11);

    if(game.modifiers.shake) {
        shake();
    }
    if(game.modifiers.tilt) {
        tiltang += tiltda;
        if(tiltang < -Math.PI/14 || tiltang > Math.PI/14) {
            tiltda = -tiltda;
        }
        rotate(context, tiltang);
    }
    if(game.modifiers.zoom) {
        scale *= dzoom;
        if(scale > scalesetting * 1.15 || scale < scalesetting / 1.15) {
            dzoom = 1/dzoom;
        }
    }
    if(game.modifiers.colorize) {
        colorize();
    }
}

function loseScreenTick() {
    screen.drawImage(bg, 0, 0);
    font.render("YOU LOSE", screen, (width - 64) / 2, (height - 16) / 2);
    var score = "SCORE: " + game.getScore();
    font.render(score, screen, (width - score.length * 8) / 2, (height + 16) / 2);
    var kprompt = ">PRESS SPACE TO RESTART<";
    font.render(kprompt, screen, (width - kprompt.length * 8) / 2, height - 11);
}

function levelCompleteTick() {
    screen.drawImage(bg, 0, 0);
    font.render("LEVEL COMPLETE", screen, (width - 14 * 8) / 2, (height - 16) / 2);
    var score = "SCORE: " + game.getScore();
    font.render(score, screen, (width - score.length * 8) / 2, (height + 16) / 2);
    var kprompt = ">PRESS SPACE<";
    font.render(kprompt, screen, (width - kprompt.length * 8) / 2, height - 11);
}


// Load images
var bg = new Image();
bg.src = "bg.png";

var font = new Font();

var balltimer = 3 * 60;
var game = new Game();

var spinAng = 0.0;
var rotAng = 0.0;
var tiltang = 0.0;
var tiltda = 0.05;
var dzoom = 1.02;
var frames = 0;
function tick() {
    frames++;
    context.save();
    context.fillStyle = "#000000";
    context.fillRect(0, 0, cwidth, cheight);
    if(state == State.game)
        gameTick();
    if(state == State.lose)
        loseScreenTick();
    if(state == State.win)
        levelCompleteTick();
    context.translate(offx, offy);
    context.drawImage(framebuffer, 0, 0, width * scale, height * scale);
    context.restore();
    requestAnimFrame(tick);
}
tick();

setTimeout(function() {
    $('#framecounter').text("FPS: " + frames);
    frames = 0;
}, 1000);
