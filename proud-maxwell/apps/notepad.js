const NotepadApp = {
    title: 'Notepad / Type Defender',
    width: 500,
    height: 400,
    init: function(container, windowEl, winId, initialData) {
        const filePath = initialData?.path || null;
        let content = '';
        
        if (filePath && window.VFS) {
            const data = window.VFS.readFile(filePath);
            if (data !== null) {
                content = data;
            } else {
                content = "File not found or is a directory.";
            }
        }

        container.innerHTML = `
            <div style="height:100%; display:flex; flex-direction:column; background:rgba(0,0,0,0.8); color:var(--text-main); position:relative;">
                
                <!-- NOTEPAD VIEW -->
                <div id="note-view" style="display:flex; flex-direction:column; height:100%;">
                    <div class="app-toolbar" style="background:rgba(255,255,255,0.05); padding:8px; display:flex; align-items:center;">
                        <button class="app-btn btn-new">New</button>
                        <button class="app-btn btn-save">Save</button>
                        <div style="width:1px; background:rgba(255,255,255,0.2); margin:0 8px; height:20px;"></div>
                        <button id="btn-play-type" class="app-btn" style="color:var(--accent); font-weight:bold;">Play Type Defender</button>
                    </div>
                    <textarea class="notepad-textarea" spellcheck="false" style="flex-grow:1; background:transparent; border:none; outline:none; color:var(--text-main); font-family:monospace; padding:10px; resize:none;">${content}</textarea>
                    <div class="notepad-statusbar" style="background:rgba(0,0,0,0.5); padding:4px 8px; font-size:12px; color:var(--text-muted);">
                        FILE: ${filePath || 'UNSAVED'}
                    </div>
                </div>

                <!-- GAME VIEW -->
                <div id="game-view" style="display:none; flex-direction:column; height:100%; background:#000;">
                    <div class="app-toolbar" style="background:#111; padding:8px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #333;">
                        <button id="btn-back-note" class="app-btn">&larr; Back</button>
                        <span style="color:var(--text-muted); font-size:12px;">Type words to destroy them</span>
                        <div style="font-size:12px; font-weight:bold;">SCORE: <span id="type-score" style="color:var(--accent);">0</span></div>
                    </div>
                    <div style="flex-grow:1; position:relative; overflow:hidden;">
                        <canvas id="type-canvas" width="500" height="340" style="width:100%; height:100%; display:block;"></canvas>
                        
                        <div id="type-overlay" style="display:flex; position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); flex-direction:column; align-items:center; justify-content:center;">
                            <h2 style="color:#0f0; font-size:24px; margin-bottom:10px; font-family:monospace;">TYPE DEFENDER</h2>
                            <button id="btn-start-type" class="app-btn" style="padding:10px 20px; font-size:16px; background:#1e90ff; color:#fff;">Start Game</button>
                        </div>
                    </div>
                </div>

            </div>
        `;

        const noteView = container.querySelector('#note-view');
        const gameView = container.querySelector('#game-view');
        const btnPlayType = container.querySelector('#btn-play-type');
        const btnBackNote = container.querySelector('#btn-back-note');

        // --- NOTEPAD LOGIC ---
        const textarea = container.querySelector('.notepad-textarea');
        let currentPath = filePath;

        container.querySelector('.btn-save').addEventListener('click', () => {
            if (window.SFX) window.SFX.click();
            let savePath = currentPath;
            if (!savePath) {
                const name = prompt("Enter full path to save (e.g., /USERS/GUEST/documents/new.txt):", "/USERS/GUEST/documents/new.txt");
                if (name) {
                    savePath = name;
                } else {
                    return;
                }
            }
            if (window.VFS) {
                const success = window.VFS.writeFile(savePath, textarea.value);
                if (success) {
                    currentPath = savePath;
                    container.querySelector('.notepad-statusbar').innerText = `FILE: ${currentPath} (SAVED)`;
                    const titleEl = windowEl.querySelector('.window-title');
                    if (titleEl) titleEl.innerText = `Notepad - ${currentPath.split('/').pop()}`;
                } else {
                    alert("Failed to save. Ensure directory exists.");
                }
            }
        });

        container.querySelector('.btn-new').addEventListener('click', () => {
            if (window.SFX) window.SFX.click();
            currentPath = null;
            textarea.value = '';
            container.querySelector('.notepad-statusbar').innerText = `FILE: UNSAVED`;
            const titleEl = windowEl.querySelector('.window-title');
            if (titleEl) titleEl.innerText = `Notepad`;
        });

        if (currentPath) {
            const titleEl = windowEl.querySelector('.window-title');
            if (titleEl) titleEl.innerText = `Notepad - ${currentPath.split('/').pop()}`;
        }

        // --- TYPE DEFENDER LOGIC ---
        const gCanvas = container.querySelector('#type-canvas');
        const gCtx = gCanvas.getContext('2d');
        const scoreEl = container.querySelector('#type-score');
        const overlay = container.querySelector('#type-overlay');
        const btnStartType = container.querySelector('#btn-start-type');
        
        let gameActive = false;
        let score = 0;
        let frameCount = 0;
        
        const wordList = [
            'function', 'variable', 'object', 'array', 'string', 'number', 'boolean', 
            'undefined', 'null', 'class', 'method', 'return', 'await', 'async', 
            'promise', 'resolve', 'reject', 'import', 'export', 'default', 'const',
            'let', 'var', 'if', 'else', 'switch', 'case', 'break', 'continue', 
            'while', 'for', 'throw', 'catch', 'finally', 'try', 'console', 'log',
            'error', 'warn', 'info', 'table', 'dir', 'time', 'clear', 'document',
            'window', 'navigator', 'screen', 'location', 'history', 'element',
            'node', 'attribute', 'event', 'listener', 'handler', 'callback',
            'timeout', 'interval', 'request', 'response', 'fetch', 'json', 'parse',
            'stringify', 'map', 'filter', 'reduce', 'sort', 'push', 'pop', 'shift'
        ];

        let words = []; // { text, typed, x, y, speed, color }
        let currentWordObj = null;
        let particles = [];
        let lasers = [];
        
        let spawnRate = 120;
        let fallSpeedMult = 1.0;

        const spawnWord = () => {
            const text = wordList[Math.floor(Math.random() * wordList.length)];
            const x = Math.max(10, Math.random() * (gCanvas.width - text.length * 12 - 20));
            words.push({
                text: text.toUpperCase(),
                typed: 0,
                x: x,
                y: -20,
                speed: (0.5 + Math.random() * 0.8) * fallSpeedMult,
                color: `hsl(${Math.random() * 360}, 70%, 60%)`
            });
        };

        const createExplosion = (x, y, color) => {
            for(let i=0; i<15; i++) {
                particles.push({
                    x, y,
                    vx: (Math.random()-0.5)*8,
                    vy: (Math.random()-0.5)*8,
                    r: Math.random()*3 + 1,
                    life: 1.0,
                    color
                });
            }
        };

        const initGame = () => {
            gameActive = true;
            score = 0;
            frameCount = 0;
            words = [];
            particles = [];
            lasers = [];
            currentWordObj = null;
            spawnRate = 120;
            fallSpeedMult = 1.0;
            overlay.style.display = 'none';
            scoreEl.innerText = score;
            requestAnimationFrame(gameLoop);
        };

        const gameOver = () => {
            gameActive = false;
            overlay.innerHTML = `
                <h2 style="color:#f00; font-size:32px; margin-bottom:5px; font-family:monospace;">SYSTEM BREACHED</h2>
                <div style="color:#fff; margin-bottom:15px; font-family:monospace;">FINAL SCORE: ${score}</div>
                <button id="btn-retry-type" class="app-btn" style="padding:10px 20px; font-size:16px; background:#1e90ff; color:#fff;">Reboot Game</button>
            `;
            overlay.querySelector('#btn-retry-type').addEventListener('click', () => {
                if (window.SFX) window.SFX.click();
                initGame();
            });
            overlay.style.display = 'flex';
        };

        const handleKey = (e) => {
            if (!gameActive || gameView.style.display === 'none') return;
            // Only capture letters A-Z
            if (e.keyCode >= 65 && e.keyCode <= 90) {
                e.preventDefault();
                const char = String.fromCharCode(e.keyCode);

                if (currentWordObj) {
                    // Continuing current word
                    if (currentWordObj.text[currentWordObj.typed] === char) {
                        currentWordObj.typed++;
                        if (window.SFX) window.SFX.click(); // tiny click
                        
                        if (currentWordObj.typed === currentWordObj.text.length) {
                            // Word complete!
                            // Shoot laser from bottom center
                            lasers.push({
                                x1: gCanvas.width/2,
                                y1: gCanvas.height,
                                x2: currentWordObj.x + (currentWordObj.text.length*6),
                                y2: currentWordObj.y,
                                life: 10,
                                color: currentWordObj.color
                            });
                            createExplosion(currentWordObj.x + (currentWordObj.text.length*6), currentWordObj.y, currentWordObj.color);
                            
                            score += currentWordObj.text.length * 10;
                            scoreEl.innerText = score;
                            
                            words = words.filter(w => w !== currentWordObj);
                            currentWordObj = null;
                        }
                    } else {
                        // Wrong key! Flash red?
                        // Just ignore or reset? Z-Type usually just ignores wrong keys
                    }
                } else {
                    // Try to lock onto a new word
                    // Find highest word starting with char
                    let bestMatch = null;
                    let maxDiff = -1;
                    
                    for (let w of words) {
                        if (w.text[0] === char) {
                            // Prioritize words closest to bottom
                            if (w.y > maxDiff) {
                                maxDiff = w.y;
                                bestMatch = w;
                            }
                        }
                    }
                    
                    if (bestMatch) {
                        currentWordObj = bestMatch;
                        currentWordObj.typed = 1;
                        if (window.SFX) window.SFX.click();
                    }
                }
            }
        };

        windowEl.addEventListener('keydown', handleKey);
        btnStartType.addEventListener('click', () => {
            if (window.SFX) window.SFX.click();
            initGame();
        });

        const gameLoop = () => {
            if (!gameActive) return;
            frameCount++;

            if (frameCount % spawnRate === 0) {
                spawnWord();
            }
            if (frameCount % 600 === 0) {
                if (spawnRate > 40) spawnRate -= 5;
                fallSpeedMult += 0.1;
            }

            gCtx.fillStyle = 'rgba(0,0,0,0.4)'; // trail effect
            gCtx.fillRect(0, 0, gCanvas.width, gCanvas.height);

            // Draw Base Turret
            gCtx.fillStyle = '#444';
            gCtx.beginPath();
            gCtx.arc(gCanvas.width/2, gCanvas.height, 20, Math.PI, 0);
            gCtx.fill();

            // Lasers
            for (let i = lasers.length - 1; i >= 0; i--) {
                let l = lasers[i];
                gCtx.strokeStyle = l.color;
                gCtx.lineWidth = 4;
                gCtx.beginPath();
                gCtx.moveTo(l.x1, l.y1);
                gCtx.lineTo(l.x2, l.y2);
                gCtx.stroke();
                l.life--;
                if (l.life <= 0) lasers.splice(i, 1);
            }

            // Particles
            for (let i = particles.length - 1; i >= 0; i--) {
                let p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.05;
                if (p.life <= 0) {
                    particles.splice(i, 1);
                } else {
                    gCtx.fillStyle = p.color;
                    gCtx.globalAlpha = p.life;
                    gCtx.beginPath();
                    gCtx.arc(p.x, p.y, p.r, 0, Math.PI*2);
                    gCtx.fill();
                    gCtx.globalAlpha = 1.0;
                }
            }

            // Words
            gCtx.font = 'bold 16px monospace';
            for (let i = words.length - 1; i >= 0; i--) {
                let w = words[i];
                w.y += w.speed;
                
                if (w.y > gCanvas.height - 20) {
                    gameOver();
                    return;
                }

                if (w === currentWordObj) {
                    // Highlight typed part
                    const typedStr = w.text.substring(0, w.typed);
                    const untypedStr = w.text.substring(w.typed);
                    
                    gCtx.fillStyle = '#0f0';
                    gCtx.fillText(typedStr, w.x, w.y);
                    
                    const offset = gCtx.measureText(typedStr).width;
                    gCtx.fillStyle = '#fff';
                    gCtx.fillText(untypedStr, w.x + offset, w.y);
                    
                    // Draw target line
                    gCtx.strokeStyle = 'rgba(0, 255, 0, 0.2)';
                    gCtx.lineWidth = 1;
                    gCtx.beginPath();
                    gCtx.moveTo(gCanvas.width/2, gCanvas.height);
                    gCtx.lineTo(w.x + (w.text.length*4), w.y + 10);
                    gCtx.stroke();
                } else {
                    gCtx.fillStyle = w.color;
                    gCtx.fillText(w.text, w.x, w.y);
                }
            }

            requestAnimationFrame(gameLoop);
        };

        // View Toggling
        btnPlayType.addEventListener('click', () => {
            if (window.SFX) window.SFX.click();
            noteView.style.display = 'none';
            gameView.style.display = 'flex';
            windowEl.setAttribute('tabindex', '-1');
            windowEl.style.outline = 'none';
            windowEl.focus();
        });

        btnBackNote.addEventListener('click', () => {
            if (window.SFX) window.SFX.click();
            gameView.style.display = 'none';
            noteView.style.display = 'flex';
            gameActive = false;
        });
        
        windowEl.addEventListener('mousedown', () => {
            if (gameView.style.display !== 'none') windowEl.focus();
        });
    }
};
