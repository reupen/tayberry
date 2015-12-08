'use strict';
var Rect = require('./helpers/rect').Rect;
var Utils = require('./helpers/utils');

var Tayberry = require('./base').Tayberry;

Tayberry.prototype.registerCallback = function (eventName, func) {
    this.callbacks[eventName].push(func);
};

Tayberry.prototype.onAnimate = function (timestamp) {
    var elapsed;
    for (let index = this.pendingAnimations.length - 1; index >= 0; index--) {
        let animation = this.pendingAnimations[index];
        if (animation.startTime === null) {
            animation.startTime = timestamp;
        }
        elapsed = timestamp - animation.startTime;
        for (let i = 0; i < this.renderers.length; i++) {
            this.renderers[i].onAnimationFrame(elapsed, animation);
        }
        if (elapsed >= animation.length) {
            this.pendingAnimations.splice(index, 1);
            if (animation.completionCallback) {
                animation.completionCallback();
            }
        }
    }
    this.redraw(true);
    if (this.pendingAnimations.length) {
        this.animator = requestAnimationFrame(this.onAnimate.bind(this));
    } else {
        this.animator = null;
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
    let tooltipDisplayStyle = 'none';
    if (boundingRect.containsPoint(clientX, clientY)) {
        let x = clientX - boundingRect.left;
        let y = clientY - boundingRect.top;

        let hitTestResult = this.hitTest(this.mapLogicalXUnit(x), this.mapLogicalYUnit(y));
        if (hitTestResult.found) {
            if (hitTestResult.type === 'legend') {
                this.selectedItem = hitTestResult;
                ret = true;
            } else if (hitTestResult.type === 'plotItem') {
                let tooltipHtml = '';
                const aboveZero = hitTestResult.rect.top < hitTestResult.rect.bottom;
                tooltipDisplayStyle = 'block';
                if (this.options.tooltips.shared) {
                    const category = this.xAxes[0].getCategoryLabel(hitTestResult.categoryIndex, this.categoryCount, hitTestResult.isXRange);
                    tooltipHtml += Utils.formatString(this.options.tooltips.headerTemplate, {category: category}, true);
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
                    const category = series.xAxis.getCategoryLabel(hitTestResult.categoryIndex, this.categoryCount, hitTestResult.isXRange);
                    tooltipHtml += Utils.formatString(this.options.tooltips.headerTemplate, {category: category}, true);
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
    }
    this.tooltipElement.style.display = tooltipDisplayStyle;
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

Tayberry.prototype.onClick = function (event) {
    let boundingRect = new Rect(this.plotCanvas.getBoundingClientRect());
    // Why is event.buttons always 0?
    if ((event.button === 0) && boundingRect.containsPoint(event.clientX, event.clientY)) {
        let x = event.clientX - boundingRect.left;
        let y = event.clientY - boundingRect.top;
        let hitTestResult = this.hitTest(this.mapLogicalXUnit(x), this.mapLogicalYUnit(y));
        if (hitTestResult.found) {
            if (hitTestResult.type === 'legend') {
                this.startAnimation({
                    type: hitTestResult.series.visible ? 'hideSeries' : 'showSeries',
                    series: hitTestResult.series,
                    completionCallback: () => hitTestResult.series.visible = !hitTestResult.series.visible
                })
            }
        }
    }
};

Tayberry.prototype.onMouseMove = function (event) {
    let oldSelectedItem = Utils.assign({}, this.selectedItem);
    if (!this.handleMouseMove(event.clientX, event.clientY)) {
        this.selectedItem = {};
    }

    if (oldSelectedItem.type !== this.selectedItem.type ||
        oldSelectedItem.categoryIndex !== this.selectedItem.categoryIndex ||
        oldSelectedItem.series !== this.selectedItem.series) {
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
    this.callbacks['onResize'].forEach(func => func());
    this.redraw();
};
