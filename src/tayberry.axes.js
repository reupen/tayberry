'use strict';
var Utils = require('./utils.js');

class Axis {
    static create(tayberry, options, axisType, xYSwapped) {
        if (xYSwapped) {
            axisType = axisType === 'y' ? 'x' : 'y';
        }
        if (options.type === 'linear')
            return new LinearAxis(tayberry, options, axisType);
        else
            return new CategorialAxis(tayberry, options, axisType);
    }

    constructor(tayberry, options, axisType) {
        this.tayberry = tayberry;
        this.options = options;
        this.axisType = axisType;
        this.tickStep = null;
        this.min = null;
        this.max = null;
        this.tickStart = null;
        this.tickEnd = null;
        this.calculatedSize = 0;
    }

    get isPlacedAtStart() {
        return this.options.placement === "left" || this.options.placement === "bottom" || this.options.placement === "start";
    }

    get isYAxis() {
        return this.axisType === 'y';
    }

    maxLabelSize() {}

    adjustSize(plotArea, fixedOnly = false, reset = false) {
        let size = 0,
            tb = this.tayberry,
            ret;

        if (reset)
            this.calculatedSize = 0;

        size += tb.mapLogicalXUnit(tb.options.elementLargePadding);
        if (this.options.title) {
            size += tb.mapLogicalXUnit(tb.options.elementSmallPadding + tb.options.font.size);
        }

        if (!fixedOnly) {
            if (this.isYAxis) {
                size += this.maxLabelSize()
            } else {
                size += tb.mapLogicalYUnit(tb.options.font.size);
            }
        }

        if (this.isPlacedAtStart) {
            if (this.isYAxis) {
                plotArea.left += size - this.calculatedSize;
            } else {
                plotArea.top += size - this.calculatedSize;
            }
        } else {
            size *= -1;
            if (this.isYAxis) {
                plotArea.right += size - this.calculatedSize;
            } else {
                plotArea.bottom += size - this.calculatedSize;
            }
        }

        ret = this.calculatedSize !== size;
        this.calculatedSize = size;

        return ret;
    }

    calculateExtent() {}

    draw() {
        this.drawTicksAndLabels();
        this.drawTitle();
    }

    drawTicksAndLabels() {}

    get startProperty() {
        if (this.isYAxis)
            return this.isPlacedAtStart ? 'left' : 'right';
        else
            return this.isPlacedAtStart ? 'top' : 'bottom';
    }

    get endProperty() {
        if (this.isYAxis)
            return !this.isPlacedAtStart ? 'left' : 'right';
        else
            return !this.isPlacedAtStart ? 'top' : 'bottom';
    }

    get plotDisplacement() {
        return this.isYAxis ? this.tayberry.plotArea.height : -this.tayberry.plotArea.width;
    }

    get plotLength() {
        return Math.abs(this.plotDisplacement);
    }

    getValueSize(value) {
        return Math.round( value * this.plotDisplacement / (this.max - this.min));
    }

    drawTitle() {
        let tb = this.tayberry;
        tb.ctx.save();
        tb.ctx.fillStyle = tb.options.font.colour;
        tb.ctx.textAlign = 'center';
        tb.ctx.textBaseline = !this.isPlacedAtStart  ? 'bottom' : 'top';

        if (this.isYAxis) {
            const x = 0;
            const y = tb.plotArea.top + (tb.plotArea.height) / 2;
            tb.ctx.translate(x, y);
            tb.ctx.rotate(-Math.PI / 2);
            tb.ctx.fillText(this.options.title, 0, 0);
        } else {
            const x = tb.plotArea.left + tb.plotArea.width / 2;
            const y = tb.plotArea[this.startProperty] - this.calculatedSize;
            //tb.mapLogicalYUnit(tb.options.font.size * 2 + tb.options.elementSmallPadding + tb.options.elementLargePadding)
            tb.ctx.fillText(this.options.title, x, y);
        }
        tb.ctx.restore();
    }

    getOrigin() {}
}

class CategorialAxis extends Axis {
    drawTicksAndLabels() {
        var i, barWidth, x, y, lastXEnd;
        let tb = this.tayberry;
        const categoryCount = this.options.categories.length;
        let plotArea = tb.plotArea.clone();
        if (this.isYAxis)
            plotArea.swapXY();
        barWidth = Math.floor(plotArea.width / tb.series[0].data.length);
        tb.ctx.save();
        tb.ctx.fillStyle = tb.options.font.colour;
        tb.ctx.textAlign = this.isYAxis ? 'right' : 'center';
        tb.ctx.textBaseline = this.isYAxis ? 'top' : 'middle';
        let factor;
        switch (this.options.labelPosition) {
            case 'left':
                factor = 0;
                break;
            case 'right':
                factor = 1;
                break;
            default:
                factor = 0.5;
                break;
        }
        for (i = 0; i < categoryCount; i++) {
            x = plotArea.left + Math.floor(i * barWidth + barWidth * factor);
            y = (this.isPlacedAtStart ? plotArea.top : plotArea.bottom) + tb.mapLogicalYUnit(tb.options.elementLargePadding)*(this.isPlacedAtStart ? -1 : 1);
            const textWidth = tb.getTextWidth(this.options.categories[i]);
            const xStart = x - textWidth / 2;
            const xEnd = x + textWidth / 2;
            if (typeof lastXEnd === 'undefined' || xStart > lastXEnd + 1) {
                if (this.isYAxis)
                    [x, y] = [y, x];
                tb.ctx.fillText(this.options.categories[i], x, y);
                lastXEnd = xEnd;
            }
        }
        tb.ctx.restore();
    }

    maxLabelSize() {
        let tb = this.tayberry;
        return Utils.reduce(this.options.categories, Math.max, tb.getTextWidth.bind(tb));
    }

    //getOrigin() {
    //    return this.tayberry.plotArea[this.isYAxis ? 'bottom' : 'left'];
    //}
}

class LinearAxis extends Axis {
    maxLabelSize() {
        let tb = this.tayberry;
        return Math.max(tb.getTextWidth(this.options.labelFormatter(this.tickStart)), tb.getTextWidth(this.options.labelFormatter(this.tickEnd)));
    }

    drawTicksAndLabels() {
        var yValue, x, y;
        let tb = this.tayberry;

        const yOrigin = this.getOrigin();

        const start = this.startProperty,
            end = this.endProperty;

        tb.ctx.save();
        tb.ctx.fillStyle = tb.options.font.colour;
        tb.ctx.textAlign = this.isYAxis ? 'right' : 'center';
        tb.ctx.textBaseline = this.isYAxis ? 'middle' : 'top';

        for (yValue = this.tickStart; yValue <= this.tickEnd && this.tickStep;) {
            yValue = this.tickStart + Math.round((yValue + this.tickStep - this.tickStart) / this.tickStep) * this.tickStep;
            x = tb.plotArea[start] + tb.mapLogicalXUnit(tb.options.elementSmallPadding)*(this.isPlacedAtStart ? -1 : 1);
            const valueHeight = this.getValueSize(yValue);
            y = yOrigin - valueHeight;
            if (this.isYAxis) {
                if (tb.plotArea.containsY(y)) {
                    tb.ctx.fillText(this.options.labelFormatter(yValue), x, y);
                    tb.drawLine(tb.plotArea[start], y, tb.plotArea[end], y, this.options.gridLines.colour);
                }
            } else {
                if (tb.plotArea.containsX(y)) {
                    tb.ctx.fillText(this.options.labelFormatter(yValue), y, x);
                    tb.drawLine(y, tb.plotArea[start], y, tb.plotArea[end], this.options.gridLines.colour);
                }
            }
        }

        tb.ctx.restore();
    }

    calculateExtent() {
        if (this.options.type === 'linear') {
            let targetTicks, approxStep, scale;

            let targetStart = this.options.min;
            let targetEnd = this.options.max;
            const overriddenStart = typeof targetStart !== 'undefined';
            const overriddenEnd = typeof targetEnd !== 'undefined';

            if (!overriddenStart || !overriddenEnd) {
                const [dataMin, dataMax] = this.tayberry.getDataMinMax();
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

            targetTicks = this.plotLength / this.tayberry.mapLogicalYUnit(this.options.tickStep);
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
        }
    }
    getOrigin() {
        return this.tayberry.plotArea[this.isYAxis ? 'bottom' : 'left'] - this.getValueSize(0 - this.min);
    }
}

exports.Axis = Axis;