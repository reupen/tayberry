'use strict';
var Tayberry = require('./tayberry.base.js').Tayberry;

Tayberry.prototype.getTextWidth = function (text, fontString) {
    let ret;
    if (fontString) {
        this.ctx.save();
        this.ctx.font = fontString;
    }
    ret = this.ctx.measureText(text).width;
    if (fontString) {
        this.ctx.restore();
    }
    return ret;
};

Tayberry.prototype.splitMultilineText = function (maxWidth, text) {
    let lines = [];
    let lineWidth = 0;
    let lineText = '';
    const spaceWidth = this.ctx.measureText(' ').width;
    for (let i = 0; i < text.length;) {
        const wordStart = i;
        while (i < text.length && text[i] !== ' ' && text[i] !== '\r' && text[i] !== '\n') i++;
        const wordEnd = i;
        while (i < text.length && (text[i] === ' ' || text[i] === '\r' || text[i] === '\n')) i++;
        if (wordEnd > wordStart) {
            const word = text.substring(wordStart, wordEnd);
            const wordWidth = this.ctx.measureText(word).width;
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
        this.ctx.fillText(line, x, y + lineHeight * i);
    }
};

Tayberry.prototype.render = function () {
    this.calculatePlotArea();
    this.drawTitle();
    this.xAxis.draw();
    this.yAxis.draw();
    this.drawLegend();
    this.createTooltip();
    if (this.options.animations.enabled) {
        this.animator = requestAnimationFrame(this.onAnimate.bind(this));
        this.animatationStart = performance.now();
        this.animationLength = 500;
    } else {
        this.draw();
    }
};

Tayberry.prototype.clear = function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

Tayberry.prototype.drawTitle = function () {
    if (this.options.title.text) {
        const x = (this.canvas.width) / 2, y = 0;
        this.ctx.save();
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.font = this.titleFont;
        this.ctx.fillStyle = this.options.title.font.colour;
        this.drawTextMultiline(this.getFontHeight(this.options.title.font), x, y, this.canvas.width, this.options.title.text);
        // this.ctx.fillText(this.options.title.text, x, y);
        this.ctx.restore();
    }
};

Tayberry.prototype.drawLabel = function (sign, text, rect) {
    if (this.options.swapAxes)
        rect = rect.clone().swapXY();
    let x = (rect.left + rect.right) / 2;
    let y;
    if (this.options.labels.verticalAlignment === 'top')
        y = rect.top;
    else if (this.options.labels.verticalAlignment === 'bottom')
        y = rect.bottom;
    else
        y = (rect.top + rect.bottom) / 2;
    let baseline = 'middle';
    let align = 'center';
    if (this.options.swapAxes) {
        [x, y] = [y, x];
        if (this.options.labels.verticalPosition === 'outside')
            align = 'left';
        else if (this.options.labels.verticalPosition === 'inside')
            align = 'right';
    } else {
        baseline = Tayberry.mapVerticalPosition(sign, this.options.labels.verticalPosition);
    }
    if (this.plotArea.containsPoint(x, y)) {
        this.ctx.save();
        this.ctx.textAlign = align;
        this.ctx.textBaseline = baseline;
        this.ctx.fillText(text, x, y);
        this.ctx.restore();
    }
};


Tayberry.prototype.draw = function () {

    this.ctx.save();
    this.enumerateBars(function (bar) {
        this.ctx.fillStyle = bar.selected ? bar.renderedSeries.highlightColour : bar.renderedSeries.colour;
        this.ctx.fillRect(bar.rect.left, bar.rect.top, bar.rect.width, bar.rect.height);
    }.bind(this));
    this.ctx.restore();

    if (this.options.labels.enabled) {
        this.ctx.save();
        this.enumerateBars(function (bar) {
            this.ctx.font = this.labelFont;
            this.ctx.fillStyle = this.options.labels.font.colour;
            this.drawLabel(bar.value, this.options.yAxis.labelFormatter(bar.value), bar.rect);
        }.bind(this));
        this.ctx.restore();
    }
};

Tayberry.prototype.drawLine = function (x1, y1, x2, y2, colour) {
    this.ctx.save();
    if (colour) {
        this.ctx.strokeStyle = colour;
    }
    this.ctx.beginPath();
    this.ctx.moveTo(x1 + 0.5, y1 + 0.5);
    this.ctx.lineTo(x2 + 0.5, y2 + 0.5);
    this.ctx.stroke();
    this.ctx.restore();
};

Tayberry.prototype.redraw = function () {
    this.clear();
    this.drawTitle();
    this.xAxis.draw();
    this.yAxis.draw();
    this.drawLegend();
    this.draw();
};


Tayberry.prototype.drawLegend = function () {
    if (this.options.legend.enabled) {
        this.ctx.save();
        this.ctx.font = this.legendFont;
        let totalWidth = 0;
        const indicatorSize = this.mapLogicalXUnit(this.options.legend.indicatorSize);
        for (let index = 0; index < this.series.length; index++) {
            const series = this.series[index];
            if (series.name) {
                totalWidth += this.getTextWidth(series.name, this.legendFont) + indicatorSize + this.mapLogicalXUnit(this.options.elementSmallPadding + this.options.elementLargePadding);
            }
        }
        let x = this.plotArea.left + this.plotArea.width / 2 - totalWidth / 2,
            y = this.canvas.height - indicatorSize;

        for (let index = 0; index < this.renderedSeries.length; index++) {
            const series = this.renderedSeries[index];
            if (series.name) {
                this.ctx.fillStyle = series.colour;
                this.ctx.fillRect(x, y, indicatorSize, indicatorSize);
                this.ctx.textBaseline = 'middle';
                this.ctx.fillStyle = this.options.legend.font.colour;
                x += indicatorSize + this.mapLogicalXUnit(this.options.elementSmallPadding);
                this.ctx.fillText(series.name, x, y + indicatorSize / 2);
                x += this.getTextWidth(series.name, this.legendFont) + this.mapLogicalXUnit(this.options.elementLargePadding);
            }
        }
        this.ctx.restore();
    }
};
