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
        const maxLegendItemWidth = this.getLegendItemMaxTextWidth() +  indicatorSize + smallPadding;

        switch (this.options.legend.placement) {
            case 'bottom':
                plotArea.bottom -= smallPadding + largePadding + indicatorSize;
                this.legendY = plotArea.bottom + largePadding;
                break;
            case 'top':
                this.legendY = plotArea.top;
                plotArea.top += smallPadding + largePadding + indicatorSize;
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

Tayberry.prototype.getLegendItemMaxTextWidth = function () {
    let ret = 0;
    for (let index = 0; index < this.options.series.length; index++) {
        const series = this.options.series[index];
        if (series.name) {
            ret = Math.max(this.getTextWidth(series.name, this.legendFont));
        }
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
        for (let index = 0; index < this.options.series.length; index++) {
            const series = this.options.series[index];
            let textWidth = 0;
            if (series.name) {
                textWidth = this.getTextWidth(series.name, this.legendFont);
                totalWidth += textWidth + indicatorSize + smallPadding + largePadding;
                ret.items.push({textWidth: textWidth, series: series});
            }
        }

        let x, y, isVertical;

        switch (this.options.legend.placement) {
            case 'top':
                x = this.plotArea.left + this.plotArea.width / 2 - totalWidth / 2;
                y = this.legendY;
                isVertical = false;
                break;
            case 'left':
                x = this.legendX;
                y = (this.labelsCanvas.height - indicatorSize)/2;
                isVertical = true;
                break;
            case 'right':
                x = this.legendX;
                y = (this.labelsCanvas.height - indicatorSize)/2;
                isVertical = true;
                break;
            default:
                x = this.plotArea.left + this.plotArea.width / 2 - totalWidth / 2;
                y = this.legendY;
                isVertical = false;
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
