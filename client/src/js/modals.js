export class Modal {
    constructor({ startOpen = false, classes = [] } = {}) {
        this.buttons = [];
        [this.modal, this.headDiv, this.bodyDiv, this.buttonDiv] =
            this.#create(classes);
        this.addButton('Close', () => this.close(), ['btn-dark']);
        if (startOpen) {
            this.show();
        }
    }

    #create(classes) {
        const dialog = document.createElement('dialog');
        dialog.classList.add('modal');
        dialog.classList.add(...classes);

        const [headDiv, bodyDiv, buttonDiv] = ['head', 'body', 'button'].map(
            (divClass) => {
                const div = document.createElement('div');
                div.classList.add(`${divClass}-div`);
                dialog.append(div);
                return div;
            },
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

export function showToast(text, timeout = 5000, classes = []) {
    const div = document.createElement('div');
    div.classList.add('toast');
    div.classList.add(...classes);
    div.innerText = text;
    document.body.append(div);

    setTimeout(() => div.remove(), timeout);
}
