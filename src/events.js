'use strict';
var Rect = require('./helpers/rect').Rect;
var Utils = require('./helpers/utils');

var Tayberry = require('./base').Tayberry;

Tayberry.prototype.onAnimate = function (timestamp) {
    var elapsed;
    if (this.animationStart === null) {
        this.animationStart = timestamp;
    }
    elapsed = timestamp - this.animationStart;
    for (let i = 0; i < this.renderers.length; i++) {
        this.renderers[i].onAnimationFrame(elapsed, this.animationLength);
    }
    this.redraw(true);
    if (elapsed < this.animationLength) {
        this.animator = requestAnimationFrame(this.onAnimate.bind(this));
    }
};

Tayberry.prototype.onMouseLeave = function (event) {
    if ((event.currentTarget == this.plotCanvas && event.relatedTarget !== this.tooltipElement) || (event.currentTarget == this.tooltipElement && event.relatedTarget !== this.plotCanvas)) {
        this.selectedItem = {};
        this.tooltipElement.style.display = 'none';
        this.redraw();
    }
};

Tayberry.prototype.handleMouseMove = function (clientX, clientY) {
    let boundingRect = new Rect(this.plotCanvas.getBoundingClientRect());
    let ret = false;
    if (boundingRect.containsPoint(clientX, clientY)) {
        let x = clientX - boundingRect.left;
        let y = clientY - boundingRect.top;

        let hitTestResult = this.hitTest(this.mapLogicalXUnit(x), this.mapLogicalYUnit(y));
        if (hitTestResult.found) {
            const aboveZero = hitTestResult.rect.top < hitTestResult.rect.bottom;
            const category = this.xAxis.getCategoryLabel(hitTestResult.categoryIndex, this.categoryCount, hitTestResult.isXRange);
            this.tooltipElement.style.display = 'block';
            let tooltipHtml = Utils.formatString(this.options.tooltips.headerTemplate, {category: category}, true);
            if (this.options.tooltips.shared) {
                for (let index = 0; index < this.seriesCount; index++) {
                    const series = this.options.series[index];
                    const value = Tayberry.getDataValue(series.data[hitTestResult.categoryIndex]);
                    tooltipHtml += Utils.formatString(this.options.tooltips.valueTemplate, {
                        value: series.yAxis.options.labelFormatter(value),
                        name: series.name,
                        colour: series.colour
                    }, true);
                }
            } else {
                const series = hitTestResult.series;
                const value = hitTestResult.value;
                tooltipHtml += Utils.formatString(this.options.tooltips.valueTemplate, {
                    value: series.yAxis.options.labelFormatter(value),
                    name: series.name,
                    colour: series.colour
                }, true);
            }
            tooltipHtml += this.options.tooltips.footerTemplate;
            this.tooltipElement.innerHTML = tooltipHtml;
            let tooltipRect = this.tooltipElement.getBoundingClientRect();
            if (!this.options.tooltips.shared) {
                this.tooltipElement.style.borderColor = hitTestResult.series.colour;
            }
            this.tooltipElement.style.left = window.pageXOffset + boundingRect.left + this.mapScreenUnit(hitTestResult.rect.width) / 2 + hitTestResult.rect.left / this.scaleFactor - tooltipRect.width / 2 + 'px';
            this.tooltipElement.style.top = window.pageYOffset + boundingRect.top + this.mapScreenUnit(hitTestResult.rect.top) - tooltipRect.height * (aboveZero ? 1 : 0) - this.options.elementSmallPadding * (aboveZero ? 1 : -1) + 'px';
            this.selectedItem = hitTestResult;
            ret = true;
        }
    }
    return ret;
};


//Tayberry.prototype.onTouchStart = function (event) {
//    for (let index = 0; index < event.targetTouches.length; index++) {
//        let touch = event.targetTouches[index];
//        if (this.handleMouseMove(touch.clientX, touch.clientY)) {
//            // event.preventDefault();
//            this.redraw();
//            break;
//        }
//    }
//};


Tayberry.prototype.onMouseMove = function (event) {
    let oldSelectedItem = Utils.assign({}, this.selectedItem);
    if (!this.handleMouseMove(event.clientX, event.clientY)) {
        this.selectedItem = {};
    }

    if (oldSelectedItem.categoryIndex !== this.selectedItem.categoryIndex || oldSelectedItem.series !== this.selectedItem.series) {
        this.redraw();
    }
};

Tayberry.prototype.onWindowResize = function () {
    this.tooltipElement.style.display = 'none';
    this.labelsCanvas.style.width = Math.floor(this.containerElement.clientWidth) + 'px';
    this.labelsCanvas.style.height = Math.floor(this.containerElement.clientHeight) + 'px';
    this.plotCanvas.style.width = Math.floor(this.containerElement.clientWidth) + 'px';
    this.plotCanvas.style.height = Math.floor(this.containerElement.clientHeight) + 'px';
    this.initialise();
    this.updateFonts();
    this.calculatePlotArea();
    this.createTooltip();
    this.redraw();
};
