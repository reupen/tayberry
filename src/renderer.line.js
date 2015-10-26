'use strict';
var Utils = require('./helpers/utils');
var Renderer = require('./renderer.base').Renderer;

class LineRenderer extends Renderer {
    drawPlot() {
        this.ctx.save();
        let lastPoints = [];
        this.enumeratePoints(function (pt) {
            const colour = pt.selected ? pt.renderedSeries.highlightColour : pt.renderedSeries.colour;
            const lastPt = lastPoints[pt.seriesIndex];
            this.ctx.fillStyle = colour;
            if (lastPt) {
                this.ctx.lineWidth = '1';
                this.tb.drawLine(lastPt.x, lastPt.y, pt.x, pt.y, colour, this.ctx);
            }
            this.ctx.fillRect(pt.x - 4, pt.y - 4, 8, 8);
            lastPoints[pt.seriesIndex] = pt;
        }.bind(this));
        this.ctx.restore();
    }

    drawLabels() {
        if (this.tb.options.labels.enabled) {
            this.ctx.save();
            this.enumeratePoints(function (pt) {
                this.ctx.font = this.tb.labelFont;
                this.ctx.fillStyle = this.tb.options.labels.font.colour;
                this.drawLabel(pt.value, this.tb.options.yAxis.labelFormatter(pt.value), pt.x, pt.y);
            }.bind(this));
            this.ctx.restore();
        }
    }

    drawLabel(sign, text, x, y) {
    }

    hitTest(x, y) {
        // TODO: Optimise
        let ret = {
            found: false,
            plotType: 'line'
        };

        return ret;
    }

    enumeratePoints(callback) {
        //TODO: support linear x-axes
        const categoryCount = this.renderedSeries[0].data.length;
        if (categoryCount) {
            const isHorizontal = this.tb.options.swapAxes;
            let plotArea = this.tb.plotArea.clone();
            if (isHorizontal)
                plotArea.swapXY();
            const categoryWidth = (plotArea.width / categoryCount);
            //const yOrigin = this.tb.yAxis.getOrigin();

            //let xLast;

            for (let categoryIndex = 0; categoryIndex < categoryCount; categoryIndex++) {
                //let xStart = xLast;
                let x = plotArea.left + Math.floor((categoryIndex + 0.5) * categoryWidth);

                for (let seriesIndex = 0; seriesIndex < this.renderedSeries.length; seriesIndex++) {
                    const value = this.renderedSeries[seriesIndex].data[categoryIndex];
                    if (Utils.isMissingValue(value))
                        continue;
                    let y = this.tb.yAxis.getValueDisplacement(value);

                    if (isHorizontal)
                        [x, y] = [y, x];
                    //[xStart, xEnd, yStart, yEnd] = [yStart, yEnd, xStart, xEnd];

                    const stopEnumerating = callback({
                        seriesIndex: seriesIndex,
                        categoryIndex: categoryIndex,
                        series: this.series[seriesIndex],
                        renderedSeries: this.renderedSeries[seriesIndex],
                        value: this.series[seriesIndex].data[categoryIndex],
                        renderedValue: this.renderedSeries[seriesIndex].data[categoryIndex],
                        x: x,
                        y: y,
                        //FIXME: series comparison
                        selected: this.tb.selectedItem.categoryIndex === categoryIndex && (this.tb.options.tooltips.shared || this.tb.selectedItem.series === this.series[seriesIndex])
                    });
                    if (stopEnumerating)
                        break;
                }
            }
        }
    }
}

exports.LineRenderer = LineRenderer;