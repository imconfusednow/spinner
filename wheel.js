export class Wheel {
    COLOURS = ["#dc2626", "#ea580c", "#86198f", "#14532d", "#1d4ed8", "#ec4899", "#22d3ee", "#0d9488", "#84cc16", "#fde047"];
    DECELERATION = 0.993;
    FULLROTATION = Math.PI * 2;
    CLICKDURATION = 0.5;
    AUDIOCTX = new (window.AudioContext || window.webkitAudioContext)();
    constructor(ctx, radius, options, tctx, clickSound, resultModal) {
        this.ctx = ctx;
        this.radius = radius;
        this.buttonSize = 40;
        this.gap = 12;
        this.setupButton();
        this.rotation = 0;
        this.speed = 0;
        this.x = this.ctx.canvas.width / 2;
        this.y = this.ctx.canvas.height / 2;
        this.options = options;
        this.span = this.calculateSpan()
        this.tempCtx = tctx;
        //Keeps the sound buffer 'warm' so sound don't become quiet
        const testSound = this.loadSound('silence.mp3');
        setInterval(()=>this.playSound(testSound, 0.0001), 200);
        this.clickSound = this.loadSound(clickSound);
        this.resultModal = resultModal;
        this.clickTimer = 0;
        this.spinning = false;
        this.hadBonus = true;
        this.currentSelection = "";
    }

    updateOptions(options) {
        this.options = options;
        this.span = this.calculateSpan();
    }

    setupButton() {
        this.ctx.canvas.addEventListener('click', ()=>{this.checkClick(event)});
    }

    calculateSpan() {
        return this.FULLROTATION / (this.options.length);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        if (!this.options.length) {
            return;
        }
        const selectionChanged = this.calculateCurrentSelection();
        if (this.spinning) {
            this.physicsStep(selectionChanged);   
        }
        
        
        for (let index in this.options) {
            const angle = this.rotation + this.span * index;        
            this.drawSlice(index, angle);
        }
        this.drawMarker(selectionChanged);
        this.drawSpinButton();
    }

    physicsStep(changedSelection) {
        this.rotation += this.speed;
        if (this.rotation > this.FULLROTATION) {
            this.rotation -= this.FULLROTATION;
        }
        this.speed *= this.DECELERATION;
        this.speed -= 0.00005;
        if (this.spinning && this.speed < 0.001) {
            this.setWinner(this.currentSelection);
        }
        if (!this.hadBonus && this.speed < 0.004) {
            if (Math.random() < 0.15) {
                this.bonusSpin();
            }
            this.hadBonus = true;
        }
        this.clickTimer += 0.05;
        
        if (changedSelection) { 
            this.playSound(this.clickSound, 1);
            this.clickTimer = 0;
        }        
    }

    spin(speed) {
        this.hadBonus = false;
        this.spinning = true;
        this.speed += speed;
        this.startMusic();
    }

    startMusic() {
        const music = this.loadSound('funny-sounds-363152.mp3');
        this.playSound(music);
    }

    bonusSpin() {        
        this.spin(0.1);  
    }

    drawSlice(index, angle) {
        const ctx = this.ctx;
        const text = this.options[index].name;  
        if (this.currentSelection == text) {
             this.tempCtx.fillStyle = "yellow";
             ctx.fillStyle = this.COLOURS[index];
        }
        else {
            this.tempCtx.fillStyle = "white";
            ctx.fillStyle = this.COLOURS[index];
        }  
        ctx.beginPath();
        const theta = ( Math.PI / 2 ) - Math.acos(this.gap / (2 * this.radius));
        const phi = ( Math.PI / 2 ) - Math.acos(this.gap / (2 * (this.buttonSize + this.gap)));
        ctx.arc(this.x, this.y, this.radius, angle + theta, angle + this.span - theta, false);
        ctx.arc(this.x, this.y, this.buttonSize + this.gap, angle + this.span - phi, angle + phi, true);    
        // ctx.arc(this.x, this.y, this.radius, angle + this.gap, angle + this.span - this.gap, false);
        // ctx.arc(this.x, this.y, this.buttonSize + this.gap, angle + this.span - this.gap, angle + this.gap, true);      
        ctx.stroke();
        ctx.fill();        

        this.tempCtx.clearRect(0, 0, this.tempCtx.canvas.width, this.tempCtx.canvas.height);

        ctx.save();
        this.tempCtx.save();
        
        const x = this.x + Math.cos(angle + this.span / 2);
        const y = this.y + Math.sin(angle + this.span / 2);
        const rot = angle + this.span / 2;
        ctx.translate(x, y);
        ctx.rotate(rot);

        this.tempCtx.canvas.width = this.tempCtx.measureText(text).width;
        this.tempCtx.font = "60px Roboto";
        
        this.tempCtx.fillStyle = "white";

        this.tempCtx.fillText(text, 0, this.tempCtx.canvas.height / 2);
        ctx.drawImage(this.tempCtx.canvas, this.radius - this.tempCtx.canvas.width - 30, -this.tempCtx.canvas.height / 2, this.tempCtx.canvas.width, this.tempCtx.canvas.height);        
        ctx.restore();
        this.tempCtx.restore();
    }

    drawMarker() {
        const ctx = this.ctx;
        const startX = this.x + this.radius + 40;
        const startY = this.y;
        let rotate = (this.spinning) ?  this.clickTimer - 0.4 : 0;
        if (rotate > 0) {
            rotate = 0;
        }
        ctx.save()
        ctx.fillStyle = "lightgrey";
        ctx.beginPath();
        ctx.translate(startX, startY);
        ctx.rotate(rotate);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 4);
        ctx.lineTo(-50, 2);       
        ctx.lineTo(-50, -2);
        ctx.lineTo(0, -4);
        ctx.lineTo(0, 4);
        ctx.fill();
        ctx.restore()
    }

    drawSpinButton() {
        const ctx = this.ctx;
        const startX = this.x;
        const startY = this.y;        
        ctx.save()
        ctx.fillStyle = (this.spinning) ? "green" : "yellow";
        ctx.beginPath();
        ctx.translate(startX, startY);
        ctx.arc(0, 0, this.buttonSize, 0, this.FULLROTATION);        
        ctx.fill();
        ctx.restore();
    }

    calculateCurrentSelection() {
        let changed = false;
        if (!this.spinning) {
            this.currentSelection = "";
            return false;
        }
        const index = this.options.length - Math.floor(this.rotation / this.span) - 1;
        const selection = this.options[index].name;

        if (selection !== this.currentSelection) {
            if (this.currentSelection) {
                changed = true;
            }
            this.currentSelection = selection;
        }
        
        return changed;
    }

    loadSound(file) {
        const sound = new Audio(`sounds/${file}`);
        sound.preload = 'auto';
        sound.load();
        return sound;
    }

    playSound(sound, volume=1) {
        sound.currentTime = 0;
        sound.volume = volume;
        sound.play();        
    }

    stopSound(sound) {
        sound.stop();
    }

    setText(text) {
        document.querySelector('#debug-text').innerText = text;
    }

    setWinner(winner) {
        this.spinning = false;
        this.speed = 0;
        this.resultModal.setBodyText(`And the winner is... ${winner} 🥳`);
        this.resultModal.show();
        this.resultModal.addButton(`Remove ${winner}`, (event) => {
            this.removeOption(winner);
            this.resultModal.close();
        }, ['btn-red']);
    }

    removeOption(name) {
        this.options = this.options.filter((option)=>{return option.name !== name});
        this.span = this.calculateSpan();
    }

    randomSpeed() {
        return (Math.random() + 0.5) / 2;
    }

    checkClick(event) {
        const rect = this.ctx.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        if ((dx * dx + dy * dy) <= (this.buttonSize ** 2)) {
            this.spin(this.randomSpeed());
        }
    }
}