'use strict';
var Utils = require('./utils.js');

class Axis {
    constructor(tayberry, options) {
        this.tayberry = tayberry;
        this.options = options;
        this.tickStep = null;
        this.min = null;
        this.max = null;
        this.tickStart = null;
        this.tickEnd = null;
    }

    calculateExtent() {
        var targetTicks, approxStep, scale;

        let targetStart = this.options.min;
        let targetEnd = this.options.max;
        const overriddenStart = typeof targetStart !== 'undefined';
        const overriddenEnd = typeof targetEnd !== 'undefined';

        if (!overriddenStart || !overriddenEnd) {
            const [dataMin, dataMax] = this.tayberry.calculateYDataMinMax();
            const dataRange = dataMax - dataMin;
            if (!overriddenStart) {
                targetStart = dataMin - dataRange * 0.1;
                if (dataMin >= 0 && targetStart < 0)
                    targetStart = 0;
            }
            if (!overriddenEnd) {
                targetEnd = dataMax + dataRange * 0.1;
                if (dataMax <= 0 && targetStart > 0)
                    targetEnd = 0;
            }
        }

        const targetRange = targetEnd - targetStart;

        targetTicks = this.tayberry.plotArea.height / this.tayberry.mapLogicalYUnit(this.options.tickStep);
        approxStep = targetRange / targetTicks;
        scale = Math.pow(10, Math.floor(Math.log(approxStep) / Math.log(10)));
        this.tickStep = Math.ceil(approxStep / scale) * scale;
        this.min = targetStart;
        this.max = targetEnd;
        if (!overriddenStart)
            this.min = Math.floor(this.min / scale) * scale;
        if (!overriddenEnd)
            this.max = Math.ceil(this.max / scale) * scale;
        this.tickStart = Math.floor(this.min / this.tickStep) * this.tickStep;
        this.tickEnd = Math.ceil(this.max / this.tickStep) * this.tickStep;
    };

    drawLinear() {
        var yValue, x, y;
        let tb = this.tayberry;

        const yOrigin = tb.getYOrigin();
        tb.ctx.save();
        tb.ctx.fillStyle = tb.options.font.colour;
        tb.ctx.textAlign = 'right';
        tb.ctx.textBaseline = 'middle';

        for (yValue = this.tickStart; yValue <= this.tickEnd && this.tickStep;) {
            yValue = this.tickStart + Math.round((yValue + this.tickStep - this.tickStart) / this.tickStep) * this.tickStep;
            x = tb.plotArea.left - tb.mapLogicalXUnit(tb.options.elementSmallPadding);
            const valueHeight = tb.getYHeight(yValue);
            y = yOrigin - valueHeight;
            if (tb.plotArea.containsY(y)) {
                tb.ctx.fillText(this.options.labelFormatter(yValue), x, y);
                tb.drawLine(tb.plotArea.left, y, tb.plotArea.right, y, this.options.gridLines.colour);
            }
        }

        x = 0;
        y = tb.plotArea.top + tb.plotArea.height / 2;
        tb.ctx.textAlign = 'center';
        tb.ctx.textBaseline = 'top';
        tb.ctx.translate(x, y);
        tb.ctx.rotate(-Math.PI / 2);
        tb.ctx.fillText(this.options.title, 0, 0);
        tb.ctx.restore();
    };

    drawCategory() {
        var i, barWidth, x, y, lastXEnd;
        let tb = this.tayberry;
        const categoryCount = tb.categories.length;
        barWidth = Math.floor(tb.plotArea.width / tb.series[0].data.length);
        tb.ctx.save();
        tb.ctx.fillStyle = tb.options.font.colour;
        tb.ctx.textAlign = 'center';
        tb.ctx.textBaseline = 'bottom';
        let factor;
        switch (this.options.labelPosition) {
            case 'left':
                factor = 0;
                break;
            case 'right':
                factor = 0;
                break;
            default:
                factor = 0.5;
                break;
        }
        for (i = 0; i < categoryCount; i++) {
            x = tb.plotArea.left + Math.floor(i * barWidth + barWidth * factor);
            y = tb.plotArea.bottom + tb.mapLogicalYUnit(tb.options.font.size + tb.options.elementSmallPadding);
            const textWidth = tb.getTextWidth(tb.categories[i]);
            const xStart = x - textWidth / 2;
            const xEnd = x + textWidth / 2;
            if (typeof lastXEnd === 'undefined' || xStart > lastXEnd + 1) {
                tb.ctx.fillText(tb.categories[i], x, y);
                lastXEnd = xEnd;
            }
        }
        x = tb.plotArea.left + tb.plotArea.width / 2;
        y = tb.plotArea.bottom + tb.mapLogicalYUnit(tb.options.font.size * 2 + tb.options.elementSmallPadding + tb.options.elementLargePadding);
        tb.ctx.fillText(this.options.title, x, y);
        tb.ctx.restore();
    };
}

exports.Axis = Axis;