'use strict';
var Tayberry = require('./tayberry.base.js').Tayberry;

Tayberry.prototype.render = function () {
    this.calculatePlotArea();
    this.calculateYAxisExtent();
    this.finalisePlotArea();
    this.animator = requestAnimationFrame(this.onAnimate.bind(this));
    this.animatationStart = performance.now();
    this.animationLength = 500;
    this.drawXAxis();
    this.drawYAxis();
    this.createTooltip();
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
        this.ctx.fillStyle = this.options.font.colour;
        this.ctx.fillText(this.options.title.text, x, y);
        this.ctx.restore();
    }
};

Tayberry.prototype.drawLabel = function (sign, text, rect) {
    const x = (rect.left + rect.right) / 2;
    let y;
    if (this.options.labels.verticalAlignment === 'top')
        y = rect.top;
    else if (this.options.labels.verticalAlignment === 'bottom')
        y = rect.bottom;
    else
        y = (rect.top + rect.bottom) / 2;
    if (this.plotArea.containsPoint(x, y)) {
        this.ctx.save();
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = Tayberry.mapVerticalPosition(sign, this.options.labels.verticalPosition);
        this.ctx.fillStyle = this.options.font.colour;
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
            this.drawLabel(bar.value, bar.value.toString(), bar.rect);
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
    this.drawXAxis();
    this.drawYAxis();
    this.drawLegend();
    this.draw();
};


Tayberry.prototype.drawLegend = function () {
    if (this.options.legend.enabled) {
        let totalWidth = 0;
        const indicatorSize = this.mapLogicalUnit(this.options.legend.indicatorSize);
        for (let series of this.series) {
            if (series.name) {
                totalWidth += this.getTextWidth(series.name) + indicatorSize + this.mapLogicalUnit(4) + this.mapLogicalUnit(this.options.elementPadding);
            }
        }
        let x = this.plotArea.left + this.plotArea.width / 2 - totalWidth / 2,
            y = this.canvas.height - indicatorSize;

        for (let series of this.renderedSeries) {
            if (series.name) {
                this.ctx.fillStyle = series.colour;
                this.ctx.fillRect(x, y, indicatorSize, indicatorSize);
                this.ctx.textBaseline = 'middle';
                this.ctx.fillStyle = this.options.font.colour;
                x += indicatorSize + this.mapLogicalUnit(4);
                this.ctx.fillText(series.name, x, y + indicatorSize / 2);
                x += this.getTextWidth(series.name) + this.mapLogicalUnit(this.options.elementPadding);
            }
        }
    }
};
