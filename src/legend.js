'use strict';
import {Tayberry} from './base';
import {Rect} from './helpers/rect';
import * as Utils from './helpers/utils.js';
import * as constants from './constants';
import {Colour} from './helpers/colour';

Tayberry.prototype.adjustSizeForLegend = function (plotArea, reset) {
    let ret = false;
    if (reset) {
        this.legendCalculatedSize = 0;
    }
    if (this.options.legend.enabled) {
        const smallPadding = this.mapLogicalXUnit(this.options.elementSmallPadding);
        const largePadding = this.mapLogicalXUnit(this.options.elementLargePadding);
        const indicatorSize = this.mapLogicalXUnit(this.options.legend.indicatorSize);
        const textWidths = this.getLegendItemTextWidths();
        const maxLegendItemWidth = Utils.reduce(textWidths, Math.max) + indicatorSize;
        const isVertical = this.options.legend.placement === 'left' || this.options.legend.placement === 'right';
        const isHorizontal = !isVertical;

        let rowIndices = [];
        const numItems = textWidths.length;
        const plotWidth = plotArea.width;


        if (isHorizontal) {
            let cumWidth = 0;
            for (let i = 0; i < numItems; i++) {
                cumWidth += textWidths[i] + indicatorSize + smallPadding;
                if (i + 1 == numItems || cumWidth > plotWidth) {
                    rowIndices.push(i);
                    cumWidth = 0;
                } else {
                    cumWidth += largePadding;
                }
            }
        }

        this.legendRowIndices = rowIndices;
        // this.legendTextWidths = textWidths;
        const numRows = rowIndices.length;

        let calculatedSize = 0;

        switch (this.options.legend.placement) {
            case 'bottom':
                calculatedSize = largePadding + indicatorSize*numRows;
                plotArea.bottom -= calculatedSize - this.legendCalculatedSize;
                this.legendY = this.plotCanvas.height - indicatorSize*numRows;
                break;
            case 'top':
                calculatedSize = largePadding + indicatorSize*numRows;
                this.legendY = plotArea.top;
                plotArea.top += calculatedSize - this.legendCalculatedSize;
                break;
            case 'left':
                calculatedSize = maxLegendItemWidth + largePadding;
                this.legendX = plotArea.left;
                plotArea.left += calculatedSize - this.legendCalculatedSize;
                break;
            case 'right':
                calculatedSize = maxLegendItemWidth;
                plotArea.right -= calculatedSize - this.legendCalculatedSize;
                this.legendX = plotArea.right;
                break;
        }

        ret = this.legendCalculatedSize !== calculatedSize;
        this.legendCalculatedSize = calculatedSize;
    }
    return ret;
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
        const indicatorSize = this.mapLogicalXUnit(this.options.legend.indicatorSize);
        const isVertical = this.options.legend.placement === 'left' || this.options.legend.placement === 'right';
        const isHorizontal = !isVertical;
        let newLineIndices = this.legendRowIndices;

        let lineWidths = [];

        let lineStart = 0;
        for (let lineIndex = 0; lineIndex < newLineIndices.length; lineIndex++) {
            const lineEnd = newLineIndices[lineIndex];
            let lineWidth = 0;

            for (let index = lineStart; index < lineEnd; index++) {
                const series = this.options.series[index];
                if (index > newLineIndices[lineIndex]) {
                    ++lineIndex;
                }
                let textWidth = 0;
                // FIXME: ignore unnamed series
                //if (series.name) {
                textWidth = this.getTextWidth(series.name, this.legendFont);
                lineWidth += textWidth + indicatorSize + smallPadding;
                if (index + 1 < lineEnd) lineWidth += largePadding;
                ret.items.push({textWidth: textWidth, series: series});
                //}
            }
            lineStart = lineEnd;
            lineWidths.push(lineWidth);
        }
        
        lineStart = 0;
        for (let lineIndex = 0; lineIndex < newLineIndices.length; lineIndex++) {
            const lineEnd = newLineIndices[lineIndex];
            const lineWidth = lineWidths[lineIndex];
            let x = isHorizontal ? this.plotArea.left + this.plotArea.width / 2 - lineWidth / 2 : this.legendX;
            let y = isHorizontal ? this.legendY + indicatorSize * lineIndex : (this.labelsCanvas.height - indicatorSize) / 2;

            if (lineIndex === 0) {
                ret.rect.left = x;
                ret.rect.right = x;
                ret.rect.top = y;
            }

            for (let index = lineStart; index < lineEnd; index++) {
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
            lineStart = lineEnd;
            if (lineIndex + 1 === newLineIndices.length) {
                ret.rect.bottom = y + indicatorSize;
            }
        }

    }
    return ret;
};
