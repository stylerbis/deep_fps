// ============================================
// DEEP FPS - Wave Survival Game
// ============================================

// Game Constants
const SCREEN_WIDTH = 640;
const SCREEN_HEIGHT = 360;
const FOV = Math.PI / 3;
const BLOCK_SIZE = 64;
const MAP_SIZE = 24;
const MAX_DEPTH = 20;
const MOVEMENT_SPEED = 3;
const ROTATION_SPEED = 0.08;

// Game State
const gameState = {
    running: false,
    paused: false,
    wave: 1,
    score: 0,
    enemiesRemaining: 0,
    enemies: [],
    powerups: [],
    bullets: [],
    particles: [],
    activePowerup: null,
    powerupEndTime: 0
};

// Player State
const player = {
    x: MAP_SIZE * BLOCK_SIZE / 2,
    y: MAP_SIZE * BLOCK_SIZE / 2,
    angle: 0,
    health: 100,
    maxHealth: 100,
    weapon: 'pistol',
    damageMultiplier: 1,
    fireRate: 1,
    fireDelay: 0
};

// Weapons configuration
const weapons = {
    pistol: { name: 'Pistol', damage: 25, fireRate: 1, color: '#888' },
    shotgun: { name: 'Shotgun', damage: 15, fireRate: 0.5, spread: 0.3, pellets: 5, color: '#664' },
    rifle: { name: 'Rifle', damage: 30, fireRate: 0.1, color: '#466' },
    plasma: { name: 'Plasma Rifle', damage: 40, fireRate: 0.15, color: '#0ff' },
    minigun: { name: 'Minigun', damage: 20, fireRate: 0.05, spread: 0.15, pellets: 3, color: '#333' }
};

// Power-up types
const powerupTypes = [
    { id: 'health', name: 'Health Pack', icon: '❤️', effect: () => { player.health = Math.min(player.health + 30, player.maxHealth); } },
    { id: 'rapid-fire', name: 'Rapid Fire', icon: '⚡', duration: 15000, effect: () => { player.fireRate *= 0.5; } },
    { id: 'shield', name: 'Shield', icon: '🛡️', duration: 10000, effect: () => { player.damageMultiplier = 0; } },
    { id: 'double-damage', name: 'Double Damage', icon: '💥', duration: 12000, effect: () => { player.damageMultiplier = 2; } },
    { id: 'weapon_upgrade', name: 'Weapon Upgrade', icon: '🔫', effect: () => { 
        const weaponKeys = Object.keys(weapons);
        const currentIndex = weaponKeys.indexOf(player.weapon);
        if (currentIndex < weaponKeys.length - 1) {
            player.weapon = weaponKeys[currentIndex + 1];
        }
    } }
];

// Map - 1 = wall, 0 = empty, 2 = decoration
const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,1],
    [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
    [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1],
    [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Input State
const keys = {};
let mouseLocked = false;

// Canvas setup
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d', { alpha: false });
canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;

// ============================================
// Raycasting Engine
// ============================================

function castRays() {
    // Draw ceiling and floor
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT / 2);
    ctx.fillStyle = '#0a0a1e';
    ctx.fillRect(0, SCREEN_HEIGHT / 2, SCREEN_WIDTH, SCREEN_HEIGHT / 2);

    // Cast rays for walls
    const numRays = SCREEN_WIDTH / 4; // Lower resolution for performance
    const rayWidth = SCREEN_WIDTH / numRays;

    for (let x = 0; x < numRays; x++) {
        const rayAngle = (player.angle - FOV / 2) + (x / numRays) * FOV;
        const rayDirX = Math.cos(rayAngle);
        const rayDirY = Math.sin(rayAngle);

        let dist = 0;
        let hitX = 0, hitY = 0;
        let texture = 0;

        // DDA algorithm for ray casting
        let mapX = Math.floor(player.x / BLOCK_SIZE);
        let mapY = Math.floor(player.y / BLOCK_SIZE);

        let sideDistX, sideDistY;
        const deltaDistX = Math.abs(1 / rayDirX);
        const deltaDistY = Math.abs(1 / rayDirY);
        let stepX, stepY;
        let side = 0;

        if (rayDirX < 0) {
            stepX = -1;
            sideDistX = (player.x / BLOCK_SIZE - mapX) * deltaDistX;
        } else {
            stepX = 1;
            sideDistX = (mapX + 1 - player.x / BLOCK_SIZE) * deltaDistX;
        }

        if (rayDirY < 0) {
            stepY = -1;
            sideDistY = (player.y / BLOCK_SIZE - mapY) * deltaDistY;
        } else {
            stepY = 1;
            sideDistY = (mapY + 1 - player.y / BLOCK_SIZE) * deltaDistY;
        }

        // Ray trace
        let hit = false;
        while (!hit && dist < MAX_DEPTH * BLOCK_SIZE) {
            if (sideDistX < sideDistY) {
                sideDistX += deltaDistX;
                mapX += stepX;
                side = 0;
            } else {
                sideDistY += deltaDistY;
                mapY += stepY;
                side = 1;
            }

            if (mapX < 0 || mapX >= MAP_SIZE || mapY < 0 || mapY >= MAP_SIZE) {
                hit = true;
                dist = MAX_DEPTH * BLOCK_SIZE;
            } else if (map[mapY][mapX] === 1) {
                hit = true;
                texture = map[mapY][mapX];
                
                // Calculate distance
                if (side === 0) {
                    dist = (mapX - player.x / BLOCK_SIZE + (1 - stepX) / 2) / rayDirX;
                } else {
                    dist = (mapY - player.y / BLOCK_SIZE + (1 - stepY) / 2) / rayDirY;
                }
                
                hitX = mapX;
                hitY = mapY;
            }
        }

        // Fix fish-eye effect
        dist = dist * Math.cos(rayAngle - player.angle);

        // Calculate wall height
        const wallHeight = (SCREEN_HEIGHT * BLOCK_SIZE) / (dist * BLOCK_SIZE + 0.1);
        const wallTop = (SCREEN_HEIGHT - wallHeight) / 2;

        // Determine wall color based on side and distance
        let shade = 255 / (dist + 1);
        const baseColor = side === 0 ? '#4a6fa5' : '#3d5a7a';
        const gradientColor = side === 0 ? '#2a3f5a' : '#1d2f3a';
        
        // Apply distance fog
        const fogAmount = Math.min(dist / MAX_DEPTH, 1);
        
        // Draw wall strip
        ctx.fillStyle = getColorAtDistance(baseColor, dist, fogAmount);
        ctx.fillRect(x * rayWidth, wallTop, rayWidth + 1, wallHeight);
    }
}

function getColorAtDistance(baseColor, dist, fogAmount) {
    const color = hexToRgb(baseColor);
    const fogColor = { r: 10, g: 10, b: 26 };
    
    const r = Math.floor(color.r * (1 - fogAmount * 0.8) + fogColor.r * fogAmount * 0.8);
    const g = Math.floor(color.g * (1 - fogAmount * 0.8) + fogColor.g * fogAmount * 0.8);
    const b = Math.floor(color.b * (1 - fogAmount * 0.8) + fogColor.b * fogAmount * 0.8);
    
    // Darken with distance
    const darken = 1 / (dist + 1);
    return `rgb(${Math.floor(r * darken)}, ${Math.floor(g * darken)}, ${Math.floor(b * darken)})`;
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

// ============================================
// Enemy Rendering
// ============================================

function renderEntities() {
    // Combine enemies and powerups for sorting
    const entities = [
        ...gameState.enemies.map(e => ({ type: 'enemy', x: e.x, y: e.y, size: e.size, data: e })),
        ...gameState.powerups.map(p => ({ type: 'powerup', x: p.x, y: p.y, size: 20, data: p }))
    ];

    // Sort by distance (farthest first)
    entities.sort((a, b) => {
        const distA = Math.sqrt((a.x - player.x) ** 2 + (a.y - player.y) ** 2);
        const distB = Math.sqrt((b.x - player.x) ** 2 + (b.y - player.y) ** 2);
        return distB - distA;
    });

    // Render each entity
    for (const entity of entities) {
        renderEntity(entity);
    }
}

function renderEntity(entity) {
    const dx = entity.x - player.x;
    const dy = entity.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 10) return; // Too close

    // Calculate angle to entity
    let angleToEntity = Math.atan2(dy, dx) - player.angle;
    while (angleToEntity < -Math.PI) angleToEntity += 2 * Math.PI;
    while (angleToEntity > Math.PI) angleToEntity -= 2 * Math.PI;

    // Check if entity is in front of player
    if (Math.abs(angleToEntity) > FOV / 2 + 0.5) return;

    // Calculate screen position
    const screenX = (SCREEN_WIDTH / 2) * (1 + Math.tan(angleToEntity) / Math.tan(FOV / 2));
    
    // Calculate entity size on screen
    const entityHeight = (SCREEN_HEIGHT * entity.size) / (distance / BLOCK_SIZE + 0.1);
    const entityWidth = entityHeight;
    const entityTop = (SCREEN_HEIGHT - entityHeight) / 2;

    if (entity.type === 'enemy') {
        // Draw enemy as a simple sprite
        const enemy = entity.data;
        const color = enemy.health > enemy.maxHealth * 0.5 ? '#8B0000' : '#450000';
        
        // Draw enemy body
        const grad = ctx.createRadialGradient(
            screenX, entityTop + entityHeight / 2, 0,
            screenX, entityTop + entityHeight / 2, entityWidth / 2
        );
        grad.addColorStop(0, color);
        grad.addColorStop(1, '#200');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(screenX, entityTop + entityHeight / 2, entityWidth / 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw eyes
        const eyeSize = entityWidth * 0.15;
        ctx.fillStyle = '#ff0';
        ctx.beginPath();
        ctx.arc(screenX - entityWidth * 0.25, entityTop + entityHeight * 0.35, eyeSize, 0, Math.PI * 2);
        ctx.arc(screenX + entityWidth * 0.25, entityTop + entityHeight * 0.35, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Health bar
        if (enemy.health < enemy.maxHealth) {
            const barWidth = entityWidth * 0.6;
            const barHeight = 5;
            const barX = screenX - barWidth / 2;
            const barY = entityTop - 8;
            
            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            const healthPercent = enemy.health / enemy.maxHealth;
            ctx.fillStyle = healthPercent > 0.5 ? '#0f0' : healthPercent > 0.25 ? '#ff0' : '#f00';
            ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        }
    } else {
        // Draw powerup
        const powerup = entity.data;
        const pu = powerupTypes.find(p => p.id === powerup.type);
        
        // Pulsing effect
        const pulse = Math.sin(Date.now() / 200) * 0.1 + 1;
        const actualHeight = entityHeight * pulse;
        const actualTop = entityTop - (actualHeight - entityHeight) / 2;
        
        // Glow effect
        const glowSize = entityWidth * 0.8 * pulse;
        const glowGrad = ctx.createRadialGradient(
            screenX, actualTop + actualHeight / 2, 0,
            screenX, actualTop + actualHeight / 2, glowSize
        );
        glowGrad.addColorStop(0, `rgba(255, 215, 0, ${0.5 + Math.sin(Date.now() / 200) * 0.3})`);
        glowGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
        
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(screenX, actualTop + actualHeight / 2, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Powerup icon
        ctx.font = `${actualHeight * 0.6}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pu.icon, screenX, actualTop + actualHeight / 2);
    }
}

// ============================================
// Particle System
// ============================================

function createParticle(x, y, type) {
    const particle = {
        x, y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1,
        type,
        size: Math.random() * 3 + 2
    };
    gameState.particles.push(particle);
}

function updateParticles() {
    for (let i = gameState.particles.length - 1; i >= 0; i--) {
        const p = gameState.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;

        if (p.life <= 0) {
            gameState.particles.splice(i, 1);
        }
    }
}

function renderParticles() {
    for (const p of gameState.particles) {
        const dx = p.x - player.x;
        const dy = p.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angleTo = Math.atan2(dy, dx) - player.angle;
        
        let normalizedAngle = angleTo;
        while (normalizedAngle < -Math.PI) normalizedAngle += 2 * Math.PI;
        while (normalizedAngle > Math.PI) normalizedAngle -= 2 * Math.PI;

        if (Math.abs(normalizedAngle) > FOV / 2 + 0.3 || distance < 10) continue;

        const screenX = (SCREEN_WIDTH / 2) * (1 + Math.tan(normalizedAngle) / Math.tan(FOV / 2));
        const particleSize = (p.size * SCREEN_HEIGHT) / (distance / BLOCK_SIZE + 0.1);
        
        if (p.type === 'blood') {
            ctx.fillStyle = `rgba(139, 0, 0, ${p.life})`;
        } else if (p.type === 'spark') {
            ctx.fillStyle = `rgba(255, 200, 0, ${p.life})`;
        } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${p.life})`;
        }
        
        ctx.beginPath();
        ctx.arc(screenX, SCREEN_HEIGHT / 2, particleSize, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ============================================
// Player Movement
// ============================================

function updatePlayer() {
    if (player.fireDelay > 0) {
        player.fireDelay -= 1 / 60;
    }

    let moveForward = 0;
    let strafe = 0;

    if (keys['w'] || keys['W']) moveForward = 1;
    if (keys['s'] || keys['S']) moveForward = -1;
    if (keys['a'] || keys['A']) strafe = -1;
    if (keys['d'] || keys['D']) strafe = 1;

    // Calculate new position
    const newX = player.x + (moveForward * Math.cos(player.angle) - strafe * Math.sin(player.angle)) * MOVEMENT_SPEED;
    const newY = player.y + (moveForward * Math.sin(player.angle) + strafe * Math.cos(player.angle)) * MOVEMENT_SPEED;

    // Collision detection
    const mapX = Math.floor(newX / BLOCK_SIZE);
    const mapY = Math.floor(newY / BLOCK_SIZE);

    if (map[mapY][Math.floor(player.y / BLOCK_SIZE)] !== 1) {
        player.x = newX;
    }
    if (map[mapY][mapX] !== 1) {
        player.y = newY;
    }

    // Keep player in bounds
    player.x = Math.max(BLOCK_SIZE, Math.min(MAP_SIZE * BLOCK_SIZE - BLOCK_SIZE, player.x));
    player.y = Math.max(BLOCK_SIZE, Math.min(MAP_SIZE * BLOCK_SIZE - BLOCK_SIZE, player.y));
}

// ============================================
// Shooting
// ============================================

function shoot() {
    if (player.fireDelay > 0) return;

    const weapon = weapons[player.weapon];
    player.fireDelay = weapon.fireRate;

    // Weapon flash
    canvas.classList.add('weapon-flash');
    setTimeout(() => canvas.classList.remove('weapon-flash'), 100);

    // Create bullet(s)
    const numPellets = weapon.pellets || 1;
    const spread = weapon.spread || 0;

    for (let i = 0; i < numPellets; i++) {
        const spreadAngle = (Math.random() - 0.5) * spread;
        const bulletAngle = player.angle + spreadAngle;
        
        gameState.bullets.push({
            x: player.x,
            y: player.y,
            vx: Math.cos(bulletAngle) * 15,
            vy: Math.sin(bulletAngle) * 15,
            damage: weapon.damage * player.damageMultiplier,
            life: 60
        });
    }
}

function updateBullets() {
    for (let i = gameState.bullets.length - 1; i >= 0; i--) {
        const b = gameState.bullets[i];
        b.x += b.vx;
        b.y += b.vy;
        b.life--;

        if (b.life <= 0) {
            gameState.bullets.splice(i, 1);
            continue;
        }

        // Check wall collision
        const mapX = Math.floor(b.x / BLOCK_SIZE);
        const mapY = Math.floor(b.y / BLOCK_SIZE);
        if (map[mapY][mapX] === 1) {
            gameState.bullets.splice(i, 1);
            createParticle(b.x, b.y, 'spark');
            continue;
        }

        // Check enemy collision
        for (const enemy of gameState.enemies) {
            const dx = b.x - enemy.x;
            const dy = b.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < enemy.size + 10) {
                damageEnemy(enemy, b.damage);
                gameState.bullets.splice(i, 1);
                createParticle(enemy.x, enemy.y, 'blood');
                break;
            }
        }
    }
}

function renderBullets() {
    for (const b of gameState.bullets) {
        const dx = b.x - player.x;
        const dy = b.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angleTo = Math.atan2(dy, dx) - player.angle;
        
        let normalizedAngle = angleTo;
        while (normalizedAngle < -Math.PI) normalizedAngle += 2 * Math.PI;
        while (normalizedAngle > Math.PI) normalizedAngle -= 2 * Math.PI;

        if (Math.abs(normalizedAngle) > FOV / 2 + 0.3 || distance < 10) continue;

        const screenX = (SCREEN_WIDTH / 2) * (1 + Math.tan(normalizedAngle) / Math.tan(FOV / 2));
        const bulletSize = (5 * SCREEN_HEIGHT) / (distance / BLOCK_SIZE + 0.1);
        
        const weaponColor = weapons[player.weapon].color;
        ctx.fillStyle = weaponColor;
        ctx.shadowColor = weaponColor;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(screenX, SCREEN_HEIGHT / 2, bulletSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// ============================================
// Enemy System
// ============================================

function spawnEnemy(x, y, wave) {
    const enemyTypes = ['basic', 'fast', 'tough'];
    let type = 'basic';
    
    // Increase chance of harder enemies with wave
    if (wave > 3 && Math.random() < 0.2) type = 'fast';
    if (wave > 5 && Math.random() < 0.15) type = 'tough';
    if (wave > 8 && Math.random() < 0.25) type = 'fast';
    if (wave > 10 && Math.random() < 0.2) type = 'tough';

    const baseStats = {
        basic: { health: 40 + wave * 10, damage: 10, speed: 1.5, size: 30, score: 100 },
        fast: { health: 30 + wave * 5, damage: 8, speed: 2.5, size: 25, score: 150 },
        tough: { health: 80 + wave * 15, damage: 15, speed: 1, size: 35, score: 200 }
    };

    const stats = baseStats[type];
    
    return {
        x, y,
        type,
        health: stats.health,
        maxHealth: stats.health,
        damage: stats.damage,
        speed: stats.speed,
        size: stats.size,
        score: stats.score,
        attackCooldown: 0
    };
}

function spawnWave() {
    // Clear existing enemies
    gameState.enemies = [];
    
    // Calculate wave difficulty
    const numEnemies = 3 + Math.floor(gameState.wave * 1.5);
    gameState.enemiesRemaining = numEnemies;

    // Spawn enemies around the map
    for (let i = 0; i < numEnemies; i++) {
        let x, y, valid;
        let attempts = 0;
        
        do {
            valid = true;
            x = BLOCK_SIZE + Math.random() * (MAP_SIZE - 2) * BLOCK_SIZE;
            y = BLOCK_SIZE + Math.random() * (MAP_SIZE - 2) * BLOCK_SIZE;

            // Keep away from player
            const dx = x - player.x;
            const dy = y - player.y;
            if (Math.sqrt(dx * dx + dy * dy) < 300) {
                valid = false;
            }

            // Check wall collision
            const mapX = Math.floor(x / BLOCK_SIZE);
            const mapY = Math.floor(y / BLOCK_SIZE);
            if (map[mapY][mapX] === 1) {
                valid = false;
            }

            attempts++;
        } while (!valid && attempts < 50);

        if (valid) {
            gameState.enemies.push(spawnEnemy(x, y, gameState.wave));
        }
    }
}

function updateEnemies() {
    for (const enemy of gameState.enemies) {
        // Move towards player
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 50) {
            // Move towards player
            const newX = enemy.x + (dx / distance) * enemy.speed;
            const newY = enemy.y + (dy / distance) * enemy.speed;

            // Simple collision avoidance
            let canMoveX = true, canMoveY = true;
            const mapX = Math.floor(newX / BLOCK_SIZE);
            const mapY = Math.floor(newY / BLOCK_SIZE);

            if (mapX >= 0 && mapX < MAP_SIZE && map[mapY][mapX] === 1) {
                canMoveX = false;
            }
            if (mapY >= 0 && mapY < MAP_SIZE && map[mapY][mapX] === 1) {
                canMoveY = false;
            }

            if (canMoveX) enemy.x = newX;
            if (canMoveY) enemy.y = newY;
        } else {
            // Attack player
            if (enemy.attackCooldown <= 0) {
                damagePlayer(enemy.damage);
                enemy.attackCooldown = 60;
            }
        }

        if (enemy.attackCooldown > 0) {
            enemy.attackCooldown--;
        }
    }
}

function damageEnemy(enemy, damage) {
    enemy.health -= damage;
    
    if (enemy.health <= 0) {
        // Enemy killed
        const index = gameState.enemies.indexOf(enemy);
        if (index > -1) {
            gameState.enemies.splice(index, 1);
            gameState.enemiesRemaining--;
            gameState.score += enemy.score;
            updateHUD();

            // Check wave complete
            if (gameState.enemiesRemaining <= 0) {
                waveComplete();
            }
        }
    }
}

// ============================================
// Player Damage
// ============================================

function damagePlayer(damage) {
    if (gameState.activePowerup === 'shield') {
        return; // Shield blocks damage
    }

    player.health -= damage;
    canvas.classList.add('damage-flash');
    setTimeout(() => canvas.classList.remove('damage-flash'), 500);

    updateHUD();

    if (player.health <= 0) {
        gameOver();
    }
}

// ============================================
// Power-up System
// ============================================

function spawnPowerups() {
    // Generate 3 random power-ups for player to choose from
    const choices = [];
    const availableTypes = powerupTypes.filter(p => p.id !== 'weapon_upgrade' || player.weapon !== 'minigun');
    
    for (let i = 0; i < 3; i++) {
        const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        choices.push(randomType.id);
    }

    return choices;
}

function showPowerupSelection() {
    const waveScreen = document.getElementById('wave-screen');
    const powerupPick = document.getElementById('powerup-pick');
    const choices = spawnPowerups();
    
    powerupPick.innerHTML = '';
    
    choices.forEach(typeId => {
        const pu = powerupTypes.find(p => p.id === typeId);
        const choiceDiv = document.createElement('div');
        choiceDiv.className = 'powerup-choice';
        choiceDiv.innerHTML = `
            <div class="icon" style="background: linear-gradient(135deg, #${Math.floor(Math.random()*16777215).toString(16)}, #${Math.floor(Math.random()*16777215).toString(16)}); display: flex; align-items: center; justify-content: center; font-size: 24px;">
                ${pu.icon}
            </div>
            <span class="name">${pu.name}</span>
        `;
        choiceDiv.onclick = () => selectPowerup(typeId);
        powerupPick.appendChild(choiceDiv);
    });
    
    waveScreen.classList.remove('hidden');
}

function selectPowerup(typeId) {
    const pu = powerupTypes.find(p => p.id === typeId);
    
    // Apply effect
    pu.effect();
    
    if (pu.duration) {
        gameState.activePowerup = typeId;
        gameState.powerupEndTime = Date.now() + pu.duration;
        
        setTimeout(() => {
            gameState.activePowerup = null;
            player.fireRate = weapons[player.weapon].fireRate;
            player.damageMultiplier = 1;
            updatePowerupUI();
        }, pu.duration);
    }
    
    updatePowerupUI();
    document.getElementById('wave-screen').classList.add('hidden');
    startWave();
}

function updatePowerupUI() {
    const slot = document.getElementById('powerup-active');
    if (gameState.activePowerup) {
        slot.setAttribute('data-type', gameState.activePowerup);
        slot.classList.add('active');
        const pu = powerupTypes.find(p => p.id === gameState.activePowerup);
        slot.querySelector('.powerup-icon').textContent = pu.icon;
    } else {
        slot.removeAttribute('data-type');
        slot.classList.remove('active');
        slot.querySelector('.powerup-icon').textContent = '';
    }
}

// ============================================
// Wave Management
// ============================================

function startWave() {
    gameState.running = true;
    gameState.paused = false;
    spawnWave();
    updateHUD();
}

function waveComplete() {
    gameState.running = false;
    
    // Check for active power-up expiry
    if (gameState.activePowerup && Date.now() > gameState.powerupEndTime) {
        gameState.activePowerup = null;
        player.fireRate = weapons[player.weapon].fireRate;
        player.damageMultiplier = 1;
        updatePowerupUI();
    }

    // Show wave complete screen
    const waveTitle = document.getElementById('wave-title');
    const waveMessage = document.getElementById('wave-message');
    
    waveTitle.textContent = `Wave ${gameState.wave} Complete!`;
    waveMessage.textContent = `Score: ${gameState.score} | Prepare for the next wave!`;
    
    showPowerupSelection();
    
    // Delay releasing pointer lock to prevent accidental clicks
    setTimeout(() => {
        document.exitPointerLock();
    }, 500);
}

function nextWave() {
    gameState.wave++;
    startWave();
}

// ============================================
// Game State Management
// ============================================

function startGame() {
    // Reset game state
    gameState.wave = 1;
    gameState.score = 0;
    gameState.enemies = [];
    gameState.powerups = [];
    gameState.bullets = [];
    gameState.particles = [];
    gameState.activePowerup = null;
    
    // Reset player
    player.x = MAP_SIZE * BLOCK_SIZE / 2;
    player.y = MAP_SIZE * BLOCK_SIZE / 2;
    player.angle = 0;
    player.health = player.maxHealth;
    player.weapon = 'pistol';
    player.damageMultiplier = 1;
    player.fireRate = weapons.pistol.fireRate;
    
    updateHUD();
    updatePowerupUI();
    document.getElementById('start-screen').classList.add('hidden');
    startWave();
}

function gameOver() {
    gameState.running = false;
    document.getElementById('final-waves').textContent = gameState.wave;
    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('game-over-screen').classList.remove('hidden');
    
    // Delay releasing pointer lock to prevent accidental clicks
    setTimeout(() => {
        document.exitPointerLock();
    }, 500);
}

function togglePause() {
    if (!gameState.running) return;
    
    gameState.paused = !gameState.paused;
    const pauseScreen = document.getElementById('pause-screen');
    
    if (gameState.paused) {
        pauseScreen.classList.remove('hidden');
        mouseLocked = false;
    } else {
        pauseScreen.classList.add('hidden');
        canvas.requestPointerLock();
    }
}

// ============================================
// UI Updates
// ============================================

function updateHUD() {
    document.getElementById('health-fill').style.width = `${(player.health / player.maxHealth) * 100}%`;
    document.getElementById('wave-number').textContent = gameState.wave;
    document.getElementById('enemies-remaining').textContent = gameState.enemiesRemaining;
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('weapon-name').textContent = weapons[player.weapon].name;
}

// ============================================
// Input Handlers
// ============================================

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (e.key === 'Escape') {
        togglePause();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

document.addEventListener('mousemove', (e) => {
    if (mouseLocked && gameState.running && !gameState.paused) {
        player.angle -= e.movementX * ROTATION_SPEED * 0.1;
    }
});

canvas.addEventListener('mousedown', (e) => {
    if (gameState.running && !gameState.paused) {
        if (!mouseLocked) {
            canvas.requestPointerLock();
        }
        if (e.button === 0) {
            shoot();
        }
    }
});

canvas.addEventListener('pointerlockchange', () => {
    mouseLocked = document.pointerLockElement === canvas;
});

canvas.addEventListener('contextmenu', (e) => e.preventDefault());

document.getElementById('start-btn').addEventListener('click', () => {
    startGame();
});

document.getElementById('restart-btn').addEventListener('click', () => {
    document.getElementById('game-over-screen').classList.add('hidden');
    startGame();
});

// ============================================
// Game Loop
// ============================================

function gameLoop() {
    if (!gameState.paused && gameState.running) {
        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        
        // Update
        updatePlayer();
        updateBullets();
        updateEnemies();
        updateParticles();
        
        // Render
        castRays();
        renderEntities();
        renderBullets();
        renderParticles();
        
        // Draw weapon
        drawWeapon();
    }
    
    requestAnimationFrame(gameLoop);
}

function drawWeapon() {
    const weapon = weapons[player.weapon];
    const weaponHeight = SCREEN_HEIGHT * 0.4;
    const weaponWidth = weaponHeight * 0.5;
    const weaponX = SCREEN_WIDTH / 2 - weaponWidth / 2;
    const weaponY = SCREEN_HEIGHT - weaponHeight;
    
    // Weapon bobbing while moving
    const bobX = Math.sin(Date.now() / 150) * 10;
    const bobY = Math.abs(Math.cos(Date.now() / 150)) * 10;
    
    ctx.save();
    ctx.translate(weaponX + bobX, weaponY + bobY);
    
    // Draw weapon based on type
    if (player.weapon === 'pistol') {
        ctx.fillStyle = '#444';
        ctx.fillRect(weaponWidth / 2 - 20, 0, 40, weaponHeight);
        ctx.fillStyle = '#222';
        ctx.fillRect(weaponWidth / 2 - 10, 0, 20, weaponHeight * 0.8);
    } else if (player.weapon === 'shotgun') {
        ctx.fillStyle = '#322';
        ctx.fillRect(weaponWidth / 2 - 25, 0, 50, weaponHeight);
        ctx.fillStyle = '#211';
        ctx.fillRect(weaponWidth / 2 - 15, 0, 30, weaponHeight * 0.9);
    } else if (player.weapon === 'rifle') {
        ctx.fillStyle = '#244';
        ctx.fillRect(weaponWidth / 2 - 15, 0, 30, weaponHeight);
        ctx.fillStyle = '#133';
        ctx.fillRect(weaponWidth / 2 - 8, 0, 16, weaponHeight * 0.7);
        ctx.fillStyle = '#355';
        ctx.fillRect(weaponWidth / 2 - 20, weaponHeight * 0.3, 40, 10);
    } else if (player.weapon === 'plasma') {
        ctx.fillStyle = '#044';
        ctx.fillRect(weaponWidth / 2 - 18, 0, 36, weaponHeight);
        ctx.fillStyle = '#0ff';
        ctx.fillRect(weaponWidth / 2 - 12, 0, 24, weaponHeight * 0.6);
        ctx.fillStyle = '#0ff';
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(weaponWidth / 2, weaponHeight * 0.2, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    } else if (player.weapon === 'minigun') {
        ctx.fillStyle = '#222';
        ctx.fillRect(weaponWidth / 2 - 20, 0, 40, weaponHeight);
        ctx.fillStyle = '#111';
        ctx.fillRect(weaponWidth / 2 - 12, 0, 24, weaponHeight * 0.7);
        // Barrels
        ctx.fillStyle = '#333';
        for (let i = 0; i < 6; i++) {
            ctx.fillRect(weaponWidth / 2 - 20 + i * 8, weaponHeight * 0.2, 6, 20);
        }
    }
    
    ctx.restore();
}

// Start the game loop
requestAnimationFrame(gameLoop);
