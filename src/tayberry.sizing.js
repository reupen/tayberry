'use strict';
var Rect = require('./rect').Rect;
var Utils = require('./utils');

var Tayberry = require('./tayberry.base.js').Tayberry;

Tayberry.mapVerticalPosition = function (sign, position) {
    switch (position) {
        case "outside":
            return sign > 0 ? "bottom" : "top";
        case "inside":
            return sign > 0 ? "top" : "bottom";
        default:
            return "middle";
    }
};

Tayberry.prototype.mapLogicalXUnit = function (x) {
    return this.scaleFactorX * x;
};

Tayberry.prototype.mapLogicalYUnit = function (x) {
    return this.scaleFactorY * x;
};

Tayberry.prototype.mapScreenUnit = function (x) {
    return x / this.scaleFactor;
};

Tayberry.prototype.getTextWidth = function (text) {
    return this.ctx.measureText(text).width;
};

Tayberry.prototype.calculatePlotArea = function () {
    this.plotArea = new Rect(0, 0, this.canvas.width, this.canvas.height);
    if (this.options.title.text) {
        this.plotArea.top += this.mapLogicalYUnit(this.options.elementSmallPadding + this.options.title.font.size);
    }
    if (this.options.yAxis.title) {
        this.plotArea.left += this.mapLogicalXUnit(this.options.elementLargePadding + this.options.font.size);
    }
    if (this.options.xAxis.title) {
        this.plotArea.bottom -= this.mapLogicalYUnit(this.options.elementLargePadding + this.options.font.size);
    }
    this.plotArea.bottom -= this.mapLogicalYUnit(this.options.font.size);
    if (this.options.legend.enabled)
        this.plotArea.bottom -= this.mapLogicalYUnit(this.options.elementSmallPadding + this.options.elementLargePadding + this.options.legend.indicatorSize);
};

Tayberry.prototype.finalisePlotArea = function () {
    this.plotArea.left += Math.max(this.getTextWidth(this.options.yAxis.labelFormatter(this.yAxis.tickStart)), this.getTextWidth(this.options.yAxis.labelFormatter(this.yAxis.tickEnd))) + this.mapLogicalXUnit(this.options.elementSmallPadding);
    this.plotArea.left = Math.floor(this.plotArea.left);
    this.plotArea.top = Math.floor(this.plotArea.top);
    this.plotArea.right = Math.ceil(this.plotArea.right);
    this.plotArea.bottom = Math.ceil(this.plotArea.bottom);
};

Tayberry.prototype.getYHeight = function (value) {
    return Math.round(value * this.plotArea.height / (this.yAxis.max - this.yAxis.min));
};

Tayberry.prototype.hitTest = function (x, y) {
    // TODO: Optimise
    let ret = {
        found: false,
        categoryIndex: undefined,
        seriesIndex: undefined,
        rect: undefined
    };

    let matches = [];

    const isOverlaid = this.options.barMode === 'overlaid';

    this.enumerateBars(function (bar) {
        if (bar.rect.containsPoint(x, y)) {
            matches.push({
                categoryIndex: bar.categoryIndex,
                seriesIndex: bar.seriesIndex,
                rect: bar.rect
            });
            if (!isOverlaid)
                return true;
        }
    }.bind(this));

    if (matches.length) {
        ret.found = true;
        let minMatchIndex = 0, minHeight = matches[0].rect.height;
        for (let index = 1; index < matches.length; index++) {
            const match = matches[index];
            if (match.rect.height < minHeight) {
                minMatchIndex = index;
                minHeight = match.rect.height;
            }
        }
        ret = Utils.assign(ret, matches[minMatchIndex]);
    }
    return ret;
};

Tayberry.prototype.getYOrigin = function () {
    return this.plotArea.bottom - this.getYHeight(0 - this.yAxis.min);
};

Tayberry.prototype.enumerateBars = function (callback) {
    const categoryCount = this.renderedSeries[0].data.length;
    if (categoryCount) {
        const isStacked = this.options.barMode === 'stacked';
        const isOverlaid = this.options.barMode === 'overlaid';
        const isNormal = !isStacked && !isOverlaid;
        const barCount = (isStacked || isOverlaid) ? 1 : this.series.length;
        const categoryWidth = Math.floor(this.plotArea.width / categoryCount);
        const barWidth = Math.floor(categoryWidth * (1 - this.options.categorySpacing) / barCount);
        const yOrigin = this.getYOrigin();

        for (let categoryIndex = 0; categoryIndex < categoryCount; categoryIndex++) {
            let x = this.plotArea.left + Math.floor(categoryIndex * categoryWidth + categoryWidth * this.options.categorySpacing / 2);
            const cx = barWidth;
            let yBottomPositive = yOrigin,
                yBottomNegative = yOrigin,
                yRunningTotalPositive = 0,
                yRunningTotalNegative = 0;
            for (let seriesIndex = 0; seriesIndex < this.renderedSeries.length; seriesIndex++) {
                const value = this.renderedSeries[seriesIndex].data[categoryIndex];
                if (Utils.isMissingValue(value))
                    continue;
                const yTop = yOrigin - this.getYHeight(value + (value > 0 ? yRunningTotalPositive : yRunningTotalNegative));
                let rect = new Rect(x, yTop, x + cx, value > 0 ? yBottomPositive : yBottomNegative);
                rect.left += Math.ceil(this.options.barPadding * this.scaleFactor / 2);
                rect.right -= Math.floor(this.options.barPadding * this.scaleFactor / 2);
                if (rect.right < rect.left)
                    rect.right = rect.left;
                rect.clip(this.plotArea);

                const stopEnumerating = callback({
                    seriesIndex: seriesIndex,
                    categoryIndex: categoryIndex,
                    series: this.renderedSeries[seriesIndex],
                    renderedSeries: this.renderedSeries[seriesIndex],
                    value: this.series[seriesIndex].data[categoryIndex],
                    renderedValue: this.renderedSeries[seriesIndex].data[categoryIndex],
                    rect: rect,
                    selected: this.selectedItem.categoryIndex === categoryIndex && this.selectedItem.seriesIndex === seriesIndex
                });
                if (stopEnumerating)
                    break;
                if (isStacked) {
                    if (value > 0) {
                        yRunningTotalPositive += value;
                        yBottomPositive = yTop;
                    }
                    else {
                        yRunningTotalNegative += value;
                        yBottomNegative = yTop;
                    }
                } else if (isNormal) {
                    x += barWidth;
                }
            }
        }
    }
};
