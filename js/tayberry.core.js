'use strict';
var Colour = require('./colour').Colour;
var Utils = require('./utils.js');

var Tayberry = require('./tayberry.base.js').Tayberry;

Tayberry.prototype.create = function (containerElement) {
    if (typeof containerElement == 'string') {
        this.containerElement = document.getElementById(containerElement);
    } else {
        this.containerElement = containerElement;
    }
    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.containerElement.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.renderedSeries = null;
    this.options = {};
    this.initialise();
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseleave', this.onMouseLeave.bind(this));
    this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this));
    window.addEventListener('resize', this.onWindowResize.bind(this));
};

Tayberry.prototype.initialise = function () {
    this.scaleFactor = window.devicePixelRatio || 1.0;
    this.canvas.width = this.containerElement.clientWidth * this.scaleFactor;
    this.canvas.height = this.containerElement.clientHeight * this.scaleFactor;
    this.selectedItem = {};
    this.plotArea = null;
};

Tayberry.prototype.setOptions = function (options) {
    this.options = Utils.deepAssign({}, this.defaultOptions(), options);
    this.setSeries(options.series);
    this.setCategories(options.xAxis.categories);
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
        let elem = Utils.assign({}, actualSeries);
        elem.data = this.renderedSeries[i].data.slice(0);
        elem.colour = actualSeries.colour || this.options.defaultPalette[i];
        elem.highlightColour = actualSeries.highlightColour || Colour.multiplyBy(elem.colour, 1.2);
        elem.name = actualSeries.name;
        this.renderedSeries[i] = elem;
    }
    this.ctx.font = this.mapLogicalUnit(this.options.font.size) + 'px ' + this.options.font.face;
    this.titleFont = this.mapLogicalUnit(this.options.title.font.size) + 'px ' + this.options.font.face;
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

Tayberry.prototype.calculateYDataMinMax = function () {
    var categoryIndex, seriesIndex, yMin, yMax;
    this.seriesTotals = [];
    const seriesMinima = [];
    const seriesMaxima = [];
    if (this.series[0].data.length) {
        for (categoryIndex = 0; categoryIndex < this.series[0].data.length; categoryIndex++) {
            this.seriesTotals[categoryIndex] = 0;
            for (seriesIndex = 0; seriesIndex < this.series.length; seriesIndex++) {
                this.seriesTotals[categoryIndex] += this.series[seriesIndex].data[categoryIndex];
            }
        }
        for (let series of this.series) {
            seriesMinima.push(Utils.reduce(series.data, Math.min));
            seriesMaxima.push(Utils.reduce(series.data, Math.max));
        }
        if (this.options.stacked) {
            yMin = Math.min(0, Utils.reduce(this.seriesTotals, Math.min));
            yMax = Math.max(Utils.reduce(this.seriesTotals, Math.max), 1);
        } else {
            yMin = Utils.reduce(seriesMinima, Math.min);
            yMax = Utils.reduce(seriesMaxima, Math.max);
        }
    }
    return [yMin, yMax];
};



Tayberry.prototype.createTooltip = function () {

    this.tooltipElement = document.createElement('div');
    this.tooltipElement.className = 'tayberry-tooltip';
    this.tooltipElement.style.position = 'absolute';
    this.tooltipElement.style.left = '0px';
    this.tooltipElement.style.top = '0px';
    this.tooltipElement.style.zIndex = '99999';
    this.tooltipElement.style.font = this.options.font.size + 'px ' + this.options.font.face;;
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
