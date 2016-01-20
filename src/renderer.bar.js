'use strict';
import {Rect} from './helpers/rect';
import * as Utils from './helpers/utils.js';
import {Colour} from './helpers/colour';
import * as renderer from './renderer.base';
import * as constants from './constants';
import {Tayberry} from './base';

export class BarRenderer extends renderer.Renderer {
    constructor(ctx, tayberry, series) {
        super(ctx, tayberry, series);

        this.barPositions = null;

        this.tb.registerCallback('onResize', this.updateBarWidths.bind(this));
        this.tb.registerCallback('onInit', this.updateBarWidths.bind(this));
    }

    updateBarWidths() {
        const categoryCount = this.renderedSeries[0].data.length;
        const isStacked = this.tb.options.barPlot.mode === 'stacked';
        const isOverlaid = this.tb.options.barPlot.mode === 'overlaid';
        const isNormal = !isStacked && !isOverlaid;
        const seriesCount = this.renderedSeries.length;
        const plotArea = this.tb.options.swapAxes ? this.tb.plotArea.clone().swapXY() : this.tb.plotArea;
        const categoryWidth = (plotArea.width / categoryCount);
        let animatingSeriesCount = 0;
        let totalMultiplier = 0;

        //TODO: animations for stacked and overlaid bar charts
        for (let seriesIndex = 0; seriesIndex < seriesCount; seriesIndex++) {
            const rSeries = this.renderedSeries[seriesIndex];
            const series = this.series[seriesIndex];
            if (series.animationState) {
                if (series.animationState.type === 'show') {
                    if (isNormal) {
                        rSeries.multiplier = series.animationState.stage;
                    } else {
                        let transColour = new Colour(series.colour);
                        transColour.a = 0;
                        rSeries.colour = Colour.createFromBlend(transColour, new Colour(series.colour), series.animationState.stage).toString();

                        rSeries.multiplier = 1;
                    }
                } else {
                    if (isNormal) {
                        rSeries.multiplier = 1 - series.animationState.stage;
                    } else {
                        let transColour = new Colour(series.colour);
                        transColour.a = 0;
                        rSeries.colour = Colour.createFromBlend(new Colour(series.colour), transColour, series.animationState.stage).toString();

                        rSeries.multiplier = 1;
                    }
                }
                ++animatingSeriesCount;
            } else if (series.visible & constants.visibilityState.visible) {
                rSeries.multiplier = 1;
            } else {
                rSeries.multiplier = 0;
            }
            totalMultiplier += rSeries.multiplier;
        }

        const totalBarsPerCategory = (isStacked || isOverlaid) ? 1 : totalMultiplier;

        this.barPositions = [];

        for (let categoryIndex = 0; categoryIndex < categoryCount; categoryIndex++) {
            const categoryXStart = plotArea.left + Math.floor(categoryIndex * categoryWidth);
            const categoryXEnd = plotArea.left + Math.floor((categoryIndex + 1) * categoryWidth);
            // FIXME: Need to map this.tb.options.barPlot.categorySpacing
            const barXStart = categoryXStart + Math.ceil(categoryWidth * this.tb.options.barPlot.categorySpacing / 2);
            const barXEnd = categoryXEnd - Math.floor(categoryWidth * this.tb.options.barPlot.categorySpacing / 2);

            let categoryPositions = [];
            let barIndex = 0;

            let runningBarWidth = 0;

            for (let seriesIndex = 0; seriesIndex < seriesCount; seriesIndex++) {
                const rSeries = this.renderedSeries[seriesIndex];
                let barWidth = Math.floor(rSeries.multiplier * Math.floor((barXEnd - barXStart) / totalBarsPerCategory));

                const xStart = Math.floor(barXStart + runningBarWidth) + Math.ceil(rSeries.xAxis.mapLogicalXOrYUnit(this.tb.options.barPlot.barPadding) / 2);
                const xEnd = Math.ceil(barXStart + runningBarWidth + barWidth) - Math.floor(rSeries.xAxis.mapLogicalXOrYUnit(this.tb.options.barPlot.barPadding) / 2);

                categoryPositions.push([xStart, xEnd]);

                if (isNormal) {
                    barIndex++;
                    runningBarWidth += barWidth;
                }
            }

            this.barPositions.push(categoryPositions);
        }
    }

    onToggleSeriesAnimationFrame() {
        this.updateBarWidths();
    }

    drawPlot() {
        this.ctx.save();
        let barEnumerator = new BarEnumerator(this);
        let bar;
        while ((bar = barEnumerator.next())) {
            if (bar.series.visible & (constants.visibilityState.visible | constants.visibilityState.transitioning)) {
                this.ctx.fillStyle = bar.selected ? bar.renderedSeries.highlightColour : bar.renderedSeries.colour;
                this.ctx.fillRect(bar.rect.left, bar.rect.top, bar.rect.width, bar.rect.height);
            }
        }
        this.ctx.restore();
    }

    drawLabels() {
        if (this.tb.options.labels.enabled) {
            this.ctx.save();
            let barEnumerator = new BarEnumerator(this);
            let bar;
            while ((bar = barEnumerator.next())) {
                if ((bar.series.visible & (constants.visibilityState.visible | constants.visibilityState.transitioning)) === constants.visibilityState.visible) {
                    this.ctx.font = this.tb.labelFont;
                    this.ctx.fillStyle = this.tb.options.labels.font.colour;
                    this.drawLabel(bar.value, bar.series.yAxis.options.labelFormatter(bar.value), bar.rect);
                }
            }
            this.ctx.restore();
        }
    }

    hitTest(x, y) {
        // TODO: Optimise
        let ret = {
            found: false,
            plotType: 'bar',
            type: 'plotItem',
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

            if (!Utils.isMissingValue(realDistance)) {
                matches.push({
                    sortDistance: sortDistance,
                    distance: realDistance,
                    priority: priority,
                    data: {
                        categoryIndex: bar.categoryIndex,
                        seriesIndex: bar.seriesIndex,
                        rect: bar.rect,
                        series: bar.series,
                        renderedSeries: bar.renderedSeries,
                        value: Tayberry.getDataValue(this.series[bar.seriesIndex].data[bar.categoryIndex])
                    }
                });
            }
        }

        if (matches.length) {
            matches.sort((a, b) => {
                let ret = a.priority - b.priority;
                if (!ret) ret = a.sortDistance - b.sortDistance;
                if (!ret) ret = a.data.rect.height - b.data.rect.height;
                return ret;
            });
            ret.found = true;
            ret.normalisedDistance = matches[0].distance + Math.sqrt(matches[0].data.rect.area);
            if (ret.normalisedDistance < 0) {
                ret.normalisedDistance = 0;
            }
            ret = Utils.assign(ret, matches[0].data);
        }
        return ret;
    }
}

export class BarEnumerator extends renderer.ByCategoryEnumerator {
    constructor(renderer, startCategoryIndex = 0) {
        super(renderer, startCategoryIndex);
        if (this.categoryCount) {
            this.isStacked = this.tb.options.barPlot.mode === 'stacked';
            this.isOverlaid = this.tb.options.barPlot.mode === 'overlaid';
            this.isNormal = !this.isStacked && !this.isOverlaid;
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

            const [xStart, xEnd] = this.renderer.barPositions[this.categoryIndex][this.seriesIndex];

            const yTop = series.yAxis.getValueDisplacement(value + (value > 0 ? this.yRunningTotalPositive : this.yRunningTotalNegative));
            let rect = new Rect(xStart, yTop, xEnd, this.isStacked ? (value > 0 ? this.yBottomPositive : this.yBottomNegative) : series.yAxis.getOrigin());

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
                selected: this.tb.selectedItem.type === 'plotItem' && this.tb.selectedItem.categoryIndex === this.categoryIndex && (this.tb.options.tooltips.shared || this.tb.selectedItem.series === this.renderer.series[this.seriesIndex])
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

