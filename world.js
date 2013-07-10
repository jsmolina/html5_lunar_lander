
var World = function (idCanvas, repeatPattern) {
    var that = this;
    var ship = null;
    var width = 0;
    var height = 0;
    var partsX = 100;
    var partsY = 100;
    var minMargin = 0;
    var floor = [];
    var specialPos = [];
    var ramps = [];
    var ctx = null;
    var frameCount = 0;
    var score = 0;
    this.pause = true;
    // is there any way to access others var?
    var PLAYING = 0, FINISHED = 1, DYING = 2, DIED = 3;
    var solvedMessage = "NICE! YOU LANDED!! PRESS 'N' OR TAP FOR NEXT LEVEL";
    var solved = false;
    var level = 1;

    /**
     * Gets canvas context
     * @param idCanvas
     * @returns context
     */
    this.loadCanvas = function (idCanvas) {
        var elemento = document.getElementById(idCanvas);


        if (elemento && elemento.getContext) {
            var ctx = elemento.getContext('2d');
            if (ctx) {
                width = ctx.canvas.width;
                height = ctx.canvas.height;
                partsX = width / 100.0;
                partsY = height / 100.0;
                minMargin = partsX * 3;
                return ctx;
            }
        }
        return false;
    };


    this.construct = function() {
        ctx = this.loadCanvas(idCanvas);
        ship = new Ship(ctx, partsX, partsY, width, height);
    }



    /**
     *Draws a line on with and height
     **/
    this.drawLine = function (originX, originY, width, height, color) {
        var originalX = partsX * originX;
        var originalY = partsY * originY;
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.moveTo(originalX, originalY);
        ctx.lineTo(originalX + width * partsX, originalY + height * partsY);
        ctx.stroke();
    }

    /**
     * Draws a specific text in canvas
     * @param text
     * @param originX
     * @param originY
     */
    this.drawText = function (text, originX, originY) {
        ctx.font = '0.9em courier';
        var xPosition = originX;
        var yPosition = originY;
        // relative or absolute?
        if (originX < 101 && originY < 101) {
            xPosition = xPosition * partsX;
            yPosition = yPosition * partsY;
        }
        ctx.strokeText(text, xPosition, yPosition);
        ctx.textBaseline = 'bottom';
    }

    /**
     * Draws right column texts
     * @param texts
     * @param startY
     */
    this.drawRightColumn = function(texts, startY) {
        ctx.font = '0.9em courier';
        var maxWidth = 0;
        var textWidth = 0;
        for (index in texts) {
            textWidth = ctx.measureText(texts[index]).width + minMargin;
            if(textWidth > maxWidth) {
                maxWidth = textWidth;
            }
        }

        var xPos = width - maxWidth;
        var yPos = startY;
        for (index in texts) {
            this.drawText(texts[index], xPos, yPos * partsY);
            yPos += 5;
        }
    }

    /**
     * Returns
     * @returns [height, ramp?]
     */
    this.getCollision = function() {
        var currentPosX = ship.getPosX();
        var collision = 1;
        var ramp = false;
        var angle = 0;
        var lastHeight = floor[0];
        var lastX = 0;

        for (fv in floor) {
            var floorX = fv;
            // match current pos
            if (Math.abs(floorX - (currentPosX + minMargin)) <= minMargin) {

                var angle = Math.abs(Math.atan2(floor[fv] - lastHeight, fv - lastX) * 180 / Math.PI);
                if (angle > 10) {
                    ramp = true;
                }

                return {collision: floor[fv], ramp: ramp, specialPos: specialPos[lastX]};
            }
            lastX = fv;
            lastHeight = floor[fv];
        }
        return {collision: 1, ramp: ramp, specialPos: false};
    }

    this.randBlink = function() {
        if (Math.random() > 0.5) {
            ctx.strokeStyle = "#FFFFFF";
        } else {
            ctx.strokeStyle = "yellow";
        }
    }


    /**
     * Draws score, speeds, ...
     */
    this.drawLegend = function () {

        var speedYLegend = "";
        var speedXLegend = "";
        // paint speeds and directions
        var speedY = ship.getSpeedY();
        var speedX = ship.getSpeedX();
        if (speedY >= 0) {
            speedYLegend = Math.abs(speedY) + " \u2193";
        } else {
            speedYLegend = Math.abs(speedY) + " \u2191";
        }

        if (speedX >= 0) {
            speedXLegend = Math.abs(speedX) + " \u2192";
        } else {
            speedXLegend = Math.abs(speedX) + " \u2190";
        }

        var currentPosX = ship.getPosX();


        // get collision point
        var result = this.getCollision();



        ship.checkCollision(this.floor, result.collision, result.ramp);

        if(ship.getStatus() == FINISHED) {
            if (ship.getFuel() > 0) {
                var incremental = 1;

                if(result.specialPos == true) {
                    incremental = 4;
                }

                score += ship.fuelToScore(50) * incremental;
            } else {
                solved = true;
            }
            // if passing yellow
            if(solved != true) {
                this.randBlink();
            } else {
                this.drawText(solvedMessage, 25, 50);
            }
        }

        if(ship.getStatus() == DIED) {
            this.drawText("You died. Press R or hold your finger.", 30, 50);            
        }

        if (ship.getPosY() >= result.collision) {
            this.gravity = 0;
        }

        this.drawText("SCORE " + score, 3, 10);
        this.drawText("TIME  " + "00000", 3, 15);
        var fuel = ship.getFuel();
        if (fuel <= 0 && solved != true) {
            ctx.strokeStyle = "#FF0000";
        }
        this.drawText("FUEL  " + ship.getFuel(), 3, 20);
        this.drawText("LEVEL " + level, 3, 25);

        ctx.strokeStyle = "#FFFFFF";

        this.drawRightColumn([
            "ALTITUDE    " + Math.round(ship.getPosY() / partsY) ,
            "HORIZ SPEED " + speedXLegend,
            "VERT SPEED  " + speedYLegend
        ],
            10
        );



    }

    this.getRandomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }


    /**
     * Generates floor only one time
     * @param level Current Game level
     * modifies floor var
     */
    this.generateFloor = function(level) {
        var lastHeight = partsY * 80;
        var counter = 0;
        var nextPlain = false;
        var currentHeight = 0;
        var val = 0;
        var jump = 0;

        floor[0] = lastHeight;
        while (counter < width) {
            currentHeight = lastHeight;
            // si da un valor por debajo del nivel de usuario, generar
            // baches
            val = this.getRandomInt(0, 20);
            if (level > val && nextPlain === false) {
                jump = this.getRandomInt(0, 40);
                if (jump > 20) {
                    jump = 0 - jump;
                }
                currentHeight = lastHeight + jump;
                if (lastHeight >= height) {
                    currentHeight = pargsY * 80;
                }
            } else {
                nextPlain = false;
            }

            floor[counter] = currentHeight;
            // Mark special points
            if (Math.abs(lastHeight - floor[counter]) > 2) {
                specialPos[counter] = true;
                nextPlain = true;
            } else {
                specialPos[counter] = false;
            }

            lastHeight = currentHeight;

            counter += minMargin;
        }
    }

    /**
     * Draws pre-generated floor or generates if empty
     * @param level Game level
     */
    this.drawFloor = function (level) {
        var lastHeight = partsY * 80;
        /** if floor is already generated... @todo firefox fails! **/
        if (floor.length > 0) {
            ctx.beginPath();
            ctx.strokeStyle = "#FFFFFF";

            ctx.moveTo(0, lastHeight);

            for (fv in floor) {
                ctx.lineTo(fv, floor[fv]);
                lastHeight = floor[fv];
            }


            ctx.lineTo(width, floor[fv]);
            ctx.stroke();

            for (fv in floor) {
                if (specialPos[fv] === true) {
                    ctx.strokeText("4x", fv, floor[fv] + minMargin);
                }
            }
            return;
        } else {
            this.generateFloor(level);
        }
    }


    /**
     * Cleans up canvas
     */
    this.clean = function () {
        // @todo check which is faster!
        ctx.canvas.width  = ctx.canvas.width;
        //ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    }


    //http://upload.wikimedia.org/wikipedia/en/9/9f/Lunar_Lander.png
    /**
     * Main function: draw
     */
    this.draw = function () {

        if (ctx) {
            this.clean();
            this.drawFloor(level);
            this.drawLegend();
            ship.moveMe();
            ship.drawMe();
            //ship.checkCollission();

            frameCount++;
            if(frameCount % 5 == 0) {
                frameCount = 0;
                ship.fall();
            }

            // draw floor repeating as repeatpattern until width, draw ship
	    if(this.pause === false) {
		setTimeout(function () {
		    that.draw();
		}, 90);
	    }
        }
	
    }
    
    this.stop = function() {
	this.pause = true;
    }
    
    this.start = function() {
	this.pause = false;
	this.draw();
    }
    
    this.keyDown = function(e) {         
        if (e==40 /*s*/){
            ship.accelerate(0, -partsY * 0.5);
        } else if(e == 37) {            
            ship.accelerate(-partsX * 0.5, 0);
        } else if (e == 39) {
            ship.accelerate(partsX * 0.5, 0);
        } else if (e == 78 && solved == true) {
            ship = new Ship(ctx, partsX, partsY, width, height);
            solved = false;
            level += 1;
            // create a new floor!
            this.generateFloor(level);
        } else if(e == 78 && ship.getStatus() == DIED) {
            window.location.reload();
        }
    }
}


