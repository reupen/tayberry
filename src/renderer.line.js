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
        this.enumeratePoints(function (pt) {
            if (pt.firstPoint) {
                this.ctx.lineWidth = pt.seriesSelected ? 4 : 2;
                this.ctx.strokeStyle = pt.seriesSelected ? pt.renderedSeries.highlightColour : pt.renderedSeries.colour;
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
            if (pt.selected) {
                this.ctx.fillStyle = pt.renderedSeries.highlightColour;
                this.drawMarker(pt.renderedSeries.markerType, pt.x, pt.y, 15);
            }
            this.ctx.fillStyle = pt.renderedSeries.colour;
            this.drawMarker(pt.renderedSeries.markerType, pt.x, pt.y, 10);
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

        let distances = [];

        //let lastPt;
        this.enumeratePoints(function (pt) {
            const distance = Math.sqrt(Math.pow(pt.x - x, 2) + Math.pow(pt.y - y, 2));
            distances.push([distance, pt]);
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
        if (distances.length) {
            distances.sort((e1, e2) => e1[0] - e2[0]);
            if (true || distances[0][0] <= 5) {
                const pt = distances[0][1];
                const rect = new Rect(pt.x - 5, pt.y - 5 , pt.x + 5, pt.y + 5);
                Utils.assign(ret, [{found: true, rect: rect}, pt]);
            }
        }

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