const PaintApp = {
    title: 'Paint / Sugar',
    width: 600,
    height: 520,
    init: function(container, windowEl, winId) {
        container.innerHTML = `
            <div style="display:flex; flex-direction:column; height:100%; position:relative; background:rgba(0,0,0,0.8);">
                
                <!-- PAINT VIEW -->
                <div id="paint-view" style="display:flex; flex-direction:column; height:100%;">
                    <div class="app-toolbar" style="background:rgba(255,255,255,0.05); padding:8px; display:flex; align-items:center;">
                        <button class="app-btn btn-clear">Clear</button>
                        <button class="app-btn btn-save">Save</button>
                        <div style="width:1px; background:rgba(255,255,255,0.2); margin:0 8px; height:20px;"></div>
                        <button class="app-btn color-btn" style="background:#ff4757; width:24px; height:24px; padding:0; border-radius:50%; margin-right:4px;" data-color="#ff4757"></button>
                        <button class="app-btn color-btn" style="background:#2ed573; width:24px; height:24px; padding:0; border-radius:50%; margin-right:4px;" data-color="#2ed573"></button>
                        <button class="app-btn color-btn" style="background:#1e90ff; width:24px; height:24px; padding:0; border-radius:50%; margin-right:4px;" data-color="#1e90ff"></button>
                        <button class="app-btn color-btn" style="background:#ffffff; width:24px; height:24px; padding:0; border-radius:50%; margin-right:4px;" data-color="#ffffff"></button>
                        <input type="range" class="size-slider" min="1" max="20" value="5" style="margin-left:10px; width:80px;">
                        <div style="flex-grow:1;"></div>
                        <button id="btn-play-sugar" class="app-btn" style="color:var(--accent); font-weight:bold;">Play Sugar Game</button>
                    </div>
                    <canvas id="paint-canvas" width="600" height="460" style="flex-grow:1; cursor:crosshair; background:#fff;"></canvas>
                </div>

                <!-- GAME VIEW -->
                <div id="game-view" style="display:none; flex-direction:column; height:100%;">
                    <div class="app-toolbar" style="background:rgba(255,255,255,0.05); padding:8px; display:flex; align-items:center; justify-content:space-between;">
                        <button id="btn-back-paint" class="app-btn">&larr; Paint</button>
                        <span id="level-display" style="color:#fff; font-weight:bold;">LEVEL 1</span>
                        <div style="display:flex; gap:8px;">
                            <button id="btn-drop-sugar" class="app-btn" style="background:#2ed573; color:#000; font-weight:bold;">Drop Sugar</button>
                            <button id="btn-restart-lvl" class="app-btn">Restart Level</button>
                        </div>
                    </div>
                    <div style="position:relative; flex-grow:1;">
                        <canvas id="game-canvas" width="600" height="480" style="width:100%; height:100%; cursor:crosshair; background:#222; display:block;"></canvas>
                        
                        <!-- Overlay Messages -->
                        <div id="game-overlay" style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); flex-direction:column; align-items:center; justify-content:center; pointer-events:none;">
                            <h2 id="overlay-msg" style="color:#fff; font-size:32px; margin-bottom:10px; text-shadow:0 2px 4px #000;">LEVEL COMPLETE!</h2>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const paintView = container.querySelector('#paint-view');
        const gameView = container.querySelector('#game-view');
        const pCanvas = container.querySelector('#paint-canvas');
        const gCanvas = container.querySelector('#game-canvas');
        
        // --- PAINT LOGIC ---
        const pCtx = pCanvas.getContext('2d', { willReadFrequently: true });
        pCtx.fillStyle = '#fff';
        pCtx.fillRect(0, 0, pCanvas.width, pCanvas.height);
        
        let pDrawing = false;
        let pColor = '#1e90ff';
        let pSize = 5;

        pCanvas.addEventListener('mousedown', (e) => {
            pDrawing = true;
            pCtx.beginPath();
            pCtx.moveTo(e.offsetX, e.offsetY);
        });
        pCanvas.addEventListener('mousemove', (e) => {
            if (pDrawing) {
                pCtx.lineTo(e.offsetX, e.offsetY);
                pCtx.strokeStyle = pColor;
                pCtx.lineWidth = pSize;
                pCtx.lineCap = 'round';
                pCtx.lineJoin = 'round';
                pCtx.stroke();
            }
        });
        pCanvas.addEventListener('mouseup', () => pDrawing = false);
        pCanvas.addEventListener('mouseleave', () => pDrawing = false);

        container.querySelector('.btn-clear').addEventListener('click', () => {
            if (window.SFX) window.SFX.click();
            pCtx.fillStyle = '#fff';
            pCtx.fillRect(0, 0, pCanvas.width, pCanvas.height);
        });

        container.querySelector('.btn-save').addEventListener('click', () => {
            if (window.SFX) window.SFX.click();
            const name = prompt("Save image as (e.g., drawing.png):", "drawing.png");
            if (name) {
                const dataUrl = pCanvas.toDataURL("image/png");
                if (window.VFS) window.VFS.writeFile('/USERS/GUEST/' + name, dataUrl);
                alert("Saved to /USERS/GUEST/" + name);
            }
        });

        container.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (window.SFX) window.SFX.click();
                pColor = e.target.dataset.color;
            });
        });
        container.querySelector('.size-slider').addEventListener('input', (e) => {
            pSize = e.target.value;
        });

        // --- VIEW SWITCHING ---
        let gameRunning = false;
        container.querySelector('#btn-play-sugar').addEventListener('click', () => {
            if (window.SFX) window.SFX.click();
            paintView.style.display = 'none';
            gameView.style.display = 'flex';
            gameRunning = true;
            startGame();
        });
        container.querySelector('#btn-back-paint').addEventListener('click', () => {
            if (window.SFX) window.SFX.click();
            gameView.style.display = 'none';
            paintView.style.display = 'flex';
            gameRunning = false;
        });

        // --- SUGAR GAME LOGIC ---
        const gCtx = gCanvas.getContext('2d');
        const overlay = container.querySelector('#game-overlay');
        const overlayMsg = container.querySelector('#overlay-msg');
        const btnDrop = container.querySelector('#btn-drop-sugar');
        const btnRestart = container.querySelector('#btn-restart-lvl');

        let currentLevel = parseInt(localStorage.getItem('titanium_sugar_level') || 0);
        let levels = [];
        let particles = [];
        let userLines = [];
        let currentDraw = null;
        
        let levelState = 'DRAWING'; // DRAWING, DROPPING, WON, LOST

        // Generate 25 levels
        for(let i=0; i<25; i++) {
            let spawners = [];
            let cups = [];
            let statics = [];
            
            let req = 100 + (i * 10);
            
            if (i === 0) {
                spawners.push({x: 300, y: 50});
                cups.push({x: 260, y: 380, w: 80, h: 60, req: 100});
            } else if (i === 1) {
                spawners.push({x: 100, y: 50});
                cups.push({x: 420, y: 380, w: 80, h: 60, req: 120});
            } else if (i === 2) {
                spawners.push({x: 300, y: 50});
                cups.push({x: 100, y: 380, w: 80, h: 60, req: 100});
                cups.push({x: 420, y: 380, w: 80, h: 60, req: 100});
                statics.push({x1: 250, y1: 150, x2: 350, y2: 150});
            } else {
                let spawnerCount = 1 + Math.floor(i / 8);
                for(let s=0; s<spawnerCount; s++) {
                    spawners.push({
                        x: 100 + Math.random() * 400, 
                        y: 40 + Math.random() * 60
                    });
                }
                let cupCount = 1 + Math.floor((i-2) / 6);
                for(let c=0; c<cupCount; c++) {
                    cups.push({
                        x: 50 + Math.random() * 420, 
                        y: 350 + Math.random() * 50, 
                        w: 80, h: 60, req: Math.floor(req/cupCount)
                    });
                }
                let staticCount = Math.floor(i / 3);
                for(let o=0; o<staticCount; o++) {
                    let sx = 100 + Math.random() * 400;
                    let sy = 150 + Math.random() * 150;
                    statics.push({
                        x1: sx, y1: sy,
                        x2: sx + (Math.random() > 0.5 ? 1 : -1) * (50 + Math.random()*100),
                        y2: sy + (Math.random() > 0.5 ? 1 : -1) * (20 + Math.random()*50)
                    });
                }
            }
            levels.push({ spawners, cups, statics });
        }

        let lvlData = null;

        const loadLevel = (index) => {
            if (index >= levels.length) {
                alert("YOU BEAT ALL 25 LEVELS! INCREDIBLE!");
                index = 0;
            }
            currentLevel = index;
            localStorage.setItem('titanium_sugar_level', currentLevel);
            container.querySelector('#level-display').innerText = 'LEVEL ' + (currentLevel + 1);
            
            // Deep copy level data
            const template = levels[currentLevel];
            
            // Calculate total sugar needed across all cups
            let totalReq = template.cups.reduce((acc, cup) => acc + cup.req, 0);
            let totalSugarAllowed = Math.floor(totalReq * 2.5); // 250% of what's required
            
            lvlData = {
                spawners: template.spawners.map(s => ({
                    ...s, 
                    rate: 2, 
                    frames: 0, 
                    remaining: Math.floor(totalSugarAllowed / template.spawners.length)
                })),
                cups: template.cups.map(c => ({
                    ...c,
                    filled: 0
                })),
                statics: JSON.parse(JSON.stringify(template.statics))
            };
            
            particles = [];
            userLines = [];
            levelState = 'DRAWING';
            overlay.style.display = 'none';
            btnDrop.disabled = false;
        };

        const startGame = () => {
            loadLevel(currentLevel);
            requestAnimationFrame(gameLoop);
        };

        btnDrop.addEventListener('click', () => {
            if (window.SFX) window.SFX.click();
            if (levelState === 'DRAWING') {
                levelState = 'DROPPING';
                btnDrop.disabled = true;
            }
        });
        
        btnRestart.addEventListener('click', () => {
            if (window.SFX) window.SFX.click();
            loadLevel(currentLevel);
        });

        // User Drawing Lines
        gCanvas.addEventListener('mousedown', (e) => {
            if (levelState !== 'DRAWING') return;
            currentDraw = { x1: e.offsetX, y1: e.offsetY, x2: e.offsetX, y2: e.offsetY };
        });
        gCanvas.addEventListener('mousemove', (e) => {
            if (levelState !== 'DRAWING' || !currentDraw) return;
            
            let dx = e.offsetX - currentDraw.x1;
            let dy = e.offsetY - currentDraw.y1;
            if (dx*dx + dy*dy > 64) { // segment length ~8px
                currentDraw.x2 = e.offsetX;
                currentDraw.y2 = e.offsetY;
                userLines.push({...currentDraw});
                currentDraw.x1 = e.offsetX;
                currentDraw.y1 = e.offsetY;
            }
        });
        gCanvas.addEventListener('mouseup', () => currentDraw = null);
        gCanvas.addEventListener('mouseleave', () => currentDraw = null);

        const pointToSegmentDistSq = (px, py, x1, y1, x2, y2) => {
            let dx = x2 - x1;
            let dy = y2 - y1;
            let lenSq = dx*dx + dy*dy;
            let t = lenSq === 0 ? 0 : Math.max(0, Math.min(1, ((px - x1)*dx + (py - y1)*dy) / lenSq));
            let projX = x1 + t * dx;
            let projY = y1 + t * dy;
            return {
                distSq: (px - projX)**2 + (py - projY)**2,
                projX: projX,
                projY: projY
            };
        };

        const gameLoop = () => {
            if (!gameRunning) return;

            gCtx.fillStyle = '#222';
            gCtx.fillRect(0, 0, gCanvas.width, gCanvas.height);

            const allLines = [...lvlData.statics, ...userLines];
            
            // Draw Lines
            gCtx.lineWidth = 5;
            gCtx.lineCap = 'round';
            // Statics
            gCtx.strokeStyle = '#ff4757';
            lvlData.statics.forEach(l => {
                gCtx.beginPath(); gCtx.moveTo(l.x1, l.y1); gCtx.lineTo(l.x2, l.y2); gCtx.stroke();
            });
            // User
            gCtx.strokeStyle = '#2ed573';
            userLines.forEach(l => {
                gCtx.beginPath(); gCtx.moveTo(l.x1, l.y1); gCtx.lineTo(l.x2, l.y2); gCtx.stroke();
            });

            // Handle Spawners & Particles
            let spawnersEmpty = true;
            
            lvlData.spawners.forEach(s => {
                // Draw spawner
                gCtx.fillStyle = '#ff4757';
                gCtx.beginPath();
                gCtx.arc(s.x, s.y, 10, 0, Math.PI*2);
                gCtx.fill();
                gCtx.fillStyle = '#fff';
                gCtx.font = '10px Arial';
                gCtx.fillText(s.remaining, s.x - 8, s.y - 12);

                if (s.remaining > 0) spawnersEmpty = false;

                if (levelState === 'DROPPING' && s.remaining > 0) {
                    s.frames++;
                    if (s.frames >= s.rate) {
                        s.frames = 0;
                        s.remaining--;
                        particles.push({
                            x: s.x + (Math.random()*10 - 5), 
                            y: s.y + 10, 
                            vx: (Math.random()-0.5), 
                            vy: 0, 
                            r: 2 
                        });
                    }
                }
            });

            // Update & Draw Particles
            gCtx.fillStyle = '#fff';
            for (let i = particles.length - 1; i >= 0; i--) {
                let p = particles[i];
                p.vy += 0.2; // Gravity
                p.x += p.vx;
                p.y += p.vy;

                // Line collisions
                for (let line of allLines) {
                    let col = pointToSegmentDistSq(p.x, p.y, line.x1, line.y1, line.x2, line.y2);
                    if (col.distSq < p.r * p.r) {
                        let dist = Math.sqrt(col.distSq);
                        let nx = dist === 0 ? 0 : (p.x - col.projX) / dist;
                        let ny = dist === 0 ? -1 : (p.y - col.projY) / dist;

                        p.x = col.projX + nx * p.r;
                        p.y = col.projY + ny * p.r;

                        let dot = p.vx * nx + p.vy * ny;
                        p.vx = (p.vx - 2 * dot * nx) * 0.4;
                        p.vy = (p.vy - 2 * dot * ny) * 0.4;
                        p.vx += (Math.random() - 0.5) * 0.5;
                    }
                }

                // Check Cups
                let collected = false;
                for (let cup of lvlData.cups) {
                    if (p.x > cup.x && p.x < cup.x + cup.w && p.y > cup.y && p.y < cup.y + cup.h) {
                        if (cup.filled < cup.req) {
                            cup.filled++;
                        }
                        collected = true;
                        break;
                    }
                }

                // Delete if out of bounds or collected
                if (collected || p.y > gCanvas.height + 10 || p.x < -10 || p.x > gCanvas.width + 10) {
                    particles.splice(i, 1);
                    continue;
                }

                // Draw Particle
                gCtx.beginPath();
                gCtx.arc(p.x, p.y, p.r, 0, Math.PI*2);
                gCtx.fill();
            }

            // Draw Cups
            let allFilled = true;
            lvlData.cups.forEach(cup => {
                gCtx.strokeStyle = '#fff';
                gCtx.lineWidth = 2;
                gCtx.beginPath();
                gCtx.moveTo(cup.x, cup.y);
                gCtx.lineTo(cup.x, cup.y + cup.h);
                gCtx.lineTo(cup.x + cup.w, cup.y + cup.h);
                gCtx.lineTo(cup.x + cup.w, cup.y);
                gCtx.stroke();

                let fillPct = Math.min(1, cup.filled / cup.req);
                gCtx.fillStyle = `rgba(255, 255, 255, ${0.2 + fillPct*0.8})`;
                gCtx.fillRect(cup.x, cup.y + cup.h - (cup.h * fillPct), cup.w, cup.h * fillPct);

                gCtx.fillStyle = '#fff';
                gCtx.font = '14px Arial';
                gCtx.fillText(cup.filled + ' / ' + cup.req, cup.x + 10, cup.y + cup.h + 20);

                if (cup.filled < cup.req) allFilled = false;
            });

            // Check Win/Loss Condition
            if (levelState === 'DROPPING') {
                if (allFilled) {
                    levelState = 'WON';
                    overlayMsg.innerText = "LEVEL COMPLETE!";
                    overlayMsg.style.color = "#0f0";
                    overlay.style.display = 'flex';
                    setTimeout(() => {
                        if (gameRunning && levelState === 'WON') {
                            loadLevel(currentLevel + 1);
                        }
                    }, 2000);
                } else if (spawnersEmpty && particles.length === 0) {
                    levelState = 'LOST';
                    overlayMsg.innerText = "OUT OF SUGAR. FAILED.";
                    overlayMsg.style.color = "#f00";
                    overlay.style.display = 'flex';
                }
            }

            requestAnimationFrame(gameLoop);
        };
    }
};
