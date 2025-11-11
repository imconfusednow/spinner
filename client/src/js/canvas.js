export class Canvas {
    constructor(canvasId) {
        const [canvas, ctx] = this.createCanvas(canvasId);
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = canvas.width;
        this.height = canvas.height;

        const [fCanvas, fCtx] = this.createCanvas();

        this.fakeCanvas = fCanvas;
        this.fakeCtx = fCtx
    }

    createCanvas(canvasId) {
        let canvas;
        if (canvasId) {
            canvas = document.getElementById(canvasId);
        }
        else {
            canvas = document.createElement('canvas');
        }
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

        return [canvas, ctx];
    }

    drawSegment(x, y, fillColour, startAngle, span, radius, innerRadius, margin) {
        this.ctx.fillStyle = fillColour;

        this.ctx.beginPath();
        
        const theta = ( Math.PI / 2 ) - Math.acos(margin / (2 * radius));
        const phi = ( Math.PI / 2 ) - Math.acos(margin / (2 * (innerRadius + margin)));

        this.ctx.arc(x, y, radius, startAngle + theta, startAngle + span - theta, false);
        this.ctx.arc(x, y, innerRadius + margin, startAngle + span - phi, startAngle + phi, true);
   
        this.ctx.stroke();
        this.ctx.fill();
    }

    drawText(text, size, colour, x, y, rotation, margin, align) {
        this.ctx.save();
        this.fakeCtx.save();
        this.fakeCtx.clearRect(0, 0, this.fakeCanvas.width, this.fakeCanvas.height);

        this.ctx.translate(x, y);
        this.ctx.rotate(rotation + 0.05);

        const measturedText = this.fakeCtx.measureText(text);

        this.fakeCtx.canvas.width = measturedText.width;
        this.fakeCtx.canvas.height = measturedText.actualBoundingBoxAscent + measturedText.actualBoundingBoxDescent;
        this.fakeCtx.font = `${size}px Roboto`;
        this.fakeCtx.textAlign = 'left';
        this.fakeCtx.textBaseline = 'middle';
        
        this.fakeCtx.fillStyle = colour;

        let widthOffset = margin;
        if (align === 'right') {
            widthOffset = -(measturedText.width + margin);
        }

        this.fakeCtx.fillText(text, 0, this.fakeCtx.canvas.height / 2);
        this.ctx.drawImage(this.fakeCtx.canvas, widthOffset, -this.fakeCtx.canvas.height / 2, this.fakeCtx.canvas.width, this.fakeCtx.canvas.height);        

        this.ctx.restore();
        this.fakeCtx.restore();
    }

    
}
