import * as utils from '@/js/utils.js';
import { COLOURS, FULLROTATION } from '@/js/constants.js';
import { useMouse, useTitle, useEventBus } from '@vueuse/core';
import { storeToRefs } from 'pinia';

const { x, y } = useMouse();
const title = useTitle();
const eventBus = useEventBus('user-error');

export class Wheel {
    DECELERATION = 0.993;
    CLICKDURATION = 0.5;
    STATICSPEED = 0.003;
    BIAS_WEIGHTING = 15;
    constructor(canvas, resultModal, spinnerStore, cacheMedia = true) {
        const { currentTheme, options, spinning, themes, fps } =
            storeToRefs(spinnerStore);
        this.canvas = canvas;
        this.originalRadius = 0;
        this.radius = 0;
        this.padding = 40;
        this.gap = 12;
        this.themes = themes;
        this.setupButton();
        this.rotation = Math.random() * FULLROTATION;
        this.direction = this.chooseDirection();
        this.speed = this.STATICSPEED;
        this.originalX = this.canvas.width / 2;
        this.x = this.canvas.width / 2;
        this.originalY = this.canvas.height / 2;
        this.y = this.canvas.height / 2;
        this.options = options;
        this.sounds = {};
        this.images = {};
        //Keeps the sound buffer 'warm' so sound don't become quiet
        this.loadSound('/sounds/silence.mp3', 'silence');
        this.playSound('silence', { loop: true, volume: 0.01 });
        this.loadSound('/sounds/click.mp3', 'click');
        this.loadSound('/sounds/ding.mp3', 'ding');
        this.resultModal = resultModal;
        this.clickTimer = 0;
        this.currentTheme = currentTheme;
        this.spinning = spinning;
        this.fps = fps;
        this.hadBonus = true;
        this.currentSelection = '';
        this.cacheMedia = cacheMedia;
        this.wheelId = Math.floor(Math.random() * 100);
    }

    updateLocalOptions(options) {
        this.options = { value: options.filter((option) => option) };
    }

    setupButton() {
        this.canvas.canvas.addEventListener('click', () => {
            this.checkClick(event);
        });
    }

    calculateSpan(weighting, totalWeighting) {
        const share = weighting / totalWeighting;
        return FULLROTATION * share;
    }

    getWeightings() {
        let sum = 0;
        const weightedOption = this.currentTheme.value.weighted_option;
        const weightings = this.options.value.map((opt, i) => {
            const weighting =
                opt.toLowerCase() === weightedOption?.toLowerCase()
                    ? this.BIAS_WEIGHTING
                    : 1;
            sum += weighting;
            return weighting;
        });

        return [sum, weightings];
    }

    draw() {
        const [width, height] = this.canvas.startStep();
        this.setDimensions(width, height);

        let startAngle = this.rotation;
        let span = 0;
        const [totalWeighting, weightings] = this.getWeightings();

        for (let index in this.options.value) {
            span = this.calculateSpan(weightings[index], totalWeighting);
            if (this.spinning.value) {
                this.calculateCurrentSelection(
                    startAngle,
                    startAngle + span,
                    index,
                );
            }
            this.drawSlice(index, startAngle, span);
            startAngle += span;
        }
        this.drawMarker();
        this.drawSpinButton();
        this.spinTime += 1;
    }

    step() {
        this.rotateStep();
        if (this.spinning.value) {
            this.physicsStep();
        }
    }

    rotateStep() {
        this.rotation += this.speed * this.direction;

        if (this.rotation > FULLROTATION) {
            this.rotation -= FULLROTATION;
        } else if (this.rotation < 0) {
            this.rotation += FULLROTATION;
        }
    }

    physicsStep() {
        if (this.currentTheme.value?.animation === 'bounce') {
            const mag = 2000 * this.speed;
            this.y =
                this.canvas.height / 2 -
                Math.abs(Math.sin(this.spinTime / 20) * mag);
        }
        if (this.currentTheme.value?.animation === 'wobble') {
            const mag = 500 * (this.speed + 0.1);
            this.x = this.canvas.width / 2 - Math.sin(this.spinTime / 4) * mag;
            this.radius = Math.abs(Math.cos(this.spinTime / 7) * 60 + 375);
        }
        if (this.currentTheme.value?.animation === 'grow') {
            if (this.spinTime === 0) {
                this.radius = 0;
            }
            this.radius += Math.random() * 4;
        }
        if (
            this.currentTheme.value?.animation == 'rolloff' &&
            this.spinTime > 210
        ) {
            this.x -= this.speed * this.radius * -this.direction;
            if (this.x + this.radius < 0 && this.direction < 0) {
                this.x = window.innerWidth + this.radius;
            } else if (
                this.x - this.radius > window.innerWidth &&
                this.direction > 0
            ) {
                this.x = -this.radius;
            }
        }
        if (this.currentTheme.value?.animation == 'laggy') {
            this.fps.value = 1;
        }

        this.speed *= this.DECELERATION;
        this.speed -= 0.00004;
        if (this.spinning.value && this.speed < 0.001) {
            this.setWinner(this.options.value[this.currentSelection]);
        }
        if (!this.hadBonus && this.speed < 0.004) {
            if (Math.random() < 0.1) {
                this.bonusSpin();
            }
            this.hadBonus = true;
        }
        this.clickTimer += 0.05;
    }

    spin(speed) {
        if (this.spinning.value) {
            return;
        }
        if (!this.currentTheme.value?.label) {
            const payload = {
                message: 'Please select a theme',
                timeout: 3000,
                classes: ['warning'],
            };
            eventBus.emit('no_theme', payload);
            return;
        }
        if (this.options.value.length === 0) {
            const payload = {
                message: 'Please add at least one option',
                timeout: 3000,
                classes: ['warning'],
            };
            eventBus.emit('no_options', payload);
            return;
        }
        title.value = 'Spinner';
        this.hadBonus = false;
        this.spinning.value = true;
        this.spinTime = 0;
        this.speed = speed;
        this.direction = this.chooseDirection();
        this.loadSound(`${this.currentTheme.value?.music}`, 'music');
        this.playSound('music');
        this.setDingTime();
    }

    start() {
        if (this.currentTheme.value?.label === 'Random') {
            this.setCurrentTheme(utils.randomChoice(this.themes.value));
        }
        this.spin(this.randomSpeed());
    }

    chooseDirection() {
        return Math.random() < 0.5 ? 1 : -1;
    }

    setCurrentTheme(theme) {
        this.currentTheme.value = theme;
    }

    bonusSpin() {
        const payload = { message: 'B-b-b-bonus Spin!', timeout: 3000 };
        eventBus.emit('no_theme', payload);
        this.speed += 0.1;
    }

    drawSlice(index, startAngle, span) {
        if (
            this.spinning.value &&
            this.currentTheme.value?.animation === 'invisible'
        ) {
            return;
        }

        const sliceColour = this.getColour(index);

        this.canvas.drawSegment(
            this.x,
            this.y,
            sliceColour,
            startAngle,
            span,
            this.radius,
            this.buttonSize(),
            this.gap,
        );

        const x = this.x + Math.cos(startAngle + span / 2) * this.radius;
        const y = this.y + Math.sin(startAngle + span / 2) * this.radius;
        const rot = startAngle + span / 2;

        const text = this.options.value[index];
        this.canvas.drawText(text, 60, 'white', x, y, rot, 5, 'right');
    }

    getColour(index) {
        const source = this.currentTheme.value?.colours
            ? this.currentTheme.value.colours
            : COLOURS;

        return source[index % source.length];
    }

    drawMarker() {
        const ctx = this.canvas.ctx;
        const startX = this.originalX + this.originalRadius + this.padding;
        const startY = this.originalY;
        let rotate = this.spinning.value
            ? this.clickTimer * this.direction - 0.4 * this.direction
            : 0;

        if (this.clickTimer > 0.4) {
            rotate = 0;
        }
        ctx.save();
        ctx.fillStyle = 'lightgrey';
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
        ctx.restore();
    }

    drawSpinButton() {
        const ctx = this.canvas.ctx;
        const startX = this.x;
        const startY = this.y;
        const buttonSize = this.buttonSize();
        ctx.save();
        const buttonInside = this.checkInButton();
        if (buttonInside && this.currentTheme.value?.label) {
            document.body.style.cursor = 'pointer';
            ctx.fillStyle = 'orange';
        } else if (buttonInside) {
            document.body.style.cursor = 'not-allowed';
            ctx.fillStyle = 'red';
        } else {
            document.body.style.cursor = 'default';
            ctx.fillStyle = 'yellow';
        }
        ctx.beginPath();
        ctx.translate(startX, startY);
        ctx.arc(0, 0, buttonSize, 0, FULLROTATION);
        ctx.fill();
        ctx.rotate(this.rotation);
        const [imagePath, imageName] = this.getCurrentImageDetails();

        const img = this.loadImage(imagePath, imageName);
        if (this.spinning.value) {
            ctx.drawImage(
                img,
                Math.floor(-buttonSize * 1.5),
                Math.floor(-buttonSize * 1.5),
                Math.floor(buttonSize * 3),
                Math.floor(buttonSize * 3),
            );
        } else {
            ctx.drawImage(
                img,
                Math.floor(-buttonSize * 0.75),
                Math.floor(-buttonSize * 0.75),
                Math.floor(buttonSize * 1.5),
                Math.floor(buttonSize * 1.5),
            );
        }

        ctx.restore();
    }

    getCurrentImageDetails() {
        const currentTheme =
            this.currentTheme.value?.label === 'Random'
                ? utils.randomChoice(this.themes.value)
                : this.currentTheme.value;
        if (currentTheme?.image) {
            return [`${currentTheme.image}`, currentTheme.label];
        }

        return ['/images/spin.svg', 'default'];
    }

    calculateCurrentSelection(startAngle, endAngle, index) {
        let selection = null;

        if (startAngle < FULLROTATION && endAngle > FULLROTATION) {
            selection = index;
        } else {
            return false;
        }

        if (selection !== this.currentSelection) {
            if (this.currentSelection !== '') {
                this.handleSelectionChange();
            }
            this.currentSelection = selection;
        }
    }

    handleSelectionChange() {
        this.playSound('click', { loop: false });
        this.clickTimer = 0;
        this.speed -= 0.0001;
    }

    loadImage(file, name) {
        if (this.images[name] && this.cacheMedia) {
            return this.images[name];
        }
        const img = document.createElement('img');
        img.src = `${file}`;
        img.style.transformOrigin = 'center';
        this.images[name] = img;
        return img;
    }

    loadSound(file, name) {
        if (this.sounds[name] && this.cacheMedia) {
            return this.sounds[name];
        }
        const sound = new Audio(`${file}`);
        sound.preload = 'auto';
        sound.load();
        this.sounds[name] = sound;
        return sound;
    }

    playSound(name, { loop = true, volume = 1, stopAfter = -1 } = {}) {
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

    clearMediaChaches() {
        this.sounds = {};
        this.images = {};
    }

    stopSound(name) {
        const sound = this.sounds[name];
        sound.pause();
        sound.currentTime = 0;
        delete this.sounds[name];
    }

    setDebugText(...texts) {
        for (let [i, text] of texts.entries()) {
            this.canvas.drawText(
                text,
                20,
                'white',
                100,
                100 + 50 + 20 * i,
                0,
                0,
                'left',
            );
        }
    }

    setWinner(winner) {
        this.resultModal.setBodyText(
            `And the winner is... ${winner} ${utils.randomEmoji()}`,
        );
        this.spinning.value = false;
        this.speed = this.STATICSPEED;
        title.value = `${winner} wins!`;

        this.resultModal.show();
        this.stopSound('music');
        this.loadSound(`${this.currentTheme.value?.ending}`, 'ending');
        this.playSound('ending', { loop: false, stopAfter: 5000 });
        this.resetState();
        this.resultModal.addButton(
            `Remove ${winner}`,
            () => {
                this.removeOption(winner);
                this.resultModal.close();
            },
            ['btn-red'],
        );
        this.resetAnimations();
        // setTimeout(() => {
        //     this.playTimerSound();
        // }, this.dingTime);
    }

    resetAnimations() {
        this.fps.value = 100;
    }

    setDingTime() {
        this.dingTime = (45 * 60 * 1000) / this.options.value.length;
    }

    playTimerSound() {
        if (!document.hidden) {
            return;
        }
        this.playSound('ding', { loop: false });
        title.value = `Time Up!`;
    }

    setDimensions(canvasWidth, canvasHeight) {
        const [beforeX, beforeY] = [this.originalX, this.originalY];
        this.originalX = canvasWidth / 2;
        this.originalY = canvasHeight / 2;
        this.originalRadius = Math.max(
            Math.min(canvasHeight, canvasWidth) / 2 - this.padding,
            0,
        );
        if (beforeX !== this.originalX || beforeY !== this.originalY) {
            this.resetState();
        }
    }

    resetState() {
        this.x = this.originalX;
        this.y = this.originalY;
        this.radius = this.originalRadius;
    }

    removeOption(name) {
        this.options.value = this.options.value.filter((option) => {
            return option !== name;
        });
    }

    randomSpeed() {
        return (Math.random() + 0.5) / 2;
    }

    checkClick() {
        if (this.checkInButton()) {
            this.start();
        }
    }

    checkInButton() {
        const rect = this.canvas.canvas.getBoundingClientRect();
        const mouseX = x.value - (rect.left + window.scrollX);
        const mouseY = y.value - (rect.top + window.scrollY);
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        if (dx * dx + dy * dy <= this.buttonSize() ** 2) {
            return true;
        }
        return false;
    }

    buttonSize() {
        return this.radius / 8;
    }
}
