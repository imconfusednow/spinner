import { showToast } from "/js/modals.js";
import * as utils from "/js/utils.js";
import {COLOURS} from "/js/constants.js";
import { Canvas } from "/js/canvas.js";
import { FULLROTATION } from '/js/constants.js'

export class Wheel {
    DECELERATION = 0.993;
    CLICKDURATION = 0.5;
    AUDIOCTX = new (window.AudioContext || window.webkitAudioContext)();
    constructor(canvasId, radius, options, resultModal) {
        this.canvas = new Canvas(canvasId);
        this.radius = radius;
        this.gap = 12;
        this.themes = [];
        this.currentTheme = {};
        this.setupButton();
        this.rotation = Math.random() * FULLROTATION;
        this.speed = 0;
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height / 2;
        this.options = options;
        this.span = this.calculateSpan()
        this.sounds = {};
        this.images = {};
        //Keeps the sound buffer 'warm' so sound don't become quiet
        this.loadSound('silence.mp3', 'silence');
        this.playSound('silence', {loop: true, volume: 0.01});
        this.clickSound = this.loadSound("click.wav", 'click');
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
        this.canvas.canvas.addEventListener('click', ()=>{this.checkClick(event)});
    }

    calculateSpan() {
        return FULLROTATION / (this.options.length);
    }

    draw() {
        this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (!this.options.length) {
            return;
        }
        const selectionChanged = ()=>this.calculateCurrentSelection();
        if (this.spinning) {
            this.physicsStep(selectionChanged);   
        }        
        
        for (let index in this.options) {
            this.drawSlice(index);
        }
        this.drawMarker(selectionChanged);
        this.drawSpinButton();
        this.spinTime += 1;
    }

    physicsStep(changedSelection) {
        if (this.currentTheme.animation == "bounce") {
            const time = Date.now();
            this.y = this.canvas.height / 2 - Math.abs(Math.sin(time / 80) * 150);
        }
        else {
            this.y = this.canvas.height / 2;
        }
        if (this.currentTheme.animation == "wobble") {
            const time = Date.now();
            this.x = this.canvas.height / 2 - (Math.abs(Math.sin(time / 100) * 100)) - (Math.abs(Math.cos(time / 100) * 100) ) + 100;
        }
        if (this.currentTheme.animation == "grow") {
            if (this.spinTime === 0) {
                this.radius = 0;
            }
            this.radius += Math.random() * 4;
        }
        else {
            this.radius = 400;
        }
        this.radius += 0.1;
        this.rotation += this.speed;
        if (this.rotation > FULLROTATION) {
            this.rotation -= FULLROTATION;
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
            this.playSound('click', {loop: false});
            this.clickTimer = 0;
        }
    }

    spin(speed) {
        if (!this.currentTheme.music) {
            showToast("Please select a theme", 3000, ["warning"]);
            return;
        }
        this.hadBonus = false;
        this.spinning = true;
        this.spinTime = 0;
        this.speed += speed;
        this.loadSound(this.currentTheme.music, "music");
        this.playSound('music');
    }

    setThemes(themes) {
        this.themes = themes;
    }

    setCurrentTheme(themeName) {
        this.currentTheme = this.themes[themeName] || {};        
    }


    bonusSpin() {
        showToast("b-b-b-bonus spin!!!")
        this.speed += 0.1;
    }

    drawSlice(index) {
        if (this.spinning && this.currentTheme.animation === 'invisible') {
            return;
        }

        const sliceColour = this.getColour(index);
        const span = FULLROTATION / this.options.length;
        const startAngle = index * span + this.rotation;

        this.canvas.drawSegment(this.x, this.y, sliceColour, startAngle, span, this.radius, this.buttonSize(), this.gap);

        const x = this.x + Math.cos(startAngle + span / 2) * this.radius;
        const y = this.y + Math.sin(startAngle + span / 2) * this.radius;
        const rot = startAngle + span / 2;

        const text = this.options[index].name;  

        this.canvas.drawText(text, 60, "white", x, y, rot, 5, "right");
        
    }

    getColour(index) {
        if (this.currentTheme?.colours) {
            return this.currentTheme.colours[index];
        }
        else {
            return COLOURS[index];
        }
    }

    drawMarker() {
        const ctx = this.canvas.ctx;
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
        const ctx = this.canvas.ctx;
        const startX = this.x;
        const startY = this.y;        
        ctx.save()
        const buttonInside = this.checkInButton();
        if (buttonInside && this.currentTheme.music) {
            document.body.style.cursor = 'pointer';
            ctx.fillStyle = "orange";
        }
        else if (buttonInside) {
            document.body.style.cursor = 'not-allowed';
            ctx.fillStyle = "red";
        }
        else {
            document.body.style.cursor = 'default';
            ctx.fillStyle = "yellow";
        }
        ctx.beginPath();
        ctx.translate(startX, startY);
        ctx.arc(0, 0, this.buttonSize(), 0, FULLROTATION);            
        ctx.fill();
        ctx.rotate(this.rotation);
        if (this.currentTheme.image && this.spinning) {
            const img = this.loadImage(this.currentTheme.image, this.currentTheme.name);
            ctx.drawImage(img, -this.buttonSize(), -this.buttonSize(), this.buttonSize() * 2, this.buttonSize() * 2);
        }
        else {            
            const img = this.loadImage('spin.svg', 'default');
            ctx.drawImage(img, -this.buttonSize() / 2, -this.buttonSize() / 2, this.buttonSize(), this.buttonSize());
        }
        
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

    loadImage(file, name) {
        if (this.images[name]) {
            return this.images[name];
        }
        const img = document.createElement("img");
        img.src = `/images/${file}`;
        img.style.transformOrigin = "center";
        this.images[name] = img;
        return img;
    }

    loadSound(file, name) {
        if (this.sounds[name]) {
            return this.sounds[name];
        }
        const sound = new Audio(`sounds/${file}`);
        sound.preload = 'auto';
        sound.load();
        this.sounds[name] = sound;
        return sound;
    }

    playSound(name, {loop=true, volume=1, stopAfter=-1} = {}) {
        const sound = this.sounds[name];
        sound.currentTime = 0;
        sound.volume = volume;
        sound.loop = loop;
        if (stopAfter > 0) {
            setTimeout(() => {
                this.stopSound(name);
            }, stopAfter);
        }
        sound.play();        
    }

    stopSound(name) {
        const sound = this.sounds[name];
        sound.pause();
        sound.currentTime = 0;
        delete this.sounds[name];
    }

    setText(text) {
        document.querySelector('#debug-text').innerText = text;
    }

    setWinner(winner) {
        this.spinning = false;
        this.speed = 0;
        this.resultModal.setBodyText(`And the winner is... ${winner} ${utils.randomEmoji()}`);
        this.resultModal.show();
        this.stopSound('music');
        this.loadSound(this.currentTheme.ending, 'ending');
        this.playSound('ending', {loop: false, stopAfter: 5000});
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

    checkClick() {
        if (this.checkInButton()) {
            this.spin(this.randomSpeed());
        }        
    }    

    checkInButton() {
        const rect = this.canvas.canvas.getBoundingClientRect();
        const mouseX = window.mouseX - rect.left;
        const mouseY = window.mouseY - rect.top;
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        if ((dx * dx + dy * dy) <= (this.buttonSize() ** 2)) {
            return true;
        }
        return false;
    }

    buttonSize() {
        return this.radius / 8;
    }
}