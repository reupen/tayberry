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

Tayberry.prototype.calculatePlotArea = function () {
    const MAX_AXIS_CALC_SIZE_ATTEMPTS = 5;

    this.plotArea = new Rect(0, 0, this.canvas.width, this.canvas.height);
    if (this.options.title.text) {
        this.plotArea.top += this.mapLogicalYUnit(this.options.elementSmallPadding);
        this.plotArea.top += this.getFontHeight(this.options.title.font)*this.splitMultilineText(this.canvas.width, this.options.title.text).length;
    }
    if (this.options.legend.enabled)
        this.plotArea.bottom -= this.mapLogicalYUnit(this.options.elementSmallPadding + this.options.elementLargePadding + this.options.legend.indicatorSize);

    this.yAxis.adjustSize(this.plotArea, true, true);
    this.xAxis.adjustSize(this.plotArea, true, true);

    for (let i = 0; i < MAX_AXIS_CALC_SIZE_ATTEMPTS; i++) {
        this.yAxis.calculateExtent();
        this.xAxis.calculateExtent();
        this.yAxis.updateFormatter();
        this.xAxis.updateFormatter();
        if (!this.yAxis.adjustSize(this.plotArea) && !this.xAxis.adjustSize(this.plotArea))
            break;
    }
    this.plotArea.left = Math.ceil(this.plotArea.left);
    this.plotArea.top = Math.ceil(this.plotArea.top);
    this.plotArea.right = Math.floor(this.plotArea.right);
    this.plotArea.bottom = Math.floor(this.plotArea.bottom);
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

Tayberry.prototype.enumerateBars = function (callback) {
    const categoryCount = this.renderedSeries[0].data.length;
    if (categoryCount) {
        const isStacked = this.options.barMode === 'stacked';
        const isOverlaid = this.options.barMode === 'overlaid';
        const isHorizontal = this.options.swapAxes;
        let plotArea = this.plotArea.clone();
        if (isHorizontal)
            plotArea.swapXY();
        const isNormal = !isStacked && !isOverlaid;
        const barCount = (isStacked || isOverlaid) ? 1 : this.series.length;
        const categoryWidth = (plotArea.width / categoryCount);
        // const barWidth = (categoryWidth * (1 - this.options.categorySpacing) / barCount);
        const yOrigin = this.yAxis.getOrigin();

        for (let categoryIndex = 0; categoryIndex < categoryCount; categoryIndex++) {
            let categoryXStart = plotArea.left + Math.floor(categoryIndex * categoryWidth);
            let categoryXEnd = plotArea.left + Math.floor((categoryIndex + 1) * categoryWidth);
            let barXStart = categoryXStart + Math.ceil(categoryWidth * this.options.categorySpacing / 2);
            let barXEnd = categoryXEnd - Math.floor(categoryWidth * this.options.categorySpacing / 2);

            let yBottomPositive = yOrigin,
                yBottomNegative = yOrigin,
                yRunningTotalPositive = 0,
                yRunningTotalNegative = 0;
            let barIndex = 0;
            for (let seriesIndex = 0; seriesIndex < this.renderedSeries.length; seriesIndex++) {
                const value = this.renderedSeries[seriesIndex].data[categoryIndex];
                const barWidth = Math.floor((barXEnd - barXStart) / barCount);
                const xStart = Math.floor(barXStart + barIndex*barWidth);
                const xEnd = Math.ceil(barXStart + (barIndex+1)*barWidth);
                if (Utils.isMissingValue(value))
                    continue;
                const yTop = this.yAxis.getValueDisplacement(value + (value > 0 ? yRunningTotalPositive : yRunningTotalNegative));
                let rect = new Rect(xStart, yTop, xEnd, value > 0 ? yBottomPositive : yBottomNegative);
                rect.left += Math.ceil(this.options.barPadding * this.scaleFactor / 2);
                rect.right -= Math.floor(this.options.barPadding * this.scaleFactor / 2);
                if (rect.right < rect.left)
                    rect.right = rect.left;
                if (isHorizontal)
                    rect.swapXY();
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
                    // x += barWidth;
                    barIndex++;
                }
            }
        }
    }
};
