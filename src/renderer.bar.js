'use strict';
var Rect = require('./helpers/rect').Rect;
var Utils = require('./helpers/utils');
var Renderer = require('./renderer.base').Renderer;
var Tayberry = require('./base.js').Tayberry;

class BarRenderer extends Renderer {
    drawPlot() {
        this.ctx.save();
        this.enumerateBars(function (bar) {
            this.ctx.fillStyle = bar.selected ? bar.renderedSeries.highlightColour : bar.renderedSeries.colour;
            this.ctx.fillRect(bar.rect.left, bar.rect.top, bar.rect.width, bar.rect.height);
        }.bind(this));
        this.ctx.restore();
    }

    drawLabels() {
        if (this.tb.options.labels.enabled) {
            this.ctx.save();
            this.enumerateBars(function (bar) {
                this.ctx.font = this.tb.labelFont;
                this.ctx.fillStyle = this.tb.options.labels.font.colour;
                this.drawLabel(bar.value, this.tb.options.yAxis.labelFormatter(bar.value), bar.rect);
            }.bind(this));
            this.ctx.restore();
        }
    }

    drawLabel(sign, text, rect) {
        if (this.tb.options.swapAxes)
            rect = rect.clone().swapXY();
        let x = (rect.left + rect.right) / 2;
        let y;
        if (this.tb.options.labels.verticalAlignment === 'top')
            y = rect.top;
        else if (this.tb.options.labels.verticalAlignment === 'bottom')
            y = rect.bottom;
        else
            y = (rect.top + rect.bottom) / 2;
        let baseline = 'middle';
        let align = 'center';
        if (this.tb.options.swapAxes) {
            [x, y] = [y, x];
            if (this.tb.options.labels.verticalPosition === 'outside')
                align = 'left';
            else if (this.tb.options.labels.verticalPosition === 'inside')
                align = 'right';
        } else {
            baseline = Tayberry.mapVerticalPosition(sign, this.tb.options.labels.verticalPosition);
        }
        if (this.tb.plotArea.containsPoint(x, y)) {
            this.ctx.save();
            this.ctx.textAlign = align;
            this.ctx.textBaseline = baseline;
            this.ctx.fillText(text, x, y);
            this.ctx.restore();
        }
    }

    hitTest(x, y) {
        // TODO: Optimise
        let ret = {
            found: false,
            plotType: 'bar'
        };

        let matches = [];

        const isOverlaid = this.tb.options.barMode === 'overlaid';

        this.enumerateBars(function (bar) {
            if (bar.rect.containsPoint(x, y)) {
                matches.push({
                    categoryIndex: bar.categoryIndex,
                    seriesIndex: bar.seriesIndex,
                    rect: bar.rect,
                    series: this.series[bar.seriesIndex],
                    dataPoint: this.series[bar.seriesIndex].data[bar.categoryIndex]
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
    }

    enumerateBars(callback) {
        const categoryCount = this.renderedSeries[0].data.length;
        if (categoryCount) {
            const isStacked = this.tb.options.barMode === 'stacked';
            const isOverlaid = this.tb.options.barMode === 'overlaid';
            const isHorizontal = this.tb.options.swapAxes;
            let plotArea = this.tb.plotArea.clone();
            if (isHorizontal)
                plotArea.swapXY();
            const isNormal = !isStacked && !isOverlaid;
            const barCount = (isStacked || isOverlaid) ? 1 : this.tb.seriesCount;
            const categoryWidth = (plotArea.width / categoryCount);
            // const barWidth = (categoryWidth * (1 - this.tb.options.categorySpacing) / barCount);
            const yOrigin = this.tb.yAxis.getOrigin();

            for (let categoryIndex = 0; categoryIndex < categoryCount; categoryIndex++) {
                let categoryXStart = plotArea.left + Math.floor(categoryIndex * categoryWidth);
                let categoryXEnd = plotArea.left + Math.floor((categoryIndex + 1) * categoryWidth);
                let barXStart = categoryXStart + Math.ceil(categoryWidth * this.tb.options.categorySpacing / 2);
                let barXEnd = categoryXEnd - Math.floor(categoryWidth * this.tb.options.categorySpacing / 2);

                let yBottomPositive = yOrigin,
                    yBottomNegative = yOrigin,
                    yRunningTotalPositive = 0,
                    yRunningTotalNegative = 0;
                let barIndex = 0;
                for (let seriesIndex = 0; seriesIndex < this.renderedSeries.length; seriesIndex++) {
                    const value = this.renderedSeries[seriesIndex].data[categoryIndex];
                    const barWidth = Math.floor((barXEnd - barXStart) / barCount);
                    const xStart = Math.floor(barXStart + barIndex * barWidth);
                    const xEnd = Math.ceil(barXStart + (barIndex + 1) * barWidth);
                    if (Utils.isMissingValue(value))
                        continue;
                    const yTop = this.tb.yAxis.getValueDisplacement(value + (value > 0 ? yRunningTotalPositive : yRunningTotalNegative));
                    let rect = new Rect(xStart, yTop, xEnd, value > 0 ? yBottomPositive : yBottomNegative);
                    rect.left += Math.ceil(this.tb.xAxis.mapLogicalXOrYUnit(this.tb.options.barPadding) / 2);
                    rect.right -= Math.floor(this.tb.xAxis.mapLogicalXOrYUnit(this.tb.options.barPadding) / 2);
                    if (rect.right < rect.left)
                        rect.right = rect.left;
                    if (isHorizontal)
                        rect.swapXY();
                    rect.clip(this.tb.plotArea);

                    const stopEnumerating = callback({
                        seriesIndex: seriesIndex,
                        categoryIndex: categoryIndex,
                        series: this.series[seriesIndex],
                        renderedSeries: this.renderedSeries[seriesIndex],
                        value: this.series[seriesIndex].data[categoryIndex],
                        renderedValue: this.renderedSeries[seriesIndex].data[categoryIndex],
                        rect: rect,
                        selected: this.tb.selectedItem.categoryIndex === categoryIndex && (this.tb.options.tooltips.shared || this.tb.selectedItem.series === this.series[seriesIndex])
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
    }
}

exports.BarRenderer = BarRenderer;