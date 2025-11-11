import { Wheel } from './wheel.js';
import { Modal } from './modals.js';
import { captureCTRL } from './utils.js';
import { feather } from 'feather-icons';

const updateButton = document.querySelector('#update-options-button');
const optionsInput = document.querySelector('#options-input');



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

feather.replace()

captureCTRL('s', updateOptions);
