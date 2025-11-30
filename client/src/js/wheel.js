import { showToast } from "@/js/modals.js";
import * as utils from "@/js/utils.js";
import { COLOURS, FULLROTATION } from "@/js/constants.js";
import { useMouse, useTitle } from "@vueuse/core";

const { x, y, sourceType } = useMouse();
const title = useTitle();


export class Wheel {
  DECELERATION = 0.993;
  CLICKDURATION = 0.5;
  STATICSPEED = 0.005;
  AUDIOCTX = new (window.AudioContext || window.webkitAudioContext)();
  constructor(canvas, options, resultModal, spinnerStore) {
    this.canvas = canvas
    this.originalRadius = 0;
    this.radius = 0;
    this.padding = 40;
    this.gap = 12;
    this.themes = [];
    this.currentTheme = {};
    this.setupButton();
    this.rotation = Math.random() * FULLROTATION;
    this.direction = this.chooseDirection();
    this.speed = this.STATICSPEED;
    this.originalX = this.canvas.width / 2;
    this.x = this.canvas.width / 2;
    this.originalY = this.canvas.height / 2;
    this.y = this.canvas.height / 2;
    this.options = options;
    this.span = this.calculateSpan();
    this.sounds = {};
    this.images = {};
    //Keeps the sound buffer 'warm' so sound don't become quiet
    this.loadSound("silence.mp3", "silence");
    this.playSound("silence", { loop: true, volume: 0.01 });
    this.clickSound = this.loadSound("click.wav", "click");
    this.resultModal = resultModal;
    this.clickTimer = 0;
    this.spinnerStore = spinnerStore;
    spinnerStore.spinning = false;
    this.hadBonus = true;
    this.currentSelection = "";
    this.draw();
  }

  updateOptions(options) {
    this.options = options;
    this.span = this.calculateSpan();
  }

  setupButton() {
    this.canvas.canvas.addEventListener("click", () => {
      this.checkClick(event);
    });
  }

  calculateSpan() {
    return FULLROTATION / this.options.length;
  }

  draw() {
    const [width, height] = this.canvas.startStep();
    this.setDimensions(width - this.padding, height - this.padding);    

    const selectionChanged = this.calculateCurrentSelection();
    this.rotateStep();
    if (this.spinnerStore.spinning) {
      this.physicsStep(selectionChanged);
    }

    for (let index in this.options) {
      this.drawSlice(index);
    }
    this.drawMarker();
    this.drawSpinButton();
    this.spinTime += 1;
  }

  rotateStep() {
    this.rotation += this.speed * this.direction;
    
    if (this.rotation > FULLROTATION) {
      this.rotation -= FULLROTATION;
    }
    else if (this.rotation < 0) {
      this.rotation += FULLROTATION;
    }
  }

  physicsStep(changedSelection) {
    if (this.currentTheme.animation == "bounce") {
        const mag = 1000 * (this.speed + 0.2);
        this.y = this.canvas.height / 2 - Math.abs(Math.sin(this.spinTime / 20) * mag);
    }
    if (this.currentTheme.animation == "wobble") {
      const mag = 500 * (this.speed + 0.1);
      this.x =
        this.canvas.width / 2 -
        Math.sin(this.spinTime / 4) * mag;
      this.radius = Math.abs(Math.cos(this.spinTime / 7) * 60 + 375);
    }
    if (this.currentTheme.animation == "grow") {
      if (this.spinTime === 0) {
        this.radius = 0;
      }
      this.radius += Math.random() * 4;
    }
    
    this.speed *= this.DECELERATION;
    this.speed -= 0.00005;
    if (this.spinnerStore.spinning && this.speed < 0.001) {
      this.setWinner(this.options[this.currentSelection]);
    }
    if (!this.hadBonus && this.speed < 0.004) {
      if (Math.random() < 0.1) {
        this.bonusSpin();
      }
      this.hadBonus = true;
    }
    this.clickTimer += 0.05;

    if (changedSelection) {
      this.playSound("click", { loop: false });
      this.clickTimer = 0;
    }
  }

  spin(speed) {
    if (this.spinnerStore.spinning) {
      return;
    }
    if (!this.currentTheme.music) {
      showToast("Please select a theme", 3000, ["warning"]);
      return;
    }
    if (this.options.length === 0) {
      showToast("Please add at least one option", 3000, ["warning"]);
      return;
    }
    title.value = "Spinner";
    this.hadBonus = false;
    this.spinnerStore.spinning = true;
    this.spinTime = 0;
    this.speed = speed;
    this.direction = this.chooseDirection();
    this.loadSound(`themes/${this.currentTheme.music}`, "music");
    this.playSound("music");
  }

  start() {
    this.spin(this.randomSpeed());
  }

  chooseDirection() {
    return Math.random() < 0.5 ? 1 : -1;
  }

  setThemes(themes) {
    this.themes = themes;
  }

  setCurrentTheme(theme) {
    this.currentTheme = theme || {};
  }

  bonusSpin() {
    showToast("b-b-b-bonus spin!!!");
    this.speed += 0.1;
  }

  drawSlice(index) {
    if (this.spinnerStore.spinning && this.currentTheme.animation === "invisible") {
      return;
    }

    const sliceColour = this.getColour(index);
    const span = FULLROTATION / this.options.length;
    const startAngle = index * span + this.rotation;

    this.canvas.drawSegment(
      this.x,
      this.y,
      sliceColour,
      startAngle,
      span,
      this.radius,
      this.buttonSize(),
      this.gap
    );

    const x = this.x + Math.cos(startAngle + span / 2) * this.radius;
    const y = this.y + Math.sin(startAngle + span / 2) * this.radius;
    const rot = startAngle + span / 2;

    const text = this.options[index];

    this.canvas.drawText(text, 60, "white", x, y, rot, 5, "right");
  }

  getColour(index) {
    if (this.currentTheme?.colours) {
      return this.currentTheme.colours[index];
    } else {
      return COLOURS[index];
    }
  }

  drawMarker() {
    const ctx = this.canvas.ctx;
    const startX = this.originalX + this.originalRadius + this.padding;
    const startY = this.originalY;
    let rotate = this.spinnerStore.spinning ? this.clickTimer * this.direction - 0.4 * this.direction : 0;

    if (this.clickTimer > 0.4) {
      rotate = 0;
    }
    ctx.save();
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
    ctx.restore();
  }

  drawSpinButton() {
    const ctx = this.canvas.ctx;
    const startX = this.x;
    const startY = this.y;
    const buttonSize = this.buttonSize();
    ctx.save();
    const buttonInside = this.checkInButton();
    if (buttonInside && this.currentTheme.music) {
      document.body.style.cursor = "pointer";
      ctx.fillStyle = "orange";
    } else if (buttonInside) {
      document.body.style.cursor = "not-allowed";
      ctx.fillStyle = "red";
    } else {
      document.body.style.cursor = "default";
      ctx.fillStyle = "yellow";
    }
    ctx.beginPath();
    ctx.translate(startX, startY);
    ctx.arc(0, 0, buttonSize, 0, FULLROTATION);
    ctx.fill();
    ctx.rotate(this.rotation);
    if (this.currentTheme.image) {
      const path = `/themes/${this.currentTheme.image}`;
      const img = this.loadImage(
        path,
        this.currentTheme.name
      );
      if (this.spinnerStore.spinning) {
        ctx.drawImage(
        img,
        -buttonSize * 1.5,
        -buttonSize * 1.5,
        buttonSize * 3,
        buttonSize * 3
      );
      }
      else {
        ctx.drawImage(
        img,
        -buttonSize * 0.75,
        -buttonSize * 0.75,
        buttonSize * 1.5,
        buttonSize * 1.5
      );
      }
    }
    else {
      const path = `spin.svg`;
      const img = this.loadImage(path, "default");
      ctx.drawImage(
        img,
        -buttonSize / 2,
        -buttonSize / 2,
        buttonSize,
        buttonSize
      );
    }

    ctx.restore();
  }

  calculateCurrentSelection() {
    let changed = false;
    const selection =
      this.options.length - Math.floor(this.rotation / this.span) - 1;

    if (selection !== this.currentSelection) {
      if (this.currentSelection !== "") {
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
    const sound = new Audio(`/sounds/${file}`);
    sound.preload = "auto";
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

  stopSound(name) {
    const sound = this.sounds[name];
    sound.pause();
    sound.currentTime = 0;
    delete this.sounds[name];
  }

  setDebugText(...texts) {
    for (let [i, text] of texts.entries()) {
      this.canvas.drawText(text, 20, "white", this.x - this.radius, this.y - this.radius + 50 + (20 * i), 0, 0, "left");
    }
    
  }

  setWinner(winner) {
    this.spinnerStore.spinning = false;
    this.speed = this.STATICSPEED;
    title.value = `${winner} wins!`;
    this.resultModal.setBodyText(
      `And the winner is... ${winner} ${utils.randomEmoji()}`
    );
    this.resultModal.show();
    this.stopSound("music");
    this.loadSound(`themes/${this.currentTheme.ending}`, "ending");
    this.playSound("ending", { loop: false, stopAfter: 5000 });
    this.resetState();
    this.resultModal.addButton(
      `Remove ${winner}`,
      (event) => {
        this.removeOption(winner);
        this.resultModal.close();
      },
      ["btn-red"]
    );
  }

  setDimensions(canvasWidth, canvasHeight) {
    const [beforeX, beforeY] = [this.originalX, this.originalY];
    this.originalX = canvasWidth / 2;
    this.originalY = canvasHeight / 2;
    this.originalRadius = canvasHeight / 2;
    if ((beforeX !== this.originalX) || (beforeY !== this.originalY)) {
      this.resetState();
    }    
  }

  resetState() {
    this.x = this.originalX;
    this.y = this.originalY;
    this.radius = this.originalRadius;
    
  }

  removeOption(name) {
    this.options = this.options.filter((option) => {
      return option !== name;
    });
    this.span = this.calculateSpan();
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
    const mouseX = x.value - rect.left;
    const mouseY = y.value - rect.top;
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
