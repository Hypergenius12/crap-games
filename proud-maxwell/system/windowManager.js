const WindowManager = {
    windows: [],
    zIndexCount: 1000,
    container: null,
    taskbarApps: null,

    init: function() {
        this.container = document.getElementById('window-container');
        this.taskbarApps = document.getElementById('taskbar-apps');
    },

    createWindow: function(app, initialData = null) {
        if (!this.container) this.init();

        const winId = 'win-' + Math.random().toString(36).substr(2, 9);
        const win = document.createElement('div');
        win.className = 'os-window';
        win.id = winId;
        
        const offset = (this.windows.length * 20) % 100;
        win.style.left = (150 + offset) + 'px';
        win.style.top = (50 + offset) + 'px';
        
        win.style.width = app.width + 'px';
        win.style.height = app.height + 'px';
        win.style.zIndex = ++this.zIndexCount;

        win.innerHTML = `
            <div class="window-header">
                <div class="window-title">${app.title}</div>
                <div class="window-controls">
                    <div class="window-btn btn-min"><svg viewBox="0 0 14 14" width="14" height="14" fill="currentColor"><path d="M3 7h8v1H3z"/></svg></div>
                    <div class="window-btn btn-max"><svg viewBox="0 0 14 14" width="14" height="14" fill="currentColor" stroke="currentColor" stroke-width="0.5"><path d="M3 3h8v8H3z" fill="none"/></svg></div>
                    <div class="window-btn btn-close"><svg viewBox="0 0 14 14" width="14" height="14" fill="currentColor"><path d="M4 3L3 4l4 4-4 4 1 1 4-4 4 4 1-1-4-4 4-4-1-1-4 4-4-4z"/></svg></div>
                </div>
            </div>
            <div class="window-content"></div>
            <div class="resize-handle"></div>
        `;

        this.container.appendChild(win);
        
        const content = win.querySelector('.window-content');
        if (app.init) {
            app.init(content, win, winId, initialData);
        }

        const winObj = {
            id: winId,
            element: win,
            app: app,
            isMinimized: false,
            taskItem: null
        };
        
        this.windows.push(winObj);

        // Add to taskbar
        const taskItem = document.createElement('div');
        taskItem.className = 'taskbar-item active';
        let svg = '';
        if (app.svgIcon) {
            svg = `<div class="svg-icon" style="width:16px; height:16px; display:flex; align-items:center;">${app.svgIcon.replace('width="36"', 'width="16"').replace('height="36"', 'height="16"').replace('width="32"', 'width="16"').replace('height="32"', 'height="16"')}</div>`;
        }
        taskItem.innerHTML = `${svg} <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${app.title}</span>`;
        this.taskbarApps.appendChild(taskItem);
        winObj.taskItem = taskItem;

        // Taskbar click toggles minimize
        taskItem.addEventListener('click', () => {
            if (window.SFX) window.SFX.click();
            if (winObj.isMinimized) {
                win.classList.remove('minimized');
                winObj.isMinimized = false;
                this.focusWindow(winId);
            } else {
                if (win.style.zIndex == this.zIndexCount) {
                    win.classList.add('minimized');
                    winObj.isMinimized = true;
                    taskItem.classList.remove('active');
                } else {
                    this.focusWindow(winId);
                }
            }
        });

        if (window.SFX) window.SFX.open();

        this.setupDragging(win, win.querySelector('.window-header'));
        this.setupResizing(win, win.querySelector('.resize-handle'));
        
        win.addEventListener('mousedown', () => this.focusWindow(winId));

        win.querySelector('.btn-close').addEventListener('click', () => {
            if (window.SFX) window.SFX.close();
            this.closeWindow(winId);
        });

        win.querySelector('.btn-min').addEventListener('click', (e) => {
            e.stopPropagation();
            win.classList.add('minimized');
            winObj.isMinimized = true;
            taskItem.classList.remove('active');
            if (window.SFX) window.SFX.click();
        });

        let isMaximized = false;
        let preMaxState = { top: 0, left: 0, width: 0, height: 0 };
        
        const toggleMaximize = (e) => {
            if (e) e.stopPropagation();
            if (!isMaximized) {
                preMaxState = {
                    top: win.style.top, left: win.style.left,
                    width: win.style.width, height: win.style.height
                };
                win.style.top = '0px';
                win.style.left = '0px';
                win.style.width = '100vw';
                win.style.height = 'calc(100vh - 36px)';
            } else {
                win.style.top = preMaxState.top;
                win.style.left = preMaxState.left;
                win.style.width = preMaxState.width;
                win.style.height = preMaxState.height;
            }
            isMaximized = !isMaximized;
            if (window.SFX) window.SFX.click();
        };

        win.querySelector('.btn-max').addEventListener('click', toggleMaximize);
        win.querySelector('.window-header').addEventListener('dblclick', toggleMaximize);

        this.focusWindow(winId);
    },

    focusWindow: function(winId) {
        const win = this.windows.find(w => w.id === winId);
        if (!win) return;
        
        win.element.style.zIndex = ++this.zIndexCount;
        
        this.windows.forEach(w => {
            if (w.id === winId) {
                w.element.classList.remove('inactive');
                w.taskItem.classList.add('active');
            } else {
                w.element.classList.add('inactive');
                w.taskItem.classList.remove('active');
            }
        });
    },

    closeWindow: function(winId) {
        const winIndex = this.windows.findIndex(w => w.id === winId);
        if (winIndex === -1) return;
        
        const win = this.windows[winIndex];
        win.element.remove();
        win.taskItem.remove();
        this.windows.splice(winIndex, 1);
        
        if (this.windows.length > 0) {
            const nextWin = this.windows[this.windows.length - 1];
            if (!nextWin.isMinimized) this.focusWindow(nextWin.id);
        }
    },

    setupDragging: function(win, handle) {
        let isDragging = false;
        let startX, startY, startLeft, startTop;

        handle.addEventListener('pointerdown', (e) => {
            if (e.target.closest('.window-controls')) return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(win.style.left || 0) || 0;
            startTop = parseInt(win.style.top || 0) || 0;
            handle.setPointerCapture(e.pointerId);
        });

        handle.addEventListener('pointermove', (e) => {
            if (!isDragging) return;
            let newX = startLeft + (e.clientX - startX);
            let newY = startTop + (e.clientY - startY);
            
            // Constrain to screen so we don't lose the window header
            if (newY < 0) newY = 0;
            if (newY > window.innerHeight - 40) newY = window.innerHeight - 40;
            if (newX < -win.offsetWidth + 40) newX = -win.offsetWidth + 40;
            if (newX > window.innerWidth - 40) newX = window.innerWidth - 40;
            
            win.style.left = newX + 'px';
            win.style.top = newY + 'px';
        });

        handle.addEventListener('pointerup', (e) => {
            isDragging = false;
            handle.releasePointerCapture(e.pointerId);
        });
    },

    setupResizing: function(win, handle) {
        let isResizing = false;
        let startX, startY, startWidth, startHeight;

        handle.addEventListener('pointerdown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = parseInt(win.style.width || 0) || 0;
            startHeight = parseInt(win.style.height || 0) || 0;
            handle.setPointerCapture(e.pointerId);
            e.stopPropagation();
        });

        handle.addEventListener('pointermove', (e) => {
            if (!isResizing) return;
            const newWidth = Math.max(200, startWidth + (e.clientX - startX));
            const newHeight = Math.max(100, startHeight + (e.clientY - startY));
            win.style.width = newWidth + 'px';
            win.style.height = newHeight + 'px';
        });

        handle.addEventListener('pointerup', (e) => {
            isResizing = false;
            handle.releasePointerCapture(e.pointerId);
        });
    }
};

window.WM = WindowManager;

document.addEventListener('DOMContentLoaded', () => {
    window.WM.init();
});
