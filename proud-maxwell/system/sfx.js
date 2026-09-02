const SFX = {
    ctx: null,
    init: function() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    playTone: function(freq, type, duration, vol, endFreq = null) {
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        if (endFreq) {
            osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + duration);
        }
        
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },
    click: function() {
        this.init();
        this.playTone(800, 'sine', 0.05, 0.05);
    },
    open: function() {
        this.init();
        this.playTone(400, 'triangle', 0.1, 0.05, 800);
    },
    close: function() {
        this.init();
        this.playTone(800, 'triangle', 0.1, 0.05, 400);
    },
    boot: function() {
        this.init();
        // Epic boot chord (C Major 7)
        this.playTone(261.63, 'sine', 3.0, 0.1); // C4
        this.playTone(329.63, 'sine', 3.0, 0.1); // E4
        this.playTone(392.00, 'sine', 3.0, 0.1); // G4
        this.playTone(493.88, 'sine', 3.0, 0.1); // B4
    }
};

window.SFX = SFX;
