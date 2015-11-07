'use strict';
var Rect = require('./helpers/rect').Rect;
var Utils = require('./helpers/utils');
var renderer = require('./renderer.base');
var Tayberry = require('./base.js').Tayberry;

class BarRenderer extends renderer.Renderer {
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
                this.drawLabel(bar.value, bar.series.yAxis.options.labelFormatter(bar.value), bar.rect);
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
            let sortDistance, priority, realDistance;
            if (bar.rect.containsPoint(x, y)) {
                sortDistance = 0;
                priority = 0;
            }
            else if (bar.rect.containsX(x)) {
                sortDistance = y < bar.rect.top ? bar.rect.top - y : y - bar.rect.bottom;
                priority = isHorizontal ? 2 : 1;
            }
            else if (bar.rect.containsY(y)) {
                sortDistance = x < bar.rect.left ? bar.rect.left - x : x - bar.rect.right;
                priority = isHorizontal ? 1 : 2;
            }
            else {
                const xDist = Math.min(Math.abs(x - bar.rect.left), Math.abs(x - bar.rect.right));
                const yDist = Math.min(Math.abs(y - bar.rect.top), Math.abs(y - bar.rect.bottom));
                realDistance = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
                sortDistance = isHorizontal ? yDist : xDist;
                priority = 3;
            }

            if (typeof realDistance === 'undefined')
                realDistance = sortDistance;

            matches.push({
                sortDistance: sortDistance,
                distance: realDistance,
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
                if (!ret) ret = a.sortDistance - b.sortDistance;
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

class BarEnumerator extends renderer.ByCategoryEnumerator {
    constructor(renderer, startCategoryIndex = 0) {
        super(renderer, startCategoryIndex);
        if (this.categoryCount) {
            this.isStacked = this.tb.options.barPlot.mode === 'stacked';
            this.isOverlaid = this.tb.options.barPlot.mode === 'overlaid';
            this.isNormal = !this.isStacked && !this.isOverlaid;
            this.barCount = (this.isStacked || this.isOverlaid) ? 1 : this.tb.seriesCount;
            this.categoryWidth = (this.plotArea.width / this.categoryCount);
            // used for stacked bar charts - must be on single y-axis
            this.yOrigin = this.renderer.series[0].yAxis.getOrigin();

            this.onNewCategory();
        }
    }

    onNewCategory() {
        this.yBottomPositive = this.yOrigin;
        this.yBottomNegative = this.yOrigin;
        this.yRunningTotalPositive = 0;
        this.yRunningTotalNegative = 0;
        this.barIndex = 0;
    }

    next() {
        let ret;

        if (this.categoryIndex < this.categoryCount) {
            const series = this.renderer.renderedSeries[this.seriesIndex];
            const value = Tayberry.getDataValue(series.data[this.categoryIndex]);
            let categoryXStart = this.plotArea.left + Math.floor(this.categoryIndex * this.categoryWidth);
            let categoryXEnd = this.plotArea.left + Math.floor((this.categoryIndex + 1) * this.categoryWidth);
            let barXStart = categoryXStart + Math.ceil(this.categoryWidth * this.tb.options.barPlot.categorySpacing / 2);
            let barXEnd = categoryXEnd - Math.floor(this.categoryWidth * this.tb.options.barPlot.categorySpacing / 2);

            const barWidth = Math.floor((barXEnd - barXStart) / this.barCount);
            const xStart = Math.floor(barXStart + this.barIndex * barWidth);
            const xEnd = Math.ceil(barXStart + (this.barIndex + 1) * barWidth);

            const yTop = series.yAxis.getValueDisplacement(value + (value > 0 ? this.yRunningTotalPositive : this.yRunningTotalNegative));
            let rect = new Rect(xStart, yTop, xEnd, this.isStacked ? (value > 0 ? this.yBottomPositive : this.yBottomNegative) : series.yAxis.getOrigin());
            rect.left += Math.ceil(series.xAxis.mapLogicalXOrYUnit(this.tb.options.barPlot.barPadding) / 2);
            rect.right -= Math.floor(series.xAxis.mapLogicalXOrYUnit(this.tb.options.barPlot.barPadding) / 2);
            if (rect.right < rect.left)
                rect.right = rect.left;
            if (this.isHorizontal)
                rect.swapXY();
            rect.clip(this.tb.plotArea);

            ret = {
                seriesIndex: this.seriesIndex,
                categoryIndex: this.categoryIndex,
                series: this.renderer.series[this.seriesIndex],
                renderedSeries: this.renderer.renderedSeries[this.seriesIndex],
                value: Tayberry.getDataValue(this.renderer.series[this.seriesIndex].data[this.categoryIndex]),
                renderedValue: Tayberry.getDataValue(this.renderer.renderedSeries[this.seriesIndex].data[this.categoryIndex]),
                rect: rect,
                selected: this.tb.selectedItem.categoryIndex === this.categoryIndex && (this.tb.options.tooltips.shared || this.tb.selectedItem.series === this.renderer.series[this.seriesIndex])
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

            this.nextValue();

        }
        return ret;
    }
}

exports.BarRenderer = BarRenderer;