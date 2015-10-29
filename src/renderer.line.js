'use strict';
var Utils = require('./helpers/utils');
var Rect = require('./helpers/rect').Rect;
var Renderer = require('./renderer.base').Renderer;
var Tayberry = require('./base').Tayberry;

var autoMarkerIndex = 0;
const markers = ['square', 'diamond', 'circle', 'triangle', 'triangle-inversed'];

class LineRenderer extends Renderer {
    setSeries(series) {
        for (var i = 0; i < series.length; i++) {
            if (!series[i].markerType) {
                series[i].markerType = markers[autoMarkerIndex % markers.length];
                autoMarkerIndex++;
            }
        }
        super.setSeries(series);
    }

    drawMarker(type, x, y, size, ctx = this.ctx) {
        if (type === 'square') {
            ctx.fillRect(x - size / 2, y - size / 2, size, size);
        } else if (type === 'diamond') {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(-Math.PI / 4);
            ctx.fillRect(0 - size / 2, 0 - size / 2, size, size);
            ctx.restore();
        } else if (type === 'circle') {
            size = Math.round(size * 1.2);
            ctx.beginPath();
            ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
            ctx.fill();
        } else if (type === 'triangle' || (type === 'triangle-inversed' && (size = -size))) {
            size = Math.round(size * 1.2);
            ctx.beginPath();
            ctx.moveTo(x - size / 2, y + size / 2);
            ctx.lineTo(x, y - size / 2);
            ctx.lineTo(x + size / 2, y + size / 2);
            ctx.closePath();
            ctx.fill();
        }
    }

    drawPlot() {
        this.ctx.save();
        this.enumeratePoints(function (pt) {
            if (pt.firstPoint) {
                this.ctx.lineWidth = pt.seriesSelected ? this.tb.options.linePlot.highlightedLineWidth : this.tb.options.linePlot.lineWidth;
                this.ctx.strokeStyle = pt.seriesSelected ? pt.renderedSeries.highlightColour : pt.renderedSeries.colour;
                this.ctx.beginPath();
                this.ctx.moveTo(pt.x, pt.y);
            } else {
                this.ctx.lineTo(pt.x, pt.y);
            }
            if (pt.lastPoint) {
                this.ctx.stroke();
            }
        }.bind(this));
        this.enumeratePoints(function (pt) {
            if (pt.selected) {
                this.ctx.fillStyle = pt.renderedSeries.glowColour;
                this.drawMarker(pt.renderedSeries.markerType, pt.x, pt.y, this.tb.options.linePlot.highlightedMarkerSize);
            }
            this.ctx.fillStyle = pt.renderedSeries.colour;
            this.drawMarker(pt.renderedSeries.markerType, pt.x, pt.y, this.tb.options.linePlot.markerSize);
        }.bind(this));
        this.ctx.restore();
    }

    drawLegendIndicator(ctx, series, rect) {
        ctx.save();
        ctx.lineWidth = 2;
        ctx.strokeStyle = series.colour;
        this.tb.drawLine(rect.left, rect.yMidpoint, rect.right, rect.yMidpoint);
        ctx.fillStyle = series.colour;
        this.drawMarker(series.markerType, rect.xMidpoint, rect.yMidpoint, this.tb.options.linePlot.markerSize, ctx);
        ctx.restore();
    }

    drawLabels() {
        if (this.tb.options.labels.enabled) {
            this.ctx.save();
            this.ctx.font = this.tb.labelFont;
            this.ctx.fillStyle = this.tb.options.labels.font.colour;
            this.enumeratePoints(function (pt) {
                const rect = new Rect(pt.x, pt.y, pt.x, pt.y).inflate(this.tb.options.linePlot.markerSize/2);
                this.drawLabel(pt.value, this.tb.options.yAxis.labelFormatter(pt.value), rect);
            }.bind(this));
            this.ctx.restore();
        }
    }


    hitTest(x, y) {
        // TODO: Optimise
        let ret = {
            found: false,
            plotType: 'line',
            isXRange: false
        };

        let matches = [];

        //let lastPt;
        this.enumeratePoints(function (pt) {
            const distance = Math.sqrt(Math.pow(pt.x - x, 2) + Math.pow(pt.y - y, 2));
            matches.push({distance: distance, priority: 0, data: pt});
            //if (!pt.firstPoint) {
            //    if (x >= lastPt.x && x < pt.x) {
            //const alpha = Math.arctan((pt.y - lastPt.y) / (pt.x - lastPt.x));
            //const yAtX = (x - lastPt.x) * Math.tan(alpha) + lastPt.y;
            //if (yAtX - 2 <= y < yAtX + 2) {
            //    matches.push({
            //        categoryIndex: pt.categoryIndex,
            //        seriesIndex: pt.seriesIndex,
            //        x: bar.rect,
            //        series: this.series[bar.seriesIndex],
            //        dataPoint: this.series[bar.seriesIndex].data[bar.categoryIndex]
            //
            //    })
            //}
            //}
            //}
            //lastPt = pt;

        });
        if (matches.length) {
            matches.sort((e1, e2) => e1.distance - e2.distance);
            if (true || matches[0].distance <= 5) {
                const pt = matches[0].data;
                const rect = new Rect(pt.x, pt.y, pt.x, pt.y).inflate(this.tb.options.linePlot.markerSize/2);
                Utils.assign(ret, [{found: true, rect: rect, normalisedDistance: matches[0].distance * rect.area}, pt]);
            }
        }

        return ret;
    }

    enumeratePoints(callback) {
        const categoryCount = this.renderedSeries[0].data.length;
        if (categoryCount) {
            const isHorizontal = this.tb.options.swapAxes;
            let plotArea = this.tb.plotArea.clone();
            if (isHorizontal)
                plotArea.swapXY();

            for (let seriesIndex = 0; seriesIndex < this.renderedSeries.length; seriesIndex++) {
                for (let categoryIndex = 0; categoryIndex < categoryCount; categoryIndex++) {
                    const xValue = Tayberry.getDataXValue(this.renderedSeries[seriesIndex].data, categoryIndex);
                    let x = this.tb.xAxis.getValueDisplacement(xValue);
                    const value = Tayberry.getDataValue(this.renderedSeries[seriesIndex].data[categoryIndex]);
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
                        value: Tayberry.getDataValue(this.series[seriesIndex].data[categoryIndex]),
                        renderedValue: Tayberry.getDataValue(this.renderedSeries[seriesIndex].data[categoryIndex]),
                        x: x,
                        y: y,
                        seriesSelected: !this.tb.options.tooltips.shared && this.tb.selectedItem.series === this.series[seriesIndex],
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