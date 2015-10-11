'use strict';
var Utils = require('./utils.js');

var Tayberry = require('./tayberry.base.js').Tayberry;

Tayberry.prototype.calculateYAxisExtent = function () {
    var targetTicks, approxStep, scale;

    let targetYStart = this.options.yAxis.min;
    let targetYEnd = this.options.yAxis.max;
    const overriddenStart = typeof targetYStart !== 'undefined';
    const overriddenEnd = typeof targetYEnd !== 'undefined';

    if (!overriddenStart || !overriddenEnd) {
        const [dataYMin, dataYMax] = this.calculateYDataMinMax();
        const dataYRange = dataYMax - dataYMin;
        if (!overriddenStart) {
            targetYStart = dataYMin - dataYRange * 0.1;
            if (dataYMin >= 0 && targetYStart < 0)
                targetYStart = 0;
        }
        if (!overriddenEnd) {
            targetYEnd = dataYMax + dataYRange * 0.1;
            if (dataYMax <= 0 && targetYStart > 0)
                targetYEnd = 0;
        }
    }

    const targetYRange = targetYEnd - targetYStart;

    targetTicks = this.plotArea.height / this.mapLogicalYUnit(this.options.yAxis.tickStep);
    approxStep = targetYRange / targetTicks;
    scale = Math.pow(10, Math.floor(Math.log(approxStep) / Math.log(10)));
    this.yTickStep = Math.ceil(approxStep / scale) * scale;
    this.yMin = targetYStart;
    this.yMax = targetYEnd;
    if (!overriddenStart)
        this.yMin = Math.floor(this.yMin / scale) * scale;
    if (!overriddenEnd)
        this.yMax = Math.floor(this.yMax / scale) * scale;
    if (this.yMin <= 0 && 0 <= this.yMax) {
        this.yTickStart = Math.floor(Math.abs(this.yMin) / this.yTickStep) * Utils.sign(this.yMin) * this.yTickStep;
        this.yTickEnd = Math.floor(Math.abs(this.yMax) / this.yTickStep) * Utils.sign(this.yMax) * this.yTickStep;
    } else {
        this.yTickStart = Math.ceil(this.yMin / this.yTickStep) * this.yTickStep;
        this.yTickEnd = Math.floor(this.yMax / this.yTickStep) * this.yTickStep;
    }
};

Tayberry.prototype.drawXAxis = function () {
    var i, barCount, barWidth, x, y;
    barCount = this.renderedSeries[0].data.length;
    barWidth = Math.floor(this.plotArea.width / this.series[0].data.length);
    this.ctx.save();
    this.ctx.fillStyle = this.options.font.colour;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'bottom';
    for (i = 0; i < barCount; i++) {
        x = this.plotArea.left + Math.floor(i * barWidth + barWidth / 2);
        y = this.plotArea.bottom + this.mapLogicalYUnit(this.options.font.size + this.options.elementPadding);
        this.ctx.fillText(this.categories[i], x, y);
    }
    x = this.plotArea.left + this.plotArea.width / 2;
    y = this.plotArea.bottom + this.mapLogicalYUnit(this.options.font.size + this.options.elementPadding) * 2;
    this.ctx.fillText(this.options.xAxis.title, x, y);
    this.ctx.restore();
};

Tayberry.prototype.drawYAxis = function () {
    var yValue, x, y;

    const yOrigin = this.getYOrigin();
    this.ctx.save();
    this.ctx.fillStyle = this.options.font.colour;
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'middle';

    for (yValue = this.yTickStart; yValue <= this.yTickEnd && this.yTickStep; yValue += this.yTickStep) {
        x = this.plotArea.left - this.mapLogicalXUnit(this.options.elementPadding);
        const valueHeight = this.getYHeight(yValue);
        y = yOrigin - valueHeight;
        this.ctx.fillText(this.options.yAxis.labelFormatter(yValue), x, y);
        this.drawLine(this.plotArea.left, y, this.plotArea.right, y, this.options.yAxis.gridLines.colour);
    }

    x = 0;
    y = this.plotArea.top + this.plotArea.height / 2;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    this.ctx.translate(x, y);
    this.ctx.rotate(-Math.PI / 2);
    this.ctx.fillText(this.options.yAxis.title, 0, 0);
    this.ctx.restore();
};
