'use strict';
import {Tayberry} from './base';
import {Rect} from './helpers/rect';
import * as Utils from './helpers/utils.js';
import * as constants from './constants';
import {Colour} from './helpers/colour';

Tayberry.prototype.adjustSizeForLegend = function (plotArea) {
    if (this.options.legend.enabled) {
        const smallPadding = this.mapLogicalXUnit(this.options.elementSmallPadding);
        const largePadding = this.mapLogicalXUnit(this.options.elementLargePadding);
        const indicatorSize = this.mapLogicalXUnit(this.options.legend.indicatorSize);
        const textWidths = this.getLegendItemTextWidths();
        const maxLegendItemWidth = Utils.reduce(textWidths, Math.max) + indicatorSize;
        const isVertical = this.options.legend.placement === 'left' || this.options.legend.placement === 'right';
        const isHorizontal = !isVertical;

        let totalItemWidth = Utils.reduce(textWidths, (a, b) => a + b + indicatorSize + smallPadding);
        let numRows = 1;
        let numItems = textWidths.length;
        let plotWidth = plotArea.width;

        if (isHorizontal && numItems) {
            let totalWidth;
            while (numItems > numRows) {
                totalWidth = totalItemWidth + (numItems - numRows) * smallPadding;
                if (totalWidth > plotWidth) {
                    numRows++;
                } else break;
            }
        }

        this.legendNumRows = numRows;
        this.legendTextWidths = textWidths;

        switch (this.options.legend.placement) {
            case 'bottom':
                plotArea.bottom -= smallPadding + largePadding + indicatorSize*numRows;
                this.legendY = plotArea.bottom + largePadding;
                break;
            case 'top':
                this.legendY = plotArea.top;
                plotArea.top += smallPadding + largePadding + indicatorSize*numRows;
                break;
            case 'left':
                this.legendX = plotArea.left;
                plotArea.left += maxLegendItemWidth + largePadding;
                break;
            case 'right':
                plotArea.right -= maxLegendItemWidth;
                this.legendX = plotArea.right;
                break;
        }
    }
};

Tayberry.prototype.drawLegend = function () {
    if (this.options.legend.enabled) {
        let legendMetrics = this.getLegendMeasurements();
        this.labelsCtx.save();
        this.labelsCtx.font = this.legendFont;

        for (let index = 0; index < legendMetrics.items.length; index++) {
            const item = legendMetrics.items[index];
            const series = item.series;
            const highlighted = this.selectedItem.type === 'legend' && this.selectedItem.data.series === series;
            series.renderer.drawLegendIndicator(this.labelsCtx, series, item.indicatorRect, highlighted);
            this.labelsCtx.textBaseline = 'middle';
            this.labelsCtx.fillStyle = this.options.legend.font.colour;
            if (!(series.visible & constants.visibilityState.visible))
                this.labelsCtx.fillStyle = (new Colour(this.labelsCtx.fillStyle)).multiplyAlpha(this.options.legend.hiddenAlphaMultiplier).toString();
            this.labelsCtx.fillText(series.name, item.textX, item.textY);
        }
        this.labelsCtx.restore();
    }
};

Tayberry.prototype.hitTestLegend = function (x, y) {
    let ret = {
        found: false,
        type: 'legend'
    };
    const legendMetrics = this.getLegendMeasurements();
    if (legendMetrics.rect.containsPoint(x, y)) {
        for (let index = 0; index < legendMetrics.items.length; index++) {
            const item = legendMetrics.items[index];
            if (item.rect.containsPoint(x, y)) {
                Utils.assign(ret, [{found: true, normalisedDistance: -5, data: item}]);
                break;
            }
        }
    }
    return ret;
};

Tayberry.prototype.getLegendItemTextWidths = function () {
    let ret = [];
    for (let index = 0; index < this.options.series.length; index++) {
        const series = this.options.series[index];
        let width = 0;
        if (series.name) {
            width = Math.max(this.getTextWidth(series.name, this.legendFont));
        }
        ret.push(width);
    }
    return ret;
};

Tayberry.prototype.getLegendMeasurements = function () {
    let ret = {
        rect: new Rect(0),
        items: []
    };
    if (this.options.legend.enabled) {
        const smallPadding = this.mapLogicalXUnit(this.options.elementSmallPadding);
        const largePadding = this.mapLogicalXUnit(this.options.elementLargePadding);
        let totalWidth = 0;
        const indicatorSize = this.mapLogicalXUnit(this.options.legend.indicatorSize);
        const isVertical = this.options.legend.placement === 'left' || this.options.legend.placement === 'right';
        const isHorizontal = !isVertical;
        let totalItemWidth = Utils.reduce(this.legendTextWidths, (a, b) => a + b + indicatorSize + smallPadding);
        let newLineIndices = [];
        let numItems = this.legendTextWidths;

        if (isHorizontal && this.legendNumRows > 1) {
            const targetLineWidth = totalItemWidth / this.legendNumRows;
            let cumWidth = 0;
            for (let i = 0; i < numItems; i++) {
                cumWidth += this.legendTextWidths[i] + indicatorSize + smallPadding;
                if (i + 1 == numItems || cumWidth > targetLineWidth) {
                    newLineIndices.push(i);
                    cumWidth -= targetLineWidth; // What is the optimum logic?
                }
            }
        }

        for (let index = 0; index < this.options.series.length; index++) {
            const series = this.options.series[index];
            let textWidth = 0;
            if (series.name) {
                textWidth = this.getTextWidth(series.name, this.legendFont);
                totalWidth += textWidth + indicatorSize + smallPadding + largePadding;
                ret.items.push({textWidth: textWidth, series: series});
            }
        }

        let x, y;

        switch (this.options.legend.placement) {
            case 'top':
                x = this.plotArea.left + this.plotArea.width / 2 - totalWidth / 2;
                y = this.legendY;
                break;
            case 'left':
                x = this.legendX;
                y = (this.labelsCanvas.height - indicatorSize) / 2;
                break;
            case 'right':
                x = this.legendX;
                y = (this.labelsCanvas.height - indicatorSize) / 2;
                break;
            default:
                x = this.plotArea.left + this.plotArea.width / 2 - totalWidth / 2;
                y = this.legendY;
                break;
        }

        ret.rect.left = x;
        ret.rect.right = x;
        ret.rect.top = y;

        for (let index = 0; index < ret.items.length; index++) {
            let item = ret.items[index];

            item.rect = new Rect(x, y, x + indicatorSize + smallPadding + item.textWidth, y + indicatorSize);
            item.indicatorRect = new Rect(x, y, x + indicatorSize, y + indicatorSize);
            item.textX = x + indicatorSize + smallPadding;
            item.textY = y + indicatorSize / 2;

            ret.rect.right = Math.max(ret.rect.right, item.rect.right);

            if (isVertical) {
                y += indicatorSize + smallPadding;
            } else {
                x += ret.items[index].textWidth + largePadding;
                x += indicatorSize + smallPadding;
            }
        }
        ret.rect.bottom = y + indicatorSize;
    }
    return ret;
};
