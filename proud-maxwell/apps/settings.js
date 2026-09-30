const SettingsApp = {
    title: 'Settings',
    width: 450,
    height: 420,
    init: function(container) {
        container.innerHTML = '<div style="height:100%; display:flex; flex-direction:column; background:rgba(0,0,0,0.4); color:var(--text-main);">' +

            '<div id="settings-view" style="display:flex; flex-direction:column; height:100%; padding:20px; box-sizing:border-box;">' +
                '<div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px; margin-bottom:15px;">' +
                    '<h2 style="margin:0; font-weight:400;">Personalization</h2>' +
                    '<button id="btn-play-memory" class="app-btn" style="color:var(--accent); font-weight:bold;">Play Memory</button>' +
                '</div>' +
                '<div>' +
                    '<label style="display:block; margin-bottom:8px; font-size:13px; color:rgba(255,255,255,0.8);">Accent Color</label>' +
                    '<div style="display:flex; gap:10px;">' +
                        '<div class="color-swatch" data-color="#007acc" style="width:30px; height:30px; border-radius:50%; cursor:pointer; background:#007acc; border:2px solid #fff;"></div>' +
                        '<div class="color-swatch" data-color="#2ed573" style="width:30px; height:30px; border-radius:50%; cursor:pointer; background:#2ed573; border:2px solid transparent;"></div>' +
                        '<div class="color-swatch" data-color="#ff4757" style="width:30px; height:30px; border-radius:50%; cursor:pointer; background:#ff4757; border:2px solid transparent;"></div>' +
                        '<div class="color-swatch" data-color="#ffa502" style="width:30px; height:30px; border-radius:50%; cursor:pointer; background:#ffa502; border:2px solid transparent;"></div>' +
                        '<div class="color-swatch" data-color="#9c88ff" style="width:30px; height:30px; border-radius:50%; cursor:pointer; background:#9c88ff; border:2px solid transparent;"></div>' +
                    '</div>' +
                '</div>' +
                '<div style="margin-top:25px;">' +
                    '<label style="display:block; margin-bottom:8px; font-size:13px; color:rgba(255,255,255,0.8);">Background Animation Speed</label>' +
                    '<input type="range" id="setting-speed" min="0" max="50" value="10" style="width:100%;">' +
                '</div>' +
                '<div style="margin-top:25px;">' +
                    '<label style="display:block; margin-bottom:8px; font-size:13px; color:rgba(255,255,255,0.8);">Glass Blur Amount</label>' +
                    '<input type="range" id="setting-blur" min="0" max="40" value="20" style="width:100%;">' +
                '</div>' +
                '<div style="margin-top:auto; padding-top:20px; border-top:1px solid rgba(255,255,255,0.1); text-align:right;">' +
                    '<button id="btn-apply" class="app-btn">Apply Settings</button>' +
                '</div>' +
            '</div>' +

            '<div id="memory-view" style="display:none; flex-direction:column; height:100%;">' +
                '<div class="app-toolbar" style="background:rgba(255,255,255,0.05); padding:8px; display:flex; align-items:center; justify-content:space-between;">' +
                    '<button id="btn-back-settings" class="app-btn">&larr; Settings</button>' +
                    '<span style="font-weight:bold; color:#fff;">MEMORY MATCH</span>' +
                    '<div style="font-size:12px;">MOVES: <span id="mem-moves" style="color:var(--accent); font-weight:bold;">0</span> | BEST: <span id="mem-best" style="color:#2ed573; font-weight:bold;">--</span></div>' +
                '</div>' +
                '<div id="mem-grid" style="flex-grow:1; display:grid; grid-template-columns:repeat(4,1fr); gap:8px; padding:15px;"></div>' +
            '</div>' +

        '</div>';

        var settingsView = container.querySelector('#settings-view');
        var memoryView = container.querySelector('#memory-view');

        // --- SETTINGS LOGIC ---
        var swatches = container.querySelectorAll('.color-swatch');
        var selectedColor = '#007acc';

        swatches.forEach(function(sw) {
            sw.addEventListener('click', function(e) {
                swatches.forEach(function(s) { s.style.border = '2px solid transparent'; });
                e.target.style.border = '2px solid #fff';
                selectedColor = e.target.dataset.color;
                if (window.SFX) window.SFX.click();
            });
        });

        container.querySelector('#btn-apply').addEventListener('click', function() {
            if (window.SFX) window.SFX.click();
            document.documentElement.style.setProperty('--accent', selectedColor);
            var blurVal = container.querySelector('#setting-blur').value;
            document.documentElement.style.setProperty('--glass-blur', 'blur(' + blurVal + 'px) saturate(130%)');
            var speedVal = container.querySelector('#setting-speed').value;
            if (window.WebGLBG) window.WebGLBG.speedMultiplier = speedVal / 10;
        });

        // --- MEMORY GAME ---
        var memGrid = container.querySelector('#mem-grid');
        var movesEl = container.querySelector('#mem-moves');
        var bestEl = container.querySelector('#mem-best');
        var bestScore = localStorage.getItem('titanium_memory_best');
        if (bestScore) bestEl.innerText = bestScore;

        var memColors = ['#ff4757','#2ed573','#1e90ff','#ffa502','#9c88ff','#ff6b81','#00d2d3','#f368e0'];
        var cards = [];
        var flipped = [];
        var matched = 0;
        var moves = 0;
        var locked = false;

        function initMemory() {
            memGrid.innerHTML = '';
            cards = [];
            flipped = [];
            matched = 0;
            moves = 0;
            locked = false;
            movesEl.innerText = '0';

            // Create pairs and shuffle
            var deck = [];
            for (var i = 0; i < 8; i++) {
                deck.push({ color: memColors[i], id: i });
                deck.push({ color: memColors[i], id: i });
            }
            // Fisher-Yates shuffle
            for (var j = deck.length - 1; j > 0; j--) {
                var k = Math.floor(Math.random() * (j + 1));
                var temp = deck[j];
                deck[j] = deck[k];
                deck[k] = temp;
            }

            deck.forEach(function(card, idx) {
                var el = document.createElement('div');
                el.style.cssText = 'perspective: 1000px; min-height:80px; cursor:pointer;';
                el.dataset.idx = idx;
                el.dataset.id = card.id;
                el.dataset.color = card.color;
                el.dataset.state = 'hidden';

                el.innerHTML = '<div class="card-inner" style="position:relative; width:100%; height:100%; transition:transform 0.4s; transform-style:preserve-3d;">' +
                    '<div class="card-front" style="position:absolute; width:100%; height:100%; backface-visibility:hidden; background:rgba(0,0,0,0.3); border:2px solid rgba(255,255,255,0.1); border-radius:8px; display:flex; align-items:center; justify-content:center; box-sizing:border-box;">' +
                        '<span style="font-size:24px; color:rgba(255,255,255,0.2); font-weight:bold;">?</span>' +
                    '</div>' +
                    '<div class="card-back" style="position:absolute; width:100%; height:100%; backface-visibility:hidden; background:' + card.color + '; border:2px solid #fff; border-radius:8px; transform:rotateY(180deg); box-shadow:0 0 15px ' + card.color + '; box-sizing:border-box;">' +
                    '</div>' +
                '</div>';

                el.addEventListener('click', function() {
                    if (locked) return;
                    if (el.dataset.state !== 'hidden') return;

                    if (window.SFX) window.SFX.click();

                    var inner = el.querySelector('.card-inner');
                    inner.style.transform = 'rotateY(180deg) scale(1.05)';
                    el.dataset.state = 'flipped';
                    flipped.push(el);

                    if (flipped.length === 2) {
                        moves++;
                        movesEl.innerText = moves;
                        locked = true;

                        var a = flipped[0];
                        var b = flipped[1];

                        if (a.dataset.id === b.dataset.id) {
                            // Match!
                            a.dataset.state = 'matched';
                            b.dataset.state = 'matched';
                            setTimeout(function() {
                                a.querySelector('.card-inner').style.transform = 'rotateY(180deg) scale(0.9)';
                                b.querySelector('.card-inner').style.transform = 'rotateY(180deg) scale(0.9)';
                                a.style.opacity = '0.5';
                                b.style.opacity = '0.5';
                                matched++;
                                flipped = [];
                                locked = false;

                                if (matched === 8) {
                                    // Win!
                                    if (!bestScore || moves < parseInt(bestScore)) {
                                        bestScore = moves;
                                        localStorage.setItem('titanium_memory_best', bestScore);
                                        bestEl.innerText = bestScore;
                                    }
                                    setTimeout(function() {
                                        alert('You won in ' + moves + ' moves!');
                                        initMemory();
                                    }, 500);
                                }
                            }, 500);
                        } else {
                            // No match - flip back
                            setTimeout(function() {
                                a.querySelector('.card-inner').style.transform = 'rotateY(0deg) scale(1)';
                                b.querySelector('.card-inner').style.transform = 'rotateY(0deg) scale(1)';
                                a.dataset.state = 'hidden';
                                b.dataset.state = 'hidden';
                                flipped = [];
                                locked = false;
                            }, 800);
                        }
                    }
                });

                memGrid.appendChild(el);
                cards.push(el);
            });
        }

        container.querySelector('#btn-play-memory').addEventListener('click', function() {
            if (window.SFX) window.SFX.click();
            settingsView.style.display = 'none';
            memoryView.style.display = 'flex';
            initMemory();
        });

        container.querySelector('#btn-back-settings').addEventListener('click', function() {
            if (window.SFX) window.SFX.click();
            memoryView.style.display = 'none';
            settingsView.style.display = 'flex';
        });
    }
};
