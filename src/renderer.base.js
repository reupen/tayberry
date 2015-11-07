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
                const series = this.series[seriesIndex];
                const value = Tayberry.getDataValue(series.data[categoryIndex]);
                const yOrigin = series.yAxis.min <= 0 && 0 <= series.yAxis.max ? 0 : (series.yAxis.min > 0 ? series.yAxis.min : series.yAxis.max);
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

class Enumerator {
    constructor(renderer, startCategoryIndex = 0) {
        this.renderer = renderer;
        this.tb = renderer.tb;

        this.categoryCount = this.renderer.renderedSeries[0].data.length;
        this.categoryIndex = 0;
        this.seriesIndex = 0;
        this.seriesCount = this.renderer.renderedSeries.length;
        if (this.categoryCount) {
            this.isHorizontal = this.tb.options.swapAxes;
            this.plotArea = this.tb.plotArea.clone();
            if (this.isHorizontal)
                this.plotArea.swapXY();
            this.startCategoryIndex = Math.max(startCategoryIndex, 0);
            this.startCategoryIndex = Math.min(this.startCategoryIndex, this.categoryCount - 1);
            this.categoryIndex = this.startCategoryIndex;
        }
    }

    nextValue() {
    }
}

class ByCategoryEnumerator extends Enumerator {
    onNewCategory() {}

    nextValue() {

        let value;
        do {
            if (this.seriesIndex + 1 === this.seriesCount) {
                this.seriesIndex = 0;
                this.categoryIndex++;
                if (this.categoryIndex >= this.categoryCount)
                    break;
                this.onNewCategory();
            } else {
                this.seriesIndex++;
            }
            value = Tayberry.getDataValue(this.renderer.renderedSeries[this.seriesIndex].data[this.categoryIndex]);
        } while (Utils.isMissingValue(value));

    }
}

class BySeriesEnumerator extends Enumerator {
    nextValue() {

        let value;
        do {
            if (this.categoryIndex + 1 === this.categoryCount) {
                this.categoryIndex = this.startCategoryIndex;
                this.seriesIndex++;
                if (this.seriesIndex >= this.seriesCount)
                    break;
            } else {
                this.categoryIndex++;
            }
            value = Tayberry.getDataValue(this.renderer.renderedSeries[this.seriesIndex].data[this.categoryIndex]);
        } while (Utils.isMissingValue(value));

    }
}

exports.Renderer = Renderer;
exports.ByCategoryEnumerator = ByCategoryEnumerator;
exports.BySeriesEnumerator = BySeriesEnumerator;