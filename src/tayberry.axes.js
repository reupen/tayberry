'use strict';
var Utils = require('./utils.js');

class Axis {
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
                if (this.options.type === "linear") // TODO: Check all labels
                    size += Math.max(tb.getTextWidth(this.options.labelFormatter(this.tickStart)), tb.getTextWidth(this.options.labelFormatter(this.tickEnd)));
                else {
                    //TODO
                }
            } else {
                size += tb.mapLogicalYUnit(tb.options.font.size);
            }
        }

        if (this.isYAxis) {
            if (this.isPlacedAtStart) {
                plotArea.left += size - this.calculatedSize;
            } else {
                size *= -1;
                plotArea.right += size - this.calculatedSize;
            }
        } else {
            if (this.isPlacedAtStart) {
                plotArea.top += size - this.calculatedSize;
            } else {
                size *= -1;
                plotArea.bottom += size - this.calculatedSize;
            }
        }

        ret = this.calculatedSize !== size;
        this.calculatedSize = size;

        return ret;
    }

    calculateExtent() {
        if (this.options.type === 'linear') {
            let targetTicks, approxStep, scale;

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
        }
    };

    draw() {
        if (this.options.type === 'linear') {
            this.drawLinear();
        } else {
            this.drawCategory();
        }
        this.drawTitle();
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

    getValueSize(value) {
        return Math.round(value * this.tayberry.plotArea.height / (this.max - this.min));
    }

    drawLinear() {
        var yValue, x, y;
        let tb = this.tayberry;

        const yOrigin = this.getOrigin();

        const start = this.startProperty,
            end = this.endProperty;

        tb.ctx.save();
        tb.ctx.fillStyle = tb.options.font.colour;
        tb.ctx.textAlign = 'right';
        tb.ctx.textBaseline = 'middle';

        for (yValue = this.tickStart; yValue <= this.tickEnd && this.tickStep;) {
            yValue = this.tickStart + Math.round((yValue + this.tickStep - this.tickStart) / this.tickStep) * this.tickStep;
            x = tb.plotArea[start] - tb.mapLogicalXUnit(tb.options.elementSmallPadding);
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
    };

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
        tb.ctx.restore();
    };

    getOrigin() {
        if (this.options.type === 'linear')
            return this.tayberry.plotArea[this.isYAxis ? 'bottom' : 'left'] - this.getValueSize(0 - this.min);
        else
            return this.tayberry.plotArea[this.isYAxis ? 'bottom' : 'left'];
    }
}

exports.Axis = Axis;