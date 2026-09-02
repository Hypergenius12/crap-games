const ExplorerApp = {
    title: 'My Computer / File Sweeper',
    width: 600,
    height: 520,
    init: function(container, windowEl, winId) {
        container.innerHTML = `
            <div style="height:100%; display:flex; flex-direction:column; background:rgba(0,0,0,0.6); color:var(--text-main); position:relative;">
                
                <!-- STANDARD EXPLORER -->
                <div id="standard-view" style="display:flex; flex-direction:column; height:100%;">
                    <div class="app-toolbar" style="background:rgba(255,255,255,0.05); padding:8px; display:flex; align-items:center;">
                        <button class="app-btn btn-up">&uarr; Up</button>
                        <input type="text" class="path-input" style="flex-grow:1; margin:0 10px; background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.2); color:#fff; padding:4px 8px; font-family:monospace;" readonly>
                        <button class="app-btn btn-new-folder">New Folder</button>
                        <button class="app-btn btn-new-file">New File</button>
                        <div style="width:1px; background:rgba(255,255,255,0.2); margin:0 8px; height:20px;"></div>
                        <button id="btn-play-sweeper" class="app-btn" style="color:var(--accent); font-weight:bold;">Play File Sweeper</button>
                    </div>
                    <div class="items-container" style="flex-grow:1; overflow-y:auto; padding:10px; display:flex; flex-wrap:wrap; align-content:flex-start; gap:10px;"></div>
                </div>

                <!-- SWEEPER GAME -->
                <div id="sweeper-view" style="display:none; flex-direction:column; height:100%; background:#1e1e1e;">
                    <div class="app-toolbar" style="background:#2d2d2d; padding:10px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #444;">
                        <button id="btn-exit-sweeper" class="app-btn">&larr; Exit</button>
                        <div style="display:flex; align-items:center; gap:20px; font-family:monospace; font-size:18px; color:#ff4757;">
                            <div>FLAGS: <span id="sweep-flags">40</span></div>
                            <button id="btn-restart-sweep" style="font-size:24px; background:none; border:none; cursor:pointer;">&#128578;</button>
                            <div>TIME: <span id="sweep-time">0</span></div>
                        </div>
                        <div style="width:60px;"></div>
                    </div>
                    
                    <div style="flex-grow:1; display:flex; align-items:center; justify-content:center; padding:10px;">
                        <div id="sweep-grid" style="display:grid; grid-template-columns:repeat(16, 24px); gap:1px; background:#444; padding:2px; border:2px solid #555;">
                            <!-- Cells -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        const stdView = container.querySelector('#standard-view');
        const sweepView = container.querySelector('#sweeper-view');
        const btnPlaySweep = container.querySelector('#btn-play-sweeper');
        const btnExitSweep = container.querySelector('#btn-exit-sweeper');

        // --- STANDARD EXPLORER LOGIC ---
        let currentPath = '/USERS/GUEST';
        const pathInput = container.querySelector('.path-input');
        const itemsContainer = container.querySelector('.items-container');
        pathInput.value = currentPath;

        const svgs = {
            dir: '<svg viewBox="0 0 24 24" width="48" height="48" fill="rgba(255,255,255,0.8)"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>',
            file: '<svg viewBox="0 0 24 24" width="48" height="48" fill="rgba(255,255,255,0.8)"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>',
            img: '<svg viewBox="0 0 24 24" width="48" height="48" fill="rgba(255,255,255,0.8)"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>'
        };

        const renderItems = () => {
            if (!window.VFS) return;
            itemsContainer.innerHTML = '';
            const list = window.VFS.readDir(currentPath);
            
            list.forEach(item => {
                const isDir = item.type === 'dir';
                const el = document.createElement('div');
                el.className = 'explorer-item';
                el.style.width = '80px'; el.style.display = 'flex'; el.style.flexDirection = 'column'; el.style.alignItems = 'center'; el.style.cursor = 'pointer'; el.style.padding = '8px'; el.style.borderRadius = '4px';
                
                let icon = isDir ? svgs.dir : (item.name.endsWith('.png') ? svgs.img : svgs.file);
                
                el.innerHTML = `
                    <div style="pointer-events:none;">${icon}</div>
                    <div style="font-size:12px; text-align:center; word-break:break-all; pointer-events:none; margin-top:4px;">${item.name}</div>
                `;

                el.addEventListener('dblclick', () => {
                    if (window.SFX) window.SFX.click();
                    if (isDir) {
                        currentPath = window.VFS.resolvePath(currentPath, item.name);
                        pathInput.value = currentPath;
                        renderItems();
                    } else {
                        const fullPath = window.VFS.resolvePath(currentPath, item.name);
                        if (item.name.endsWith('.png') && window.ImageViewerApp) {
                            window.WM.createWindow(window.ImageViewerApp, { path: fullPath });
                        } else if (window.NotepadApp) {
                            window.WM.createWindow(window.NotepadApp, { path: fullPath });
                        }
                    }
                });
                itemsContainer.appendChild(el);
            });
        };

        container.querySelector('.btn-up').addEventListener('click', () => {
            if (window.SFX) window.SFX.click();
            if (currentPath !== '/') {
                currentPath = window.VFS.resolvePath(currentPath, '..');
                pathInput.value = currentPath;
                renderItems();
            }
        });

        // --- SWEEPER LOGIC ---
        const gridEl = container.querySelector('#sweep-grid');
        const flagEl = container.querySelector('#sweep-flags');
        const timeEl = container.querySelector('#sweep-time');
        const btnFace = container.querySelector('#btn-restart-sweep');
        
        const COLS = 16;
        const ROWS = 16;
        const MINES = 40;
        
        let board = [];
        let gameOver = false;
        let firstClick = true;
        let flagsLeft = MINES;
        let timer = 0;
        let timerInterval = null;

        const initSweeper = () => {
            clearInterval(timerInterval);
            timer = 0;
            timeEl.innerText = timer;
            flagsLeft = MINES;
            flagEl.innerText = flagsLeft;
            gameOver = false;
            firstClick = true;
            btnFace.innerHTML = '&#128578;'; // Smile
            
            board = [];
            gridEl.innerHTML = '';
            
            for(let r=0; r<ROWS; r++) {
                let row = [];
                for(let c=0; c<COLS; c++) {
                    const cell = document.createElement('div');
                    cell.style.width = '24px';
                    cell.style.height = '24px';
                    cell.style.backgroundColor = '#bdbdbd';
                    cell.style.borderTop = '2px solid #fff';
                    cell.style.borderLeft = '2px solid #fff';
                    cell.style.borderBottom = '2px solid #7b7b7b';
                    cell.style.borderRight = '2px solid #7b7b7b';
                    cell.style.display = 'flex';
                    cell.style.alignItems = 'center';
                    cell.style.justifyContent = 'center';
                    cell.style.fontWeight = 'bold';
                    cell.style.cursor = 'pointer';
                    cell.style.userSelect = 'none';
                    cell.style.boxSizing = 'border-box';
                    cell.style.fontSize = '14px';

                    cell.addEventListener('mousedown', (e) => {
                        if (gameOver) return;
                        if (e.button === 0) handleLeftClick(r, c);
                        if (e.button === 2) handleRightClick(r, c);
                    });
                    
                    gridEl.appendChild(cell);
                    
                    row.push({
                        r, c, el: cell,
                        isMine: false, isOpen: false, isFlagged: false, neighborMines: 0
                    });
                }
                board.push(row);
            }
        };

        const placeMines = (excludeR, excludeC) => {
            let placed = 0;
            while(placed < MINES) {
                let r = Math.floor(Math.random() * ROWS);
                let c = Math.floor(Math.random() * COLS);
                // Dont place on first click or already a mine
                if (!board[r][c].isMine && !(Math.abs(r - excludeR) <= 1 && Math.abs(c - excludeC) <= 1)) {
                    board[r][c].isMine = true;
                    placed++;
                }
            }
            
            // Calculate neighbors
            for(let r=0; r<ROWS; r++) {
                for(let c=0; c<COLS; c++) {
                    if (board[r][c].isMine) continue;
                    let count = 0;
                    for(let dr=-1; dr<=1; dr++) {
                        for(let dc=-1; dc<=1; dc++) {
                            let nr = r + dr, nc = c + dc;
                            if (nr>=0 && nr<ROWS && nc>=0 && nc<COLS && board[nr][nc].isMine) {
                                count++;
                            }
                        }
                    }
                    board[r][c].neighborMines = count;
                }
            }
        };

        const numColors = ['', '#0000FF', '#008000', '#FF0000', '#000080', '#800000', '#008080', '#000000', '#808080'];

        const openCell = (r, c) => {
            let cell = board[r][c];
            if (cell.isOpen || cell.isFlagged) return;
            
            cell.isOpen = true;
            cell.el.style.border = '1px solid #7b7b7b';
            cell.el.style.backgroundColor = '#bdbdbd';
            
            if (cell.isMine) {
                cell.el.innerHTML = '&#128163;'; // Bomb
                cell.el.style.backgroundColor = 'red';
                return;
            }
            
            if (cell.neighborMines > 0) {
                cell.el.innerText = cell.neighborMines;
                cell.el.style.color = numColors[cell.neighborMines];
            } else {
                // Flood fill
                for(let dr=-1; dr<=1; dr++) {
                    for(let dc=-1; dc<=1; dc++) {
                        let nr = r + dr, nc = c + dc;
                        if (nr>=0 && nr<ROWS && nc>=0 && nc<COLS) {
                            openCell(nr, nc);
                        }
                    }
                }
            }
        };

        const checkWin = () => {
            let closedNonMines = 0;
            for(let r=0; r<ROWS; r++) {
                for(let c=0; c<COLS; c++) {
                    if (!board[r][c].isOpen && !board[r][c].isMine) closedNonMines++;
                }
            }
            if (closedNonMines === 0) {
                gameOver = true;
                clearInterval(timerInterval);
                btnFace.innerHTML = '&#128526;'; // Cool face
                flagEl.innerText = '0';
                alert("YOU WIN! System completely defragged.");
            }
        };

        const handleLeftClick = (r, c) => {
            if (firstClick) {
                firstClick = false;
                placeMines(r, c);
                timerInterval = setInterval(() => {
                    timer++;
                    timeEl.innerText = timer;
                }, 1000);
            }
            
            let cell = board[r][c];
            if (cell.isFlagged) return;
            
            if (cell.isMine) {
                // Lose
                gameOver = true;
                clearInterval(timerInterval);
                btnFace.innerHTML = '&#128565;'; // Dead face
                for(let rr=0; rr<ROWS; rr++) {
                    for(let cc=0; cc<COLS; cc++) {
                        if (board[rr][cc].isMine) {
                            openCell(rr, cc);
                        }
                    }
                }
            } else {
                openCell(r, c);
                if (window.SFX) window.SFX.click();
                checkWin();
            }
        };

        const handleRightClick = (r, c) => {
            let cell = board[r][c];
            if (cell.isOpen) return;
            
            if (window.SFX) window.SFX.click();

            if (cell.isFlagged) {
                cell.isFlagged = false;
                cell.el.innerHTML = '';
                flagsLeft++;
            } else {
                if (flagsLeft > 0) {
                    cell.isFlagged = true;
                    cell.el.innerHTML = '<span style="color:red;">&#9873;</span>'; // Flag
                    flagsLeft--;
                }
            }
            flagEl.innerText = flagsLeft;
        };

        // Prevent context menu on grid
        gridEl.addEventListener('contextmenu', e => e.preventDefault());
        btnFace.addEventListener('click', initSweeper);

        // View Toggling
        btnPlaySweep.addEventListener('click', () => {
            if (window.SFX) window.SFX.click();
            stdView.style.display = 'none';
            sweepView.style.display = 'flex';
            initSweeper();
        });

        btnExitSweep.addEventListener('click', () => {
            if (window.SFX) window.SFX.click();
            clearInterval(timerInterval);
            sweepView.style.display = 'none';
            stdView.style.display = 'flex';
            renderItems();
        });

        renderItems();
    }
};
