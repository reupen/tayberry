'use strict';
var Utils = require('./helpers/utils');
var Easing = require('./helpers/easing');

class Renderer {
    constructor(ctx, tayberry, series) {
        this.ctx = ctx;
        this.tb = tayberry;
        this.series = null;
        this.renderedSeries = null;
        this.setSeries(series);
    }

    setSeries (series) {
        var i;
        this.series = series;
        this.renderedSeries = series.slice(0);
        for (i = 0; i < this.renderedSeries.length; i++) {
            let actualSeries = this.series[i];
            let elem = Utils.assign({}, actualSeries);
            elem.data = this.renderedSeries[i].data.slice(0);
            this.renderedSeries[i] = elem;
        }
    }

    onAnimationFrame(elapsedTime, totalTime) {
        var scaleFactor;
        scaleFactor = Math.min(Easing.inQuad(elapsedTime, totalTime), 1);
        for (let categoryIndex = 0; categoryIndex < this.series[0].data.length; categoryIndex++) {
            for (let seriesIndex = 0; seriesIndex < this.series.length; seriesIndex++) {
                const value = this.series[seriesIndex].data[categoryIndex];
                const yOrigin = this.tb.yAxis.min <= 0 && 0 <= this.tb.yAxis.max ? 0 : (this.tb.yAxis.min > 0 ? this.tb.yAxis.min : this.tb.yAxis.max);
                this.renderedSeries[seriesIndex].data[categoryIndex] = yOrigin + scaleFactor * ((value - yOrigin));
            }
        }
    }

    drawPlot() {
    }

    drawLabels() {
    }

    hitTest() {
    }

}

exports.Renderer = Renderer;