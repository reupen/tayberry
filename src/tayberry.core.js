'use strict';
var Colour = require('./colour').Colour;
var Utils = require('./utils');

var Tayberry = require('./tayberry.base').Tayberry;
var Axis = require('./tayberry.axes').Axis;

var currentAutoColourIndex = 0;

Tayberry.getAutoColour = function() {
    let ret = Tayberry.defaultColours[currentAutoColourIndex % Tayberry.defaultColours.length];
    currentAutoColourIndex++;
    return ret;
};

Tayberry.prototype.create = function (containerElement) {
    if (typeof containerElement == 'string') {
        this.containerElement = document.getElementById(containerElement);
    } else {
        this.containerElement = containerElement;
    }
    this.canvas = document.createElement('canvas');
    this.canvas.style.width = Math.floor(this.containerElement.clientWidth) + 'px';
    this.canvas.style.height = Math.floor(this.containerElement.clientHeight) + 'px';
    this.containerElement.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.renderedSeries = null;
    this.options = {};
    this.yAxis = null;
    this.xAxis = null;
    this.initialise();
};

Tayberry.prototype.destroy = function () {
    this.canvas.remove();
    this.tooltipElement.remove();
    this.options = {};
    this.series = {};
    this.canvas.removeEventListener('mousemove', this.onMouseMoveReal);
    this.canvas.removeEventListener('mouseleave', this.onMouseLeaveReal);
    this.canvas.removeEventListener('touchstart', this.onTouchStartReal);
    window.removeEventListener('resize', this.onWindowResizeReal);
};

Tayberry.prototype.initialise = function () {
    this.scaleFactor = window.devicePixelRatio || 1.0;
    this.canvas.width = Math.round(this.containerElement.clientWidth * this.scaleFactor);
    this.canvas.height = Math.round(this.containerElement.clientHeight * this.scaleFactor);
    this.scaleFactorX = this.canvas.width / this.containerElement.clientWidth;
    this.scaleFactorY = this.canvas.height / this.containerElement.clientHeight;
    this.selectedItem = {};
    this.plotArea = null;
};

Tayberry.prototype.getFontHeight = function (font, forDom = false) {
    let ret = font.size;
    if (font.autoScale)
        ret *= Math.pow(this.canvas.width/800, 0.25);
    if (!forDom) ret = this.mapLogicalYUnit(ret);
    return ret;
};

Tayberry.prototype.createFontString = function (font, forDom = false) {
    return (font.style ? font.style + ' ' : '') + this.getFontHeight(font, forDom).toFixed(1) + 'px ' + font.face;
};

Tayberry.prototype.updateFonts = function () {
    this.ctx.font = this.createFontString(this.options.font);
    this.titleFont = this.createFontString(this.options.title.font);
    this.yAxis.updateFonts();
    this.xAxis.updateFonts();
};

Tayberry.prototype.setOptions = function (options) {
    let optionOverrides = [this.defaultOptions()];
    if (options.presets) {
        for (let index = 0; index < options.presets.length; index++) {
            optionOverrides.push(Tayberry.presets[options.presets[index]]);
        }
    }
    optionOverrides.push(options);
    this.options = Utils.deepAssign({}, optionOverrides);
    this.options.title.font = Utils.deepAssign({}, [this.options.font, this.options.title.font]);
    this.options.yAxis.title.font = Utils.deepAssign({}, [this.options.font, this.options.xAxis.title.font, this.options.yAxis.title.font]);
    this.options.xAxis.title.font = Utils.deepAssign({}, [this.options.xAxis.title.font, this.options.yAxis.title.font]);
    this.setSeries(options.series);
    //this.setCategories(options.xAxis.categories);

    this.yAxis = Axis.create(this, this.options.yAxis, 0, 'y', this.options.swapAxes);
    this.xAxis = Axis.create(this, this.options.xAxis, 0, 'x', this.options.swapAxes);
    this.updateFonts();
    this.canvas.addEventListener('mousemove', this.onMouseMoveReal = this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseleave', this.onMouseLeaveReal = this.onMouseLeave.bind(this));
    this.canvas.addEventListener('touchstart', this.onTouchStartReal = this.onTouchStart.bind(this));
    window.addEventListener('resize', this.onWindowResizeReal = Utils.throttle(this.onWindowResize, 50).bind(this));
};

Tayberry.calculateHighlightColour = function (colour) {
    let newColour = new Colour(colour);
    return newColour.increaseBy(30 * (newColour.sum >= 180 * 3 ? -1 : 1)).toString();
};

/**
 * Format:
 * [{
 *   data: {array|object},
 *   name: {string}
 * },{
 *   data: {array|object},
 *   name: {string}
 * }]
 * @param series
 */
Tayberry.prototype.setSeries = function (series) {
    var i;
    if (!Array.isArray(series)) {
        this.series = [series];
    } else {
        this.series = series;
    }
    this.renderedSeries = series.slice(0);
    for (i = 0; i < this.renderedSeries.length; i++) {
        let actualSeries = this.series[i];
        actualSeries.colour = actualSeries.colour || Tayberry.getAutoColour();
        actualSeries.highlightColour = actualSeries.highlightColour || Tayberry.calculateHighlightColour(actualSeries.colour);
        let elem = Utils.assign({}, actualSeries);
        elem.data = this.renderedSeries[i].data.slice(0);
        this.renderedSeries[i] = elem;
    }
};


Tayberry.prototype.setCategories = function (categories) {
    this.categories = (categories);
    //if (this.options.xAxis.type === 'numeric' || this.options.xAxis.type === 'numerical') {
    //    this.categories = [];
    //    for (let i = this.options.xAxis.min; i <= this.options.xAxis.max; i += this.options.xAxis.step) {
    //        i = Math.round(i / this.options.xAxis.step) * this.options.xAxis.step;
    //        this.categories.push(i);
    //    }
    //}
};

Tayberry.prototype.getDataMinMax = function () {
    var categoryIndex, seriesIndex, min, max;
    let seriesPositiveTotals = [];
    let seriesNegativeTotals = [];
    const seriesMinima = [];
    const seriesMaxima = [];
    if (this.series[0].data.length) {
        for (categoryIndex = 0; categoryIndex < this.series[0].data.length; categoryIndex++) {
            seriesPositiveTotals[categoryIndex] = 0;
            seriesNegativeTotals[categoryIndex] = 0;
            for (seriesIndex = 0; seriesIndex < this.series.length; seriesIndex++) {
                const value = this.series[seriesIndex].data[categoryIndex];
                if (!Utils.isMissingValue(value)) {
                    if (value < 0) {
                        seriesNegativeTotals[categoryIndex] += value;
                    } else {
                        seriesPositiveTotals[categoryIndex] += value;
                    }
                }
            }
        }
        for (let index = 0; index < this.series.length; index++) {
            const series = this.series[index];
            seriesMinima.push(Utils.reduce(series.data, Math.min, undefined, true));
            seriesMaxima.push(Utils.reduce(series.data, Math.max, undefined, true));
        }
        if (this.options.barMode === 'stacked') {
            min = Math.min(0, Utils.reduce(seriesNegativeTotals, Math.min, undefined, true));
            max = Math.max(Utils.reduce(seriesPositiveTotals, Math.max, undefined, true), 0);
        } else {
            min = Utils.reduce(seriesMinima, Math.min, undefined, true);
            max = Utils.reduce(seriesMaxima, Math.max, undefined, true);
        }
    }
    return [min, max];
};


Tayberry.prototype.createTooltip = function () {
    if (this.tooltipElement) {
        this.tooltipElement.remove();
        this.tooltipElement = null;
    }
    this.tooltipElement = document.createElement('div');
    this.tooltipElement.className = 'tayberry-tooltip';
    this.tooltipElement.style.position = 'absolute';
    this.tooltipElement.style.left = '0px';
    this.tooltipElement.style.top = '0px';
    this.tooltipElement.style.zIndex = '99999';
    this.tooltipElement.style.font = this.createFontString(this.options.font, true);
    this.tooltipElement.style.borderRadius = '3px';
    this.tooltipElement.style.backgroundColor = 'white';
    this.tooltipElement.style.border = '2px solid black';
    this.tooltipElement.style.padding = '0.15em 0.4em';
    this.tooltipElement.style.display = 'none';
    this.tooltipElement.innerHTML = '';
    document.body.appendChild(this.tooltipElement);
    this.tooltipElement.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.tooltipElement.addEventListener('mouseleave', this.onMouseLeave.bind(this));
};
