'use strict';
import {Rect} from './helpers/rect';
import * as Utils from './helpers/utils.js';

import {Tayberry} from './base';

Tayberry.prototype.registerCallback = function (eventName, func) {
    this.callbacks[eventName].push(func);
    return [eventName, func];
};

Tayberry.prototype.deregisterCallback = function ([eventName, func]) {
    const index = this.callbacks[eventName].indexOf(func);
    if (index >= 0) {
        this.callbacks[eventName].splice(index, 1);
    } else {
        throw Error("Tried to deregister an unregistered callback");
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
    let tooltipDisplayStyleSet = false;
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
                this.tooltipElement.style.display = 'block';
                tooltipDisplayStyleSet = true;
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
    if (!tooltipDisplayStyleSet)
        this.tooltipElement.style.display = 'none';
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
                const series = hitTestResult.data.series;

                this.toggleSeriesVisibility(series);
                this.clear(false, true);
                this.drawLabelLayer();
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
