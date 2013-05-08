const BRICK_WIDTH = 15;
const BRICK_HEIGHT = 4;

var Brick = function(image) {
    this.width = BRICK_WIDTH;
    this.height = BRICK_HEIGHT;
    this.image = image;
    this.unbreakable = false;
    if(image.mod)
        this.unbreakable = true;
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
        
        x = Math.floor(x / (BRICK_WIDTH + 1));
        y = Math.floor(y / (BRICK_HEIGHT + 1));

        var hit = this.level.hit(x, y);
        if(!hit)
            return false;
        this.vx = -this.vx;
        return true;
    },

    // setVelocity contributed by http://github.com/kalgynirae
    setVelocity: function(q) {
        if(q < 0) {
            var down = true;
            q = Math.abs(q);
        }
        this.vx = (Math.floor(q * 6) - 2.5) * 0.5;
        this.vy = (Math.abs(Math.floor(q * 6) - 2.5) * 0.2) - 1.2;
        this.vy = this.vy * (down ? -1 : 1);
    },

    vertLevelCollision: function() {
        var x = this.x - this.level.renderX;
        var y = (this.y + this.vy) - this.level.renderY;
        
        x = Math.floor(x / (BRICK_WIDTH + 1));
        y = Math.floor(y / (BRICK_HEIGHT + 1));

        var hit = this.level.hit(x, y);
        if(!hit)
            return false;
        this.vy = -this.vy;
        return true;
    }
};

var Paddle = function(x, y) {
    this.width = 20;
    this.height = 6;
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
    this.o = new Image(); this.o.src = "brotate.png";
    this.o.mod = "rotated";
};

var Level = function(width, height, sw, sh, game) {
    this.game = game;
    this.width = width;
    this.height = height;
    this.bricks = new Array(width * height);
    this.renderX = (sw - width * (BRICK_WIDTH + 1)) / 2;
    this.renderY = 10;
    for(var i = 0; i < width * height; i++) {
        this.bricks[i] = null;
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
        var brick = this.bricks[y * this.width + x];
        if(!brick.unbreakable)
            this.bricks[y * this.width + x] = null;
        if(brick.image.mod)
            this.game.addModifier(brick.image.mod);
        this.game.score += 3;
        if(this.checkWin())
            levelComplete();
        return true;
    },

    checkWin: function() {
        for(var i = 0; i < this.bricks.length; i++) {
            if(this.bricks[i] != null && !this.bricks[i].unbreakable)
                return false;
        }
        return true;
    },

    draw: function(ctx) {
        for(var i = 0; i < this.width; i++) {
            for(var j = 0; j < this.height; j++) {
                if(this.bricks[j * this.width + i] == null)
                    continue;
                var x = this.renderX + (BRICK_WIDTH + 1) * i;
                var y = this.renderY + (BRICK_HEIGHT + 1) * j;
                this.bricks[j * this.width + i].draw(ctx, x, y);
            }
        }
    }
}

var Game = function() {
    this.modifiers = {
        spin: false,
        rotated: false,
        horizsplit: false,
        vertsplit: false,
        shake: false,
        tilt: false,
        zoom: false,
        colorize: false
    };
    this.paused = false;
    this.score = 0;
    this.lives = 3;
    this.k_left = false;
    this.k_right = false;

    this.level = new Level(10, 5, width, height, this);
    var pat = new Pattern("rrrrrrrrrrrygyggygyrrxbxxxxbxrrmbbmmbbmrrrrrrrrrrr");
    this.level.generate(pat);

    this.ball = new Ball(this.level, width / 2, 9001);
    this.paddle = new Paddle(25, height - 20);
}

Game.prototype = {
    tick: function() {
        if(this.paused)
            return;
        if(balltimer > 0)
            balltimer--;
        else
            this.updateBall();
        this.updatePaddle();
    },

    getScore: function() {
        score = "" + this.score;
        while(score.length < 5)
            score = "0" + score;
        return score;
    },

    render: function(ctx) {
        this.level.draw(ctx);
        this.paddle.draw(ctx);
        this.ball.draw(ctx);
    },

    // updateBall contributed by http://github.com/kalgynirae
    updateBall: function() {
        var levelhit = this.ball.checkCollideLevel();
        if(levelhit)
            return;
        
        // Standard collision check here, except we only care if the ball
        // is going downward
        if(this.ball.vy > 0 &&
           (this.ball.y + this.ball.height > this.paddle.y &&
            this.ball.y < this.paddle.y + this.paddle.height) &&
           (this.ball.x + this.ball.width > this.paddle.x &&
            this.ball.x < this.paddle.x + this.paddle.width)) {
            // Calculate the new direction
            var hit_width = (this.paddle.width + this.ball.width);
            var position = this.ball.x - (this.paddle.x - this.ball.width);
            this.ball.setVelocity(position / hit_width);
        }

        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;

        if(this.ball.x < 3) {
            this.ball.vx = -this.ball.vx;
            this.ball.x = 3;
        }

        if(this.ball.x >= width - 3) {
            this.ball.vx = -this.ball.vx;
            this.ball.x = width - 4;
        }

        if(this.ball.y < 3) {
            this.ball.vy = -this.ball.vy;
            this.ball.y = 3;
        }

        if(this.ball.y >= height - 12) {
            this.lives--;
            if(this.lives < 0)
                lose();
            this.ball.x = width / 2;
            this.ball.y = height / 2;
            this.ball.setVelocity(-Math.random());
            balltimer = 3 * 60;
        }
    },

    updatePaddle: function() {
        this.paddle.x += this.paddle.vx;
        if(this.paddle.x < 3) {
            this.paddle.vx = 0;
            this.paddle.x = 3;
        }
        if(this.paddle.x + this.paddle.width >= width - 3) {
            this.paddle.vx = 0;
            this.paddle.x = width - 3 - this.paddle.width;
        }
    },

    keydown: function(ev) {
        if(ev.keyCode == 68) {
            this.paddle.vx = +2.0;
            this.k_right = true;
        }
        else if(ev.keyCode == 65) {
            this.paddle.vx = -2.0;
            this.k_left = true;
        }
        else if(ev.keyCode == 87) {
            this.addModifier("rotated");
        }
        else if(ev.keyCode == 69) {
            this.addModifier("horizsplit");
        }
        else if(ev.keyCode == 82) {
            this.addModifier("spin");
        }
        else if(ev.keyCode == 83) {
            this.addModifier("vertsplit");
        }
        else if(ev.keyCode == 81) {
            this.clearMods();
        }
        else if(ev.keyCode == 32) {
            this.paused = !this.paused;
        }
        else
            console.log(ev.keyCode);
    },

    keyup: function(ev) {
        if(ev.keyCode == 68) {
            this.k_right = false;
            if(this.k_left)
                this.paddle.vx = -2.0;
            else
                this.paddle.vx = 0.0;
        }
        if(ev.keyCode == 65) {
            this.k_left = false;
            if(this.k_right)
                this.paddle.vx = +2.0;
            else
                this.paddle.vx = 0.0;
        }
    },

    clearMods: function() {
        for(var key in this.modifiers) {
            if(key == "spin" && this.modifiers[key]) {
                scale *= SQRT_2;
                offx = 0;
                offy = 0;
            }
            this.modifiers[key] = false;
        }
    },

    addModifier: function(mod) {
        var active = this.modifiers[mod];
        this.modifiers[mod] = true;

        if(mod == "spin" && !active) {
            spinAng = 0.0;
            scale /= SQRT_2;
            calcSpinOffset();
        }

        if(mod == "rotated") {
            rotAng += PI_OVER_2;
        }
    },
};
