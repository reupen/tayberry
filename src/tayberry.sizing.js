'use strict';
var Rect = require('./rect').Rect;
var Utils = require('./utils');

var Tayberry = require('./tayberry.base.js').Tayberry;

Tayberry.mapVerticalPosition = function (sign, position) {
    switch (position) {
        case "outside":
            return sign > 0 ? "bottom" : "top";
        case "inside":
            return sign > 0 ? "top" : "bottom";
        default:
            return "middle";
    }
};

Tayberry.prototype.mapLogicalXUnit = function (x) {
    return this.scaleFactorX * x;
};

Tayberry.prototype.mapLogicalYUnit = function (x) {
    return this.scaleFactorY * x;
};

Tayberry.prototype.mapScreenUnit = function (x) {
    return x / this.scaleFactor;
};

Tayberry.prototype.calculatePlotArea = function () {
    const MAX_AXIS_CALC_SIZE_ATTEMPTS = 5;

    this.plotArea = new Rect(0, 0, this.labelsCanvas.width, this.labelsCanvas.height);
    if (this.options.title.text) {
        this.plotArea.top += this.mapLogicalYUnit(this.options.elementSmallPadding);
        this.plotArea.top += this.getFontHeight(this.options.title.font) * this.getMultilineTextHeight(this.titleFont, this.labelsCanvas.width, this.options.title.text);
    }
    if (this.options.legend.enabled)
        this.plotArea.bottom -= this.mapLogicalYUnit(this.options.elementSmallPadding + this.options.elementLargePadding + this.options.legend.indicatorSize);

    this.yAxis.adjustSize(this.plotArea, true, true);
    this.xAxis.adjustSize(this.plotArea, true, true);

    for (let i = 0; i < MAX_AXIS_CALC_SIZE_ATTEMPTS; i++) {
        this.yAxis.calculateExtent();
        this.xAxis.calculateExtent();
        this.yAxis.updateFormatter();
        this.xAxis.updateFormatter();
        if (!this.yAxis.adjustSize(this.plotArea) && !this.xAxis.adjustSize(this.plotArea))
            break;
    }
    this.plotArea.left = Math.ceil(this.plotArea.left);
    this.plotArea.top = Math.ceil(this.plotArea.top);
    this.plotArea.right = Math.floor(this.plotArea.right);
    this.plotArea.bottom = Math.floor(this.plotArea.bottom);
};

Tayberry.prototype.hitTest = function (x, y) {
    let ret = {
        found: false,
        categoryIndex: undefined,
        seriesIndex: undefined,
        rect: undefined
    };
    for (let i = 0; i < this.renderers.length; i++) {
        const hitTestResult = this.renderers[i].hitTest(x, y);
        if (hitTestResult.found) {
            ret = hitTestResult;
            break;
        }
    }
    return ret;
};