const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
const gravity = 0.004 * canvas.height;
const baseSpeed = 0.03 * canvas.width;
const jumpSpeed = 0.04 * canvas.width;
const maxSpeed = 0.90 * canvas.height;

let gamePaused = false;
let playerScore = 0;
let enemyScore = 0;
// set the margin value defined in css
margin = 20;

canvas.width = window.innerWidth - margin;
canvas.height = window.innerHeight - margin;

playerWidth = 50
playerHeight = 150

collision = false;

c.fillRect(0,0,canvas.width,canvas.height);

let keys = {};

window.addEventListener('keydown', function(event) {
    keys[event.key] = true;
});

window.addEventListener('keyup', function(event) {
    keys[event.key] = false;
});

class Sprite {
    constructor({position, velocity, keyBindings, color, width, height, latestDir}) {
        this.position = position;
        this.velocity = velocity;
        this.keyBindings = keyBindings;
        this.color = color;
        this.width = width || playerWidth;
        this.height = height || playerHeight;
        this.latestDir = latestDir;
    }

    draw() {
        c.fillStyle = this.color;
        c.fillRect(this.position.x, this.position.y, playerWidth, playerHeight);
    }

    update(deltaTime, swordUpdate) {
        // Scale movement by delta time
        this.velocity.y += gravity * deltaTime * 30;

        // Apply velocity to position
        this.position.y += this.velocity.y * deltaTime;
        this.position.x += this.velocity.x * deltaTime;
    
        // Apply velocity to position
        this.position.y += this.velocity.y;
        this.position.x += this.velocity.x;
    
        // Collide with ground
        if (this.position.y + playerHeight > canvas.height) {
            this.position.y = canvas.height - playerHeight;
            this.velocity.y = 0; // Stop moving downwards
        }
    
        // Jumping
        if (keys[this.keyBindings.up] && this.position.y + playerHeight >= canvas.height) {
            this.velocity.y = -jumpSpeed; // jump speed
        }

        // Moving down faster
        //if (keys[this.keyBindings.down] && this.position.y)
    
        // Apply horizontal friction
        if (this.position.x >= 0 && this.position.x + playerWidth <= canvas.width) {
            this.velocity.x *= 0.9; // some friction
        }
    
        // Move left and right
        if (gamePaused == false) {
            if (keys[this.keyBindings.left]) {
                this.latestDir = "left";
                if (this.position.x > 0 && !checkIntersect(player, enemy)) {
                    this.velocity.x = -baseSpeed;
                }
            }
            if (keys[this.keyBindings.right] && !checkIntersect(player, enemy)) {
                this.latestDir = "right";
                if (this.position.x + playerWidth < canvas.width) {
                    this.velocity.x = baseSpeed;
                }
            }
        }
        // Attack
        if (swordUpdate) {
            if (keys[player.keyBindings.attack]) {
                c.fillStyle = playerSword.color;
                playerSword.position.x = player.position.x 
                playerSword.position.y = player.position.y;
                if (player.latestDir == "right") {
                    c.fillRect(playerSword.position.x + playerWidth, playerSword.position.y, playerWidth, playerHeight / 2)
                }
                else {
                    c.fillRect(playerSword.position.x - playerWidth, playerSword.position.y, playerWidth, playerHeight / 2)
                }
                if (checkIntersect(playerSword, enemy)) {
                    if (enemy.position.x < player.position.x) {
                        enemy.position.x -= 100;
                        enemy.velocity.x -= 10;
                    }
                    if (enemy.position.x > player.position.x) {
                        enemy.position.x += 100;
                        enemy.velocity.x += 10;
                    }
                }
            }
            if (keys[enemy.keyBindings.attack]) {
                c.fillStyle = playerSword.color;
                enemySword.position.x = enemy.position.x;
                enemySword.position.y = enemy.position.y
                if (enemy.latestDir == "right") {
                    c.fillRect(enemySword.position.x + playerWidth, enemySword.position.y, playerWidth, playerHeight / 2)
                }
                else {
                    c.fillRect(enemySword.position.x - playerWidth, enemySword.position.y, playerWidth, playerHeight / 2);
                }
                if (checkIntersect(enemySword, player)) {
                    if (player.position.x + playerWidth < enemy.position.x) {
                        player.position.x -= 100;
                        player.velocity.x -= 10;
                    }
                    if (player.position.x > enemy.position.x) {
                        player.position.x += 100;
                        player.velocity.x += 10;
                    }
                }
            }
        }

        // checking if player has touched the edge:
        if (player.position.x < 0 || player.position.x + playerWidth > canvas.width) {
            player.velocity.x = 0;
            player.position.x < 0 ? player.position.x = 0 : player.position.x = canvas.width;
            writeText("enemy wins!", "red");
            resetGame();
            enemyScore++
        }
        //checking if enemy has touched the edge:
        if (enemy.position.x < 0 || enemy.position.x + playerWidth > canvas.width) {
            enemy.velocity.x = 0;
            enemy.position.x < 0 ? enemy.position.x = 0 : enemy.position.x = canvas.width - playerWidth;
            writeText("player wins!", "green");
            playerScore++
            resetGame();
        }
        // check for collision
        if (checkIntersect(player, enemy)) {
            if (!collision) {
                if (Math.abs(player.position.y - enemy.position.y) >= playerHeight - 5 && this.velocity.y > 0) {
                    player.velocity.y = player.velocity.y * -1;
                    enemy.velocity.y = enemy.velocity.y * -1;
                }
                else {
                    player.velocity.x = player.velocity.x * -2;
                    enemy.velocity.x = enemy.velocity.x * -2;
                }
                collision = true;
            }
        } else {
            collision = false;
        }
        this.draw();
    }
}    

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
        attack: 'f'
    },
    color: 'green',
    latestDir: 'right'
});

const enemy = new Sprite({
    position: {
        x: canvas.width - playerWidth,
        y: canvas.height - playerHeight
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
        attack: 'j'
    },
    color: 'red',
    latestDir: 'left'
});

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
    height: playerHeight / 2
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
    height: playerHeight / 2
});

function checkIntersect(r1, r2) {
    return !(r2.position.x >= r1.position.x + r1.width ||
             r2.position.x + r2.width <= r1.position.x ||
             r2.position.y >= r1.position.y + r1.height ||
             r2.position.y + r2.height <= r1.position.y);
}

let lastTime = 0;

function animate(currentTime) {
    c.fillStyle = 'black';
    c.fillRect(0, 0, canvas.width, canvas.height);
    // setting the score
    c.fillStyle = 'white';
    c.font = "30px Arial";
    c.fillText(playerScore, 25, 50);
    c.fillText("|", 60, 48);
    c.fillText(enemyScore, 90, 50);

    if (showText == true) {
        c.fillStyle = textColor;
        c.textAlign = "center";
        c.font = "30px Arial";
        c.fillText(textToDisplay, canvas.width / 2, canvas.height / 2);
        c.textAlign = "start"; // Reset text alignment back to "start"
    }

    // Calculate the amount of time since the last frame
    let deltaTime = (currentTime - lastTime) / 1000.0;
    lastTime = currentTime;

    // Pass deltaTime to your update methods
    player.update(deltaTime, false);
    enemy.update(deltaTime, true);

    window.requestAnimationFrame(animate);
}

// set the win text varibles:
let showText = false;
let textToDisplay = "";
let textColor = "";

function writeText(text, color, time) {
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
    gamePaused = true;
    player.position.x = 0;
    player.velocity.x = 0;
    player.position.y = 700;
    player.velocity.y = 0;
    enemy.position.x = canvas.width - playerWidth;
    enemy.velocity.x = 0;
    enemy.position.y = 700;
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



// Start the game loop
window.requestAnimationFrame(animate);

