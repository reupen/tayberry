'use strict';
var Utils = require('./helpers/utils');
var Rect = require('./helpers/rect').Rect;
var renderer = require('./renderer.base');
var Tayberry = require('./base').Tayberry;

var autoMarkerIndex = 0;
const markers = ['square', 'diamond', 'circle', 'triangle', 'triangle-inversed'];

class LineRenderer extends renderer.Renderer {
    setSeries(series) {
        let totalPoints = 0;
        for (var i = 0; i < series.length; i++) {
            if (!series[i].markerType) {
                series[i].markerType = markers[autoMarkerIndex % markers.length];
                autoMarkerIndex++;
            }
            totalPoints += series[i].data.length;
        }
        const showMarkers = this.tb.options.linePlot.showMarkers;
        this.showMarkers = showMarkers === 'auto' ? totalPoints < this.tb.options.linePlot.noMarkersThreshold : showMarkers;
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
        let pointEnumerator = new PointEnumerator(this);
        let pt;
        while ((pt = pointEnumerator.next())) {
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
        }
        if (this.showMarkers) {
            pointEnumerator = new PointEnumerator(this);
            while ((pt = pointEnumerator.next())) {
                if (pt.selected) {
                    this.ctx.fillStyle = pt.renderedSeries.glowColour;
                    this.drawMarker(pt.renderedSeries.markerType, pt.x, pt.y, this.tb.options.linePlot.highlightedMarkerSize);
                }
                this.ctx.fillStyle = pt.renderedSeries.colour;
                this.drawMarker(pt.renderedSeries.markerType, pt.x, pt.y, this.tb.options.linePlot.markerSize);
            }
        }
        this.ctx.restore();
    }

    drawLegendIndicator(ctx, series, rect, highlighted) {
        const colour = highlighted ? series.highlightColour : series.colour;
        ctx.save();
        ctx.lineWidth = 2;
        ctx.strokeStyle = colour;
        this.tb.drawLine(rect.left, rect.yMidpoint, rect.right, rect.yMidpoint);
        ctx.fillStyle = colour;
        this.drawMarker(series.markerType, rect.xMidpoint, rect.yMidpoint, this.tb.options.linePlot.markerSize, ctx);
        ctx.restore();
    }

    drawLabels() {
        if (this.tb.options.labels.enabled) {
            this.ctx.save();
            this.ctx.font = this.tb.labelFont;
            this.ctx.fillStyle = this.tb.options.labels.font.colour;
            let pointEnumerator = new PointEnumerator(this);
            let pt;
            while ((pt = pointEnumerator.next())) {
                const rect = new Rect(pt.x, pt.y, pt.x, pt.y).inflate(this.tb.options.linePlot.markerSize / 2);
                this.drawLabel(pt.value, pt.series.yAxis.options.labelFormatter(pt.value), rect);
            }
            this.ctx.restore();
        }
    }


    hitTest(x, y) {
        // TODO: Optimise
        let ret = {
            found: false,
            plotType: 'line',
            type: 'plotItem',
            isXRange: false
        };

        let matches = [];

        let pointEnumerator = new PointEnumerator(this);
        let pt;
        while ((pt = pointEnumerator.next())) {
            const distance = Math.sqrt(Math.pow(pt.x - x, 2) + Math.pow(pt.y - y, 2));
            const horizontalDistance = Math.abs(this.tb.options.swapAxes ? pt.y - y : pt.x - x);
            matches.push({
                distance: distance,
                horizontalDistance: horizontalDistance,
                priority: 0,
                data: pt
            });
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

        }
        if (matches.length) {
            matches.sort((e1, e2) => {
                return (e1.horizontalDistance - e2.horizontalDistance) || (e1.distance - e2.distance);
            });
            if (true || matches[0].distance <= 5) {
                pt = matches[0].data;
                const rect = new Rect(pt.x, pt.y, pt.x, pt.y).inflate(this.tb.options.linePlot.markerSize / 2);
                Utils.assign(ret, [{
                    found: true,
                    rect: rect,
                    normalisedDistance: matches[0].distance + Math.sqrt(rect.area)
                }, pt]);
            }
        }

        return ret;
    }

}

class PointEnumerator extends renderer.BySeriesEnumerator {
    next() {
        let ret;

        if (this.seriesIndex < this.seriesCount) {
            const series = this.renderer.renderedSeries[this.seriesIndex];
            const value = Tayberry.getDataValue(series.data[this.categoryIndex]);
            const xValue = Tayberry.getDataXValue(series.data, this.categoryIndex);
            let x = series.xAxis.getValueDisplacement(xValue);
            let y = series.yAxis.getValueDisplacement(value);

            if (this.isHorizontal)
                [x, y] = [y, x];

            ret = {
                firstPoint: this.categoryIndex === 0,
                lastPoint: this.categoryIndex + 1 === this.categoryCount,
                seriesIndex: this.seriesIndex,
                categoryIndex: this.categoryIndex,
                series: this.renderer.series[this.seriesIndex],
                renderedSeries: this.renderer.renderedSeries[this.seriesIndex],
                value: Tayberry.getDataValue(this.renderer.series[this.seriesIndex].data[this.categoryIndex]),
                renderedValue: Tayberry.getDataValue(this.renderer.renderedSeries[this.seriesIndex].data[this.categoryIndex]),
                x: x,
                y: y,
                seriesSelected: this.tb.selectedItem.type === 'plotItem' && !this.tb.options.tooltips.shared && this.tb.selectedItem.series === this.renderer.series[this.seriesIndex],
                selected: this.tb.selectedItem.type === 'plotItem' && this.tb.selectedItem.categoryIndex === this.categoryIndex && (this.tb.options.tooltips.shared || this.tb.selectedItem.series === this.renderer.series[this.seriesIndex])
            };

            this.nextValue();
        }
        return ret;
    }
}

exports.LineRenderer = LineRenderer;