// CONSTANTS
const canvas = document.getElementById('canvas');
const c = canvas.getContext('2d');

const gravity = 0.015 * canvas.height;
const fallAcceleration = 0.01 * canvas.height
const maxFallSpeed = 0.10 * canvas.height;
const maxSpeed = 0.05 * canvas.width;
const speedRate = 0.005 * canvas.width;
const jumpSpeed = 0.3 * canvas.height;

const playerWidth = 50;
const playerHeight = 150;

// VARIBALES
let gameOver = false;
let keys = {}
let collision = false;
let showText = false;

// SETUP
canvas.width = window.innerWidth - 20;
const xScaling = canvas.width / 1900;
canvas.height = window.innerHeight - 20;
const yScaling = canvas.height / 1041
c.fillRect(0, 0, canvas.width, canvas.height);

window.addEventListener('keydown', function(event) {
    keys[event.key] = true;
});

window.addEventListener('keyup', function(event) {
    keys[event.key] = false;
    if (event.key === player.keyBindings.up) {
        player.jumpCooldown = false;
    }
    if (event.key === enemy.keyBindings.up) {
        enemy.jumpCooldown = false;
    }
    if (event.key === player.keyBindings.attack) {
        player.swordCooldown = false;
    }
    if (event.key === enemy.keyBindings.attack) {
        enemy.swordCooldown = false;
    }
});

// This line calls the animate function, which then starts the game
requestAnimationFrame(animate);

// CLASSES
class Sprite {
    constructor({position, velocity, keyBindings, color, width, height, opponent, swordDir, score, parent, jumps, jumpCooldown, swordCooldown}) {
        this.position = position;
        this.velocity = velocity;
        this.keyBindings = keyBindings;
        this.color = color;
        this.width = width;
        this.height = height;
        this.swordDir = swordDir;
        this.score = score;
        this.parent = parent;
        this.jumps = jumps;
        this.jumpCooldown = jumpCooldown;
        this.swordCooldown = swordCooldown;
    }
    setOpponent(opponent) {
        this.opponent = opponent;
    }

    draw() {
        c.fillStyle = this.color
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }











    update(deltaTime) {
        // Constant gravity
        if (this.velocity.y <= maxFallSpeed) {
            this.velocity.y <= 0 ? this.velocity.y += gravity * deltaTime * 30: this.velocity.y += fallAcceleration * deltaTime * 30;
        }

        // Applying velocity to position
        this.position.y += this.velocity.y * deltaTime * 30 * yScaling;
        this.position.x += this.velocity.x * deltaTime * 30 * xScaling;

        // Colliding with ground
        if (Math.floor(this.position.y) + playerHeight >= canvas.height) {
            this.position.y = canvas.height - playerHeight;
            this.velocity.y = 0;
            this.jumps = 2;
            this.jumpCooldown = false;
        }

        // Jumping
        if (keys[this.keyBindings.up] && !this.jumpCooldown) {
            // if touching the ground
            if (this.position.y + playerHeight >= canvas.height) {
                this.jumpCooldown = true;
                // negative because as position is higher on the screen, y value lowers.
                this.velocity.y = -jumpSpeed;
                this.jumps--;
            }
            else if (this.jumps > 0) {
                this.jumpCooldown = true;
                this.velocity.y = -jumpSpeed;
                this.jumps -= 1;
            }
        }

        // Horizontal friction
        this.velocity.x *= 0.9;

        // Move left and right
        if (!gameOver) {
            if (keys[this.keyBindings.left]) {
                this.swordDir = 'left';
                if (!checkIntersect(this, this.opponent)) {
                    if (this.velocity.x > -maxSpeed) {this.velocity.x -= speedRate}
                }
            }
            if (keys[this.keyBindings.right]) {
                this.swordDir = 'right';
                if (!checkIntersect(this, this.opponent)) {
                    if (this.velocity.x < maxSpeed) {this.velocity.x += speedRate}
                }
            }
        }
        // Attack
        if (keys[this.keyBindings.attack] && !this.swordCooldown) {
            let swordX;
            let swordY;
            if (this.swordDir == 'left') {
                setTimeout(() => {this.swordCooldown = true}, 100);
                swordX = this.position.x - this.width;
                swordY = this.position.y;
                c.fillStyle = 'gray'
                c.fillRect(swordX, swordY, this.width, this.height / 2);
            }
            if (this.swordDir == 'right') {
                setTimeout(() => {this.swordCooldown = true}, 100)
                swordX = this.position.x + this.width;
                swordY = this.position.y;
                c.fillStyle = 'gray';
                c.fillRect(swordX, swordY, this.width, this.height / 2);
            }
            if (checkSwordIntersect(this.opponent, swordX, swordY, this.width, this.height/2)) {
                this.position.x < this.opponent.position.x ? this.opponent.velocity.x += 50 : this.opponent.velocity.x -= 50;
                this.opponent.velocity.y -= 8;
            }
        }
        // Checking for loss
        if (this.position.x < 0 || this.position.x + playerWidth > canvas.width) {
            writeText('player wins!', 'green', 1000);
            this.opponent.score++;
            resetGame();
        }
        // check for collision
        if (checkIntersect(this, this.opponent)) {
            // if the collision is above the person,
            if (Math.abs(player.position.y - enemy.position.y) >= playerHeight - 5) {
                if (this.velocity.y <= 1 && this.position.y < this.opponent.position.y) {
                    this.velocity.y = 0;
                }
                else {
                    // making sure the players aren't inside of each other
                    this.velocity.y *= -1;
                }
            }
            else {
                if (this.position.x > this.opponent.position.x) {
                    this.position.x = this.opponent.position.x + playerWidth;
                }
                this.velocity.x *= -1.5;
            }
        }
        this.draw();
    }










}



// SETTING THE SPRITES

const player = new Sprite({
    position: {
        x: 0,
        y: canvas.height - playerHeight
    },
    velocity: {
        x: 0,
        y: 0
    },
    keyBindings: {
        up: 'w',
        down: 's',
        left: 'a',
        right: 'd',
        attack: 'f',
        juggle: 'e'
    },
    color: 'green',
    width: playerWidth,
    height: playerHeight,
    score: 0,
    swordDir: 'right',
    jumps: 2,
    jumpCooldown: false,
    swordCooldown: false
});

const enemy = new Sprite({
    position: {
        x: canvas.width - playerWidth,
        y: canvas.width - playerHeight
    },
    velocity: {
        x: 0,
        y: 0
    },
    keyBindings: {
        up: 'o',
        down: 'l',
        left: 'k',
        right: ';',
        attack: 'j',
        juggle: 'i'
    },
    color: 'red',
    width: playerWidth,
    height: playerHeight,
    score: 0,
    swordDir: 'left',
    jumps: 2,
    jumpCooldown: false,
    swordCooldown: false
});

player.setOpponent(enemy);
enemy.setOpponent(player);


// FUNCTIONS

function checkIntersect(r1, r2) {
    return !(r2.position.x >= r1.position.x + r1.width ||
             r2.position.x + r2.width <= r1.position.x ||
             r2.position.y >= r1.position.y + r1.height ||
             r2.position.y + r2.height <= r1.position.y);
}

function checkSwordIntersect(r1, x, y, width, height) {
    return !(x >= r1.position.x + r1.width ||
        x + width <= r1.position.x ||
        y >= r1.position.y + r1.height ||
        y + height <= r1.position.y);
}

let textToDisplay = "";
let textColor = "";

function writeText(text, color, time) {
    console.log("bruh")
    if (showText == false) {
        if (time == null) {time = 2000}
        showText = true;
        textToDisplay = text;
        textColor = color;
        setTimeout(function() {
            showText = false;
            textToDisplay = "";
        }, time);
    }
}

function resetGame() {
    gameOver = true;
    player.velocity.x = 0;
    enemy.velocity.x = 0;
    player.position.x = 0;
    enemy.position.x = canvas.width - playerWidth;
    player.position.y = 700;
    enemy.position.y = 700;
    player.velocity.y = 0;
    enemy.velocity.y = 0;

    // setting a timeout, waiting for existing text to disappear
    // absolute monstrosity... yikes
    console.log("text")
    setTimeout(() => {
        writeText("3", "white", 1000);
        setTimeout(() => {
            writeText("2", "white", 1000);
            setTimeout(() => {
                writeText("1", "white", 1000);
                setTimeout(() => {
                    writeText("Fight!", "red", 1000);
                    gameOver = false;
                }, 1000);
            }, 1000);
        }, 1000);
    }, 2000);
}

let lastTime = Date.now();  // initialization of lastTime

function animate() {
    let currentTime = Date.now();
    let deltaTime = (currentTime - lastTime) / 1000.0;
    lastTime = currentTime;  // update lastTime after calculating deltaTime

    c.fillStyle = 'black';
    c.fillRect(0, 0, canvas.width, canvas.height);

    c.fillStyle = 'white';
    c.font = "30px Arial";
    c.fillText(player.score, 25, 50);
    c.fillText("|", 60, 48);
    c.fillText(enemy.score, 90, 50);

    if (showText == true) {
        c.fillStyle = textColor;
        c.textAlign = "center";
        c.font = "30px Arial";
        c.fillText(textToDisplay, canvas.width / 2, canvas.height / 2);
        c.textAlign = "start"; // Reset text alignment back to "start"
    }

    player.update(deltaTime);
    enemy.update(deltaTime);

    requestAnimationFrame(animate);
}