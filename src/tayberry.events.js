'use strict';
var Rect = require('./rect').Rect;
var Easing = require('./easing.js');
var Utils = require('./utils.js');

var Tayberry = require('./tayberry.base.js').Tayberry;

Tayberry.prototype.onAnimate = function (timestamp) {
    var elapsed, scaleFactor;
    elapsed = timestamp - this.animatationStart;
    scaleFactor = Math.min(Easing.inQuad(elapsed, this.animationLength), 1);
    for (let categoryIndex = 0; categoryIndex < this.series[0].data.length; categoryIndex++) {
        for (let seriesIndex = 0; seriesIndex < this.series.length; seriesIndex++) {
            const value = this.series[seriesIndex].data[categoryIndex];
            const yOrigin = this.yAxis.min <= 0 && 0 <= this.yAxis.max ? 0 : (this.yAxis.min > 0 ? this.yAxis.min : this.yAxis.max);
            this.renderedSeries[seriesIndex].data[categoryIndex] = yOrigin + scaleFactor * ((value - yOrigin));
        }
    }
    this.redraw();
    if (scaleFactor < 1) {
        this.animator = requestAnimationFrame(this.onAnimate.bind(this));
    }
};

Tayberry.prototype.onMouseLeave = function (event) {
    if ((event.currentTarget == this.canvas && event.relatedTarget !== this.tooltipElement) || (event.currentTarget == this.tooltipElement && event.relatedTarget !== this.canvas)) {
        this.selectedItem = {};
        this.tooltipElement.style.display = 'none';
        this.redraw();
    }
};

Tayberry.prototype.handleMouseMove = function (clientX, clientY) {
    let boundingRect = new Rect(this.canvas.getBoundingClientRect());
    let ret = false;
    if (boundingRect.containsPoint(clientX, clientY)) {
        let x = clientX - boundingRect.left;
        let y = clientY - boundingRect.top;

        let hitTestResult = this.hitTest(this.mapLogicalXUnit(x), this.mapLogicalYUnit(y));
        if (hitTestResult.found) {
            const aboveZero = hitTestResult.rect.top < hitTestResult.rect.bottom;
            const category = this.xAxis.getCategoryLabel(hitTestResult.categoryIndex, this.series[0].data.length);
            this.tooltipElement.style.display = 'block';
            let tooltipHtml = Utils.formatString(this.options.tooltips.headerTemplate, {category: category}, true);
            if (this.options.tooltips.shared) {
                for (let index = 0; index<this.series.length; index++) {
                    const series = this.series[index];
                    const value = series.data[hitTestResult.categoryIndex];
                    tooltipHtml += Utils.formatString(this.options.tooltips.valueTemplate, {value: this.options.yAxis.labelFormatter(value), name: series.name, colour: series.colour}, true);
                }
            } else {
                const series = this.series[hitTestResult.seriesIndex];
                const value = series.data[hitTestResult.categoryIndex];
                tooltipHtml += Utils.formatString(this.options.tooltips.valueTemplate, {value: this.options.yAxis.labelFormatter(value), name: series.name, colour: series.colour}, true);
            }
            tooltipHtml += this.options.tooltips.footerTemplate;
            this.tooltipElement.innerHTML = tooltipHtml;
            let tooltipRect = this.tooltipElement.getBoundingClientRect();
            this.tooltipElement.style.borderColor = this.renderedSeries[hitTestResult.seriesIndex].colour;
            this.tooltipElement.style.left = window.pageXOffset + boundingRect.left + this.mapScreenUnit(hitTestResult.rect.width) / 2 + hitTestResult.rect.left / this.scaleFactor - tooltipRect.width / 2 + 'px';
            this.tooltipElement.style.top = window.pageYOffset + boundingRect.top + this.mapScreenUnit(hitTestResult.rect.top) - tooltipRect.height * (aboveZero ? 1 : 0) - this.options.elementSmallPadding * (aboveZero ? 1 : -1) + 'px';
            this.selectedItem = hitTestResult;
            ret = true;
        }
    }
    return ret;
};

Tayberry.prototype.onTouchStart = function (event) {
    for (let index = 0; index < event.targetTouches.length; index++) {
        let touch = event.targetTouches[index];
        if (this.handleMouseMove(touch.clientX, touch.clientY)) {
            event.preventDefault();
            this.redraw();
            break;
        }
    }
};


Tayberry.prototype.onMouseMove = function (event) {
    let oldSelectedItem = Utils.assign({}, this.selectedItem);
    if (!this.handleMouseMove(event.clientX, event.clientY)) {
        this.selectedItem = {};
    }

    if (oldSelectedItem.categoryIndex !== this.selectedItem.categoryIndex || oldSelectedItem.seriesIndex !== this.selectedItem.seriesIndex) {
        this.redraw();
    }
};

Tayberry.prototype.onWindowResize = function () {
    this.tooltipElement.style.display = 'none';
    this.initialise();
    this.updateFonts();
    this.calculatePlotArea();
    this.redraw();
};
