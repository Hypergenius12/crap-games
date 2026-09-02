const SysMonApp = {
    title: 'System Monitor / Task Killer',
    width: 480,
    height: 350,
    init: function(container, windowEl, winId) {
        container.innerHTML = '<div style="height:100%; display:flex; flex-direction:column; background:rgba(0,0,0,0.8); color:var(--text-main);">' +
            '<!-- SYSMON VIEW -->' +
            '<div id="sysmon-view" style="display:flex; flex-direction:column; height:100%; padding:15px; box-sizing:border-box;">' +
                '<div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 10px;">' +
                    '<div style="font-weight:600; font-size:14px;">PERFORMANCE HISTORY</div>' +
                    '<div style="display:flex; gap:10px;">' +
                        '<button id="btn-play-killer" class="app-btn" style="color:#ff4757; font-weight:bold;">Task Killer Game</button>' +
                        '<div style="font-size:11px; background:rgba(0,122,204,0.3); color:#fff; padding:3px 8px; border-radius:4px; border:1px solid rgba(0,122,204,0.5);">LIVE</div>' +
                    '</div>' +
                '</div>' +
                
                '<div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px; color:rgba(255,255,255,0.7);">' +
                    '<span>CPU Usage</span>' +
                    '<span id="sys-cpu" style="font-weight:bold; color:var(--accent);">0%</span>' +
                '</div>' +
                '<div style="flex-grow:0; height:60px; width:100%; background:rgba(0,0,0,0.4); border-radius:4px; border:1px solid rgba(255,255,255,0.05); overflow:hidden; position:relative; margin-bottom:15px;">' +
                    '<canvas id="cpu-canvas" style="position:absolute; top:0; left:0; width:100%; height:100%;"></canvas>' +
                '</div>' +

                '<div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px; color:rgba(255,255,255,0.7);">' +
                    '<span>Memory Allocation</span>' +
                    '<span id="sys-mem" style="font-weight:bold; color:#4ade80;">0MB / 1024MB</span>' +
                '</div>' +
                '<div style="flex-grow:0; height:60px; width:100%; background:rgba(0,0,0,0.4); border-radius:4px; border:1px solid rgba(255,255,255,0.05); overflow:hidden; position:relative; margin-bottom:15px;">' +
                    '<canvas id="mem-canvas" style="position:absolute; top:0; left:0; width:100%; height:100%;"></canvas>' +
                '</div>' +
                
                '<div style="font-weight:600; font-size:12px; margin-bottom:4px; color:rgba(255,255,255,0.7); border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:4px;">OPEN PROCESSES</div>' +
                '<div id="process-list" style="flex-grow:1; overflow-y:auto; display:flex; flex-direction:column; gap:2px;"></div>' +
            '</div>' +

            '<!-- GAME VIEW -->' +
            '<div id="game-view" style="display:none; flex-direction:column; height:100%;">' +
                '<div class="app-toolbar" style="background:rgba(255,255,255,0.05); padding:8px; display:flex; align-items:center; justify-content:space-between;">' +
                    '<button id="btn-back-sysmon" class="app-btn">&larr; Back</button>' +
                    '<div style="flex-grow:1; margin:0 15px; background:#222; height:10px; border-radius:5px; overflow:hidden; border:1px solid #444;">' +
                        '<div id="health-bar" style="width:100%; height:100%; background:#4ade80; transition:width 0.2s, background 0.2s;"></div>' +
                    '</div>' +
                    '<div style="font-size:12px; font-weight:bold;">SCORE: <span id="killer-score" style="color:#ff4757;">0</span></div>' +
                '</div>' +
                '<div id="taskkiller-area" style="flex-grow:1; position:relative; overflow:hidden; background:#000; cursor:crosshair;">' +
                    '<div id="killer-overlay" style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); flex-direction:column; align-items:center; justify-content:center; z-index:100;">' +
                        '<h2 style="color:#ff4757; font-size:32px; margin-bottom:5px; text-shadow:0 0 5px #f00;">SYSTEM CRASH</h2>' +
                        '<div style="color:#fff; margin-bottom:15px;">VIRUSES KILLED: <span id="killer-final">0</span></div>' +
                        '<button id="btn-restart-killer" class="app-btn" style="pointer-events:auto; color:#fff; border-color:#fff;">Reboot System</button>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';

        const sysmonView = container.querySelector('#sysmon-view');
        const gameView = container.querySelector('#game-view');
        const btnPlayKiller = container.querySelector('#btn-play-killer');
        const btnBackSysmon = container.querySelector('#btn-back-sysmon');

        // --- SYSMON LOGIC ---
        const cpuEl = container.querySelector('#sys-cpu');
        const memEl = container.querySelector('#sys-mem');
        const cpuCanvas = container.querySelector('#cpu-canvas');
        const memCanvas = container.querySelector('#mem-canvas');
        
        let cpuHistory = new Array(60).fill(0);
        let memHistory = new Array(60).fill(0);

        const drawGraph = (canvas, data, color) => {
            const ctx = canvas.getContext('2d');
            const w = canvas.clientWidth;
            const h = canvas.clientHeight;
            
            if (canvas.width !== w) canvas.width = w;
            if (canvas.height !== h) canvas.height = h;

            ctx.clearRect(0, 0, w, h);
            
            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for(let i=0; i<4; i++) {
                ctx.moveTo(0, h/4 * i);
                ctx.lineTo(w, h/4 * i);
            }
            ctx.stroke();

            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            
            const slice = w / (data.length - 1);
            for(let i = 0; i < data.length; i++) {
                const x = i * slice;
                const y = h - (data[i] / 100 * h);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            ctx.lineTo(w, h);
            ctx.lineTo(0, h);
            ctx.fillStyle = color.replace('1.0)', '0.2)');
            ctx.fill();
        };

        const processList = container.querySelector('#process-list');

        let sysmonInterval = setInterval(() => {
            if (sysmonView.style.display === 'none') return;
            if (!container.parentElement) {
                clearInterval(sysmonInterval);
                return;
            }
            
            let openWindows = window.WM ? window.WM.windows : [];
            let realTargetCpu = 5 + (openWindows.length * 8); 
            let realTargetMem = 20 + (openWindows.length * 15);
            
            // Jitter
            let targetCpu = realTargetCpu + (Math.random() * 10 - 5);
            let targetMem = realTargetMem + (Math.random() * 5 - 2);

            const currentCpu = cpuHistory[cpuHistory.length - 1];
            const currentMem = memHistory[memHistory.length - 1];

            const nextCpu = currentCpu + (targetCpu - currentCpu) * 0.2 + (Math.random()*4 - 2);
            const nextMem = currentMem + (targetMem - currentMem) * 0.1 + (Math.random()*2 - 1);

            const finalCpu = Math.max(0, Math.min(100, nextCpu));
            const finalMem = Math.max(0, Math.min(100, nextMem));

            cpuHistory.push(finalCpu); cpuHistory.shift();
            memHistory.push(finalMem); memHistory.shift();
            
            cpuEl.innerText = Math.round(finalCpu) + '%';
            memEl.innerText = Math.round(finalMem / 100 * 1024) + 'MB / 1024MB';
            
            drawGraph(cpuCanvas, cpuHistory, 'rgba(0, 122, 204, 1.0)');
            drawGraph(memCanvas, memHistory, 'rgba(74, 222, 128, 1.0)');
            
            // Update Process List
            processList.innerHTML = '';
            if (openWindows.length === 0) {
                processList.innerHTML = '<div style="color:var(--text-muted); font-size:11px; padding:5px;">System Idle...</div>';
            } else {
                openWindows.forEach(win => {
                    const titleEl = win.element.querySelector('.window-title');
                    const title = titleEl ? titleEl.innerText : 'Unknown Process';
                    
                    const item = document.createElement('div');
                    item.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:4px 8px; border-radius:3px; font-size:11px;';
                    item.innerHTML = `
                        <div style="flex-grow:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${title}</div>
                        <div style="color:var(--text-muted); margin-right:10px;">PID: ${win.id.substr(4,4)}</div>
                        <button class="app-btn kill-btn" data-id="${win.id}" style="padding:2px 6px; font-size:10px; background:rgba(255,71,87,0.2); color:#ff4757; border:1px solid rgba(255,71,87,0.5);">End Task</button>
                    `;
                    processList.appendChild(item);
                });
                
                // Add kill events
                processList.querySelectorAll('.kill-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const wid = e.target.getAttribute('data-id');
                        if (window.WM) window.WM.closeWindow(wid);
                    });
                });
            }
            
        }, 1000);
        
        setTimeout(() => {
            drawGraph(cpuCanvas, cpuHistory, 'rgba(0, 122, 204, 1.0)');
            drawGraph(memCanvas, memHistory, 'rgba(74, 222, 128, 1.0)');
        }, 100);

        // --- TASK KILLER GAME LOGIC ---
        const gameArea = container.querySelector('#taskkiller-area');
        const scoreEl = container.querySelector('#killer-score');
        const overlay = container.querySelector('#killer-overlay');
        const finalScoreEl = container.querySelector('#killer-final');
        const btnRestart = container.querySelector('#btn-restart-killer');
        const healthBar = container.querySelector('#health-bar');
        
        let gameActive = false;
        let score = 0;
        let health = 100;
        let spawnRate = 1200;
        let spawnInterval = null;
        let loopInterval = null;
        let processes = [];

        const names = ["memleak.exe", "virus.bat", "trojan.dll", "ransomware", "crypto_miner", "bloatware"];

        const initGame = () => {
            gameActive = true;
            score = 0;
            health = 100;
            spawnRate = 1200;
            scoreEl.innerText = score;
            healthBar.style.width = '100%';
            healthBar.style.background = '#4ade80';
            overlay.style.display = 'none';
            
            // clear old processes
            processes.forEach(p => p.el.remove());
            processes = [];
            
            clearInterval(spawnInterval);
            clearInterval(loopInterval);
            
            spawnInterval = setInterval(spawnProcess, spawnRate);
            loopInterval = setInterval(gameLoop, 50);
        };

        const spawnProcess = () => {
            if (!gameActive) return;
            
            const containerEl = document.createElement('div');
            const size = 30;
            const x = Math.random() * (gameArea.offsetWidth - 80) + 20;
            const y = Math.random() * (gameArea.offsetHeight - 80) + 20;
            const name = names[Math.floor(Math.random() * names.length)];
            
            containerEl.style.cssText = 'position:absolute; left:' + x + 'px; top:' + y + 'px; width:' + size + 'px; height:' + size + 'px; display:flex; align-items:center; justify-content:center; cursor:crosshair;';
            
            // The danger ring that shows max size
            const ring = document.createElement('div');
            ring.style.cssText = 'position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); border:1px dashed rgba(255,71,87,0.3); border-radius:50%; pointer-events:none; transition:width 0.1s, height 0.1s;';
            containerEl.appendChild(ring);
            
            // The actual virus core
            const el = document.createElement('div');
            el.style.cssText = 'position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(255,0,0,0.2); border:2px solid #ff4757; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#ff4757; font-size:10px; font-weight:bold; user-select:none; transition:all 0.1s; box-shadow:0 0 15px rgba(255,0,0,0.5);';
            el.innerText = name;
            containerEl.appendChild(el);
            
            gameArea.appendChild(containerEl);
            
            const maxSize = 100 + Math.random() * 60;
            ring.style.width = maxSize + 'px';
            ring.style.height = maxSize + 'px';
            
            const proc = {
                container: containerEl,
                core: el,
                size: size,
                maxSize: maxSize,
                growthRate: 0.5 + Math.random() * 1.5
            };
            
            containerEl.addEventListener('mousedown', (e) => {
                if (!gameActive) return;
                if (window.SFX) window.SFX.click();
                
                el.style.background = '#fff';
                el.style.borderColor = '#fff';
                el.style.transform = 'translate(-50%, -50%) scale(1.5)';
                el.style.opacity = '0';
                ring.style.opacity = '0';
                
                setTimeout(() => {
                    containerEl.remove();
                    const idx = processes.indexOf(proc);
                    if (idx > -1) processes.splice(idx, 1);
                }, 150);
                
                score++;
                scoreEl.innerText = score;
                
                if (score % 10 === 0 && spawnRate > 300) {
                    spawnRate -= 150;
                    clearInterval(spawnInterval);
                    spawnInterval = setInterval(spawnProcess, spawnRate);
                }
            });
            
            processes.push(proc);
        };

        const damageHealth = (amount) => {
            health -= amount;
            if (health < 0) health = 0;
            healthBar.style.width = health + '%';
            if (health < 30) healthBar.style.background = '#ff4757';
            else if (health < 60) healthBar.style.background = '#ffa502';
            
            // flash screen
            const flash = document.createElement('div');
            flash.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(255,0,0,0.3); pointer-events:none; z-index:50;';
            gameArea.appendChild(flash);
            setTimeout(() => flash.remove(), 100);
            
            if (health === 0) {
                gameOver();
            }
        };

        const gameOver = () => {
            gameActive = false;
            clearInterval(spawnInterval);
            clearInterval(loopInterval);
            overlay.style.display = 'flex';
            finalScoreEl.innerText = score;
        };

        const gameLoop = () => {
            if (!gameActive) return;
            
            for (let i = processes.length - 1; i >= 0; i--) {
                const p = processes[i];
                p.size += p.growthRate;
                p.core.style.width = p.size + 'px';
                p.core.style.height = p.size + 'px';
                
                // Color gets brighter as it gets closer to exploding
                const dangerRatio = p.size / p.maxSize;
                p.core.style.background = `rgba(255,0,0,${0.2 + dangerRatio * 0.6})`;
                
                if (p.size >= p.maxSize) {
                    // Explodes and damages system
                    p.container.remove();
                    processes.splice(i, 1);
                    damageHealth(15);
                }
            }
        };

        btnPlayKiller.addEventListener('click', () => {
            if (window.SFX) window.SFX.click();
            sysmonView.style.display = 'none';
            gameView.style.display = 'flex';
            if (!gameActive && overlay.style.display !== 'flex') {
                initGame();
            }
        });

        btnBackSysmon.addEventListener('click', () => {
            if (window.SFX) window.SFX.click();
            gameView.style.display = 'none';
            sysmonView.style.display = 'flex';
            gameActive = false; // pause game
            clearInterval(spawnInterval);
            clearInterval(loopInterval);
        });
        
        btnRestart.addEventListener('click', initGame);
    }
};
