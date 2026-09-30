const TrashApp = {
    title: 'Recycle Bin / Trash Sorter',
    width: 500,
    height: 600,
    init: function(container) {
        container.innerHTML = '<div style="height:100%; display:flex; flex-direction:column; background:#111;">' +
            '<div class="app-toolbar" style="display:flex; justify-content:space-between; padding:10px; background:#222; border-bottom:1px solid #444;">' +
                '<span style="color:#fff; font-weight:bold;">TRASH SORTER</span>' +
                '<span style="color:#aaa;">SCORE: <span id="trash-score" style="color:#0f0; font-weight:bold;">0</span></span>' +
                '<button id="btn-start-trash" class="app-btn" style="color:#ff4757; font-weight:bold;">Start Game</button>' +
            '</div>' +
            '<div id="trash-game-area" style="flex-grow:1; position:relative; overflow:hidden; background:#000;">' +
                '<div id="trash-bins" style="position:absolute; bottom:0; width:100%; height:80px; display:flex; justify-content:space-around; align-items:flex-end; padding-bottom:10px;">' +
                    '<div class="trash-bin" data-type="sys" style="width:80px; height:60px; background:#ff4757; border-radius:5px 5px 0 0; display:flex; align-items:center; justify-content:center; font-weight:bold; color:#fff; border:2px solid #fff;">SYS</div>' +
                    '<div class="trash-bin" data-type="img" style="width:80px; height:60px; background:#2ed573; border-radius:5px 5px 0 0; display:flex; align-items:center; justify-content:center; font-weight:bold; color:#fff; border:2px solid #fff;">IMG</div>' +
                    '<div class="trash-bin" data-type="txt" style="width:80px; height:60px; background:#1e90ff; border-radius:5px 5px 0 0; display:flex; align-items:center; justify-content:center; font-weight:bold; color:#fff; border:2px solid #fff;">TXT</div>' +
                '</div>' +
                '<div id="trash-player" style="position:absolute; bottom:90px; left:210px; width:80px; height:20px; background:rgba(255,255,255,0.3); border-radius:10px; transition:left 0.1s;"></div>' +
                '<div id="trash-game-over" style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:none; flex-direction:column; align-items:center; justify-content:center; z-index:10;">' +
                    '<h1 style="color:#ff4757; margin:0;">GAME OVER</h1>' +
                    '<p style="color:#fff;">Final Score: <span id="trash-final-score">0</span></p>' +
                '</div>' +
            '</div>' +
        '</div>';

        var gameArea = container.querySelector('#trash-game-area');
        var scoreEl = container.querySelector('#trash-score');
        var btnStart = container.querySelector('#btn-start-trash');
        var gameOverScreen = container.querySelector('#trash-game-over');
        var finalScoreEl = container.querySelector('#trash-final-score');

        var isPlaying = false;
        var score = 0;
        var fallInterval = null;
        var spawnInterval = null;
        var items = [];
        var speed = 2;
        var spawnRate = 1500;

        // Player paddle logic (to catch items before they hit the wrong bin)
        // Wait, instead of paddle, let's make the bins themselves the target!
        // You press keys (1, 2, 3) to move the "funnel" to direct the trash into a bin?
        // Or you use mouse to drag the falling files into the correct bin!
        
        container.querySelector('#trash-player').style.display = 'none'; // hide paddle, use drag instead

        function spawnItem() {
            if (!isPlaying) return;
            var types = [
                { type: 'sys', color: '#ff4757', label: '.sys' },
                { type: 'img', color: '#2ed573', label: '.png' },
                { type: 'txt', color: '#1e90ff', label: '.txt' }
            ];
            var t = types[Math.floor(Math.random() * types.length)];
            var startX = 20 + Math.random() * (gameArea.offsetWidth - 60);
            
            var el = document.createElement('div');
            el.className = 'trash-item';
            el.style.cssText = 'position:absolute; top:-40px; left:' + startX + 'px; width:40px; height:40px; background:' + t.color + '; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold; color:#fff; border-radius:4px; cursor:grab; user-select:none; border:2px solid #fff; box-shadow:0 4px 8px rgba(0,0,0,0.5); z-index:5;';
            el.innerText = t.label;
            el.dataset.type = t.type;
            gameArea.appendChild(el);
            
            var itemObj = { el: el, y: -40, type: t.type, isDragging: false };
            items.push(itemObj);

            // Dragging logic for the item
            el.addEventListener('mousedown', function(e) {
                if (!isPlaying) return;
                itemObj.isDragging = true;
                el.style.cursor = 'grabbing';
                el.style.zIndex = 100;
                
                var startMouseX = e.clientX;
                var startMouseY = e.clientY;
                var startLeft = parseInt(el.style.left);
                var startTop = itemObj.y;
                
                function onMove(moveE) {
                    var dx = moveE.clientX - startMouseX;
                    var dy = moveE.clientY - startMouseY;
                    el.style.left = (startLeft + dx) + 'px';
                    itemObj.y = startTop + dy;
                    el.style.top = itemObj.y + 'px';
                }
                
                function onUp() {
                    itemObj.isDragging = false;
                    el.style.cursor = 'grab';
                    el.style.zIndex = 5;
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup', onUp);
                }
                
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
            });
        }

        function gameLoop() {
            if (!isPlaying) return;
            
            var areaHeight = gameArea.offsetHeight;
            var bins = container.querySelectorAll('.trash-bin');
            
            for (var i = items.length - 1; i >= 0; i--) {
                var item = items[i];
                if (!item.isDragging) {
                    item.y += speed;
                    item.el.style.top = item.y + 'px';
                }
                
                // Check if it hit the bottom bin area
                if (item.y > areaHeight - 90) {
                    // Check collision with bins
                    var itemRect = item.el.getBoundingClientRect();
                    var matched = false;
                    var hitBin = false;
                    
                    bins.forEach(function(bin) {
                        var binRect = bin.getBoundingClientRect();
                        // Simple overlap check
                        if (itemRect.left < binRect.right && itemRect.right > binRect.left && 
                            itemRect.bottom > binRect.top) {
                            hitBin = true;
                            if (bin.dataset.type === item.type) {
                                matched = true;
                                if (window.SFX) window.SFX.click();
                            }
                        }
                    });
                    
                    if (hitBin) {
                        if (matched) {
                            score += 10;
                            scoreEl.innerText = score;
                            item.el.remove();
                            items.splice(i, 1);
                            
                            if (score % 50 === 0) {
                                speed += 0.5;
                                spawnRate = Math.max(500, spawnRate - 100);
                                clearInterval(spawnInterval);
                                spawnInterval = setInterval(spawnItem, spawnRate);
                            }
                        } else {
                            // Wrong bin! Game over
                            endGame();
                        }
                    } else if (item.y > areaHeight) {
                        // Missed all bins
                        endGame();
                    }
                }
            }
        }

        function startGame() {
            if (window.SFX) window.SFX.click();
            isPlaying = true;
            score = 0;
            speed = 2;
            spawnRate = 1500;
            scoreEl.innerText = score;
            gameOverScreen.style.display = 'none';
            btnStart.innerText = 'Restart';
            
            items.forEach(function(it) { it.el.remove(); });
            items = [];
            
            clearInterval(fallInterval);
            clearInterval(spawnInterval);
            
            fallInterval = setInterval(gameLoop, 30);
            spawnInterval = setInterval(spawnItem, spawnRate);
        }

        function endGame() {
            isPlaying = false;
            clearInterval(fallInterval);
            clearInterval(spawnInterval);
            gameOverScreen.style.display = 'flex';
            finalScoreEl.innerText = score;
            // flash effect
            var flash = document.createElement('div');
            flash.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:#f00; opacity:0.5; z-index:100; pointer-events:none; transition:opacity 0.5s;';
            gameArea.appendChild(flash);
            setTimeout(function() { flash.style.opacity = '0'; }, 50);
            setTimeout(function() { flash.remove(); }, 550);
        }

        btnStart.addEventListener('click', startGame);
    }
};
