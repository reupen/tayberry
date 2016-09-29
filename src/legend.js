'use strict';
import {Rect} from './helpers/rect';
import * as Utils from './helpers/utils.js';
import * as constants from './constants';
import {Colour} from './helpers/colour';

export class Legend {
    /**
     *
     * @param tayberry {Tayberry}
     */
    constructor(tayberry) {
        this.tb = tayberry;
        this.xPos = null;
        this.yPos = null;
        this.rowIndices = null;
        this.calculatedSize = null;
        this.canvas = tayberry.labelsCanvas;
        this.ctx = tayberry.labelsCtx;
        this.font = null;
    }

    adjustSize(plotArea, reset) {
        let ret = false;
        if (reset) {
            this.calculatedSize = 0;
        }
        if (this.tb.options.legend.enabled) {
            const smallPadding = this.tb.mapLogicalXUnit(this.tb.options.elementSmallPadding);
            const largePadding = this.tb.mapLogicalXUnit(this.tb.options.elementLargePadding);
            const indicatorSize = this.tb.mapLogicalXUnit(this.tb.options.legend.indicatorSize);
            const textWidths = this.getItemTextWidths();
            const maxLegendItemWidth = textWidths.length ? Utils.reduce(textWidths, Math.max) + indicatorSize + smallPadding : 0;
            const isVertical = this.tb.options.legend.placement === 'left' || this.tb.options.legend.placement === 'right';
            const isHorizontal = !isVertical;

            let rowIndices = [];
            const numItems = textWidths.length;
            const plotWidth = plotArea.width;


            if (isHorizontal) {
                let cumWidth = 0;
                for (let i = 0; i < numItems; i++) {
                    const itemWidth = textWidths[i] + indicatorSize + smallPadding;
                    cumWidth += itemWidth;
                    if (cumWidth > plotWidth) {
                        rowIndices.push(i);
                        cumWidth = itemWidth;
                    }

                    cumWidth += largePadding;

                    if (i + 1 == numItems) {
                        rowIndices.push(i + 1);
                    }
                }
            } else {
                for (let i = 0; i < numItems; i++) {
                    rowIndices.push(i + 1);
                }
            }

            this.rowIndices = rowIndices;
            const numRows = rowIndices.length;
            const height = indicatorSize * numRows + (numRows - 1) * smallPadding;
            const numRowGaps = numRows ? (numRows - 1) : 0;

            let calculatedSize = 0;

            switch (this.tb.options.legend.placement) {
            case 'bottom':
                calculatedSize = largePadding + indicatorSize * numRows + numRowGaps * smallPadding;
                plotArea.bottom -= calculatedSize - this.calculatedSize;
                this.yPos = this.canvas.height - indicatorSize * numRows - numRowGaps * smallPadding;
                break;
            case 'top':
                calculatedSize = largePadding + indicatorSize * numRows + numRowGaps * smallPadding;
                this.yPos = plotArea.top;
                plotArea.top += calculatedSize - this.calculatedSize;
                break;
            case 'left':
                calculatedSize = maxLegendItemWidth + largePadding;
                this.xPos = 0;
                this.yPos = plotArea.bottom - plotArea.height / 2 - height / 2;
                plotArea.left += calculatedSize - this.calculatedSize;
                break;
            case 'right':
                calculatedSize = maxLegendItemWidth + largePadding;
                plotArea.right -= calculatedSize - this.calculatedSize;
                this.xPos = plotArea.right + largePadding;
                this.yPos = plotArea.bottom - plotArea.height / 2 - height / 2;
                break;
            }

            ret = this.calculatedSize !== calculatedSize;
            this.calculatedSize = calculatedSize;
        }
        return ret;
    }

    updateFonts() {
        this.font = this.tb.createFontString(this.tb.options.legend.font);
    }

    draw() {
        if (this.tb.options.legend.enabled) {
            let legendMetrics = this.getMeasurements();
            this.ctx.save();
            this.ctx.font = this.font;

            for (let index = 0; index < legendMetrics.items.length; index++) {
                const item = legendMetrics.items[index];

                if (item.textWidth) {
                    const series = item.series;
                    const highlighted = this.tb.selectedItem.type === 'legend' && this.tb.selectedItem.data.series === series;
                    series.renderer.drawLegendIndicator(this.ctx, series, item.indicatorRect, highlighted);
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillStyle = this.tb.options.legend.font.colour;
                    if (!(series.visible & constants.visibilityState.visible))
                        this.ctx.fillStyle = (new Colour(this.ctx.fillStyle)).multiplyAlpha(this.tb.options.legend.hiddenAlphaMultiplier).toString();
                    this.ctx.fillText(series.name, item.textX, item.textY);
                }
            }
            this.ctx.restore();
        }
    }

    hitTest(x, y) {
        let ret = {
            found: false,
            type: 'legend'
        };
        const legendMetrics = this.getMeasurements();
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
    }

    getItemTextWidths() {
        let ret = [];
        for (let index = 0; index < this.tb.options.series.length; index++) {
            const series = this.tb.options.series[index];
            let width = 0;
            if (series.name) {
                width = Math.max(this.tb.getTextWidth(series.name, this.font));
            }
            ret.push(width);
        }
        return ret;
    }

    getMeasurements() {
        let ret = {
            rect: new Rect(0),
            items: []
        };
        if (this.tb.options.legend.enabled) {
            const smallPadding = this.tb.mapLogicalXUnit(this.tb.options.elementSmallPadding);
            const largePadding = this.tb.mapLogicalXUnit(this.tb.options.elementLargePadding);
            const indicatorSize = this.tb.mapLogicalXUnit(this.tb.options.legend.indicatorSize);
            const isVertical = this.tb.options.legend.placement === 'left' || this.tb.options.legend.placement === 'right';
            const isHorizontal = !isVertical;
            let newLineIndices = this.rowIndices;

            let lineWidths = [];

            let lineStart = 0;
            for (let lineIndex = 0; lineIndex < newLineIndices.length; lineIndex++) {
                const lineEnd = newLineIndices[lineIndex];
                let lineWidth = 0;

                for (let index = lineStart; index < lineEnd; index++) {
                    const series = this.tb.options.series[index];
                    if (index > newLineIndices[lineIndex]) {
                        ++lineIndex;
                    }
                    let textWidth = 0;

                    if (series.name) {
                        textWidth = this.tb.getTextWidth(series.name, this.font);
                        lineWidth += textWidth + indicatorSize + smallPadding;
                        if (index + 1 < lineEnd)
                            lineWidth += largePadding;
                        ret.items.push({textWidth: textWidth, series: series});
                    } else {
                        ret.items.push({textWidth: 0, series: series});
                    }
                }
                lineStart = lineEnd;
                lineWidths.push(lineWidth);
            }

            lineStart = 0;
            for (let lineIndex = 0; lineIndex < newLineIndices.length; lineIndex++) {
                const lineEnd = newLineIndices[lineIndex];
                const lineWidth = lineWidths[lineIndex];
                let x = isHorizontal ? this.tb.plotArea.left + this.tb.plotArea.width / 2 - lineWidth / 2 : this.xPos;
                let y = this.yPos + (indicatorSize + smallPadding) * lineIndex;

                if (lineIndex === 0) {
                    ret.rect.left = x;
                    ret.rect.right = x;
                    ret.rect.top = y;
                }

                for (let index = lineStart; index < lineEnd; index++) {
                    let item = ret.items[index];

                    if (item.textWidth > 0) {
                        item.rect = new Rect(x, y, x + indicatorSize + smallPadding + item.textWidth, y + indicatorSize);
                        item.indicatorRect = new Rect(x, y, x + indicatorSize, y + indicatorSize);
                        item.textX = x + indicatorSize + smallPadding;
                        item.textY = y + indicatorSize / 2;

                        ret.rect.right = Math.max(ret.rect.right, item.rect.right);

                        if (isHorizontal) {
                            x += ret.items[index].textWidth + largePadding;
                            x += indicatorSize + smallPadding;
                        }
                    } else {
                        item.rect = new Rect(0);
                        item.indicatorRect = new Rect(0);
                        item.textX = 0;
                        item.textY = 0;
                    }
                }
                lineStart = lineEnd;
                if (lineIndex + 1 === newLineIndices.length) {
                    ret.rect.bottom = y + indicatorSize;
                }
            }

        }
        return ret;
    }
}
