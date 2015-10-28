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
            actualSeries.renderer = this;
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

    drawLegendIndicator(ctx, series, rect) {
        ctx.fillStyle = series.colour;
        ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
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

    drawPlot() {
    }

    drawLabels() {
    }

    hitTest() {
    }

}

exports.Renderer = Renderer;