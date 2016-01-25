'use strict';
import * as Utils from './helpers/utils.js';

export class Axis {
    static create(tayberry, options, index, axisType, xYSwapped) {
        const isHorizontal = (axisType === 'x' && !xYSwapped) || (axisType === 'y' && xYSwapped);
        if (options.type === 'linear')
            return new LinearAxis(tayberry, index, options, axisType, isHorizontal);
        else
            return new CategorialAxis(tayberry, index, options, axisType, isHorizontal);
    }

    constructor(tayberry, index, options, axisType, isHorizontal) {
        this.tayberry = tayberry;
        this.options = options;
        this.axisType = axisType;
        this.isHorizontal = isHorizontal;
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
            this.options.placement = this.isVertical ^ (this.index > 0) ? 'start' : 'end';
        }
    }

    get isPlacedAtStart() {
        return this.options.placement === "left" || this.options.placement === "bottom" || this.options.placement === "start";
    }

    get isYAxis() {
        return this.axisType === 'y';
    }

    get isVertical() {
        return !this.isHorizontal;
    }

    maxLabelSize() {
        let tb = this.tayberry;
        let ticks = this.getTicks();
        return Utils.reduce(ticks, Math.max, x => tb.getTextWidth(this.options.labelFormatter(x.value), this.labelFont));
    }

    mapLogicalXOrYUnit(x) {
        return this.isVertical ? this.tayberry.mapLogicalXUnit(x) : this.tayberry.mapLogicalYUnit(x);
    }

    mapLogicalYOrXUnit(x) {
        return !this.isVertical ? this.tayberry.mapLogicalXUnit(x) : this.tayberry.mapLogicalYUnit(x);
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
            if (this.isVertical) {
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
            if (this.isVertical) {
                plotArea.left += size - this.calculatedSize;
            } else {
                plotArea.top += size - this.calculatedSize;
            }
        } else {
            size *= -1;
            if (this.isVertical) {
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

    draw(offsetRect) {
        this.drawTicksAndLabels(offsetRect);
        this.drawTitle(offsetRect);
    }

    drawTicksAndLabels(offsetRect) {
        let tb = this.tayberry;
        const labelPadding = this.mapLogicalXOrYUnit(tb.options.elementSmallPadding);
        const labelPaddingX = this.isVertical ? labelPadding * (this.isPlacedAtStart ? -1 : 1) : 0;
        const labelPaddingY = !this.isVertical ? labelPadding * (this.isPlacedAtStart ? -1 : 1) : 0;
        const fontHeight = tb.getFontHeight(this.options.font);
        const xOffset = this.isVertical ? offsetRect[this.startProperty] : 0;
        const yOffset = !this.isVertical ? offsetRect[this.startProperty] : 0;

        tb.labelsCtx.save();
        tb.labelsCtx.font = this.labelFont;
        tb.labelsCtx.fillStyle = this.options.font.colour;
        tb.labelsCtx.textAlign = this.isVertical ? (this.isPlacedAtStart ? 'right' : 'left') : 'center';
        tb.labelsCtx.textBaseline = this.isVertical ? 'middle' : this.isPlacedAtStart ? 'bottom' : 'top';

        let lastXEnds = [],
            tickIndex = 0,
            maxWidth = 0;

        this.enumerateTicks((tick) => {
            let xStart, xEnd;
            const formattedValue = this.options.labelFormatter(tick.value);
            const row = tickIndex % this.numLabelLines;
            const rowOffset = this.isVertical ? 0 : fontHeight * row;
            const textWidth = tb.getTextWidth(formattedValue, this.labelFont);
            if (!this.isVertical) {
                xStart = tick.x - textWidth / 2;
                xEnd = tick.x + textWidth / 2;
            }

            if (this.isVertical || (typeof lastXEnds[row] === 'undefined' || xStart > lastXEnds[row] + 1) && xStart >= 0 && xEnd < tb.labelsCanvas.width) {
                maxWidth = Math.max(maxWidth, textWidth);
                tb.labelsCtx.fillText(formattedValue, tick.x + labelPaddingX + xOffset, tick.y + labelPaddingY + rowOffset + yOffset);
                lastXEnds[row] = xEnd;
            }
            if (this.options.gridLines.colour)
                tb.drawLine(tick.x1, tick.y1, tick.x2, tick.y2, this.options.gridLines.colour);
            tickIndex++;
        });

        this.adjustOffsetRect(offsetRect, this.isVertical ? maxWidth + labelPadding : fontHeight + labelPadding);

        tb.labelsCtx.restore();
    }

    adjustOffsetRect(offsetRect, displacement) {
        offsetRect[this.startProperty] += this.isPlacedAtStart ? -displacement : displacement;
    }

    get startProperty() {
        if (this.isVertical)
            return this.isPlacedAtStart ? 'left' : 'right';
        else
            return this.isPlacedAtStart ? 'top' : 'bottom';
    }

    get endProperty() {
        if (this.isVertical)
            return !this.isPlacedAtStart ? 'left' : 'right';
        else
            return !this.isPlacedAtStart ? 'top' : 'bottom';
    }

    drawTitle(offsetRect) {
        if (this.options.title.text) {
            let tb = this.tayberry;
            tb.labelsCtx.save();
            tb.labelsCtx.font = this.titleFont;
            tb.labelsCtx.fillStyle = this.options.title.font.colour;
            tb.labelsCtx.textAlign = 'center';

            const labelPaddingSize = this.mapLogicalXOrYUnit(tb.options.elementSmallPadding);
            const labelPadding = labelPaddingSize * (this.isPlacedAtStart ? -1 : 1);
            const xOffset = this.isVertical ? offsetRect[this.startProperty] : 0;
            const yOffset = !this.isVertical ? offsetRect[this.startProperty] : 0;
            const fontHeight = tb.getFontHeight(this.options.title.font);

            if (this.isVertical) {
                tb.labelsCtx.textBaseline = 'bottom';
                const x = tb.plotArea[this.startProperty] + xOffset + labelPadding;
                const y = tb.plotArea.yMidpoint + yOffset;
                tb.labelsCtx.translate(x, y);
                tb.labelsCtx.rotate((this.isPlacedAtStart ? -1 : 1)*Math.PI / 2);
                tb.labelsCtx.fillText(this.options.title.text, 0, 0);
            } else {
                tb.labelsCtx.textBaseline = this.isPlacedAtStart ? 'bottom' : 'top';
                const x = tb.plotArea.xMidpoint + xOffset;
                const y = tb.plotArea[this.startProperty] + labelPadding + yOffset;
                //tb.mapLogicalYOrXUnit(tb.options.font.size * 2 + tb.options.elementSmallPadding + tb.options.elementLargePadding)
                tb.labelsCtx.fillText(this.options.title.text, x, y);
            }
            this.adjustOffsetRect(offsetRect, fontHeight + labelPaddingSize);
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

    get valueOrigin() {
        return this.min <= 0 && 0 <= this.max ? 0 : (this.min > 0 ? this.min : this.max)
    }
}

class CategorialAxis extends Axis {
    enumerateTicks(callback) {
        let tb = this.tayberry;

        const categoryCount = this.options.categories.length;
        let plotArea = tb.plotArea.clone();
        if (this.isVertical)
            plotArea.swapXY();
        const categoryWidth = (plotArea.width / tb.categoryCount);
        let factor = 0.5;

        if (!this.isVertical) {
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
            if (this.isVertical)
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

    get plotDisplacement() {
        return this.isVertical ? (-this.tayberry.plotArea.height) : (this.tayberry.plotArea.width);
    }

    getOrigin() {
        return this.tayberry.plotArea[this.isVertical ? 'bottom' : 'left'];
    }

    getValueDisplacement(value) {
        let ret = this.getOrigin() + this.plotDisplacement * (value + 0.5) / this.options.categories.length;
        ret = this.isVertical ? Math.floor(ret) : Math.ceil(ret);
        return ret;
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
            if (this.isVertical) {
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
            const [dataMin, dataMax] = this.isYAxis ? this.tayberry.getDataMinMax(this) : this.tayberry.getDataXMinMax(this);
            const dataRange = dataMax - dataMin;
            if (!overriddenStart) {
                targetStart = dataMin;
                if (this.isYAxis) {
                    targetStart = targetStart - dataRange * 0.1;
                    if (dataMin >= 0 && targetStart < 0)
                        targetStart = 0;
                }
            }
            if (!overriddenEnd) {
                targetEnd = dataMax;
                if (this.isYAxis) {
                    targetEnd = dataMax + dataRange * 0.1;
                    if (dataMax <= 0 && targetStart > 0)
                        targetEnd = 0;
                }
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
        if (!overriddenStart && this.isYAxis)
            this.min = this.tickStart;
        if (!overriddenEnd && this.isYAxis)
            this.max = this.tickEnd;
    }

    get plotDisplacement() {
        return this.isVertical ? (this.tayberry.plotArea.height - 1) : -(this.tayberry.plotArea.width - 1);
    }

    get plotLength() {
        return Math.abs(this.plotDisplacement);
    }

    getOrigin() {
        let ret = this.tayberry.plotArea[this.isVertical ? 'bottom' : 'left'] - (0 - this.min) * this.plotDisplacement / (this.max - this.min);
        if (this.isVertical) ret--;
        ret = this.isVertical ? Math.floor(ret) : Math.ceil(ret);
        return ret;
    }

    getValueDisplacement(value) {
        let ret = this.getOrigin() - value * this.plotDisplacement / (this.max - this.min);
        ret = this.isVertical ? Math.floor(ret) : Math.ceil(ret);
        return ret;
    }

    getCategoryLabel(index, totalCategories, isRange) {
        if (isRange) {
            const start = index / totalCategories;
            const end = (index + 1) / totalCategories;
            const axisRange = this.max - this.min;
            return Utils.formatString('{0} \u2264 x < {1}', [this.options.labelFormatter(this.min + start * axisRange), this.options.labelFormatter(this.min + end * axisRange)]);
        } else {
            return this.options.labelFormatter(index);
        }
    }
}
