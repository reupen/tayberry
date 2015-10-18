'use strict';
var Utils = require('./utils.js');

class Axis {
    static create(tayberry, options, index, axisType, xYSwapped) {
        if (xYSwapped) {
            axisType = axisType === 'y' ? 'x' : 'y';
        }
        if (options.type === 'linear')
            return new LinearAxis(tayberry, index, options, axisType);
        else
            return new CategorialAxis(tayberry, index, options, axisType);
    }

    constructor(tayberry, index, options, axisType) {
        this.tayberry = tayberry;
        this.options = options;
        this.axisType = axisType;
        this.index = index;
        this.tickStep = null;
        this.min = null;
        this.max = null;
        this.tickStart = null;
        this.tickEnd = null;
        this.calculatedSize = 0;

        this.setPlacement();
    }

    setPlacement() {
        const validAndSpecificPlacements = ['left', 'right', 'top', 'bottom', 'start', 'end'];
        if (validAndSpecificPlacements.indexOf(this.options.placement) === -1) {
            this.options.placement = this.isYAxis ^ (this.index > 0) ? 'start' : 'end';
        }
    }

    get isPlacedAtStart() {
        return this.options.placement === "left" || this.options.placement === "bottom" || this.options.placement === "start";
    }

    get isYAxis() {
        return this.axisType === 'y';
    }

    maxLabelSize() {
    }

    mapLogicalXOrYUnit(x) {
        return this.isYAxis ? this.tayberry.mapLogicalXUnit(x) : this.tayberry.mapLogicalYUnit(x);
    }

    mapLogicalYOrXUnit(x) {
        return !this.isYAxis ? this.tayberry.mapLogicalXUnit(x) : this.tayberry.mapLogicalYUnit(x);
    }

    adjustSize(plotArea, fixedOnly = false, reset = false) {
        let size = 0,
            tb = this.tayberry,
            ret;

        if (reset)
            this.calculatedSize = 0;

        size += this.mapLogicalXOrYUnit(tb.options.elementSmallPadding);
        if (this.options.title) {
            size += this.mapLogicalXOrYUnit(tb.options.elementSmallPadding + tb.options.font.size);
        }

        if (!fixedOnly) {
            if (this.isYAxis) {
                size += this.maxLabelSize()
            } else {
                size += this.mapLogicalXOrYUnit(tb.options.font.size);
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

    calculateExtent() {
    }

    draw() {
        this.drawTicksAndLabels();
        this.drawTitle();
    }

    drawTicksAndLabels() {
    }

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

    drawTitle() {
        let tb = this.tayberry;
        tb.ctx.save();
        tb.ctx.fillStyle = tb.options.font.colour;
        tb.ctx.textAlign = 'center';
        tb.ctx.textBaseline = !this.isPlacedAtStart ? 'bottom' : 'top';

        if (this.isYAxis) {
            const x = 0;
            const y = tb.plotArea.top + (tb.plotArea.height) / 2;
            tb.ctx.translate(x, y);
            tb.ctx.rotate(-Math.PI / 2);
            tb.ctx.fillText(this.options.title, 0, 0);
        } else {
            const x = tb.plotArea.left + tb.plotArea.width / 2;
            const y = tb.plotArea[this.startProperty] - this.calculatedSize;
            //tb.mapLogicalYOrXUnit(tb.options.font.size * 2 + tb.options.elementSmallPadding + tb.options.elementLargePadding)
            tb.ctx.fillText(this.options.title, x, y);
        }
        tb.ctx.restore();
    }

    getOrigin() {
    }
}

class CategorialAxis extends Axis {
    drawTicksAndLabels() {
        var i, x, y, lastXEnd;
        let tb = this.tayberry;
        const categoryCount = this.options.categories.length;
        let plotArea = tb.plotArea.clone();
        if (this.isYAxis)
            plotArea.swapXY();
        const categoryWidth = (plotArea.width / tb.series[0].data.length);
        tb.ctx.save();
        tb.ctx.fillStyle = tb.options.font.colour;
        tb.ctx.textAlign = this.isYAxis ? 'right' : 'center';
        tb.ctx.textBaseline = this.isYAxis ? 'top' : 'top';
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
            let yMark = (this.isPlacedAtStart ? plotArea.top : plotArea.bottom);
            //let xMark = plotArea.left + Math.floor(i * categoryWidth);
            x = plotArea.left + Math.floor(i * categoryWidth + categoryWidth * factor);
            y = yMark + this.mapLogicalXOrYUnit(tb.options.elementSmallPadding) * (this.isPlacedAtStart ? -1 : 1);
            //if (this.isYAxis)
            //    tb.drawLine(yMark+1, xMark, yMark - this.mapLogicalYOrXUnit(tb.options.elementSmallPadding), xMark, tb.options.yAxis.gridLines.colour);
            //else
            //    tb.drawLine(xMark, yMark-1, xMark, yMark + this.mapLogicalYOrXUnit(tb.options.elementSmallPadding), tb.options.yAxis.gridLines.colour);

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
}

class LinearAxis extends Axis {
    maxLabelSize() {
        let tb = this.tayberry;
        return Math.max(tb.getTextWidth(this.options.labelFormatter(this.tickStart)), tb.getTextWidth(this.options.labelFormatter(this.tickEnd)));
    }

    enumerateTicks(callback) {
        var yValue, x, y;
        let tb = this.tayberry;

        const start = this.startProperty,
            end = this.endProperty;

        for (yValue = this.tickStart; yValue <= this.tickEnd && this.tickStep;) {
            x = tb.plotArea[start] + this.mapLogicalXOrYUnit(tb.options.elementSmallPadding) * (this.isPlacedAtStart ? -1 : 1);
            y = this.getValueDisplacement(yValue);
            if (this.isYAxis) {
                if (tb.plotArea.containsY(y)) {
                    if (callback({
                            value: yValue,
                            x1: tb.plotArea[start],
                            y1: y,
                            x2: tb.plotArea[end],
                            y2: y
                        }))
                        break;
                }
            } else {
                if (tb.plotArea.containsX(y)) {
                    if (callback({
                            value: yValue,
                            y1: tb.plotArea[start],
                            x1: y,
                            y2: tb.plotArea[end],
                            x2: y
                        }))
                        break;
                }
            }
            yValue = this.tickStart + Math.round((yValue + this.tickStep - this.tickStart) / this.tickStep) * this.tickStep;
        }
    }

    drawTicksAndLabels() {
        let tb = this.tayberry;
        const labelPaddingX = this.isYAxis ? this.mapLogicalXOrYUnit(tb.options.elementSmallPadding)*(this.isPlacedAtStart ? -1 : 1) : 0;
        const labelPaddingY = !this.isYAxis ? this.mapLogicalXOrYUnit(tb.options.elementSmallPadding)*(this.isPlacedAtStart ? -1 : 1) : 0;

        tb.ctx.save();
        tb.ctx.fillStyle = tb.options.font.colour;
        tb.ctx.textAlign = this.isYAxis ? 'right' : 'center';
        tb.ctx.textBaseline = this.isYAxis ? 'middle' : 'top';

        this.enumerateTicks(function(tick) {
            tb.ctx.fillText(this.options.labelFormatter(tick.value), tick.x1 + labelPaddingX, tick.y1 + labelPaddingY);
            tb.drawLine(tick.x1, tick.y1, tick.x2, tick.y2, this.options.gridLines.colour);
        }.bind(this));

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
                const [dataMin, dataMax] = this.tayberry.getDataMinMax(); //TODO: implement for x-axis
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

            targetTicks = this.plotLength / this.mapLogicalYOrXUnit(this.options.tickStep);
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

    get plotDisplacement() {
        return this.isYAxis ? (this.tayberry.plotArea.height - 1) : -(this.tayberry.plotArea.width - 1);
    }

    get plotLength() {
        return Math.abs(this.plotDisplacement);
    }

    getOrigin() {
        let ret = this.tayberry.plotArea[this.isYAxis ? 'bottom' : 'left'] - (0 - this.min) * this.plotDisplacement / (this.max - this.min);
        if (this.isYAxis) ret--;
        ret = this.isYAxis ? Math.floor(ret) : Math.ceil(ret);
        return ret;
    }

    getValueDisplacement(value) {
        let ret = this.getOrigin() - value * this.plotDisplacement / (this.max - this.min);
        ret = this.isYAxis ? Math.floor(ret) : Math.ceil(ret);
        return ret;
    }
}

exports.Axis = Axis;