'use strict';
var Rect = require('./helpers/rect').Rect;
var Tayberry = require('./base.js').Tayberry;
var Utils = require('./helpers/utils');

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

    this.yAxes.map(e => e.adjustSize(this.plotArea, true, true));
    this.xAxes.map(e => e.adjustSize(this.plotArea, true, true));

    for (let i = 0; i < MAX_AXIS_CALC_SIZE_ATTEMPTS; i++) {
        this.yAxes.map(e => e.calculateExtent());
        this.xAxes.map(e => e.calculateExtent());
        this.yAxes.map(e => e.updateFormatter());
        this.xAxes.map(e => e.updateFormatter());
        if (Utils.none(this.yAxes.map(e => e.adjustSize(this.plotArea))) && Utils.none(this.xAxes.map(e => e.adjustSize(this.plotArea))))
            break;
    }
    this.plotArea.left = Math.ceil(this.plotArea.left);
    this.plotArea.top = Math.ceil(this.plotArea.top);
    this.plotArea.right = Math.floor(this.plotArea.right);
    this.plotArea.bottom = Math.floor(this.plotArea.bottom);
};

Tayberry.prototype.hitTest = function (x, y) {
    let ret = {
        found: false
    };
    let matches = [];
    for (let i = 0; i < this.renderers.length; i++) {
        const hitTestResult = this.renderers[i].hitTest(x, y);
        if (hitTestResult.found) {
            matches.push(hitTestResult);
        }
    }
    if (matches.length) {
        matches.sort((a, b) => a.normalisedDistance - b.normalisedDistance);
        ret = matches[0];
    }
    return ret;
};