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
        this.topAdjustment = 0;
        this.rightAdjustment = 0;
        this.titleFont = null;
        this.labelFont = null;
        this.numLabelLines = 1;

        this.setPlacement();
    }

    updateFonts() {
        this.labelFont = this.tayberry.createFontString(this.options.font);
        this.titleFont = this.tayberry.createFontString(this.options.title.font);
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
        let tb = this.tayberry;
        let ticks = this.getTicks();
        return Utils.reduce(ticks, Math.max, x => tb.getTextWidth(this.options.labelFormatter(x.value), this.labelFont));
    }

    mapLogicalXOrYUnit(x) {
        return this.isYAxis ? this.tayberry.mapLogicalXUnit(x) : this.tayberry.mapLogicalYUnit(x);
    }

    mapLogicalYOrXUnit(x) {
        return !this.isYAxis ? this.tayberry.mapLogicalXUnit(x) : this.tayberry.mapLogicalYUnit(x);
    }

    adjustSize(plotArea, fixedOnly, reset) {
        let size = 0,
            tb = this.tayberry,
            ret;

        const titleFontHeight = tb.getFontHeight(this.options.title.font);
        const fontHeight = tb.getFontHeight(this.options.font);

        if (reset) {
            this.calculatedSize = 0;
            this.topAdjustment = 0;
            this.rightAdjustment = 0;
            this.numLabelLines = 1;
        }

        size += this.mapLogicalXOrYUnit(tb.options.elementSmallPadding);
        if (this.options.title.text) {
            size += this.mapLogicalXOrYUnit(tb.options.elementSmallPadding) + titleFontHeight;
        }

        if (!fixedOnly) {
            let ticks = this.getTicks(false);
            if (this.isYAxis) {
                if (ticks.length) {
                    const lastTick = ticks[ticks.length - 1];
                    const lastTickYStart = lastTick.y - fontHeight / 2;
                    if (lastTickYStart < plotArea.top - this.topAdjustment) {
                        const adjustment = plotArea.top - lastTickYStart - this.topAdjustment + 1;
                        plotArea.top += adjustment;
                        this.topAdjustment += adjustment;
                    }
                }
                size += this.maxLabelSize()
            } else {
                {
                    let lastXEnd;
                    for (let i = 0; i < ticks.length; i++) {
                        let tick = ticks[i];
                        const textWidth = tb.getTextWidth(this.options.labelFormatter(tick.value), this.labelFont);
                        const xStart = tick.x - textWidth / 2;
                        const xEnd = tick.x + textWidth / 2;
                        if (typeof lastXEnd !== 'undefined' && xStart <= lastXEnd + 1) {
                            this.numLabelLines = 2;
                            break;
                        }
                        lastXEnd = xEnd;
                    }
                }
                if (ticks.length) {
                    const lastTick = ticks[ticks.length - 1];
                    const textWidth = tb.getTextWidth(this.options.labelFormatter(lastTick.value), this.labelFont);
                    const lastTickXEnd = lastTick.x + textWidth / 2;
                    if (lastTickXEnd >= plotArea.right + this.rightAdjustment) {
                        const adjustment = lastTickXEnd - plotArea.right - this.rightAdjustment + 1;
                        plotArea.right -= adjustment;
                        this.rightAdjustment += adjustment;
                    }
                }
                size += fontHeight * this.numLabelLines;
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

    getCategoryLabel() {
    }

    draw() {
        this.drawTicksAndLabels();
        this.drawTitle();
    }

    drawTicksAndLabels() {
        let tb = this.tayberry;
        const labelPaddingX = this.isYAxis ? this.mapLogicalXOrYUnit(tb.options.elementSmallPadding) * (this.isPlacedAtStart ? -1 : 1) : 0;
        const labelPaddingY = !this.isYAxis ? this.mapLogicalXOrYUnit(tb.options.elementSmallPadding) * (this.isPlacedAtStart ? -1 : 1) : 0;
        const fontHeight = tb.getFontHeight(this.options.font);

        tb.labelsCtx.save();
        tb.labelsCtx.font = this.labelFont;
        tb.labelsCtx.fillStyle = this.options.font.colour;
        tb.labelsCtx.textAlign = this.isYAxis ? (this.isPlacedAtStart ? 'right' : 'left') : 'center';
        tb.labelsCtx.textBaseline = this.isYAxis ? 'middle' : this.isPlacedAtStart ? 'bottom' : 'top';

        let lastXEnds = [], tickIndex = 0;

        this.enumerateTicks(function (tick) {
            let textWidth, xStart, xEnd;
            const formattedValue = this.options.labelFormatter(tick.value);
            const row = tickIndex % this.numLabelLines;
            const rowOffset = this.isYAxis ? 0 : fontHeight * row;
            if (!this.isYAxis) {
                textWidth = tb.getTextWidth(formattedValue, this.labelFont);
                xStart = tick.x - textWidth / 2;
                xEnd = tick.x + textWidth / 2;
            }

            if (this.isYAxis || (typeof lastXEnds[row] === 'undefined' || xStart > lastXEnds[row] + 1) && xStart >= 0 && xEnd < tb.labelsCanvas.width) {
                tb.labelsCtx.fillText(formattedValue, tick.x + labelPaddingX, tick.y + labelPaddingY + rowOffset);
                lastXEnds[row] = xEnd;
            }
            if (this.options.gridLines.colour)
                tb.drawLine(tick.x1, tick.y1, tick.x2, tick.y2, this.options.gridLines.colour);
            tickIndex++;
        }.bind(this));

        tb.labelsCtx.restore();
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
        if (this.options.title.text) {
            let tb = this.tayberry;
            tb.labelsCtx.save();
            tb.labelsCtx.font = this.titleFont;
            tb.labelsCtx.fillStyle = this.options.title.font.colour;
            tb.labelsCtx.textAlign = 'center';
            tb.labelsCtx.textBaseline = !this.isPlacedAtStart ? 'bottom' : 'top';

            if (this.isYAxis) {
                const x = 0;
                const y = tb.plotArea.top + (tb.plotArea.height) / 2;
                tb.labelsCtx.translate(x, y);
                tb.labelsCtx.rotate(-Math.PI / 2);
                tb.labelsCtx.fillText(this.options.title.text, 0, 0);
            } else {
                const x = tb.plotArea.left + tb.plotArea.width / 2;
                const y = tb.plotArea[this.startProperty] - this.calculatedSize;
                //tb.mapLogicalYOrXUnit(tb.options.font.size * 2 + tb.options.elementSmallPadding + tb.options.elementLargePadding)
                tb.labelsCtx.fillText(this.options.title.text, x, y);
            }
            tb.labelsCtx.restore();
        }
    }

    getTicks(visibleOnly = true) {
        let ret = [];
        this.enumerateTicks(function (tick) {
            ret.push(tick)
        }, visibleOnly);
        return ret;
    }

    getOrigin() {
    }

    updateFormatter() {
    }
}

class CategorialAxis extends Axis {
    enumerateTicks(callback) {
        let tb = this.tayberry;

        const categoryCount = this.options.categories.length;
        let plotArea = tb.plotArea.clone();
        if (this.isYAxis)
            plotArea.swapXY();
        const categoryWidth = (plotArea.width / tb.series[0].data.length);
        let factor = 0.5;

        if (!this.isYAxis) {
            switch (this.options.labelPosition) {
                case 'left':
                    factor = 0;
                    break;
                case 'right':
                    factor = 1;
                    break;
            }
        }

        for (let i = 0; i < categoryCount; i++) {
            const value = this.options.categories[i];
            let y1 = (this.isPlacedAtStart ? plotArea.top : plotArea.bottom);
            let y2 = (!this.isPlacedAtStart ? plotArea.top : plotArea.bottom);
            let x1 = plotArea.left + Math.floor(i * categoryWidth);
            let x2 = x1;
            let x = plotArea.left + Math.floor(i * categoryWidth + categoryWidth * factor);
            let y = y1;
            if (this.isYAxis)
                [x1, y1, x2, y2, x, y] = [y1, x1, y2, x2, y, x];

            callback({
                value: value,
                x1: x1,
                y1: y1,
                x2: x2,
                y2: y2,
                x: x,
                y: y
            });

        }
    }

    updateFormatter() {
        if (!this.options.labelFormatter) {
            this.options.labelFormatter = Utils.identity;
        }
    }

    getCategoryLabel(index) {
        return this.options.labelFormatter(this.options.categories[index]);
    }
}

class LinearAxis extends Axis {
    updateFormatter() {
        if (!this.options.labelFormatter) {
            if (this.options.labelFormat === 'percentage') {
                this.options.labelFormatter = Utils.createPercentageFormatter(this.max - this.min, this.options.labelPrefix, this.options.labelSuffix);
            }
            else if (this.options.labelFormat === 'currency') {
                this.options.labelFormatter = Utils.createFixedNumberFormatter(this.max - this.min, this.options.labelPrefix || this.options.currencySymbol, this.options.labelSuffix);
            }
            else {
                this.options.labelFormatter = Utils.createAutoNumberFormatter(this.max - this.min, this.options.labelPrefix, this.options.labelSuffix);
            }
        }
    }

    enumerateTicks(callback) {
        let tb = this.tayberry;

        const start = this.startProperty,
            end = this.endProperty;

        for (let yValue = this.tickStart; yValue <= this.tickEnd && this.tickStep;) {
            let y = this.getValueDisplacement(yValue);
            if (this.isYAxis) {
                if (callback({
                        value: yValue,
                        x1: tb.plotArea[start],
                        y1: y,
                        x2: tb.plotArea[end],
                        y2: y,
                        x: tb.plotArea[start],
                        y: y

                    }))
                    break;
            } else {
                if (callback({
                        value: yValue,
                        y1: tb.plotArea[start],
                        x1: y,
                        y2: tb.plotArea[end],
                        x2: y,
                        y: tb.plotArea[start],
                        x: y
                    }))
                    break;
            }
            yValue = this.tickStart + Math.round((yValue + this.tickStep - this.tickStart) / this.tickStep) * this.tickStep;
        }
    }

    static snapScaledValue(scaledStep) {
        if (scaledStep < 1)
            scaledStep = 1;
        else if (scaledStep < 2)
            scaledStep = 2;
        else if (scaledStep < 2.5)
            scaledStep = 2.5;
        else if (scaledStep < 5)
            scaledStep = 5;
        else
            scaledStep = 10;
        return scaledStep;
    }

    calculateExtent() {
        let targetTicks, approxStep, scale;

        let targetStart = this.options.min;
        let targetEnd = this.options.max;
        const overriddenStart = !Utils.isMissingValue(targetStart);
        const overriddenEnd = !Utils.isMissingValue(targetEnd);

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

        if (this.options.tickStepValue) {
            this.tickStep = this.options.tickStepValue;
            this.min = targetStart;
            this.max = targetEnd;
        } else {
            const targetRange = targetEnd - targetStart;
            targetTicks = this.plotLength / this.mapLogicalYOrXUnit(this.options.tickStep);
            approxStep = targetRange / targetTicks;
            scale = Math.pow(10, Math.floor(Math.log(approxStep) / Math.log(10)));
            let scaledStep = LinearAxis.snapScaledValue(Math.ceil(approxStep / scale));
            this.tickStep = scaledStep * scale;
            this.min = targetStart;
            this.max = targetEnd;
        }
        this.tickStart = this.options.tickStepValue && overriddenStart ? this.min : Math.floor(this.min / this.tickStep) * this.tickStep;
        this.tickEnd = this.options.tickStepValue && overriddenEnd ? this.max : Math.ceil(this.max / this.tickStep) * this.tickStep;
        if (!overriddenStart)
            this.min = this.tickStart;
        if (!overriddenEnd)
            this.max = this.tickEnd;
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

    getCategoryLabel(index, totalCategories) {
        const start = index / totalCategories;
        const end = (index + 1) / totalCategories;
        const axisRange = this.max - this.min;
        return Utils.formatString('{0} \u2264 x < {1}', [this.options.labelFormatter(this.min + start * axisRange), this.options.labelFormatter(this.min + end * axisRange)]);
    }
}

exports.Axis = Axis;