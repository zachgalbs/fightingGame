const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
const gravity = 0.004 * canvas.height;
const baseSpeed = 0.05 * canvas.width;
const maxSpeed = 0.90 * canvas.height;

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
    constructor({position, velocity, keyBindings, color}) {
        this.position = position;
        this.velocity = velocity;
        this.keyBindings = keyBindings;
        this.color = color;
    }

    draw() {
        c.fillStyle = this.color;
        c.fillRect(this.position.x, this.position.y, playerWidth, playerHeight);
    }

    update(deltaTime) {
        // Scale movement by delta time
        console.log(deltaTime);
        this.velocity.y += gravity * deltaTime * 30;

        // Apply velocity to position
        this.position.y += this.velocity.y * deltaTime;
        this.position.x += this.velocity.x * deltaTime;
        
        // Limit speed
        //if (this.velocity.y > maxSpeed) {
        //    this.velocity.y = maxSpeed;
        //}
    
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
            this.velocity.y = -baseSpeed; // jump speed
        }

        // Moving down faster
        //if (keys[this.keyBindings.down] && this.position.y)
    
        // Apply horizontal friction
        if (this.position.x >= 0 && this.position.x + playerWidth <= canvas.width) {
            this.velocity.x *= 0.9; // some friction
        }
    
        // Move left and right
        if (keys[this.keyBindings.left]) {
            if (this.position.x > 0 && !checkIntersect(player, enemy)) {
                this.velocity.x = -baseSpeed;
            }
        }
        if (keys[this.keyBindings.right] && !checkIntersect(player, enemy)) {
            if (this.position.x + playerWidth < canvas.width) {
                this.velocity.x = baseSpeed;
            }
        }
        // Attack
        let multiplier = 1;
        if (keys[player.keyBindings.attack]) {
            // if player is on the right side,
            if (player.velocity.x >= 0) {
                c.fillRect(player.position.x, player.position.y, playerWidth * multiplier, playerHeight / 2);
            }
            else if (player.velocity.x < 0) {

            }
            // draw gray sword
            c.fillStyle = playerSword.color;
            // check if the player has its sword out, if it does, set the playerSword position
            playerSword.position.y = player.position.y;
            playerSword.position.x = player.position.x + playerWidth * multiplier;
            console.log("player position: " + player.position.x);
            console.log("player sword position: " + playerSword.position.x);
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
            if (enemy.velocity.x >= 0) {multiplier = 2;}
            else {multiplier = -1;}
            // draw gray sword
            c.fillStyle = playerSword.color;
            c.fillRect(enemy.position.x, enemy.position.y, playerWidth * multiplier, playerHeight / 2)
            // check if the enemy has its sword out, if it does, set the enemySword position
            enemySword.position.y = enemy.position.y;
            console.log("enemy position: " + enemy.position.x);
            console.log("enemy sword position: " + enemySword.position.x);
            enemySword.position.x = enemy.position.x + playerWidth * multiplier;
            if (checkIntersect(enemySword, player)) {
                if (player.position.x < enemy.position.x) {
                    player.position.x -= 100;
                    player.velocity.x -= 10;
                }
                if (player.position.x > enemy.position.x) {
                    player.position.x += 100;
                    player.velocity.x += 10;
                }
            }
        }

        // Stop the friction when off the map
        if (this.position.x < 0) {
            this.velocity.x = 0;
            this.position.x = 0;
        }
        if (this.position.x + playerWidth > canvas.width) {
            this.velocity.x = 0;
            this.position.x = canvas.width - playerWidth;
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
    color: 'green'
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
    color: 'red'
});

const playerSword = new Sprite( {
    position: { 
        x: 0,
        y: 0
    },
    color: 'gray'
});

const enemySword = new Sprite( {
    position: {
        x: 0,
        y: 0
    },
    color: 'gray'
});

function checkIntersect(r1, r2) {
    return !(r2.position.x > r1.position.x + playerWidth ||
             r2.position.x + playerWidth < r1.position.x ||
             r2.position.y > r1.position.y + playerHeight ||
             r2.position.y + playerHeight < r1.position.y);
}

let lastTime = 0;

function animate(currentTime) {
    c.fillStyle = 'black';
    c.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate the amount of time since the last frame
    let deltaTime = (currentTime - lastTime) / 1000.0;
    lastTime = currentTime;

    // Pass deltaTime to your update methods
    player.update(deltaTime);
    enemy.update(deltaTime);

    window.requestAnimationFrame(animate);
}

// Start the game loop
window.requestAnimationFrame(animate);

