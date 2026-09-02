window.ContextMenu = {
    el: null,
    init: function() {
        this.el = document.createElement('div');
        this.el.className = 'context-menu';
        document.body.appendChild(this.el);
        
        document.addEventListener('click', (e) => {
            if (!this.el.contains(e.target)) {
                this.hide();
            }
        });
        
        // Hide on scroll or window blur
        window.addEventListener('blur', () => this.hide());
    },
    
    show: function(x, y, items) {
        if (!this.el) this.init();
        if (window.SFX) window.SFX.click();
        
        this.el.innerHTML = '';
        items.forEach(item => {
            if (item.separator) {
                const sep = document.createElement('div');
                sep.className = 'context-menu-separator';
                this.el.appendChild(sep);
            } else {
                const btn = document.createElement('div');
                btn.className = 'context-menu-item';
                btn.innerText = item.label;
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (window.SFX) window.SFX.click();
                    this.hide();
                    if (item.action) item.action();
                });
                this.el.appendChild(btn);
            }
        });
        
        this.el.style.display = 'flex';
        
        // Boundary check to keep menu on screen
        const rect = this.el.getBoundingClientRect();
        let posX = x;
        let posY = y;
        
        if (posX + rect.width > window.innerWidth) posX = window.innerWidth - rect.width;
        if (posY + rect.height > window.innerHeight) posY = window.innerHeight - rect.height;
        
        this.el.style.left = posX + 'px';
        this.el.style.top = posY + 'px';
    },
    
    hide: function() {
        if (this.el) this.el.style.display = 'none';
    }
};
