

var Ship = function (ctx, partsX, partsY, width, height) {
    var angle  = 0;
    var speedX = 0; // in m/s
    var speedY = 0;
    var gravity = partsX * 0.5;
    var posX   = partsX * 50;
    var posY   = partsY * 10;
    var ctx = ctx;
    var partsX = partsX;
    var partsY = partsY;
    var width = width;
    var height = height;
    var radius = width / 140;
    var onFireY = false;
    var onFireLeft = false;
    var onFireRight = false;
    var counter = 0;
    var fuel = 1000;
    var PLAYING = 0, FINISHED = 1, DYING = 2, DIED = 3;
    var status = PLAYING;

    this.fall = function() {
        speedY += gravity;
        onFireY = false;
        onFireLeft = false;
        onFireRight = false;
    }

    /**
     * Return fuel count on ship
     * @returns {number}
     */
    this.getFuel = function () {
        return fuel;
    }

    /**
     * Give remaining fuel as score
     */
    this.fuelToScore = function(amount) {
        fuel = fuel - amount;
        return amount;
    }

    /**
     * Checks ship collission
     * @param floor
     * @param collisionY
     * @param rampFlag
     */
    this.checkCollision = function(floor, collisionY, rampFlag) {
        if(status == PLAYING && (posY + partsY * 4) >= collisionY) {
            if(speedX > 0 || speedY > 10 || rampFlag) {
                status = DYING;
            } else {
                status = FINISHED;
            }

            speedY = 0;
            gravity = 0;
        }
    }

    /**
     * Moves ship by the current speed
     */
    this.moveMe = function() {
        posX += speedX;
        posY += speedY;
    }

    /**
     * Accelerates in dimension
     * @param x
     * @param y
     */
    this.accelerate = function (x, y) {
        if (fuel <= 0 || status != PLAYING) {
            return;
        }

        fuel = fuel - 50;
        // this is space, asume no rubbing


        speedX += x;
        speedY += y;

        // todo fire left and right
        if (y != 0) {
            onFireY = true;
        }

        if(speedY > 10) {
            speedY = 10;
        } else if (speedY < -10) {
            speedY = -10;
        }


        if(x > 0) {
            onFireLeft = true;
        } else if(x < 0) {
            onFireRight = true;
        }

    };

    this.getStatus = function() {
        return status;
    }

    /**
     * returns speed X
     * @returns {number}
     */
    this.getSpeedX =function() {
        return speedX;
    }


    /**
     * returns speed Y
     * @returns {number}
     */
    this.getSpeedY = function() {
        return speedY;
    }

    /**
     * Forces a position of ship
     * @param x
     * @param y
     */
    this.setPos = function(x, y) {
        posX = x;
        posY = y;
    }

    /**
     * Gets current Y position
     * @returns {number}
     */
    this.getPosY = function() {
        return posY;
    }


    /**
     * Gets current X position
     * @returns {number}
     */
    this.getPosX = function() {
        return posX;
    }

    /**
     * Fire effect
     */
    this.randFire = function() {
        if (Math.random() > 0.5) {
            ctx.strokeStyle = "#FFFFFF";
        } else {
            ctx.strokeStyle = "#FF0000";
        }
    }

    this.drawDie = function () {
        counter += 1;
        // draw explosion
        if(counter % 30 == 0) {
            speedX = 0;
            speedY = 0;
            status = DIED;
        }

        if (status == DIED) {
            return;
        }


        // draw fire
        ctx.beginPath();
        this.randFire();
        ctx.arc(posX, posY, radius + counter * partsX, 0, 2 * Math.PI, false);
        ctx.stroke();



        // draw ship
        ctx.beginPath();
        this.randFire();
        ctx.strokeStyle = "#FFFFFF";
        ctx.arc(posX, posY, radius, 0, 2 * Math.PI, false);
        ctx.stroke();


        ctx.beginPath();
        ctx.moveTo(posX, posY);
        var rectX = posX - radius;
        var rectY = posY + radius;
        ctx.rect(rectX, rectY, radius*2, radius / 2);
        ctx.stroke();
    }

    /**
     * Draws ship
     */
    this.drawMe = function() {
        if(status == DIED) {
            return;
        }
        if (status == DYING) {
            this.drawDie();
            return;
        }
        ctx.save();

        ctx.rotate(0);

        // draw ship
        ctx.beginPath();

        ctx.arc(posX, posY, radius, 0, 2 * Math.PI, false);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(posX, posY);
        var rectX = posX - radius;
        var rectY = posY + radius;
        ctx.rect(rectX, rectY, radius*2, radius / 2);
        ctx.stroke();

        ctx.beginPath();
        rectX = rectX + radius * 2;
        rectY = rectY + radius / 2;
        ctx.moveTo(rectX, rectY);
        ctx.lineTo(rectX + radius, rectY+radius);
        ctx.lineTo(rectX + partsX * 1, rectY+radius);
        ctx.stroke();

        ctx.beginPath();
        rectX = rectX - radius * 2;
        ctx.moveTo(rectX, rectY);
        ctx.lineTo(rectX - radius, rectY + radius);
        ctx.lineTo(rectX - partsX * 1, rectY+radius);
        ctx.stroke();
        // draw fire if applies
        if(onFireY) {
            ctx.beginPath();
            this.randFire();
            rectX = posX - radius;
            rectY = posY + radius + radius / 2;
            ctx.moveTo(rectX, rectY);
            ctx.lineTo(rectX + radius, rectY + partsY * 2);
            ctx.lineTo(rectX + radius * 2, rectY);
            ctx.stroke();
        }

        if(onFireLeft) {
            rectX = posX - radius;
            rectY = posY + radius;
            ctx.beginPath();
            this.randFire();
            ctx.moveTo(rectX, rectY);
            ctx.lineTo(rectX - radius, rectY - radius);
            ctx.lineTo(rectX + radius / 2, rectY - radius * 2);
            ctx.stroke();

        }

        if(onFireRight) {
            rectX = posX + radius;
            rectY = posY + radius;
            ctx.beginPath();
            this.randFire();
            ctx.moveTo(rectX, rectY);
            ctx.lineTo(rectX + radius, rectY - radius);
            ctx.lineTo(rectX - radius / 2, rectY - radius * 2);
            ctx.stroke();

        }

        ctx.restore();
    };



};
