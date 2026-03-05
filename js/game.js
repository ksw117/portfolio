document.addEventListener('DOMContentLoaded', () => {
const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // --- CONSTANTS & CONFIG ---
    const CANVAS_WIDTH = 900;
    const CANVAS_HEIGHT = 400;
    const GROUND_Y = 350;
    const GRAVITY = 0.6;
    const JUMP_FORCE = -12;
    const GAME_SPEED_START = 6;
    const MAX_SPEED = 14;

    // Set canvas resolution
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Game State
    let gameSpeed = GAME_SPEED_START;
    let score = 0;
    let frameCount = 0;
    let gameOver = false;
    let gameStarted = false;
    let obstacles = [];
    let clouds = [];
    let particles = [];

    // --- PIXEL ART DEFINITIONS (1 = black, 0 = transparent) ---

    // CAT SPRITE (Running cat with tail up)
    // Frame 1: Running
    const SPRITE_CAT_RUN_1 = [
        "011000000000000000000",
        "111000000001000010000",
        "11000000001110011100",
        "11000000001111111100",
        "11100000011111111110",
        "01100001111101111011",
        "01110001111111101110",
        "00111111111111111111",
        "000111111111111111110",
        "000011111111111111100",
        "000011111111111111000",
        "000011111111111111000",
        "000111111111111111000",
        "000111111111111110000",
        "000111111111111110000",
        "000110110001100110000",
        "000100100000100100000",
    
    ];

    // Frame 2: Running (legs in different position)
    const SPRITE_CAT_RUN_2 = [
        "011000000000000000000",
        "111000000001000010000",
        "11000000001110011100",
        "11000000001111111100",
        "11100000011111111110",
        "01100001111101111011",
        "01110001111111101110",
        "00111111111111111111",
        "000111111111111111110",
        "000011111111111111100",
        "000011111111111111000",
        "000111111111111111000",
        "000111111111111111000",
        "000111111111111110000",
        "000111111111111110000",
        "000110110001100110000",
        "000010010001000010000",
    
    ];

    // BONE SPRITE (Small bone)
    const SPRITE_BONE_SMALL = [
        "1100011",
        "0111110",
        "1100011",
    ];

    // FISHBONE SPRITE (Large fishbone)
    const SPRITE_FISHBONE = [
        "00100",
        "01010",
        "11111",
        "00100",
        "11111",
        "00100",
        "11111",
        "00100",
        "11111",
        "00100",
        "01110",
        "11011",    
    ];

    // VULTURE SPRITE (keeping the bird)
    const vultureData = [
        "000000001100",
        "001100011100",
        "011111111100",
        "111111111000",
        "000111100000",
        "000011000000",
    ];

    // Classes
    class Sprite {
        constructor(bitmaps, scale = 3) {
            if (!Array.isArray(bitmaps[0])) {
                this.frames = [bitmaps];
            } else {
                this.frames = bitmaps;
            }

            this.scale = scale;
            this.height = this.frames[0].length * scale;
            this.width = this.frames[0][0].length * scale;
        }

        draw(ctx, x, y, frameIndex = 0) {
            const frame = this.frames[frameIndex % this.frames.length];

            ctx.fillStyle = '#1E1E1E';
            for (let r = 0; r < frame.length; r++) {
                for (let c = 0; c < frame[r].length; c++) {
                    if (frame[r][c] === '1') {
                        ctx.fillRect(x + c * this.scale, y + r * this.scale, this.scale, this.scale);
                    }
                }
            }
        }
    }

    // Define assets
    const catAnim = [SPRITE_CAT_RUN_1, SPRITE_CAT_RUN_2];

    // Instantiate Sprites
    const catSprite = new Sprite(catAnim, 3);
    const boneSprite = new Sprite(SPRITE_BONE_SMALL, 4);
    const fishboneSprite = new Sprite(SPRITE_FISHBONE, 4);
    const vultureSprite = new Sprite(vultureData, 4);

    class Player {
        constructor() {
            this.x = 50;
            this.y = GROUND_Y - catSprite.height;
            this.vy = 0;
            this.grounded = true;
            this.jumpTimer = 0;
            this.width = catSprite.width;
            this.normalHeight = catSprite.height;
            this.duckHeight = Math.floor(this.normalHeight * 0.6);
            this.height = this.normalHeight;
            this.ducking = false;
            this.animTimer = 0;
        }

        update() {
            if (!this.grounded) {
                this.vy += GRAVITY;
            }

            this.y += this.vy;

            if (this.y >= GROUND_Y - this.normalHeight) {
                this.y = GROUND_Y - this.normalHeight;
                this.vy = 0;
                this.grounded = true;
            } else {
                this.grounded = false;
            }

            const isDown = keys['ArrowDown'];
            this.ducking = isDown && this.grounded;

            if (this.grounded) {
                if (this.ducking) {
                    this.height = this.duckHeight;
                    this.y = GROUND_Y - this.duckHeight;
                } else {
                    this.height = this.normalHeight;
                    this.y = GROUND_Y - this.normalHeight;
                }
            } else {
                this.height = this.normalHeight;
            }

            this.animTimer++;
        }

        jump() {
            if (this.grounded && !this.ducking) {
                this.vy = JUMP_FORCE;
                this.grounded = false;
            }
        }

        draw() {
            let fIndex = 0;
            if (this.ducking) {
                fIndex = 1;
            } else if (this.grounded) {
                fIndex = Math.floor(this.animTimer / 8) % 2;
            } else {
                fIndex = 0;
            }
            catSprite.draw(ctx, this.x, this.y, fIndex);
        }
    }

    class Obstacle {
        constructor(type) {
            this.type = type;
            this.markedForDeletion = false;

            if (type === 'bone') {
                this.sprite = boneSprite;
                this.y = GROUND_Y - this.sprite.height;
            } else if (type === 'fishbone') {
                this.sprite = fishboneSprite;
                this.y = GROUND_Y - this.sprite.height;
            } else if (type === 'vulture') {
                this.sprite = vultureSprite;
                const heights = [GROUND_Y - 60, GROUND_Y - 100, GROUND_Y - 30];
                this.y = heights[Math.floor(Math.random() * heights.length)];
            }

            this.x = CANVAS_WIDTH + Math.random() * 200;
            this.width = this.sprite.width;
            this.height = this.sprite.height;
            this.animTimer = 0;
        }

        update() {
            this.x -= gameSpeed;
            if (this.x + this.sprite.width < 0) {
                this.markedForDeletion = true;
            }
            this.animTimer++;
        }

        draw() {
            let fIndex = 0;
            this.sprite.draw(ctx, this.x, this.y, fIndex);
        }
    }

    // Global Objects
    let player = new Player();

    // Input
    let keys = {};

    window.addEventListener('keydown', (e) => {
        if (['ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
            e.preventDefault();
        }

        if (!gameStarted && (e.code === 'Space' || e.code === 'Enter')) {
            startGame();
            return;
        }

        keys[e.code] = true;

        if ((e.code === 'Space' || e.code === 'ArrowUp') && !gameOver && gameStarted) {
            player.jump();
        }

        if (e.code === 'Space' && gameOver && gameStarted) {
            resetGame();
            animate();
        }
    });

    window.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });

    function spawnObstacle() {
        if (obstacles.length > 0) {
            let lastObs = obstacles[obstacles.length - 1];
            if (CANVAS_WIDTH - lastObs.x < 350 + Math.random() * 250) {
                return;
            }
        }

        const r = Math.random();
        let type = 'bone';
        if (score > 500 && r > 0.7) type = 'vulture';
        else if (r > 0.45) type = 'fishbone';

        obstacles.push(new Obstacle(type));
    }

    function checkCollision(rect1, rect2) {
        let r1w = rect1.width;
        let r1h = rect1.height;
        let r2w = rect2.width;
        let r2h = rect2.height;

        let padding = 10;

        return (
            rect1.x < rect2.x + r2w - padding &&
            rect1.x + r1w - padding > rect2.x &&
            rect1.y < rect2.y + r2h - padding &&
            rect1.y + r1h - padding > rect2.y
        );
    }

    function update() {
        if (gameOver) return;

        if (frameCount % 1000 === 0 && gameSpeed < MAX_SPEED) {
            gameSpeed += 0.5;
        }

        player.update();

        spawnObstacle();
        obstacles.forEach(obs => obs.update());
        obstacles = obstacles.filter(obs => !obs.markedForDeletion);

        for (let obs of obstacles) {
            if (checkCollision(player, obs)) {
                gameOver = true;
                document.getElementById('game-over').classList.remove('hidden');
            }
        }

        score++;
        document.getElementById('score').innerText = Math.floor(score / 10).toString().padStart(5, '0');
        frameCount++;
    }

    function draw() {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw Ground
        ctx.beginPath();
        ctx.moveTo(0, GROUND_Y);
        ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
        ctx.strokeStyle = '#535353';
        ctx.lineWidth = 2;
        ctx.stroke();

        player.draw();
        obstacles.forEach(obs => obs.draw());
    }

    function resetGame() {
        gameOver = false;
        obstacles = [];
        score = 0;
        gameSpeed = GAME_SPEED_START;
        player = new Player();

        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('score').classList.remove('hidden');
        document.getElementById('score').style.color = '';
    }

    function startGame() {
        if (gameStarted) return;
        gameStarted = true;
        document.getElementById('start-menu').classList.add('hidden');
        document.getElementById('instructions').classList.remove('hidden');
        document.getElementById('score').classList.remove('hidden');
        resetGame();
        animate();
    }

    function animate() {
        if (!gameStarted) return;
        update();
        draw();
        if (!gameOver) {
            requestAnimationFrame(animate);
        }
    }

    document.getElementById('start-btn').addEventListener('click', startGame);

    function init() {
        document.getElementById('score').classList.add('hidden');
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.beginPath();
        ctx.moveTo(0, GROUND_Y);
        ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
        ctx.strokeStyle = '#535353';
        ctx.lineWidth = 2;
        ctx.stroke();
        player.draw();
    }

    init();
});