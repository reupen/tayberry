'use strict';
var Utils = require('./helpers/utils');
var Renderer = require('./renderer.base').Renderer;

class LineRenderer extends Renderer {

    drawMarker(type, x, y, size) {
        if (type === 'square') {
            this.ctx.fillRect(x - size / 2, y - size / 2, size, size);
        } else if (type === 'diamond') {
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(-Math.PI / 4);
            this.ctx.fillRect(0 - size / 2, 0 - size / 2, size, size);
            this.ctx.restore();
        } else if (type === 'circle') {
            size = Math.round(size * 1.2);
            this.ctx.beginPath();
            this.ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
            this.ctx.fill();
        } else if (type === 'triangle' || (type === 'triangle-inversed' && (size = -size))) {
            size = Math.round(size * 1.2);
            this.ctx.beginPath();
            this.ctx.moveTo(x - size / 2, y + size / 2);
            this.ctx.lineTo(x, y - size / 2);
            this.ctx.lineTo(x + size / 2, y + size / 2);
            this.ctx.closePath();
            this.ctx.fill();
        }
    }

    drawPlot() {
        this.ctx.save();
        this.ctx.lineWidth = '2';
        this.enumeratePoints(function (pt) {
            if (pt.firstPoint) {
                this.ctx.strokeStyle = pt.selected ? pt.renderedSeries.highlightColour : pt.renderedSeries.colour;
                this.ctx.beginPath();
                this.ctx.moveTo(pt.x, pt.y);
            } else {
                this.ctx.lineTo(pt.x, pt.y);
            }
            if (pt.lastPoint) {
                this.ctx.stroke();
            }
            //this.ctx.fillRect(pt.x - 4, pt.y - 4, 8, 8);
        }.bind(this));
        this.enumeratePoints(function (pt) {
            if (pt.firstPoint) {
                this.ctx.fillStyle = pt.selected ? pt.renderedSeries.highlightColour : pt.renderedSeries.colour;
            }
            this.drawMarker('circle', pt.x, pt.y, 8);
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

            for (let seriesIndex = 0; seriesIndex < this.renderedSeries.length; seriesIndex++) {
                for (let categoryIndex = 0; categoryIndex < categoryCount; categoryIndex++) {
                    let x = this.tb.xAxis.getValueDisplacement(categoryIndex);
                    const value = this.renderedSeries[seriesIndex].data[categoryIndex];
                    if (Utils.isMissingValue(value))
                        continue;
                    let y = this.tb.yAxis.getValueDisplacement(value);

                    if (isHorizontal)
                        [x, y] = [y, x];

                    const stopEnumerating = callback({
                        firstPoint: categoryIndex === 0,
                        lastPoint: categoryIndex + 1 === categoryCount,
                        seriesIndex: seriesIndex,
                        categoryIndex: categoryIndex,
                        series: this.series[seriesIndex],
                        renderedSeries: this.renderedSeries[seriesIndex],
                        value: this.series[seriesIndex].data[categoryIndex],
                        renderedValue: this.renderedSeries[seriesIndex].data[categoryIndex],
                        x: x,
                        y: y,
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