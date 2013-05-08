var brickwidth = 15;
var brickheight = 4;

var Brick = function(image) {
    this.width = brickwidth;
    this.height = brickheight;
    this.image = image;
}

Brick.prototype = {
    draw: function(ctx, x, y) {
       ctx.drawImage(this.image, x, y);
    }
};

const MAX_BALL_SPEED = 2;
const HIT_BOOST = 0.05;

var Ball = function(level, x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0.3;
    this.vy = -1;
    this.level = level;
    this.image = new Image(); this.image.src = "ball.png";
    this.width = 2;
    this.height = 2;
};

Ball.prototype = {
    draw: function(ctx) {
        ctx.drawImage(this.image, this.x - 1, this.y - 1);
    },

    checkCollideLevel: function() {
        return this.vertLevelCollision() || this.horizLevelCollision();
    },

    clampSpeed: function() {
        var curspeed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
        var ang = Math.atan2(this.vy, this.vx);
        if(curspeed > MAX_BALL_SPEED)
            curspeed = MAX_BALL_SPEED

        this.vx = curspeed * Math.cos(ang);
        this.vy = curspeed * Math.sin(ang);
    },

    addSpeed: function(speed) {
        var curspeed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
        var ang = Math.atan2(this.vy, this.vx);
        curspeed += speed;
        if(curspeed > MAX_BALL_SPEED)
            curspeed = MAX_BALL_SPEED

        this.vx = curspeed * Math.cos(ang);
        this.vy = curspeed * Math.sin(ang);
    },

    horizLevelCollision: function() {
        var x = (this.x + this.vx) - this.level.renderX;
        var y = this.y - this.level.renderY;
        
        x = Math.floor(x / (brickwidth + 1));
        y = Math.floor(y / (brickheight + 1));

        var hit = this.level.hit(x, y);
        if(!hit)
            return false;

        this.vx = -this.vx;
        if(this.vx > 0)
            this.vx += HIT_BOOST;
        else
            this.vx -= HIT_BOOST;
        this.clampSpeed();
    },

    vertLevelCollision: function() {
        var x = this.x - this.level.renderX;
        var y = (this.y + this.vy) - this.level.renderY;
        
        x = Math.floor(x / (brickwidth + 1));
        y = Math.floor(y / (brickheight + 1));

        var hit = this.level.hit(x, y);
        if(!hit)
            return false;

        this.vy = -this.vy;
        if(this.vy > 0)
            this.vy += HIT_BOOST;
        else
            this.vy -= HIT_BOOST;
        this.clampSpeed();
    }
};

var Paddle = function(x, y) {
    this.width = 20;
    this.height = 4;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.image = new Image(); this.image.src = "paddle.png";
};

Paddle.prototype = {
    draw: function(ctx) {
        ctx.drawImage(this.image, this.x, this.y);
    }
};

var Pattern = function(str) {
    this.str = str;
    this.r = new Image(); this.r.src = "bred.png";
    this.y = new Image(); this.y.src = "byellow.png";
    this.g = new Image(); this.g.src = "bgreen.png";
    this.c = new Image(); this.c.src = "bcyan.png";
    this.b = new Image(); this.b.src = "bblue.png";
    this.m = new Image(); this.m.src = "bmagenta.png";
};

var Level = function(width, height, sw, sh) {
    this.width = width;
    this.height = height;
    this.bricks = new Array(width * height);
    this.renderX = (sw - width * (brickwidth + 1)) / 2;
    this.renderY = 10;
    for(var i = 0; i < width * height; i++) {
        this.bricks[i] = new Brick("#ff0000");
    }
}

Level.prototype = {
    generate: function(pattern) {
        for(var i = 0; i < this.width * this.height; i++) {
            if(pattern.str[i] == 'x')
                this.bricks[i] = null;
            else
                this.bricks[i] = new Brick(pattern[pattern.str[i]]);
        }
    },

    hit: function(x, y) {
        if(x < 0 || y < 0 || x >= this.width || y >= this.height)
            return false;
        if(this.bricks[y * this.width + x] == null)
            return false;
        this.bricks[y * this.width + x] = null;
        return true;
    },

    draw: function(ctx) {
        for(var i = 0; i < this.width; i++) {
            for(var j = 0; j < this.height; j++) {
                if(this.bricks[j * this.width + i] == null)
                    continue;
                var x = this.renderX + (brickwidth + 1) * i;
                var y = this.renderY + (brickheight + 1) * j;
                this.bricks[j * this.width + i].draw(ctx, x, y);
            }
        }
    }
}
