'use strict';
var Tayberry = require('./base').Tayberry;
var Rect = require('./helpers/rect').Rect;
var Utils = require('./helpers/utils');

Tayberry.prototype.drawLegend = function () {
    if (this.options.legend.enabled) {
        let legendMetrics = this.getLegendMeasurements();
        this.labelsCtx.save();
        this.labelsCtx.font = this.legendFont;

        for (let index = 0; index < legendMetrics.items.length; index++) {
            const item = legendMetrics.items[index];
            const series = item.series;
            const highlighted = this.selectedItem.type === 'legend' && this.selectedItem.series === series;
            series.renderer.drawLegendIndicator(this.labelsCtx, series, item.indicatorRect, highlighted);
            this.labelsCtx.textBaseline = 'middle';
            this.labelsCtx.fillStyle = this.options.legend.font.colour;
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
        let x = this.plotArea.left + this.plotArea.width / 2 - totalWidth / 2,
            y = this.labelsCanvas.height - indicatorSize;

        ret.rect.left = x;
        ret.rect.right = x + totalWidth;
        ret.rect.top = y;
        ret.rect.bottom = y + indicatorSize;

        for (let index = 0; index < ret.items.length; index++) {
            let item = ret.items[index];
            item.rect = new Rect(x, ret.rect.top, x + indicatorSize + smallPadding + item.textWidth, ret.rect.bottom);
            item.indicatorRect = new Rect(x, ret.rect.top, x + indicatorSize, ret.rect.bottom);
            x += indicatorSize + smallPadding;
            item.textX = x;
            item.textY = y + indicatorSize / 2;

            x += ret.items[index].textWidth + largePadding;
        }
    }
    return ret;
};
