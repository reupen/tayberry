'use strict';
var Rect = require('./helpers/rect').Rect;
var Utils = require('./helpers/utils');
var Renderer = require('./renderer.base').Renderer;
var Tayberry = require('./base.js').Tayberry;

class BarRenderer extends Renderer {
    drawPlot() {
        this.ctx.save();
        let barEnumerator = new BarEnumerator(this);
        let bar;
        while ((bar = barEnumerator.next())) {
            this.ctx.fillStyle = bar.selected ? bar.renderedSeries.highlightColour : bar.renderedSeries.colour;
            this.ctx.fillRect(bar.rect.left, bar.rect.top, bar.rect.width, bar.rect.height);
        }
        this.ctx.restore();
    }

    drawLabels() {
        if (this.tb.options.labels.enabled) {
            this.ctx.save();
            let barEnumerator = new BarEnumerator(this);
            let bar;
            while ((bar = barEnumerator.next())) {
                this.ctx.font = this.tb.labelFont;
                this.ctx.fillStyle = this.tb.options.labels.font.colour;
                this.drawLabel(bar.value, this.tb.options.yAxis.labelFormatter(bar.value), bar.rect);
            }
            this.ctx.restore();
        }
    }

    hitTest(x, y) {
        // TODO: Optimise
        let ret = {
            found: false,
            plotType: 'bar',
            isXRange: true
        };

        const categoryCount = this.renderedSeries[0].data.length;
        const isHorizontal = this.tb.options.swapAxes;
        let plotArea = this.tb.plotArea.clone();
        if (isHorizontal)
            plotArea.swapXY();
        const categoryIndex = Math.floor(categoryCount * ((isHorizontal ? y : x) - plotArea.left) / plotArea.width);

        let matches = [];

        let barEnumerator = new BarEnumerator(this, categoryIndex);
        let bar;
        while ((bar = barEnumerator.next())) {
            if (bar.categoryIndex > categoryIndex)
                break;
            let distance, priority;
            if (bar.rect.containsPoint(x, y)) {
                distance = 0;
                priority = 0;
            }
            else if (bar.rect.containsX(x)) {
                distance = y < bar.rect.top ? bar.rect.top - y : y - bar.rect.bottom;
                priority = isHorizontal ? 2 : 1;
            }
            else if (bar.rect.containsY(y)) {
                distance = x < bar.rect.left ? bar.rect.left - x : x - bar.rect.right;
                priority = isHorizontal ? 1 : 2;
            }
            else {
                const xDist = Math.min(Math.abs(x - bar.rect.left), Math.abs(x - bar.rect.right));
                const yDist = Math.min(Math.abs(y - bar.rect.top), Math.abs(y - bar.rect.bottom));
                // distance = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
                distance = isHorizontal ? yDist : xDist;
                priority = 3;
            }

            matches.push({
                distance: distance,
                priority: priority,
                data: {
                    categoryIndex: bar.categoryIndex,
                    seriesIndex: bar.seriesIndex,
                    rect: bar.rect,
                    series: this.series[bar.seriesIndex],
                    value: Tayberry.getDataValue(this.series[bar.seriesIndex].data[bar.categoryIndex])
                }
            });
        }

        if (matches.length) {
            matches.sort((a, b) => {
                let ret = a.priority - b.priority;
                if (!ret) ret = a.distance - b.distance;
                if (!ret) ret = a.data.rect.height - b.data.rect.height;
                return ret;
            });
            ret.found = true;
            ret.normalisedDistance = matches[0].distance * matches[0].data.rect.area;
            ret = Utils.assign(ret, matches[0].data);
        }
        return ret;
    }
}

class BarEnumerator {
    constructor(barRenderer, startCategoryIndex = 0) {
        this.barRenderer = barRenderer;
        this.tb = barRenderer.tb;

        this.categoryCount = this.barRenderer.renderedSeries[0].data.length;
        this.categoryIndex = 0;
        this.seriesIndex = 0;
        this.seriesCount = this.barRenderer.renderedSeries.length;
        if (this.categoryCount) {
            this.isStacked = this.tb.options.barMode === 'stacked';
            this.isOverlaid = this.tb.options.barMode === 'overlaid';
            this.isHorizontal = this.tb.options.swapAxes;
            this.plotArea = this.tb.plotArea.clone();
            if (this.isHorizontal)
                this.plotArea.swapXY();
            this.isNormal = !this.isStacked && !this.isOverlaid;
            this.barCount = (this.isStacked || this.isOverlaid) ? 1 : this.tb.seriesCount;
            this.categoryWidth = (this.plotArea.width / this.categoryCount);
            this.yOrigin = this.tb.yAxis.getOrigin();

            this.startCategoryIndex = Math.max(startCategoryIndex, 0);
            this.startCategoryIndex = Math.min(this.startCategoryIndex, this.categoryCount - 1);

            this.yBottomPositive = this.yOrigin;
            this.yBottomNegative = this.yOrigin;
            this.yRunningTotalPositive = 0;
            this.yRunningTotalNegative = 0;
            this.barIndex = 0;
        }
    }

    next() {
        let ret;

        if (this.categoryIndex < this.categoryCount) {
            const value = Tayberry.getDataValue(this.barRenderer.renderedSeries[this.seriesIndex].data[this.categoryIndex]);
            let categoryXStart = this.plotArea.left + Math.floor(this.categoryIndex * this.categoryWidth);
            let categoryXEnd = this.plotArea.left + Math.floor((this.categoryIndex + 1) * this.categoryWidth);
            let barXStart = categoryXStart + Math.ceil(this.categoryWidth * this.tb.options.categorySpacing / 2);
            let barXEnd = categoryXEnd - Math.floor(this.categoryWidth * this.tb.options.categorySpacing / 2);

            const barWidth = Math.floor((barXEnd - barXStart) / this.barCount);
            const xStart = Math.floor(barXStart + this.barIndex * barWidth);
            const xEnd = Math.ceil(barXStart + (this.barIndex + 1) * barWidth);

            const yTop = this.tb.yAxis.getValueDisplacement(value + (value > 0 ? this.yRunningTotalPositive : this.yRunningTotalNegative));
            let rect = new Rect(xStart, yTop, xEnd, value > 0 ? this.yBottomPositive : this.yBottomNegative);
            rect.left += Math.ceil(this.tb.xAxis.mapLogicalXOrYUnit(this.tb.options.barPadding) / 2);
            rect.right -= Math.floor(this.tb.xAxis.mapLogicalXOrYUnit(this.tb.options.barPadding) / 2);
            if (rect.right < rect.left)
                rect.right = rect.left;
            if (this.isHorizontal)
                rect.swapXY();
            rect.clip(this.tb.plotArea);

            ret = {
                seriesIndex: this.seriesIndex,
                categoryIndex: this.categoryIndex,
                series: this.barRenderer.series[this.seriesIndex],
                renderedSeries: this.barRenderer.renderedSeries[this.seriesIndex],
                value: Tayberry.getDataValue(this.barRenderer.series[this.seriesIndex].data[this.categoryIndex]),
                renderedValue: Tayberry.getDataValue(this.barRenderer.renderedSeries[this.seriesIndex].data[this.categoryIndex]),
                rect: rect,
                selected: this.tb.selectedItem.categoryIndex === this.categoryIndex && (this.tb.options.tooltips.shared || this.tb.selectedItem.series === this.barRenderer.series[this.seriesIndex])
            };

            if (this.isStacked) {
                if (value > 0) {
                    this.yRunningTotalPositive += value;
                    this.yBottomPositive = yTop;
                }
                else {
                    this.yRunningTotalNegative += value;
                    this.yBottomNegative = yTop;
                }
            } else if (this.isNormal) {
                this.barIndex++;
            }

            let nextValue;
            do {
                if (this.seriesIndex + 1 === this.seriesCount) {
                    this.seriesIndex = 0;
                    this.categoryIndex++;
                    if (this.categoryIndex >= this.categoryCount)
                        break;
                    this.yBottomPositive = this.yOrigin;
                    this.yBottomNegative = this.yOrigin;
                    this.yRunningTotalPositive = 0;
                    this.yRunningTotalNegative = 0;
                    this.barIndex = 0;
                } else {
                    this.seriesIndex++;
                }
                nextValue = Tayberry.getDataValue(this.barRenderer.renderedSeries[this.seriesIndex].data[this.categoryIndex]);
            } while (Utils.isMissingValue(nextValue));

        }
        return ret;
    }
}

exports.BarRenderer = BarRenderer;