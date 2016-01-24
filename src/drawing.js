'use strict';
import {Tayberry} from './base';
import {Rect} from './helpers/rect';
import * as Utils from './helpers/utils.js';

Tayberry.prototype.getTextWidth = function (text, fontString) {
    let ret;
    if (fontString) {
        this.labelsCtx.save();
        this.labelsCtx.font = fontString;
    }
    ret = this.labelsCtx.measureText(text).width;
    if (fontString) {
        this.labelsCtx.restore();
    }
    return ret;
};

Tayberry.prototype.getMultilineTextHeight = function (fontString, maxWidth, text) {
    let ret;
    if (fontString) {
        this.labelsCtx.save();
        this.labelsCtx.font = fontString;
    }
    ret = this.splitMultilineText(maxWidth, text).length;
    if (fontString) {
        this.labelsCtx.restore();
    }
    return ret;
};


Tayberry.prototype.splitMultilineText = function (maxWidth, text) {
    let lines = [];
    let lineWidth = 0;
    let lineText = '';
    const spaceWidth = this.labelsCtx.measureText(' ').width;
    for (let i = 0; i < text.length;) {
        const wordStart = i;
        while (i < text.length && text[i] !== ' ' && text[i] !== '\r' && text[i] !== '\n') i++;
        const wordEnd = i;
        while (i < text.length && (text[i] === ' ' || text[i] === '\r' || text[i] === '\n')) i++;
        if (wordEnd > wordStart) {
            const word = text.substring(wordStart, wordEnd);
            const wordWidth = this.labelsCtx.measureText(word).width;
            if (lineWidth + wordWidth > maxWidth) {
                if (!lineWidth) {
                    lineText = word;
                }
                lines.push(lineText);
                if (lineWidth) {
                    lineWidth = 0;
                    lineText = word;
                }
            } else {
                lineText += (lineText ? ' ' : '') + word;
                lineWidth += wordWidth + spaceWidth;
            }
        }
    }
    if (lineText) {
        lines.push(lineText);
    }
    return lines;
};

Tayberry.prototype.drawTextMultiline = function (lineHeight, x, y, maxWidth, text) {
    let lines = this.splitMultilineText(maxWidth, text);

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        this.labelsCtx.fillText(line, x, y + lineHeight * i);
    }
};

Tayberry.prototype.revokeAnimation = function (series) {
    if (series.animationState) {
        delete series.animationState;

        for (let index = this.pendingAnimations.length; index; index--) {
            if (this.pendingAnimations[index-1].series === series) {
                this.pendingAnimations.splice(index-1, 1);
            }
        }
    }
};

Tayberry.prototype.startAnimation = function (animation) {
    this.pendingAnimations.push(Utils.assign({}, [{
        length: 500,
        startTime: (typeof performance !== 'undefined' && typeof performance.now !== 'undefined') ? performance.now() : null
    },
        animation
    ]));
    if (!this.animator)
        this.animator = requestAnimationFrame(this.onAnimate.bind(this));
};

Tayberry.prototype.render = function () {
    this.drawLabelLayer();
    this.createTooltip();
    if (this.options.animations.enabled) {
        this.startAnimation({
            type: 'grow'
        });
    } else {
        this.drawPlotLayer();
    }
};

Tayberry.prototype.clear = function (plot = true, labels = true) {
    if (plot) this.plotCtx.clearRect(0, 0, this.plotCanvas.width, this.plotCanvas.height);
    if (labels) this.labelsCtx.clearRect(0, 0, this.labelsCanvas.width, this.labelsCanvas.height);
};

Tayberry.prototype.drawBackground = function () {
    if (this.options.plotBackgroundColour) {
        this.labelsCtx.save();
        this.labelsCtx.fillStyle = this.options.plotBackgroundColour;
        this.labelsCtx.fillRect(this.plotArea.left, this.plotArea.top, this.plotArea.width, this.plotArea.height);
        this.labelsCtx.restore();
    }
};

Tayberry.prototype.drawTitle = function () {
    if (this.options.title.text) {
        const x = (this.labelsCanvas.width) / 2, y = 0;
        this.labelsCtx.save();
        this.labelsCtx.textAlign = 'center';
        this.labelsCtx.textBaseline = 'top';
        this.labelsCtx.font = this.titleFont;
        this.labelsCtx.fillStyle = this.options.title.font.colour;
        this.drawTextMultiline(this.getFontHeight(this.options.title.font), x, y, this.labelsCanvas.width, this.options.title.text);
        // this.labelsCtx.fillText(this.options.title.text, x, y);
        this.labelsCtx.restore();
    }
};

Tayberry.prototype.drawPlotLayer = function () {
    for (let i = 0; i < this.renderers.length; i++) {
        this.renderers[i].drawPlot();
    }
    for (let i = 0; i < this.renderers.length; i++) {
        this.renderers[i].drawLabels();
    }
};


Tayberry.prototype.drawLine = function (x1, y1, x2, y2, colour, ctx = this.labelsCtx) {
    ctx.save();
    if (colour) {
        ctx.strokeStyle = colour;
    }
    ctx.beginPath();
    ctx.moveTo(x1 + 0.5, y1 + 0.5);
    ctx.lineTo(x2 + 0.5, y2 + 0.5);
    ctx.stroke();
    ctx.restore();
};

Tayberry.prototype.drawLabelLayer = function () {
    this.drawBackground();
    this.drawTitle();
    let offsetRect = new Rect(0);
    this.xAxes.map(e => e.draw(offsetRect));
    this.yAxes.map(e => e.draw(offsetRect));
    this.drawLegend();
};

Tayberry.prototype.redraw = function (plotOnly) {
    this.clear(true, !plotOnly);
    if (!plotOnly) {
        this.drawLabelLayer();
    }
    this.drawPlotLayer();
};

