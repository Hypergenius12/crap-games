// Initialize Desktop
document.addEventListener('DOMContentLoaded', () => {
    
    // Init WebGL Background
    if (window.WebGLBG) window.WebGLBG.init();
    
    // Init Audio Context on first click (browser policy)
    document.body.addEventListener('click', () => {
        if (window.SFX && !window.SFX.initialized) {
            window.SFX.init();
            window.SFX.initialized = true;
        }
    }, { once: true });

    // Shiny Parallax/Reveal Effect Tracking
    document.addEventListener('mousemove', (e) => {
        document.documentElement.style.setProperty('--mouse-x', e.clientX + 'px');
        document.documentElement.style.setProperty('--mouse-y', e.clientY + 'px');
        
        const shinyEl = e.target.closest('.desktop-icon, .app-btn, .taskbar-item, .window-btn, .calc-btn, .explorer-item');
        if (shinyEl) {
            const rect = shinyEl.getBoundingClientRect();
            shinyEl.style.setProperty('--local-mouse-x', (e.clientX - rect.left) + 'px');
            shinyEl.style.setProperty('--local-mouse-y', (e.clientY - rect.top) + 'px');
        }
    });

    // Boot Sequence
    const bootScreen = document.getElementById('boot-screen');
    setTimeout(() => {
        if (window.SFX && window.SFX.initialized) window.SFX.boot();
        bootScreen.style.opacity = '0';
        setTimeout(() => {
            bootScreen.style.display = 'none';
        }, 800);
    }, 2000);

    // Setup Clock
    const clockEl = document.getElementById('clock');
    setInterval(() => {
        const d = new Date();
        let hours = d.getHours();
        let mins = d.getMinutes();
        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; 
        mins = mins < 10 ? '0'+mins : mins;
        clockEl.innerText = hours + ':' + mins + ' ' + ampm;
    }, 1000);

    // Initialize Virtual File System
    if (window.VFS) window.VFS.init && window.VFS.init();

    const desktop = document.getElementById('desktop');
    const startMenu = document.getElementById('start-menu');

    // Glass-themed SVGs
    const svgs = {
        dir: '<svg viewBox="0 0 24 24" width="36" height="36" fill="rgba(255,255,255,0.9)"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>',
        term: '<svg viewBox="0 0 24 24" width="36" height="36" fill="rgba(255,255,255,0.7)"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8h16v10zm-2-1h-6v-2h6v2zM5.5 9.5l4 4-4 4L7 19l5.5-5.5L7 8l-1.5 1.5z"/></svg>',
        file: '<svg viewBox="0 0 24 24" width="36" height="36" fill="rgba(255,255,255,0.7)"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>',
        calc: '<svg viewBox="0 0 24 24" width="36" height="36" fill="rgba(255,255,255,0.7)"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/><path d="M7 7h10v4H7zm0 6h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zm-8 4h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>',
        sysmon: '<svg viewBox="0 0 24 24" width="36" height="36" fill="rgba(255,255,255,0.7)"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/></svg>',
        paint: '<svg viewBox="0 0 24 24" width="36" height="36" fill="rgba(255,255,255,0.7)"><path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34a.996.996 0 00-1.41 0L9 12.25 11.75 15l8.96-8.96a.996.996 0 000-1.41z"/></svg>',
        settings: '<svg viewBox="0 0 24 24" width="36" height="36" fill="rgba(255,255,255,0.7)"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>',
        trash: '<svg viewBox="0 0 24 24" width="36" height="36" fill="rgba(255,255,255,0.5)"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>'
    };

    // Define all 8 apps
    var apps = [];
    
    if (typeof ExplorerApp !== 'undefined') apps.push({ title: 'My Computer', svgIcon: svgs.dir, app: ExplorerApp });
    if (typeof CMDApp !== 'undefined') apps.push({ title: 'Command Line', svgIcon: svgs.term, app: CMDApp });
    if (typeof NotepadApp !== 'undefined') apps.push({ title: 'Notepad', svgIcon: svgs.file, app: NotepadApp });
    if (typeof CalcApp !== 'undefined') apps.push({ title: 'Calculator', svgIcon: svgs.calc, app: CalcApp });
    if (typeof SysMonApp !== 'undefined') apps.push({ title: 'SysMon', svgIcon: svgs.sysmon, app: SysMonApp });
    if (typeof PaintApp !== 'undefined') apps.push({ title: 'Paint', svgIcon: svgs.paint, app: PaintApp });
    if (typeof SettingsApp !== 'undefined') apps.push({ title: 'Settings', svgIcon: svgs.settings, app: SettingsApp });
    if (typeof TrashApp !== 'undefined') apps.push({ title: 'Recycle Bin', svgIcon: svgs.trash, app: TrashApp });

    console.log('[TitaniumOS] Loaded ' + apps.length + ' apps');

    // Setup Desktop as a flex container
    desktop.style.display = 'flex';
    desktop.style.flexDirection = 'column';
    desktop.style.flexWrap = 'wrap';
    desktop.style.alignContent = 'flex-start';
    desktop.style.gap = '10px';
    desktop.style.padding = '10px';

    apps.forEach(function(app, index) {
        // Desktop Icon
        var icon = document.createElement('div');
        icon.className = 'desktop-icon';
        icon.style.position = 'relative'; // Override absolute from CSS
        icon.innerHTML = '<div class="svg-icon" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5)); pointer-events:none;">' + app.svgIcon + '</div>' +
            '<div class="icon-label" style="pointer-events:none;">' + app.title + '</div>';

        // Dragging Logic
        var isDragging = false;
        var startX, startY, initialTop, initialLeft;

        icon.addEventListener('mousedown', function(e) {
            if (e.button !== 0) return;
            isDragging = false;
            startX = e.clientX;
            startY = e.clientY;
            initialTop = parseInt(icon.style.top) || icon.offsetTop;
            initialLeft = parseInt(icon.style.left) || icon.offsetLeft;
            icon.style.zIndex = 100;
            
            document.querySelectorAll('.desktop-icon').forEach(function(el) { el.classList.remove('active-icon'); });
            icon.classList.add('active-icon');
            
            var onMouseMove = function(moveEvent) {
                var dx = moveEvent.clientX - startX;
                var dy = moveEvent.clientY - startY;
                if (!isDragging && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
                    isDragging = true;
                    icon.style.position = 'absolute';
                    // We need to set top/left now so the movement is smooth from the original spot
                    icon.style.top = initialTop + 'px';
                    icon.style.left = initialLeft + 'px';
                }
                if (isDragging) {
                    icon.style.top = (initialTop + dy) + 'px';
                    icon.style.left = (initialLeft + dx) + 'px';
                }
            };
            
            var onMouseUp = function() {
                icon.style.zIndex = '';
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                if (isDragging) {
                    if (icon.style.position !== 'absolute') {
                        icon.style.position = 'absolute';
                    }
                    var finalTop = parseInt(icon.style.top);
                    var finalLeft = parseInt(icon.style.left);
                    finalTop = Math.max(10, Math.round((finalTop - 10) / 10) * 10 + 10);
                    finalLeft = Math.max(10, Math.round((finalLeft - 10) / 10) * 10 + 10);
                    icon.style.top = finalTop + 'px';
                    icon.style.left = finalLeft + 'px';
                }
            };
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        icon.addEventListener('click', function(e) {
            if (isDragging) {
                e.preventDefault();
                e.stopPropagation();
            }
        });

        icon.addEventListener('dblclick', function(e) { 
            if (isDragging) return;
            if (window.SFX) window.SFX.click();
            if (app.app) {
                window.WM.createWindow(app.app);
            } else {
                alert('Recycle Bin is empty.');
            }
        });

        // Icon Context Menu
        icon.addEventListener('contextmenu', function(e) {
            e.stopPropagation();
            e.preventDefault();
            if (window.ContextMenu) {
                window.ContextMenu.show(e.clientX, e.clientY, [
                    { label: 'Open', action: function() { if (app.app) window.WM.createWindow(app.app); } },
                    { separator: true },
                    { label: 'Properties', action: function() { alert(app.title + ' Properties'); } }
                ]);
            }
        });

        desktop.appendChild(icon);

        // Start Menu Item
        var smItem = document.createElement('div');
        smItem.className = 'start-menu-item';
        var smallIcon = app.svgIcon.replace('width="36"', 'width="20"').replace('height="36"', 'height="20"');
        smItem.innerHTML = '<div class="svg-icon" style="width: 24px; height: 24px;">' + smallIcon + '</div>' +
            '<span>' + app.title + '</span>';
        smItem.addEventListener('click', function() {
            if (window.SFX) window.SFX.click();
            if (app.app) window.WM.createWindow(app.app);
            startMenu.classList.remove('show');
            document.getElementById('start-button').classList.remove('active');
        });
        document.getElementById('start-menu-items').appendChild(smItem);
    });

    // Start button click
    var startBtn = document.getElementById('start-button');
    startBtn.addEventListener('click', function(e) {
        if (window.SFX) window.SFX.click();
        startMenu.classList.toggle('show');
        startBtn.classList.toggle('active');
        e.stopPropagation();
    });

    // Hide start menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!startMenu.contains(e.target) && e.target !== startBtn) {
            startMenu.classList.remove('show');
            startBtn.classList.remove('active');
        }
    });

    // Desktop Context Menu
    desktop.addEventListener('contextmenu', function(e) {
        if (e.target !== desktop) return;
        e.preventDefault();
        if (window.ContextMenu) {
            window.ContextMenu.show(e.clientX, e.clientY, [
                { label: 'Refresh Desktop', action: function() { window.location.reload(); } },
                { separator: true },
                { label: 'System Properties', action: function() { if (typeof SysMonApp !== 'undefined') window.WM.createWindow(SysMonApp); } }
            ]);
        }
    });

});
