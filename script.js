import { Wheel } from './wheel.js';
import { Modal } from './modals.js';

const updateButton = document.querySelector('#update-options-button');
const optionsInput = document.querySelector('#options-input');


function setupCanvas() {
    const canvas = document.querySelector('#spinner-canvas');
    const ctx = canvas.getContext("2d");
    
    let dpi = window.devicePixelRatio;
    let styleHeight = getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
    let styleWidth = getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);
    canvas.setAttribute('width', styleWidth * dpi);
    canvas.setAttribute('height', styleHeight * dpi);
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "center";
    ctx.font = "50px Roboto";
    ctx.lineWidth = 2;

    const tCanvas = document.createElement("canvas");
    const tctx = tCanvas.getContext("2d");
    tctx.textBaseline = "alphabetic";
    tctx.textAlign = "left";
    tctx.font = "50px Roboto";
    document.body.append(tCanvas);

    return [canvas, ctx, tCanvas, tctx];
}

function loadParams() {
    const params = new URLSearchParams(document.location.search);
    const optionsString = params.get("options");
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
        const thisOption = {"name": name, "image": image}
        returnOptions.push(thisOption);
    }

    saveParams(returnOptions);

    return returnOptions;
}


const resultModal = new Modal({startOpen: false, classes: []});
resultModal.setHeaderText("Scrum Spinner Result");


loadParams();
let options = parseOptions();
const [canvas, ctx, tempCanvas, tempCtx] = setupCanvas();
const wheel = new Wheel(ctx, 400, options, tempCtx, '7-FingerClick.wav', resultModal);

doFrame();

updateButton.addEventListener('click', ()=>{
    let options = parseOptions();
    wheel.updateOptions(options);
});
function doFrame() {                
    wheel.draw();
    window.requestAnimationFrame(doFrame);
}

document.addEventListener("mousemove", mouseMoveHandler, false);
