export class Canvas {
    constructor(canvasId) {
        const [canvas, ctx] = this.createCanvas(canvasId);
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = canvas.width;
        this.height = canvas.height;
        this.fakeCanvases = {};
    }

    createCanvas(canvasId) {
        let canvas;
        if (canvasId) {
            canvas = document.getElementById(canvasId);
        } else {
            canvas = document.createElement('canvas');
        }
        const ctx = canvas.getContext('2d');

        ctx.textBaseline = 'alphabetic';
        ctx.textAlign = 'center';
        ctx.font = '50px Roboto';
        ctx.lineWidth = 2;

        return [canvas, ctx];
    }

    startStep() {
        let rect = this.canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        this.canvas.width = width;
        this.canvas.height = height;
        this.width = width;
        this.height = height;
        //this.ctx.clearRect(0, 0, width, height);
        return [width, height];
    }

    drawSegment(
        x,
        y,
        fillColour,
        startAngle,
        span,
        radius,
        innerRadius,
        margin,
    ) {
        this.ctx.fillStyle = fillColour;

        this.ctx.beginPath();

        const theta = Math.PI / 2 - Math.acos(margin / (2 * radius));
        const phi =
            Math.PI / 2 - Math.acos(margin / (2 * (innerRadius + margin)));

        this.ctx.arc(
            x,
            y,
            radius,
            startAngle + theta,
            startAngle + span - theta,
            false,
        );
        this.ctx.arc(
            x,
            y,
            innerRadius + margin,
            startAngle + span - phi,
            startAngle + phi,
            true,
        );

        this.ctx.stroke();
        this.ctx.fill();
    }

    drawText(text, size, colour, x, y, rotation, margin, align) {
        this.ctx.save();

        this.ctx.translate(x, y);
        this.ctx.rotate(rotation);

        if (!this.fakeCanvases[text]) {
            const [fakeCanvas, fakeCtx] = this.createCanvas();
            fakeCtx.font = `${size}px Roboto`;
            const measturedText = fakeCtx.measureText(text);

            fakeCtx.canvas.width = measturedText.width;
            fakeCtx.canvas.height =
                measturedText.actualBoundingBoxAscent +
                measturedText.actualBoundingBoxDescent +
                50; // Doesn't quite work, give some leeway
            fakeCtx.font = `${size}px Roboto`;
            fakeCtx.textAlign = 'left';
            fakeCtx.textBaseline = 'middle';

            fakeCtx.fillStyle = colour;

            let widthOffset = margin;
            if (align === 'right') {
                widthOffset = -(measturedText.width + margin);
            }

            fakeCtx.fillText(text, 0, fakeCtx.canvas.height / 2);

            this.fakeCanvases[text] = {
                canvas: fakeCanvas,
                ctx: fakeCtx,
                widthOffset: widthOffset,
            };
        }

        const {
            canvas: fakeCanvas,
            ctx: fakeCtx,
            widthOffset,
        } = this.fakeCanvases[text];

        this.ctx.drawImage(
            fakeCtx.canvas,
            Math.floor(widthOffset),
            Math.floor(-fakeCtx.canvas.height / 2),
            fakeCtx.canvas.width,
            fakeCtx.canvas.height,
        );
        this.ctx.restore();
    }
}
