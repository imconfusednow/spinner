(function (modals_js, utils, constants_js, canvas_js, featherIcons) {
    'use strict';

    function _interopNamespaceDefault(e) {
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () { return e[k]; }
                    });
                }
            });
        }
        n.default = e;
        return Object.freeze(n);
    }

    var utils__namespace = /*#__PURE__*/_interopNamespaceDefault(utils);

    class Wheel {
        DECELERATION = 0.993;
        CLICKDURATION = 0.5;
        AUDIOCTX = new (window.AudioContext || window.webkitAudioContext)();
        constructor(canvasId, radius, options, resultModal) {
            this.canvas = new canvas_js.Canvas(canvasId);
            this.radius = radius;
            this.gap = 12;
            this.themes = [];
            this.currentTheme = {};
            this.setupButton();
            this.rotation = Math.random() * constants_js.FULLROTATION;
            this.speed = 0;
            this.x = this.canvas.width / 2;
            this.y = this.canvas.height / 2;
            this.options = options;
            this.span = this.calculateSpan();
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
            this.canvas.canvas.addEventListener('click', ()=>{this.checkClick(event);});
        }

        calculateSpan() {
            return constants_js.FULLROTATION / (this.options.length);
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
            if (this.rotation > constants_js.FULLROTATION) {
                this.rotation -= constants_js.FULLROTATION;
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
                modals_js.showToast("Please select a theme", 3000, ["warning"]);
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
            modals_js.showToast("b-b-b-bonus spin!!!");
            this.speed += 0.1;
        }

        drawSlice(index) {
            if (this.spinning && this.currentTheme.animation === 'invisible') {
                return;
            }

            const sliceColour = this.getColour(index);
            const span = constants_js.FULLROTATION / this.options.length;
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
                return constants_js.COLOURS[index];
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
            ctx.save();
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
            ctx.arc(0, 0, this.buttonSize(), 0, constants_js.FULLROTATION);            
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
            this.resultModal.setBodyText(`And the winner is... ${winner} ${utils__namespace.randomEmoji()}`);
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

    class Modal {
        constructor({ startOpen = false, classes = [] } = {}) {
          this.buttons = [];
          [this.modal, this.headDiv, this.bodyDiv, this.buttonDiv] = this.#create(classes);
          this.addButton('Close', ()=>this.close(), ['btn-dark']);
          if (startOpen) {
            this.show();
          }

        }

        #create(classes) {
          const dialog = document.createElement('dialog');
          dialog.classList.add('modal');
          dialog.classList.add(...classes);

          const [headDiv, bodyDiv, buttonDiv] = ['head', 'body', 'button'].map((divClass)=>
          {
            const div = document.createElement('div');
            div.classList.add(`${divClass}-div`);
            dialog.append(div);
            return div;
          }
        );


          document.body.append(dialog);
          return [dialog, headDiv, bodyDiv, buttonDiv];
        }

        show() {
            this.modal.showModal();
        }

        close() {
          this.clearButtons();
          this.modal.close();
        }

        addButton(text, onClick, classes = []) {
          const button = document.createElement('button');
          button.innerText = text;
          button.classList.add('btn');
          button.classList.add(...classes);
          button.addEventListener('click', onClick);
          this.buttonDiv.append(button);
          this.buttons.push(button);
        }

        removeButton(button) {
          button.remove();
        }

        clearButtons() {
          if (this.buttons.length <= 1) {
            return;
          }
          for (let i = 1; i < this.buttons.length; i++) {
            this.buttons[i].remove();
          }
        }

        setHeaderText(text) {
          const div = document.createElement('div');
          this.headDiv.innerText = text;
          div.classList.add('modal-text');      
        }

        setBodyText(text) {
          const div = document.createElement('div');
          this.bodyDiv.innerText = text;
          div.classList.add('modal-text');      
        }
       
    }

    function captureCTRL(key, callback) {
        document.addEventListener('keydown', e => {
            if (e.ctrlKey && e.key === key) {
                e.preventDefault();
                callback();            
            }
        });
    }

    const updateButton = document.querySelector('#update-options-button');
    const optionsInput = document.querySelector('#options-input');


    function loadParams() {
        const params = new URLSearchParams(document.location.search);
        const optionsString = params.get("options");
        if (!optionsString) {
            return;
        }
        const splitOptions = optionsString.split(",").join("\n");
        optionsInput.value = splitOptions;
    }

    function saveParams(options) {
        const params = new URLSearchParams(document.location.search);
        const optionsString = options.map((option)=>{return option.name}).join(',');
        params.set('options', optionsString);

        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', newUrl);
    }

    function parseOptions() {    
        const optionsText = optionsInput.value;
        if (optionsText === "") {
            return [];
        }
        let returnOptions = [];

        for (let line of optionsText.split("\n")) {
            if (line === "") 
            {
                continue;
            }
            const [name, image] = line.split(",");
            const thisOption = {"name": name, "image": image};
            returnOptions.push(thisOption);
        }

        saveParams(returnOptions);

        return returnOptions;
    }

    function updateOptions() {
        let options = parseOptions();
        wheel.updateOptions(options);
    }


    const resultModal = new Modal({startOpen: false, classes: []});
    resultModal.setHeaderText("Spinner Result");


    loadParams();
    let options = parseOptions();
    const wheel = new Wheel('spinner-canvas', 400, options, resultModal);

    doFrame();

    updateButton.addEventListener('click', updateOptions);
    function doFrame() {                
        wheel.draw();
        window.requestAnimationFrame(doFrame);
    }

    document.addEventListener("mousemove", mouseMoveHandler, false);

    function mouseMoveHandler(event) {
        window.mouseX = event.clientX;
        window.mouseY = event.clientY;
    }

    const themeSelect = document.getElementById("theme-select");

    wheel.setCurrentTheme(themeSelect.value);

    themeSelect.addEventListener("change", (event)=>{
        const value = event.target.value;
        wheel.setCurrentTheme(value);
        event.target.classList.remove('error');
    });

    const themes = JSON.parse(document.querySelector('#themes-data').innerText);

    wheel.setThemes(themes);

    featherIcons.feather.replace();

    captureCTRL('s', updateOptions);

})(modals_js, utils, constants_js, canvas_js, featherIcons);
