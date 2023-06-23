// CONSTANTS
const canvas = document.getElementById('canvas');
const c = canvas.getContext('2d');

const gravity = 0.005 * canvas.height;
const maxSpeed = 0.05 * canvas.width;
const speedRate = 0.005 * canvas.width;
const jumpSpeed = 0.2 * canvas.height;

const playerWidth = 50;
const playerHeight = 150;

// VARIBALES
let gameOver = false;
let keys = {}
let collision = false;

// SETUP
canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 20;
c.fillRect(0, 0, canvas.width, canvas.height);

window.addEventListener('keydown', function(event) {
    keys[event.key] = true;
});

window.addEventListener('keyup', function(event) {
    keys[event.key] = false;
});

// This line calls the animate function, which then starts the game
requestAnimationFrame(animate);

// CLASSES
class Sprite {
    constructor({position, velocity, keyBindings, color, width, height, opponent, swordDir, score}) {
        this.position = position;
        this.velocity = velocity;
        this.keyBindings = keyBindings;
        this.color = color;
        this.width = width;
        this.height = height;
        this.swordDir = swordDir;
        this.score = score;
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
        this.velocity.y += gravity * deltaTime * 30;

        // Applying velocity to position
        this.position.y += this.velocity.y * deltaTime * 30;
        this.position.x += this.velocity.x * deltaTime * 30;

        // Colliding with ground
        if (this.position.y + playerHeight >= canvas.height) {
            this.position.y = canvas.height - playerHeight;
            this.velocity.y = 0;
        }

        // Jumping
        if (keys[this.keyBindings.up] && this.position.y + playerHeight >= canvas.height) {
            // negative because as position is higher on the screen, y value lowers.
            this.velocity.y = -jumpSpeed;
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

        // Checking for loss
        if (this.position.x < 0 || this.position.x + playerWidth > canvas.width) {
            this.opponent.score++;
            writeText('player wins!', 'green');
            resetGame();
        }
        // check for collision
        if (checkIntersect(this, this.opponent)) {
            if (!collision) {
                // if the collision is above the person, 
                if (Math.abs(player.position.y - enemy.position.y) >= playerHeight - 5) {
                    if (this.velocity.y <= 1 && this.position.y < this.opponent.position.y) {
                        console.log("ran");
                        this.velocity.y = 0;
                    }
                    else {
                        this.velocity.y *= -1;
                    }
                }
                else {
                    this.velocity.x *= -1.5;
                }
                collision = true;
            }
        } else {
            collision = false;
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
    score: 0
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
    score: 0
});

player.setOpponent(enemy);
enemy.setOpponent(player);

const playerSword = new Sprite( {
    position: { 
        x: -1,
        y: -1
    },
    velocity: {
        x: 0,
        y: 0
    },
    color: 'gray',
    width: playerWidth,
    height: playerHeight / 2,
    swordDir: 'right'
});

const enemySword = new Sprite( {
    position: {
        x: 0,
        y: 0
    },
    velocity: {
        x: 0,
        y: 0
    },
    color: 'gray',
    width: playerWidth,
    height: playerHeight / 2,
    swordDir: 'left'
});



// FUNCTIONS

function checkIntersect(r1, r2) {
    return !(r2.position.x >= r1.position.x + r1.width ||
             r2.position.x + r2.width <= r1.position.x ||
             r2.position.y >= r1.position.y + r1.height ||
             r2.position.y + r2.height <= r1.position.y);
}

function writeText(text, color, time) {
    if (time == null) {time = 2000}
    textToDisplay = text;
    textColor = color;
    setTimeout(function() {
        textToDisplay = "";
    }, time);
}

function resetGame() {
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
    setTimeout(() => {
        writeText("3", "white", 1000);
        setTimeout(() => {
            writeText("2", "white", 1000);
            setTimeout(() => {
                writeText("1", "white", 1000);
                setTimeout(() => {
                    writeText("Fight!", "red", 1000);
                    gamePaused = false;
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

    player.update(deltaTime);
    enemy.update(deltaTime);

    requestAnimationFrame(animate);
}