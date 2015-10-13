(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Tayberry = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Utils = require('./utils.js');

var Colour = (function () {
    /**
     * Constructs a Colour object.
     *
     * @param colourCode    an HTML colour code in hex or integer (rgb) form
     */

    function Colour() {
        _classCallCheck(this, Colour);

        if (arguments.length === 1) {
            var arg1 = arguments[0];
            if (typeof arg1 === 'string') this.parseString(arg1);else {
                this.r = arg1.r;
                this.g = arg1.g;
                this.b = arg1.b;
                this.a = arg1.a;
            }
        }
    }

    /**
     * Parses an HTML colour code
     * @param str
     * @returns {Colour}
     */

    _createClass(Colour, [{
        key: 'parseString',
        value: function parseString(str) {
            var regExHex = /^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})|^#?([0-9A-F]{1})([0-9A-F]{1})([0-9A-F]{1})$/i;
            var regExInt = /^rgba?\((\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(\s*,\s*([0-9]*\.?[0-9]+))+\)$/i;
            var groupsHex = regExHex.exec(str);
            var groupsInt = regExInt.exec(str);
            if (groupsHex) {
                var parseHex = function parseHex(value) {
                    var ret = parseInt(value, 16);
                    ret = ret * 0x10 + ret;
                    return ret;
                };
                this.r = groupsHex[1] ? parseInt(groupsHex[1], 16) : parseHex(groupsHex[4]);
                this.g = groupsHex[2] ? parseInt(groupsHex[2], 16) : parseHex(groupsHex[5]);
                this.b = groupsHex[3] ? parseInt(groupsHex[3], 16) : parseHex(groupsHex[6]);
                this.a = null;
            } else if (groupsInt) {
                this.r = parseInt(groupsInt[1]);
                this.g = parseInt(groupsInt[2]);
                this.b = parseInt(groupsInt[3]);
                this.a = groupsInt[5] ? parseFloat(groupsInt[5]) : null;
            } else {
                this.r = null;
                this.g = null;
                this.b = null;
                this.a = null;
            }
            return this;
        }

        /**
         * Clips a colour component to be in the range [0, 255], and round it them to
         * the nearest integer
         * @param component
         * @returns {Colour}
         */
    }, {
        key: 'clipComponent',
        value: function clipComponent(component) {
            this[component] = Math.round(this[component]);
            this[component] = Math.min(this[component], 255);
            this[component] = Math.max(this[component], 0);
            return this;
        }

        /**
         * Clips r,g,b colour components to be in the range [0, 255], and rounds them to
         * the nearest integer
         * @returns {Colour}
         */
    }, {
        key: 'clip',
        value: function clip() {
            this.clipComponent('r');
            this.clipComponent('g');
            this.clipComponent('b');
            return this;
        }

        /**
         * Multiplies each colour component by a number
         * @param number
         * @returns {Colour}
         */
    }, {
        key: 'multiplyBy',
        value: function multiplyBy(number) {
            this.r *= number;
            this.g *= number;
            this.b *= number;
            this.clip();
            return this;
        }

        /**
         * Adds a number to each colour component
         * @param number
         * @returns {Colour}
         */
    }, {
        key: 'increaseBy',
        value: function increaseBy(number) {
            this.r += number;
            this.g += number;
            this.b += number;
            this.clip();
            return this;
        }
    }, {
        key: 'toString',

        /**
         * Formats this colour as a string
         * @returns {String}
         */
        value: function toString() {
            var ret;
            if (this.a) {
                ret = Utils.formatString('rgba({r},{g},{b},{a})', this);
            } else {
                ret = Utils.formatString('rgb({r},{g},{b})', this);
            }
            return ret;
        }

        /**
         * Multiplies each colour component of a colour code by a number
         * @param colour
         * @param number
         * @returns {String}
         */
    }, {
        key: 'sum',
        get: function get() {
            return this.r + this.g + this.b;
        }
    }], [{
        key: 'multiplyBy',
        value: function multiplyBy(colour, number) {
            return new Colour(colour).multiplyBy(number).toString();
        }
    }]);

    return Colour;
})();

exports.Colour = Colour;

},{"./utils.js":12}],2:[function(require,module,exports){
"use strict";

exports.linear = function (time, duration) {
    return time / duration;
};

exports.linear = function (time, duration) {
    return time / duration;
};

exports.inQuad = function (time, duration) {
    var factor = time / duration;
    return factor * factor;
};

exports.outQuad = function (time, duration) {
    var factor = time / duration;
    return factor * (2 - factor);
};

},{}],3:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Rect = (function () {
    function Rect() {
        _classCallCheck(this, Rect);

        var rect;
        if (arguments.length === 1) {
            rect = arguments[0];
            this.left = rect.left;
            this.top = rect.top;
            this.right = rect.right;
            this.bottom = rect.bottom;
        } else if (arguments.length === 4) {
            this.left = arguments[0];
            this.top = arguments[1];
            this.right = arguments[2];
            this.bottom = arguments[3];
        }
    }

    _createClass(Rect, [{
        key: "containsPoint",
        value: function containsPoint(x, y) {
            return this.containsX(x) && this.containsY(y);
        }
    }, {
        key: "containsY",
        value: function containsY(y) {
            return y >= this.minY && y < this.maxY;
        }
    }, {
        key: "containsX",
        value: function containsX(x) {
            return x >= this.minX && x < this.maxX;
        }
    }, {
        key: "clip",
        value: function clip(clipRect) {
            if (this.left < clipRect.minX) this.left = clipRect.minX;else if (this.left > clipRect.maxX) this.left = clipRect.maxX;

            if (this.right < clipRect.minX) this.right = clipRect.minX;else if (this.right > clipRect.maxX) this.right = clipRect.maxX;

            if (this.top < clipRect.minY) this.top = clipRect.minY;else if (this.top > clipRect.maxY) this.top = clipRect.maxY;

            if (this.bottom > clipRect.maxY) this.bottom = clipRect.maxY;else if (this.bottom < clipRect.minY) this.bottom = clipRect.minY;

            return this;
        }
    }, {
        key: "width",
        get: function get() {
            return this.right - this.left;
        }
    }, {
        key: "height",
        get: function get() {
            return this.bottom - this.top;
        }
    }, {
        key: "maxY",
        get: function get() {
            return Math.max(this.bottom, this.top);
        }
    }, {
        key: "minY",
        get: function get() {
            return Math.min(this.bottom, this.top);
        }
    }, {
        key: "minX",
        get: function get() {
            return Math.min(this.left, this.right);
        }
    }, {
        key: "maxX",
        get: function get() {
            return Math.max(this.left, this.right);
        }
    }]);

    return Rect;
})();

exports.Rect = Rect;

},{}],4:[function(require,module,exports){
'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var Utils = require('./utils.js');

var Tayberry = require('./tayberry.base.js').Tayberry;

Tayberry.prototype.calculateYAxisExtent = function () {
    var targetTicks, approxStep, scale;

    var targetYStart = this.options.yAxis.min;
    var targetYEnd = this.options.yAxis.max;
    var overriddenStart = typeof targetYStart !== 'undefined';
    var overriddenEnd = typeof targetYEnd !== 'undefined';

    if (!overriddenStart || !overriddenEnd) {
        var _calculateYDataMinMax = this.calculateYDataMinMax();

        var _calculateYDataMinMax2 = _slicedToArray(_calculateYDataMinMax, 2);

        var dataYMin = _calculateYDataMinMax2[0];
        var dataYMax = _calculateYDataMinMax2[1];

        var dataYRange = dataYMax - dataYMin;
        if (!overriddenStart) {
            targetYStart = dataYMin - dataYRange * 0.1;
            if (dataYMin >= 0 && targetYStart < 0) targetYStart = 0;
        }
        if (!overriddenEnd) {
            targetYEnd = dataYMax + dataYRange * 0.1;
            if (dataYMax <= 0 && targetYStart > 0) targetYEnd = 0;
        }
    }

    var targetYRange = targetYEnd - targetYStart;

    targetTicks = this.plotArea.height / this.mapLogicalYUnit(this.options.yAxis.tickStep);
    approxStep = targetYRange / targetTicks;
    scale = Math.pow(10, Math.floor(Math.log(approxStep) / Math.log(10)));
    this.yTickStep = Math.ceil(approxStep / scale) * scale;
    this.yMin = targetYStart;
    this.yMax = targetYEnd;
    if (!overriddenStart) this.yMin = Math.floor(this.yMin / scale) * scale;
    if (!overriddenEnd) this.yMax = Math.ceil(this.yMax / scale) * scale;
    this.yTickStart = Math.floor(this.yMin / this.yTickStep) * this.yTickStep;
    this.yTickEnd = Math.ceil(this.yMax / this.yTickStep) * this.yTickStep;
};

Tayberry.prototype.drawXAxis = function () {
    var i, barWidth, x, y, lastXEnd;
    var categoryCount = this.categories.length;
    barWidth = Math.floor(this.plotArea.width / this.series[0].data.length);
    this.ctx.save();
    this.ctx.fillStyle = this.options.font.colour;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'bottom';
    var factor = undefined;
    switch (this.options.xAxis.labelPosition) {
        case 'left':
            factor = 0;
            break;
        case 'right':
            factor = 0;
            break;
        default:
            factor = 0.5;
            break;
    }
    for (i = 0; i < categoryCount; i++) {
        x = this.plotArea.left + Math.floor(i * barWidth + barWidth * factor);
        y = this.plotArea.bottom + this.mapLogicalYUnit(this.options.font.size + this.options.elementSmallPadding);
        var textWidth = this.getTextWidth(this.categories[i]);
        var xStart = x - textWidth / 2;
        var xEnd = x + textWidth / 2;
        if (typeof lastXEnd === 'undefined' || xStart > lastXEnd + 1) {
            this.ctx.fillText(this.categories[i], x, y);
            lastXEnd = xEnd;
        }
    }
    x = this.plotArea.left + this.plotArea.width / 2;
    y = this.plotArea.bottom + this.mapLogicalYUnit(this.options.font.size * 2 + this.options.elementSmallPadding + this.options.elementLargePadding);
    this.ctx.fillText(this.options.xAxis.title, x, y);
    this.ctx.restore();
};

Tayberry.prototype.drawYAxis = function () {
    var yValue, x, y;

    var yOrigin = this.getYOrigin();
    this.ctx.save();
    this.ctx.fillStyle = this.options.font.colour;
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'middle';

    for (yValue = this.yTickStart; yValue <= this.yTickEnd && this.yTickStep;) {
        yValue = this.yTickStart + Math.round((yValue + this.yTickStep - this.yTickStart) / this.yTickStep) * this.yTickStep;
        x = this.plotArea.left - this.mapLogicalXUnit(this.options.elementSmallPadding);
        var valueHeight = this.getYHeight(yValue);
        y = yOrigin - valueHeight;
        if (this.plotArea.containsY(y)) {
            this.ctx.fillText(this.options.yAxis.labelFormatter(yValue), x, y);
            this.drawLine(this.plotArea.left, y, this.plotArea.right, y, this.options.yAxis.gridLines.colour);
        }
    }

    x = 0;
    y = this.plotArea.top + this.plotArea.height / 2;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    this.ctx.translate(x, y);
    this.ctx.rotate(-Math.PI / 2);
    this.ctx.fillText(this.options.yAxis.title, 0, 0);
    this.ctx.restore();
};

},{"./tayberry.base.js":5,"./utils.js":12}],5:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Tayberry = (function () {
    function Tayberry() {
        _classCallCheck(this, Tayberry);

        this.selectedItem = {};
        this.containerElement = null;
        this.canvas = null;
        this.ctx = null;
        this.renderedSeries = null;
        this.options = null;
        this.scaleFactor = null;
        this.titleFont = null;
        this.plotArea = null;
        this.yTickStep = null;
        this.yTickStart = null;
        this.yTickEnd = null;
        this.yMin = null;
        this.yMax = null;
        this.series = [];
        this.categories = [];
    }

    _createClass(Tayberry, [{
        key: "seriesCount",
        get: function get() {
            return this.series.length;
        }
    }, {
        key: "categoryCount",
        get: function get() {
            return this.series.length ? this.series[0].data.length : 0;
        }
    }]);

    return Tayberry;
})();

exports.Tayberry = Tayberry;

},{}],6:[function(require,module,exports){
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

Tayberry.prototype.updateFonts = function () {
    this.ctx.font = this.mapLogicalYUnit(this.options.font.size) + 'px ' + this.options.font.face;
    this.titleFont = this.mapLogicalYUnit(this.options.title.font.size) + 'px ' + this.options.font.face;
};

Tayberry.prototype.updateYFormatter = function () {
    if (!this.options.yAxis.labelFormatter) {
        if (this.options.yAxis.labelFormat === 'percentage') {
            this.options.yAxis.labelFormatter = Utils.createPercentageFormatter(this.yMax - this.yMin, this.options.yAxis.labelPrefix, this.options.yAxis.labelSuffix);
        } else if (this.options.yAxis.labelFormat === 'currency') {
            this.options.yAxis.labelFormatter = Utils.createFixedNumberFormatter(this.yMax - this.yMin, this.options.yAxis.labelPrefix || this.options.yAxis.currencySymbol, this.options.yAxis.labelSuffix);
        } else {
            this.options.yAxis.labelFormatter = Utils.createAutoNumberFormatter(this.yMax - this.yMin, this.options.yAxis.labelPrefix, this.options.yAxis.labelSuffix);
        }
    }
};

Tayberry.prototype.setOptions = function (options) {
    var optionOverrides = [this.defaultOptions()];
    if (options.presets) {
        for (var index = 0; index < options.presets.length; index++) {
            optionOverrides.push(Tayberry.presets[options.presets[index]]);
        }
    }
    optionOverrides.push(options);
    this.options = Utils.deepAssign({}, optionOverrides);
    this.setSeries(options.series);
    this.setCategories(options.xAxis.categories);
    this.updateFonts();
    this.canvas.addEventListener('mousemove', this.onMouseMoveReal = this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseleave', this.onMouseLeaveReal = this.onMouseLeave.bind(this));
    this.canvas.addEventListener('touchstart', this.onTouchStartReal = this.onTouchStart.bind(this));
    window.addEventListener('resize', this.onWindowResizeReal = Utils.throttle(this.onWindowResize, 50).bind(this));
};

Tayberry.calculateHighlightColour = function (colour) {
    var newColour = new Colour(colour);
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
        var actualSeries = this.series[i];
        actualSeries.colour = actualSeries.colour || this.options.defaultPalette[i];
        actualSeries.highlightColour = actualSeries.highlightColour || Tayberry.calculateHighlightColour(actualSeries.colour);
        var elem = Utils.assign({}, actualSeries);
        elem.data = this.renderedSeries[i].data.slice(0);
        this.renderedSeries[i] = elem;
    }
};

Tayberry.prototype.setCategories = function (categories) {
    this.categories = categories;
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
    var seriesPositiveTotals = [];
    var seriesNegativeTotals = [];
    var seriesMinima = [];
    var seriesMaxima = [];
    if (this.series[0].data.length) {
        for (categoryIndex = 0; categoryIndex < this.series[0].data.length; categoryIndex++) {
            seriesPositiveTotals[categoryIndex] = 0;
            seriesNegativeTotals[categoryIndex] = 0;
            for (seriesIndex = 0; seriesIndex < this.series.length; seriesIndex++) {
                var value = this.series[seriesIndex].data[categoryIndex];
                if (!Utils.isMissingValue(value)) {
                    if (value < 0) {
                        seriesNegativeTotals[categoryIndex] += value;
                    } else {
                        seriesPositiveTotals[categoryIndex] += value;
                    }
                }
            }
        }
        for (var index = 0; index < this.series.length; index++) {
            var series = this.series[index];
            seriesMinima.push(Utils.reduce(series.data, Math.min, undefined, true));
            seriesMaxima.push(Utils.reduce(series.data, Math.max, undefined, true));
        }
        if (this.options.barMode === 'stacked') {
            yMin = Math.min(0, Utils.reduce(seriesNegativeTotals, Math.min, undefined, true));
            yMax = Math.max(Utils.reduce(seriesPositiveTotals, Math.max, undefined, true), 0);
        } else {
            yMin = Utils.reduce(seriesMinima, Math.min, undefined, true);
            yMax = Utils.reduce(seriesMaxima, Math.max, undefined, true);
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
    this.tooltipElement.style.font = this.options.font.size + 'px ' + this.options.font.face;
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

},{"./colour":1,"./tayberry.base.js":5,"./utils.js":12}],7:[function(require,module,exports){
'use strict';
var Tayberry = require('./tayberry.base.js').Tayberry;

Tayberry.prototype.defaultOptions = function () {
    return {
        defaultPalette: ['#6FE87B', //green
        '#FFAB51', //orange
        '#51A8FF', //blue
        '#B651FF', //purple
        '#FF6051', //red
        '#636363' //dark grey
        ],
        title: {
            text: '',
            font: {
                size: 20
            }
        },
        font: {
            colour: '#444',
            size: 12,
            face: 'sans-serif'
        },
        xAxis: {
            title: '',
            type: 'category',
            min: 0,
            max: 100,
            step: 1,
            categories: [],
            labelPosition: 'middle' //left|middle|right
        },
        yAxis: {
            title: '',
            gridLines: {
                colour: '#ccc'
            },
            min: undefined,
            max: undefined,
            tickStep: 30,
            labelFormat: 'number', //[number|percentage|currency],
            labelFormatter: undefined,
            labelPrefix: undefined,
            labelSuffix: undefined,
            currencySymbol: '£'
        },
        series: [],
        barMode: 'normal', //[normal|stacked|overlaid]
        barPadding: 2,
        elementSmallPadding: 5,
        elementLargePadding: 10,
        categorySpacing: 0.3,
        presets: [],
        tooltips: {
            shared: false,
            headerTemplate: '<strong>{category}</strong><table>',
            valueTemplate: '<tr><td style="padding-right: 0.5em"><span style="color: {colour}">●</span> {name}</td><td style="text-align: right">{value}</td></tr>',
            footerTemplate: '</table>'
        },
        legend: {
            enabled: true,
            indicatorSize: 15
        },
        labels: {
            enabled: false,
            verticalAlignment: 'top',
            verticalPosition: 'outside'
        }
    };
};

Tayberry.presets = {
    histogram: {
        xAxis: {
            labelPosition: 'left'
        },
        barMode: 'overlaid',
        categorySpacing: 0,
        barPadding: 1
    }
};

},{"./tayberry.base.js":5}],8:[function(require,module,exports){
'use strict';
var Tayberry = require('./tayberry.base.js').Tayberry;

Tayberry.prototype.render = function () {
    this.calculatePlotArea();
    this.calculateYAxisExtent();
    this.updateYFormatter();
    this.finalisePlotArea();
    this.animator = requestAnimationFrame(this.onAnimate.bind(this));
    this.animatationStart = performance.now();
    this.animationLength = 500;
    this.drawXAxis();
    this.drawYAxis();
    this.createTooltip();
};

Tayberry.prototype.clear = function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

Tayberry.prototype.drawTitle = function () {
    if (this.options.title.text) {
        var x = this.canvas.width / 2,
            y = 0;
        this.ctx.save();
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.font = this.titleFont;
        this.ctx.fillStyle = this.options.font.colour;
        this.ctx.fillText(this.options.title.text, x, y);
        this.ctx.restore();
    }
};

Tayberry.prototype.drawLabel = function (sign, text, rect) {
    var x = (rect.left + rect.right) / 2;
    var y = undefined;
    if (this.options.labels.verticalAlignment === 'top') y = rect.top;else if (this.options.labels.verticalAlignment === 'bottom') y = rect.bottom;else y = (rect.top + rect.bottom) / 2;
    if (this.plotArea.containsPoint(x, y)) {
        this.ctx.save();
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = Tayberry.mapVerticalPosition(sign, this.options.labels.verticalPosition);
        this.ctx.fillStyle = this.options.font.colour;
        this.ctx.fillText(text, x, y);
        this.ctx.restore();
    }
};

Tayberry.prototype.draw = function () {

    this.ctx.save();
    this.enumerateBars((function (bar) {
        this.ctx.fillStyle = bar.selected ? bar.renderedSeries.highlightColour : bar.renderedSeries.colour;
        this.ctx.fillRect(bar.rect.left, bar.rect.top, bar.rect.width, bar.rect.height);
    }).bind(this));
    this.ctx.restore();

    if (this.options.labels.enabled) {
        this.ctx.save();
        this.enumerateBars((function (bar) {
            this.drawLabel(bar.value, this.options.yAxis.labelFormatter(bar.value), bar.rect);
        }).bind(this));
        this.ctx.restore();
    }
};

Tayberry.prototype.drawLine = function (x1, y1, x2, y2, colour) {
    this.ctx.save();
    if (colour) {
        this.ctx.strokeStyle = colour;
    }
    this.ctx.beginPath();
    this.ctx.moveTo(x1 + 0.5, y1 + 0.5);
    this.ctx.lineTo(x2 + 0.5, y2 + 0.5);
    this.ctx.stroke();
    this.ctx.restore();
};

Tayberry.prototype.redraw = function () {
    this.clear();
    this.drawTitle();
    this.drawXAxis();
    this.drawYAxis();
    this.drawLegend();
    this.draw();
};

Tayberry.prototype.drawLegend = function () {
    if (this.options.legend.enabled) {
        var totalWidth = 0;
        var indicatorSize = this.mapLogicalXUnit(this.options.legend.indicatorSize);
        for (var index = 0; index < this.series.length; index++) {
            var series = this.series[index];
            if (series.name) {
                totalWidth += this.getTextWidth(series.name) + indicatorSize + this.mapLogicalXUnit(this.options.elementSmallPadding + this.options.elementLargePadding);
            }
        }
        var x = this.plotArea.left + this.plotArea.width / 2 - totalWidth / 2,
            y = this.canvas.height - indicatorSize;

        for (var index = 0; index < this.renderedSeries.length; index++) {
            var series = this.renderedSeries[index];
            if (series.name) {
                this.ctx.fillStyle = series.colour;
                this.ctx.fillRect(x, y, indicatorSize, indicatorSize);
                this.ctx.textBaseline = 'middle';
                this.ctx.fillStyle = this.options.font.colour;
                x += indicatorSize + this.mapLogicalXUnit(this.options.elementSmallPadding);
                this.ctx.fillText(series.name, x, y + indicatorSize / 2);
                x += this.getTextWidth(series.name) + this.mapLogicalXUnit(this.options.elementLargePadding);
            }
        }
    }
};

},{"./tayberry.base.js":5}],9:[function(require,module,exports){
'use strict';
var Rect = require('./rect').Rect;
var Easing = require('./easing.js');
var Utils = require('./utils.js');

var Tayberry = require('./tayberry.base.js').Tayberry;

Tayberry.prototype.onAnimate = function (timestamp) {
    var elapsed, scaleFactor;
    elapsed = timestamp - this.animatationStart;
    scaleFactor = Math.min(Easing.inQuad(elapsed, this.animationLength), 1);
    for (var categoryIndex = 0; categoryIndex < this.series[0].data.length; categoryIndex++) {
        for (var seriesIndex = 0; seriesIndex < this.series.length; seriesIndex++) {
            var value = this.series[seriesIndex].data[categoryIndex];
            var yOrigin = this.yMin <= 0 && 0 <= this.yMax ? 0 : this.yMin > 0 ? this.yMin : this.yMax;
            this.renderedSeries[seriesIndex].data[categoryIndex] = yOrigin + scaleFactor * (value - yOrigin);
        }
    }
    this.redraw();
    if (scaleFactor < 1) {
        this.animator = requestAnimationFrame(this.onAnimate.bind(this));
    }
};

Tayberry.prototype.onMouseLeave = function (event) {
    if (event.currentTarget == this.canvas && event.relatedTarget !== this.tooltipElement || event.currentTarget == this.tooltipElement && event.relatedTarget !== this.canvas) {
        this.selectedItem = {};
        this.tooltipElement.style.display = 'none';
        this.redraw();
    }
};

Tayberry.prototype.handleMouseMove = function (clientX, clientY) {
    var boundingRect = new Rect(this.canvas.getBoundingClientRect());
    var ret = false;
    if (boundingRect.containsPoint(clientX, clientY)) {
        var x = clientX - boundingRect.left;
        var y = clientY - boundingRect.top;

        var hitTestResult = this.hitTest(this.mapLogicalXUnit(x), this.mapLogicalYUnit(y));
        if (hitTestResult.found) {
            var aboveZero = hitTestResult.rect.top < hitTestResult.rect.bottom;
            var category = this.categories[hitTestResult.categoryIndex];
            this.tooltipElement.style.display = 'block';
            var tooltipHtml = Utils.formatString(this.options.tooltips.headerTemplate, { category: category }, true);
            if (this.options.tooltips.shared) {
                for (var index = 0; index < this.series.length; index++) {
                    var series = this.series[index];
                    var value = series.data[hitTestResult.categoryIndex];
                    tooltipHtml += Utils.formatString(this.options.tooltips.valueTemplate, { value: this.options.yAxis.labelFormatter(value), name: series.name, colour: series.colour }, true);
                }
            } else {
                var series = this.series[hitTestResult.seriesIndex];
                var value = series.data[hitTestResult.categoryIndex];
                tooltipHtml += Utils.formatString(this.options.tooltips.valueTemplate, { value: this.options.yAxis.labelFormatter(value), name: series.name, colour: series.colour }, true);
            }
            tooltipHtml += this.options.tooltips.footerTemplate;
            this.tooltipElement.innerHTML = tooltipHtml;
            var tooltipRect = this.tooltipElement.getBoundingClientRect();
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
    for (var index = 0; index < event.targetTouches.length; index++) {
        var touch = event.targetTouches[index];
        if (this.handleMouseMove(touch.clientX, touch.clientY)) {
            event.preventDefault();
            this.redraw();
            break;
        }
    }
};

Tayberry.prototype.onMouseMove = function (event) {
    var oldSelectedItem = Utils.assign({}, this.selectedItem);
    if (!this.handleMouseMove(event.clientX, event.clientY)) {
        this.selectedItem = {};
    }

    if (oldSelectedItem.categoryIndex !== this.selectedItem.categoryIndex || oldSelectedItem.seriesIndex !== this.selectedItem.seriesIndex) {
        this.redraw();
    }
};

Tayberry.prototype.onWindowResize = function (event) {
    this.tooltipElement.style.display = 'none';
    this.initialise();
    this.updateFonts();
    this.calculatePlotArea();
    this.calculateYAxisExtent();
    this.finalisePlotArea();
    this.redraw();
};

},{"./easing.js":2,"./rect":3,"./tayberry.base.js":5,"./utils.js":12}],10:[function(require,module,exports){
'use strict';

(function () {
    'use strict';
    var Tayberry = require('./tayberry.base.js').Tayberry;
    require('./tayberry.axes.js');
    require('./tayberry.core.js');
    require('./tayberry.drawing.js');
    require('./tayberry.events.js');
    require('./tayberry.defaults.js');
    require('./tayberry.sizing.js');

    module.exports = {
        /**
         * Creates a Tayberry chart
         *
         * @param element   ID of container div, or HTMLElement
         * @param options   Options object
         */
        create: function create(element, options) {
            var chart = new Tayberry();
            chart.create(element);
            chart.setOptions(options);
            chart.render();
        }
    };
})();

},{"./tayberry.axes.js":4,"./tayberry.base.js":5,"./tayberry.core.js":6,"./tayberry.defaults.js":7,"./tayberry.drawing.js":8,"./tayberry.events.js":9,"./tayberry.sizing.js":11}],11:[function(require,module,exports){
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

Tayberry.prototype.getTextWidth = function (text) {
    return this.ctx.measureText(text).width;
};

Tayberry.prototype.calculatePlotArea = function () {
    this.plotArea = new Rect(0, 0, this.canvas.width, this.canvas.height);
    if (this.options.title.text) {
        this.plotArea.top += this.mapLogicalYUnit(this.options.elementSmallPadding + this.options.title.font.size);
    }
    if (this.options.yAxis.title) {
        this.plotArea.left += this.mapLogicalXUnit(this.options.elementLargePadding + this.options.font.size);
    }
    if (this.options.xAxis.title) {
        this.plotArea.bottom -= this.mapLogicalYUnit(this.options.elementLargePadding + this.options.font.size);
    }
    this.plotArea.bottom -= this.mapLogicalYUnit(this.options.font.size);
    if (this.options.legend.enabled) this.plotArea.bottom -= this.mapLogicalYUnit(this.options.elementSmallPadding + this.options.elementLargePadding + this.options.legend.indicatorSize);
};

Tayberry.prototype.finalisePlotArea = function () {
    this.plotArea.left += Math.max(this.getTextWidth(this.options.yAxis.labelFormatter(this.yTickStart)), this.getTextWidth(this.options.yAxis.labelFormatter(this.yTickEnd))) + this.mapLogicalXUnit(this.options.elementSmallPadding);
    this.plotArea.left = Math.floor(this.plotArea.left);
    this.plotArea.top = Math.floor(this.plotArea.top);
    this.plotArea.right = Math.ceil(this.plotArea.right);
    this.plotArea.bottom = Math.ceil(this.plotArea.bottom);
};

Tayberry.prototype.getYHeight = function (value) {
    return Math.round(value * this.plotArea.height / (this.yMax - this.yMin));
};

Tayberry.prototype.hitTest = function (x, y) {
    // TODO: Optimise
    var ret = {
        found: false,
        categoryIndex: undefined,
        seriesIndex: undefined,
        rect: undefined
    };

    var matches = [];

    var isOverlaid = this.options.barMode === 'overlaid';

    this.enumerateBars((function (bar) {
        if (bar.rect.containsPoint(x, y)) {
            matches.push({
                categoryIndex: bar.categoryIndex,
                seriesIndex: bar.seriesIndex,
                rect: bar.rect
            });
            if (!isOverlaid) return true;
        }
    }).bind(this));

    if (matches.length) {
        ret.found = true;
        var minMatchIndex = 0,
            minHeight = matches[0].rect.height;
        for (var index = 1; index < matches.length; index++) {
            var match = matches[index];
            if (match.rect.height < minHeight) {
                minMatchIndex = index;
                minHeight = match.rect.height;
            }
        }
        ret = Utils.assign(ret, matches[minMatchIndex]);
    }
    return ret;
};

Tayberry.prototype.getYOrigin = function () {
    return this.plotArea.bottom - this.getYHeight(0 - this.yMin);
};

Tayberry.prototype.enumerateBars = function (callback) {
    var categoryCount = this.renderedSeries[0].data.length;
    if (categoryCount) {
        var isStacked = this.options.barMode === 'stacked';
        var isOverlaid = this.options.barMode === 'overlaid';
        var isNormal = !isStacked && !isOverlaid;
        var barCount = isStacked || isOverlaid ? 1 : this.series.length;
        var categoryWidth = Math.floor(this.plotArea.width / categoryCount);
        var barWidth = Math.floor(categoryWidth * (1 - this.options.categorySpacing) / barCount);
        var yOrigin = this.getYOrigin();

        for (var categoryIndex = 0; categoryIndex < categoryCount; categoryIndex++) {
            var x = this.plotArea.left + Math.floor(categoryIndex * categoryWidth + categoryWidth * this.options.categorySpacing / 2);
            var cx = barWidth;
            var yBottomPositive = yOrigin,
                yBottomNegative = yOrigin,
                yRunningTotalPositive = 0,
                yRunningTotalNegative = 0;
            for (var seriesIndex = 0; seriesIndex < this.renderedSeries.length; seriesIndex++) {
                var value = this.renderedSeries[seriesIndex].data[categoryIndex];
                if (Utils.isMissingValue(value)) continue;
                var yTop = yOrigin - this.getYHeight(value + (value > 0 ? yRunningTotalPositive : yRunningTotalNegative));
                var rect = new Rect(x, yTop, x + cx, value > 0 ? yBottomPositive : yBottomNegative);
                rect.left += Math.ceil(this.options.barPadding * this.scaleFactor / 2);
                rect.right -= Math.floor(this.options.barPadding * this.scaleFactor / 2);
                if (rect.right < rect.left) rect.right = rect.left;
                rect.clip(this.plotArea);

                var stopEnumerating = callback({
                    seriesIndex: seriesIndex,
                    categoryIndex: categoryIndex,
                    series: this.renderedSeries[seriesIndex],
                    renderedSeries: this.renderedSeries[seriesIndex],
                    value: this.series[seriesIndex].data[categoryIndex],
                    renderedValue: this.renderedSeries[seriesIndex].data[categoryIndex],
                    rect: rect,
                    selected: this.selectedItem.categoryIndex === categoryIndex && this.selectedItem.seriesIndex === seriesIndex
                });
                if (stopEnumerating) break;
                if (isStacked) {
                    if (value > 0) {
                        yRunningTotalPositive += value;
                        yBottomPositive = yTop;
                    } else {
                        yRunningTotalNegative += value;
                        yBottomNegative = yTop;
                    }
                } else if (isNormal) {
                    x += barWidth;
                }
            }
        }
    }
};

},{"./rect":3,"./tayberry.base.js":5,"./utils":12}],12:[function(require,module,exports){
'use strict';

(function () {
    "use strict";

    exports.identity = function (obj) {
        return obj;
    };

    exports.isMissingValue = function (n) {
        return n === null || typeof n === 'undefined' || isNaN(n) && typeof n === 'number';
    };

    exports.reduce = function (array, func, getter) {
        var ignoreMissing = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

        var ret, i;
        if (array.reduce && !getter && !ignoreMissing) {
            ret = array.reduce(function (a, b) {
                return func(a, b);
            });
        } else {
            getter = getter || exports.identity;
            if (array.length) {
                ret = getter(array[0]);
                for (i = 1; i < array.length; i++) {
                    var value = getter(array[i]);
                    if (!ignoreMissing || !exports.isMissingValue(value)) ret = func(ret, value);
                }
            }
        }
        return ret;
    };

    exports.sign = Math.sign || function (n) {
        return n > 0 ? 1 : n < 0 ? -1 : 0;
    };

    exports.now = typeof performance !== 'undefined' && typeof performance.now !== 'undefined' ? performance.now : function () {
        return new Date().getTime();
    };

    var innerAssign = function innerAssign(deepAssign, targetObject, sourceObjects) {
        if (!Array.isArray(sourceObjects)) sourceObjects = [sourceObjects];
        if (!deepAssign && Object.assign) {
            return Object.assign.apply(Object, [targetObject].concat(sourceObjects));
        } else {
            if (targetObject === undefined || targetObject === null) {
                throw new TypeError('Cannot convert first argument to object');
            }

            var to = Object(targetObject);
            for (var i = 0; i < sourceObjects.length; i++) {
                var currentSourceObject = sourceObjects[i];
                if (currentSourceObject === undefined || currentSourceObject === null) {
                    continue;
                }
                currentSourceObject = Object(currentSourceObject);

                var keysArray = Object.keys(currentSourceObject);
                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                    var nextKey = keysArray[nextIndex];
                    var nextValue = currentSourceObject[nextKey];
                    var desc = Object.getOwnPropertyDescriptor(currentSourceObject, nextKey);
                    if (desc !== undefined && desc.enumerable) {
                        if (deepAssign && typeof to[nextKey] === "object" && !Array.isArray(nextValue) && typeof nextValue === 'object') innerAssign(true, to[nextKey], nextValue);else to[nextKey] = nextValue;
                    }
                }
            }
            return to;
        }
    };

    exports.assign = function (targetObject, sourceObjects) {
        return innerAssign(false, targetObject, sourceObjects);
    };

    exports.deepAssign = function (targetObject, sourceObjects) {
        return innerAssign(true, targetObject, sourceObjects);
    };

    exports.formatString = function (formatString, formatValues, escapeAsHtml) {
        return formatString.replace(/{(\w+)}/g, function (match, placeholder) {
            var value = formatValues[placeholder];
            return typeof value !== 'undefined' ? escapeAsHtml ? exports.stringToHtml(value) : value : match;
        });
    };

    exports.locateDecimalPoint = function (number) {
        return Math.floor(Math.log(number) / Math.log(10));
    };

    exports.formatNumberThousands = function (number) {
        var decimalPlaces = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

        var parts = number.toFixed(decimalPlaces).split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    };

    exports.createAutoNumberFormatter = function (scale) {
        var prefix = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
        var suffix = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];
        var precision = arguments.length <= 3 || arguments[3] === undefined ? 2 : arguments[3];

        var decimalPlaces = exports.locateDecimalPoint(scale);
        decimalPlaces = decimalPlaces < 0 ? -decimalPlaces + precision - 1 : 0;
        return function (x) {
            return prefix + exports.formatNumberThousands(x, decimalPlaces) + suffix;
        };
    };

    exports.createFixedNumberFormatter = function (scale) {
        var prefix = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
        var suffix = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];
        var decimalPlaces = arguments.length <= 3 || arguments[3] === undefined ? 2 : arguments[3];

        return function (x) {
            return prefix + exports.formatNumberThousands(x, decimalPlaces) + suffix;
        };
    };

    exports.createPercentageFormatter = function (scale) {
        var prefix = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
        var suffix = arguments.length <= 2 || arguments[2] === undefined ? '%' : arguments[2];
        var precision = arguments.length <= 3 || arguments[3] === undefined ? 2 : arguments[3];

        var decimalPlaces = exports.locateDecimalPoint(scale * 100);
        decimalPlaces = decimalPlaces < 0 ? -decimalPlaces + precision - 1 : 0;
        return function (x) {
            return prefix + exports.formatNumberThousands(x * 100, decimalPlaces) + suffix;
        };
    };

    exports.stringToHtml = function (str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    };

    exports.throttle = function (fn, threshold) {
        var last, deferTimer;
        return function () {
            var context = this;

            var now = Date.now(),
                args = arguments;
            if (last && now < last + threshold) {
                clearTimeout(deferTimer);
                deferTimer = setTimeout(function () {
                    last = now;
                    fn.apply(context, args);
                }, threshold);
            } else {
                last = now;
                fn.apply(context, args);
            }
        };
    };
})();

},{}]},{},[10])(10)
});


//# sourceMappingURL=tayberry.js.map
