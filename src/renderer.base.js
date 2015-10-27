'use strict';
var Utils = require('./helpers/utils');
var Easing = require('./helpers/easing');
var Tayberry = require('./base').Tayberry;

class Renderer {
    constructor(ctx, tayberry, series) {
        this.ctx = ctx;
        this.tb = tayberry;
        this.series = null;
        this.renderedSeries = null;
        this.setSeries(series);
    }

    setSeries(series) {
        var seriesIndex;
        this.series = series;
        this.renderedSeries = series.slice(0);
        for (seriesIndex = 0; seriesIndex < this.renderedSeries.length; seriesIndex++) {
            let actualSeries = this.series[seriesIndex];
            let elem = Utils.assign({}, actualSeries);
            elem.data = this.renderedSeries[seriesIndex].data.slice(0);
            if (elem.data.length && Array.isArray(elem.data[0])) {
                for (var dataIndex = 0; dataIndex < elem.data.length; dataIndex++) {
                    elem.data[dataIndex] = elem.data[dataIndex].slice(0);                    
                }
            }
            this.renderedSeries[seriesIndex] = elem;
        }
    }

    onAnimationFrame(elapsedTime, totalTime) {
        var scaleFactor;
        scaleFactor = Math.min(Easing.inQuad(elapsedTime, totalTime), 1);
        for (let categoryIndex = 0; categoryIndex < this.series[0].data.length; categoryIndex++) {
            for (let seriesIndex = 0; seriesIndex < this.series.length; seriesIndex++) {
                const value = Tayberry.getDataValue(this.series[seriesIndex].data[categoryIndex]);
                const yOrigin = this.tb.yAxis.min <= 0 && 0 <= this.tb.yAxis.max ? 0 : (this.tb.yAxis.min > 0 ? this.tb.yAxis.min : this.tb.yAxis.max);
                Tayberry.setDataValue(this.renderedSeries[seriesIndex].data, categoryIndex, yOrigin + scaleFactor * ((value - yOrigin)));
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