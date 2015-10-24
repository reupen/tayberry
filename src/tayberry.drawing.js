'use strict';
var Tayberry = require('./tayberry.base.js').Tayberry;

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

Tayberry.prototype.clear = function (plot = true, labels = true) {
    if (plot) this.plotCtx.clearRect(0, 0, this.plotCanvas.width, this.plotCanvas.height);
    if (labels) this.labelsCtx.clearRect(0, 0, this.labelsCanvas.width, this.labelsCanvas.height);
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
        this.plotCtx.save();
        this.plotCtx.textAlign = align;
        this.plotCtx.textBaseline = baseline;
        this.plotCtx.fillText(text, x, y);
        this.plotCtx.restore();
    }
};


Tayberry.prototype.draw = function () {

    this.plotCtx.save();
    this.enumerateBars(function (bar) {
        this.plotCtx.fillStyle = bar.selected ? bar.renderedSeries.highlightColour : bar.renderedSeries.colour;
        this.plotCtx.fillRect(bar.rect.left, bar.rect.top, bar.rect.width, bar.rect.height);
    }.bind(this));
    this.plotCtx.restore();

    if (this.options.labels.enabled) {
        this.plotCtx.save();
        this.enumerateBars(function (bar) {
            this.plotCtx.font = this.labelFont;
            this.plotCtx.fillStyle = this.options.labels.font.colour;
            this.drawLabel(bar.value, this.options.yAxis.labelFormatter(bar.value), bar.rect);
        }.bind(this));
        this.plotCtx.restore();
    }
};

Tayberry.prototype.drawLine = function (x1, y1, x2, y2, colour) {
    this.labelsCtx.save();
    if (colour) {
        this.labelsCtx.strokeStyle = colour;
    }
    this.labelsCtx.beginPath();
    this.labelsCtx.moveTo(x1 + 0.5, y1 + 0.5);
    this.labelsCtx.lineTo(x2 + 0.5, y2 + 0.5);
    this.labelsCtx.stroke();
    this.labelsCtx.restore();
};

Tayberry.prototype.redraw = function (plotOnly) {
    this.clear(true, !plotOnly);
    if (!plotOnly) {
        this.drawTitle();
        this.xAxis.draw();
        this.yAxis.draw();
        this.drawLegend();
    }
    this.draw();
};


Tayberry.prototype.drawLegend = function () {
    if (this.options.legend.enabled) {
        this.labelsCtx.save();
        this.labelsCtx.font = this.legendFont;
        let totalWidth = 0;
        const indicatorSize = this.mapLogicalXUnit(this.options.legend.indicatorSize);
        for (let index = 0; index < this.series.length; index++) {
            const series = this.series[index];
            if (series.name) {
                totalWidth += this.getTextWidth(series.name, this.legendFont) + indicatorSize + this.mapLogicalXUnit(this.options.elementSmallPadding + this.options.elementLargePadding);
            }
        }
        let x = this.plotArea.left + this.plotArea.width / 2 - totalWidth / 2,
            y = this.labelsCanvas.height - indicatorSize;

        for (let index = 0; index < this.renderedSeries.length; index++) {
            const series = this.renderedSeries[index];
            if (series.name) {
                this.labelsCtx.fillStyle = series.colour;
                this.labelsCtx.fillRect(x, y, indicatorSize, indicatorSize);
                this.labelsCtx.textBaseline = 'middle';
                this.labelsCtx.fillStyle = this.options.legend.font.colour;
                x += indicatorSize + this.mapLogicalXUnit(this.options.elementSmallPadding);
                this.labelsCtx.fillText(series.name, x, y + indicatorSize / 2);
                x += this.getTextWidth(series.name, this.legendFont) + this.mapLogicalXUnit(this.options.elementLargePadding);
            }
        }
        this.labelsCtx.restore();
    }
};