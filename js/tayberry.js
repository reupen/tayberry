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
            var regExInt = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(\s*,\s*([0-9]*\.?[0-9]+)\s*)?\)$/i;
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
                throw new RangeError(str + " is not a valid HTML colour");
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
    }, {
        key: 'sum',
        get: function get() {
            return this.r + this.g + this.b;
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
            return y >= this.top && y < this.bottom || y >= this.bottom && y < this.top;
        }
    }, {
        key: "containsX",
        value: function containsX(x) {
            return x >= this.left && x < this.right || x >= this.right && x < this.left;
        }
    }, {
        key: "clip",
        value: function clip(clipRect) {
            //FIXME: In theory, we should be more careful about how we handle rects where right < left or bottom < top
            if (this.left < clipRect.minX) this.left = clipRect.minX;else if (this.left > clipRect.maxX) this.left = clipRect.maxX;

            if (this.right < clipRect.minX) this.right = clipRect.minX;else if (this.right > clipRect.maxX) this.right = clipRect.maxX;

            if (this.top < clipRect.minY) this.top = clipRect.minY;else if (this.top > clipRect.maxY) this.top = clipRect.maxY;

            if (this.bottom > clipRect.maxY) this.bottom = clipRect.maxY;else if (this.bottom < clipRect.minY) this.bottom = clipRect.minY;

            return this;
        }
    }, {
        key: "clone",
        value: function clone() {
            return new Rect(this);
        }
    }, {
        key: "swapXY",
        value: function swapXY() {
            var _ref = [this.top, this.left];
            this.left = _ref[0];
            this.top = _ref[1];
            var _ref2 = [this.right, this.bottom];
            this.bottom = _ref2[0];
            this.right = _ref2[1];

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

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Utils = require('./utils.js');

var Axis = (function () {
    _createClass(Axis, null, [{
        key: 'create',
        value: function create(tayberry, options, index, axisType, xYSwapped) {
            if (xYSwapped) {
                axisType = axisType === 'y' ? 'x' : 'y';
            }
            if (options.type === 'linear') return new LinearAxis(tayberry, index, options, axisType);else return new CategorialAxis(tayberry, index, options, axisType);
        }
    }]);

    function Axis(tayberry, index, options, axisType) {
        _classCallCheck(this, Axis);

        this.tayberry = tayberry;
        this.options = options;
        this.axisType = axisType;
        this.index = index;
        this.tickStep = null;
        this.min = null;
        this.max = null;
        this.tickStart = null;
        this.tickEnd = null;
        this.calculatedSize = 0;
        this.topAdjustment = 0;
        this.rightAdjustment = 0;
        this.titleFont = null;
        this.labelFont = null;
        this.numLabelLines = 1;

        this.setPlacement();
    }

    _createClass(Axis, [{
        key: 'updateFonts',
        value: function updateFonts() {
            this.labelFont = this.tayberry.createFontString(this.options.font);
            this.titleFont = this.tayberry.createFontString(this.options.title.font);
        }
    }, {
        key: 'setPlacement',
        value: function setPlacement() {
            var validAndSpecificPlacements = ['left', 'right', 'top', 'bottom', 'start', 'end'];
            if (validAndSpecificPlacements.indexOf(this.options.placement) === -1) {
                this.options.placement = this.isYAxis ^ this.index > 0 ? 'start' : 'end';
            }
        }
    }, {
        key: 'maxLabelSize',
        value: function maxLabelSize() {
            var _this = this;

            var tb = this.tayberry;
            var ticks = this.getTicks();
            return Utils.reduce(ticks, Math.max, function (x) {
                return tb.getTextWidth(_this.options.labelFormatter(x.value), _this.labelFont);
            });
        }
    }, {
        key: 'mapLogicalXOrYUnit',
        value: function mapLogicalXOrYUnit(x) {
            return this.isYAxis ? this.tayberry.mapLogicalXUnit(x) : this.tayberry.mapLogicalYUnit(x);
        }
    }, {
        key: 'mapLogicalYOrXUnit',
        value: function mapLogicalYOrXUnit(x) {
            return !this.isYAxis ? this.tayberry.mapLogicalXUnit(x) : this.tayberry.mapLogicalYUnit(x);
        }
    }, {
        key: 'adjustSize',
        value: function adjustSize(plotArea, fixedOnly, reset) {
            var size = 0,
                tb = this.tayberry,
                ret = undefined;

            var titleFontHeight = tb.getFontHeight(this.options.title.font);
            var fontHeight = tb.getFontHeight(this.options.font);

            if (reset) {
                this.calculatedSize = 0;
                this.topAdjustment = 0;
                this.rightAdjustment = 0;
                this.numLabelLines = 1;
            }

            size += this.mapLogicalXOrYUnit(tb.options.elementSmallPadding);
            if (this.options.title.text) {
                size += this.mapLogicalXOrYUnit(tb.options.elementSmallPadding) + titleFontHeight;
            }

            if (!fixedOnly) {
                var ticks = this.getTicks(false);
                if (this.isYAxis) {
                    if (ticks.length) {
                        var lastTick = ticks[ticks.length - 1];
                        var lastTickYStart = lastTick.y - fontHeight / 2;
                        if (lastTickYStart < plotArea.top - this.topAdjustment) {
                            var adjustment = plotArea.top - lastTickYStart - this.topAdjustment + 1;
                            plotArea.top += adjustment;
                            this.topAdjustment += adjustment;
                        }
                    }
                    size += this.maxLabelSize();
                } else {
                    {
                        var lastXEnd = undefined;
                        for (var i = 0; i < ticks.length; i++) {
                            var tick = ticks[i];
                            var textWidth = tb.getTextWidth(this.options.labelFormatter(tick.value), this.labelFont);
                            var xStart = tick.x - textWidth / 2;
                            var xEnd = tick.x + textWidth / 2;
                            if (typeof lastXEnd !== 'undefined' && xStart <= lastXEnd + 1) {
                                this.numLabelLines = 2;
                                break;
                            }
                            lastXEnd = xEnd;
                        }
                    }
                    if (ticks.length) {
                        var lastTick = ticks[ticks.length - 1];
                        var textWidth = tb.getTextWidth(this.options.labelFormatter(lastTick.value), this.labelFont);
                        var lastTickXEnd = lastTick.x + textWidth / 2;
                        if (lastTickXEnd >= plotArea.right + this.rightAdjustment) {
                            var adjustment = lastTickXEnd - plotArea.right - this.rightAdjustment + 1;
                            plotArea.right -= adjustment;
                            this.rightAdjustment += adjustment;
                        }
                    }
                    size += fontHeight * this.numLabelLines;
                }
            }

            if (this.isPlacedAtStart) {
                if (this.isYAxis) {
                    plotArea.left += size - this.calculatedSize;
                } else {
                    plotArea.top += size - this.calculatedSize;
                }
            } else {
                size *= -1;
                if (this.isYAxis) {
                    plotArea.right += size - this.calculatedSize;
                } else {
                    plotArea.bottom += size - this.calculatedSize;
                }
            }

            ret = this.calculatedSize !== size;
            this.calculatedSize = size;

            return ret;
        }
    }, {
        key: 'calculateExtent',
        value: function calculateExtent() {}
    }, {
        key: 'getCategoryLabel',
        value: function getCategoryLabel() {}
    }, {
        key: 'draw',
        value: function draw() {
            this.drawTicksAndLabels();
            this.drawTitle();
        }
    }, {
        key: 'drawTicksAndLabels',
        value: function drawTicksAndLabels() {
            var tb = this.tayberry;
            var labelPaddingX = this.isYAxis ? this.mapLogicalXOrYUnit(tb.options.elementSmallPadding) * (this.isPlacedAtStart ? -1 : 1) : 0;
            var labelPaddingY = !this.isYAxis ? this.mapLogicalXOrYUnit(tb.options.elementSmallPadding) * (this.isPlacedAtStart ? -1 : 1) : 0;
            var fontHeight = tb.getFontHeight(this.options.font);

            tb.labelsCtx.save();
            tb.labelsCtx.font = this.labelFont;
            tb.labelsCtx.fillStyle = this.options.font.colour;
            tb.labelsCtx.textAlign = this.isYAxis ? this.isPlacedAtStart ? 'right' : 'left' : 'center';
            tb.labelsCtx.textBaseline = this.isYAxis ? 'middle' : this.isPlacedAtStart ? 'bottom' : 'top';

            var lastXEnds = [],
                tickIndex = 0;

            this.enumerateTicks((function (tick) {
                var textWidth = undefined,
                    xStart = undefined,
                    xEnd = undefined;
                var formattedValue = this.options.labelFormatter(tick.value);
                var row = tickIndex % this.numLabelLines;
                var rowOffset = this.isYAxis ? 0 : fontHeight * row;
                if (!this.isYAxis) {
                    textWidth = tb.getTextWidth(formattedValue, this.labelFont);
                    xStart = tick.x - textWidth / 2;
                    xEnd = tick.x + textWidth / 2;
                }

                if (this.isYAxis || (typeof lastXEnds[row] === 'undefined' || xStart > lastXEnds[row] + 1) && xStart >= 0 && xEnd < tb.labelsCanvas.width) {
                    tb.labelsCtx.fillText(formattedValue, tick.x + labelPaddingX, tick.y + labelPaddingY + rowOffset);
                    lastXEnds[row] = xEnd;
                }
                if (this.options.gridLines.colour) tb.drawLine(tick.x1, tick.y1, tick.x2, tick.y2, this.options.gridLines.colour);
                tickIndex++;
            }).bind(this));

            tb.labelsCtx.restore();
        }
    }, {
        key: 'drawTitle',
        value: function drawTitle() {
            if (this.options.title.text) {
                var tb = this.tayberry;
                tb.labelsCtx.save();
                tb.labelsCtx.font = this.titleFont;
                tb.labelsCtx.fillStyle = this.options.title.font.colour;
                tb.labelsCtx.textAlign = 'center';
                tb.labelsCtx.textBaseline = !this.isPlacedAtStart ? 'bottom' : 'top';

                if (this.isYAxis) {
                    var x = 0;
                    var y = tb.plotArea.top + tb.plotArea.height / 2;
                    tb.labelsCtx.translate(x, y);
                    tb.labelsCtx.rotate(-Math.PI / 2);
                    tb.labelsCtx.fillText(this.options.title.text, 0, 0);
                } else {
                    var x = tb.plotArea.left + tb.plotArea.width / 2;
                    var y = tb.plotArea[this.startProperty] - this.calculatedSize;
                    //tb.mapLogicalYOrXUnit(tb.options.font.size * 2 + tb.options.elementSmallPadding + tb.options.elementLargePadding)
                    tb.labelsCtx.fillText(this.options.title.text, x, y);
                }
                tb.labelsCtx.restore();
            }
        }
    }, {
        key: 'getTicks',
        value: function getTicks() {
            var visibleOnly = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

            var ret = [];
            this.enumerateTicks(function (tick) {
                ret.push(tick);
            }, visibleOnly);
            return ret;
        }
    }, {
        key: 'getOrigin',
        value: function getOrigin() {}
    }, {
        key: 'updateFormatter',
        value: function updateFormatter() {}
    }, {
        key: 'isPlacedAtStart',
        get: function get() {
            return this.options.placement === "left" || this.options.placement === "bottom" || this.options.placement === "start";
        }
    }, {
        key: 'isYAxis',
        get: function get() {
            return this.axisType === 'y';
        }
    }, {
        key: 'startProperty',
        get: function get() {
            if (this.isYAxis) return this.isPlacedAtStart ? 'left' : 'right';else return this.isPlacedAtStart ? 'top' : 'bottom';
        }
    }, {
        key: 'endProperty',
        get: function get() {
            if (this.isYAxis) return !this.isPlacedAtStart ? 'left' : 'right';else return !this.isPlacedAtStart ? 'top' : 'bottom';
        }
    }]);

    return Axis;
})();

var CategorialAxis = (function (_Axis) {
    _inherits(CategorialAxis, _Axis);

    function CategorialAxis() {
        _classCallCheck(this, CategorialAxis);

        _get(Object.getPrototypeOf(CategorialAxis.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(CategorialAxis, [{
        key: 'enumerateTicks',
        value: function enumerateTicks(callback) {
            var tb = this.tayberry;

            var categoryCount = this.options.categories.length;
            var plotArea = tb.plotArea.clone();
            if (this.isYAxis) plotArea.swapXY();
            var categoryWidth = plotArea.width / tb.series[0].data.length;
            var factor = 0.5;

            if (!this.isYAxis) {
                switch (this.options.labelPosition) {
                    case 'left':
                        factor = 0;
                        break;
                    case 'right':
                        factor = 1;
                        break;
                }
            }

            for (var i = 0; i < categoryCount; i++) {
                var value = this.options.categories[i];
                var y1 = this.isPlacedAtStart ? plotArea.top : plotArea.bottom;
                var y2 = !this.isPlacedAtStart ? plotArea.top : plotArea.bottom;
                var x1 = plotArea.left + Math.floor(i * categoryWidth);
                var x2 = x1;
                var x = plotArea.left + Math.floor(i * categoryWidth + categoryWidth * factor);
                var y = y1;
                if (this.isYAxis) {
                    ;

                    var _ref = [y1, x1, y2, x2, y, x];
                    x1 = _ref[0];
                    y1 = _ref[1];
                    x2 = _ref[2];
                    y2 = _ref[3];
                    x = _ref[4];
                    y = _ref[5];
                }callback({
                    value: value,
                    x1: x1,
                    y1: y1,
                    x2: x2,
                    y2: y2,
                    x: x,
                    y: y
                });
            }
        }
    }, {
        key: 'updateFormatter',
        value: function updateFormatter() {
            if (!this.options.labelFormatter) {
                this.options.labelFormatter = Utils.identity;
            }
        }
    }, {
        key: 'getCategoryLabel',
        value: function getCategoryLabel(index) {
            return this.options.labelFormatter(this.options.categories[index]);
        }
    }]);

    return CategorialAxis;
})(Axis);

var LinearAxis = (function (_Axis2) {
    _inherits(LinearAxis, _Axis2);

    function LinearAxis() {
        _classCallCheck(this, LinearAxis);

        _get(Object.getPrototypeOf(LinearAxis.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(LinearAxis, [{
        key: 'updateFormatter',
        value: function updateFormatter() {
            if (!this.options.labelFormatter) {
                if (this.options.labelFormat === 'percentage') {
                    this.options.labelFormatter = Utils.createPercentageFormatter(this.max - this.min, this.options.labelPrefix, this.options.labelSuffix);
                } else if (this.options.labelFormat === 'currency') {
                    this.options.labelFormatter = Utils.createFixedNumberFormatter(this.max - this.min, this.options.labelPrefix || this.options.currencySymbol, this.options.labelSuffix);
                } else {
                    this.options.labelFormatter = Utils.createAutoNumberFormatter(this.max - this.min, this.options.labelPrefix, this.options.labelSuffix);
                }
            }
        }
    }, {
        key: 'enumerateTicks',
        value: function enumerateTicks(callback) {
            var tb = this.tayberry;

            var start = this.startProperty,
                end = this.endProperty;

            for (var yValue = this.tickStart; yValue <= this.tickEnd && this.tickStep;) {
                var y = this.getValueDisplacement(yValue);
                if (this.isYAxis) {
                    if (callback({
                        value: yValue,
                        x1: tb.plotArea[start],
                        y1: y,
                        x2: tb.plotArea[end],
                        y2: y,
                        x: tb.plotArea[start],
                        y: y

                    })) break;
                } else {
                    if (callback({
                        value: yValue,
                        y1: tb.plotArea[start],
                        x1: y,
                        y2: tb.plotArea[end],
                        x2: y,
                        y: tb.plotArea[start],
                        x: y
                    })) break;
                }
                yValue = this.tickStart + Math.round((yValue + this.tickStep - this.tickStart) / this.tickStep) * this.tickStep;
            }
        }
    }, {
        key: 'calculateExtent',
        value: function calculateExtent() {
            var targetTicks = undefined,
                approxStep = undefined,
                scale = undefined;

            var targetStart = this.options.min;
            var targetEnd = this.options.max;
            var overriddenStart = !Utils.isMissingValue(targetStart);
            var overriddenEnd = !Utils.isMissingValue(targetEnd);

            if (!overriddenStart || !overriddenEnd) {
                var _tayberry$getDataMinMax = this.tayberry.getDataMinMax();

                var _tayberry$getDataMinMax2 = _slicedToArray(_tayberry$getDataMinMax, 2);

                var dataMin = _tayberry$getDataMinMax2[0];
                var dataMax = _tayberry$getDataMinMax2[1];
                //TODO: implement for x-axis
                var dataRange = dataMax - dataMin;
                if (!overriddenStart) {
                    targetStart = dataMin - dataRange * 0.1;
                    if (dataMin >= 0 && targetStart < 0) targetStart = 0;
                }
                if (!overriddenEnd) {
                    targetEnd = dataMax + dataRange * 0.1;
                    if (dataMax <= 0 && targetStart > 0) targetEnd = 0;
                }
            }

            if (this.options.tickStepValue) {
                this.tickStep = this.options.tickStepValue;
                this.min = targetStart;
                this.max = targetEnd;
            } else {
                var targetRange = targetEnd - targetStart;
                targetTicks = this.plotLength / this.mapLogicalYOrXUnit(this.options.tickStep);
                approxStep = targetRange / targetTicks;
                scale = Math.pow(10, Math.floor(Math.log(approxStep) / Math.log(10)));
                var scaledStep = LinearAxis.snapScaledValue(Math.ceil(approxStep / scale));
                this.tickStep = scaledStep * scale;
                this.min = targetStart;
                this.max = targetEnd;
            }
            this.tickStart = this.options.tickStepValue && overriddenStart ? this.min : Math.floor(this.min / this.tickStep) * this.tickStep;
            this.tickEnd = this.options.tickStepValue && overriddenEnd ? this.max : Math.ceil(this.max / this.tickStep) * this.tickStep;
            if (!overriddenStart) this.min = this.tickStart;
            if (!overriddenEnd) this.max = this.tickEnd;
        }
    }, {
        key: 'getOrigin',
        value: function getOrigin() {
            var ret = this.tayberry.plotArea[this.isYAxis ? 'bottom' : 'left'] - (0 - this.min) * this.plotDisplacement / (this.max - this.min);
            if (this.isYAxis) ret--;
            ret = this.isYAxis ? Math.floor(ret) : Math.ceil(ret);
            return ret;
        }
    }, {
        key: 'getValueDisplacement',
        value: function getValueDisplacement(value) {
            var ret = this.getOrigin() - value * this.plotDisplacement / (this.max - this.min);
            ret = this.isYAxis ? Math.floor(ret) : Math.ceil(ret);
            return ret;
        }
    }, {
        key: 'getCategoryLabel',
        value: function getCategoryLabel(index, totalCategories) {
            var start = index / totalCategories;
            var end = (index + 1) / totalCategories;
            var axisRange = this.max - this.min;
            return Utils.formatString('{0} ≤ x < {1}', [this.options.labelFormatter(this.min + start * axisRange), this.options.labelFormatter(this.min + end * axisRange)]);
        }
    }, {
        key: 'plotDisplacement',
        get: function get() {
            return this.isYAxis ? this.tayberry.plotArea.height - 1 : -(this.tayberry.plotArea.width - 1);
        }
    }, {
        key: 'plotLength',
        get: function get() {
            return Math.abs(this.plotDisplacement);
        }
    }], [{
        key: 'snapScaledValue',
        value: function snapScaledValue(scaledStep) {
            if (scaledStep < 1) scaledStep = 1;else if (scaledStep < 2) scaledStep = 2;else if (scaledStep < 2.5) scaledStep = 2.5;else if (scaledStep < 5) scaledStep = 5;else scaledStep = 10;
            return scaledStep;
        }
    }]);

    return LinearAxis;
})(Axis);

exports.Axis = Axis;

},{"./utils.js":12}],5:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Tayberry = (function () {
    function Tayberry() {
        _classCallCheck(this, Tayberry);

        this.selectedItem = {};
        this.containerElement = null;
        this.labelsCanvas = null;
        this.labelsCtx = null;
        this.renderedSeries = null;
        this.options = null;
        this.scaleFactor = null;
        this.titleFont = null;
        this.plotArea = null;
        this.series = [];
        this.categories = [];
        this.titleFont = null;
        this.labelFont = null;
        this.legendFont = null;
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
var Utils = require('./utils');

var Tayberry = require('./tayberry.base').Tayberry;
var Axis = require('./tayberry.axes').Axis;

var currentAutoColourIndex = 0;

Tayberry.getAutoColour = function () {
    var ret = Tayberry.defaultColours[currentAutoColourIndex % Tayberry.defaultColours.length];
    currentAutoColourIndex++;
    return ret;
};

Tayberry.prototype.createCanvas = function () {
    var ret = document.createElement('canvas');
    // IE11 hack-fix - clientWidth sometimes incorrect on first access
    ret.style.width = Math.floor(this.containerElement.clientWidth) + 'px';
    ret.style.width = Math.floor(this.containerElement.clientWidth) + 'px';
    ret.style.height = Math.floor(this.containerElement.clientHeight) + 'px';
    ret.style.position = 'absolute';
    this.containerElement.appendChild(ret);
    return ret;
};

Tayberry.prototype.create = function (containerElement) {
    if (typeof containerElement == 'string') {
        this.containerElement = document.getElementById(containerElement);
    } else {
        this.containerElement = containerElement;
    }
    this.labelsCanvas = this.createCanvas();
    this.labelsCtx = this.labelsCanvas.getContext('2d');
    this.plotCanvas = this.createCanvas();
    this.plotCtx = this.plotCanvas.getContext('2d');
    this.renderedSeries = null;
    this.options = {};
    this.yAxis = null;
    this.xAxis = null;
    this.initialise();
};

Tayberry.prototype.destroy = function () {
    this.labelsCanvas.parentNode.removeChild(this.labelsCanvas);
    this.tooltipElement.parentNode.removeChild(this.tooltipElement);
    this.options = {};
    this.series = {};
    this.plotCanvas.removeEventListener('mousemove', this.onMouseMoveReal);
    this.plotCanvas.removeEventListener('mouseleave', this.onMouseLeaveReal);
    // this.plotCanvas.removeEventListener('touchstart', this.onTouchStartReal);
    window.removeEventListener('resize', this.onWindowResizeReal);
};

Tayberry.prototype.initialise = function () {
    this.scaleFactor = window.devicePixelRatio || 1.0;
    this.labelsCanvas.width = Math.round(this.labelsCanvas.clientWidth * this.scaleFactor);
    this.labelsCanvas.height = Math.round(this.labelsCanvas.clientHeight * this.scaleFactor);
    this.plotCanvas.width = this.labelsCanvas.width;
    this.plotCanvas.height = this.labelsCanvas.height;
    this.scaleFactorX = this.labelsCanvas.width / this.labelsCanvas.clientWidth;
    this.scaleFactorY = this.labelsCanvas.height / this.labelsCanvas.clientHeight;
    this.selectedItem = {};
    this.plotArea = null;
};

Tayberry.prototype.getFontHeight = function (font, forDom) {
    var ret = font.size;
    if (font.autoScale) ret *= Math.pow(this.labelsCanvas.width / 800, 0.25);
    if (!forDom) ret = this.mapLogicalYUnit(ret);
    return ret;
};

Tayberry.prototype.createFontString = function (font, forDom) {
    return (font.style ? font.style + ' ' : '') + this.getFontHeight(font, forDom).toFixed(1) + 'px ' + font.face;
};

Tayberry.prototype.updateFonts = function () {
    //this.labelsCtx.font = this.createFontString(this.options.font);
    this.titleFont = this.createFontString(this.options.title.font);
    this.labelFont = this.createFontString(this.options.labels.font);
    this.legendFont = this.createFontString(this.options.legend.font);
    this.yAxis.updateFonts();
    this.xAxis.updateFonts();
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
    this.options.title.font = Utils.deepAssign({}, [this.options.font, this.options.title.font]);
    this.options.tooltips.font = Utils.deepAssign({}, [this.options.font, this.options.tooltips.font]);
    this.options.labels.font = Utils.deepAssign({}, [this.options.font, this.options.labels.font]);
    this.options.legend.font = Utils.deepAssign({}, [this.options.font, this.options.legend.font]);
    this.options.yAxis.title.font = Utils.deepAssign({}, [this.options.font, this.options.allAxes.title.font, this.options.yAxis.title.font]);
    this.options.xAxis.title.font = Utils.deepAssign({}, [this.options.font, this.options.allAxes.title.font, this.options.xAxis.title.font]);
    this.options.xAxis.font = Utils.deepAssign({}, [this.options.font, this.options.allAxes.font, this.options.xAxis.font]);
    this.options.yAxis.font = Utils.deepAssign({}, [this.options.font, this.options.allAxes.font, this.options.yAxis.font]);
    this.setSeries(options.series);
    //this.setCategories(options.xAxis.categories);

    this.yAxis = Axis.create(this, this.options.yAxis, 0, 'y', this.options.swapAxes);
    this.xAxis = Axis.create(this, this.options.xAxis, 0, 'x', this.options.swapAxes);
    this.updateFonts();
    this.plotCanvas.addEventListener('mousemove', this.onMouseMoveReal = this.onMouseMove.bind(this));
    this.plotCanvas.addEventListener('mouseleave', this.onMouseLeaveReal = this.onMouseLeave.bind(this));
    //this.plotCanvas.addEventListener('touchstart', this.onTouchStartReal = this.onTouchStart.bind(this));
    window.addEventListener('resize', this.onWindowResizeReal = Utils.throttle(this.onWindowResize, 50).bind(this));
};

Tayberry.calculateHighlightColour = function (colour) {
    var newColour = new Colour(colour);
    return newColour.increaseBy(30 * (newColour.sum >= 180 * 3 ? -1 : 1)).toString();
};

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
        actualSeries.colour = actualSeries.colour || Tayberry.getAutoColour();
        actualSeries.highlightColour = actualSeries.highlightColour || Tayberry.calculateHighlightColour(actualSeries.colour);
        var elem = Utils.assign({}, actualSeries);
        elem.data = this.renderedSeries[i].data.slice(0);
        this.renderedSeries[i] = elem;
    }
};

Tayberry.prototype.getDataMinMax = function () {
    var categoryIndex, seriesIndex, min, max;
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
        this.tooltipElement.parentNode.removeChild(this.tooltipElement);
        this.tooltipElement = null;
    }
    this.tooltipElement = document.createElement('div');
    this.tooltipElement.className = 'tayberry-tooltip';
    this.tooltipElement.style.position = 'absolute';
    this.tooltipElement.style.left = '0px';
    this.tooltipElement.style.top = '0px';
    this.tooltipElement.style.zIndex = '99999';
    this.tooltipElement.style.font = this.createFontString(this.options.tooltips.font, true);
    this.tooltipElement.style.borderRadius = '3px';
    this.tooltipElement.style.backgroundColor = 'white';
    this.tooltipElement.style.border = '2px solid #bbb';
    this.tooltipElement.style.padding = '0.15em 0.4em';
    this.tooltipElement.style.display = 'none';
    this.tooltipElement.innerHTML = '';
    document.body.appendChild(this.tooltipElement);
    this.tooltipElement.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.tooltipElement.addEventListener('mouseleave', this.onMouseLeave.bind(this));
};

},{"./colour":1,"./tayberry.axes":4,"./tayberry.base":5,"./utils":12}],7:[function(require,module,exports){
'use strict';
var Tayberry = require('./tayberry.base.js').Tayberry;

Tayberry.prototype.defaultOptions = function () {
    return {
        title: {
            text: '',
            font: {
                size: 20
            }
        },
        font: {
            colour: '#444',
            size: 12,
            face: 'sans-serif',
            style: '',
            autoScale: true
        },
        allAxes: {
            font: {},
            title: {
                font: {}
            }
        },
        xAxis: {
            title: {
                text: '',
                font: {}
            },
            type: 'categorial',
            min: null,
            max: null,
            tickStep: 40,
            tickStepValue: null,
            font: {},
            categories: [],
            labelPosition: 'middle', //left|middle|right
            placement: 'auto',
            gridLines: {}
        },
        yAxis: {
            title: {
                text: '',
                font: {}
            },
            gridLines: {
                colour: '#ccc'
            },
            min: undefined,
            max: undefined,
            tickStep: 40,
            tickStepValue: null,
            font: {},
            labelFormat: 'number', //[number|percentage|currency],
            labelFormatter: undefined,
            labelPrefix: undefined,
            labelSuffix: undefined,
            currencySymbol: '£',
            placement: 'auto',
            type: 'linear'
        },
        animations: {
            enabled: true
        },
        series: [],
        swapAxes: false,
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
            footerTemplate: '</table>',
            font: {}
        },
        legend: {
            enabled: true,
            indicatorSize: 15,
            font: {}
        },
        labels: {
            enabled: false,
            verticalAlignment: 'top',
            verticalPosition: 'outside',
            font: {}
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

Tayberry.defaultColours = ['#6FE87B', //green
'#FFAB51', //orange
'#51A8FF', //blue
'#B651FF', //purple
'#FF6051', //red
'#636363', //dark grey
'#FFE314', //yellow
'#A88572', //brown
'#B7B7B7' //light grey
];

},{"./tayberry.base.js":5}],8:[function(require,module,exports){
'use strict';
var Tayberry = require('./tayberry.base.js').Tayberry;
var Utils = require('./utils');

Tayberry.prototype.getTextWidth = function (text, fontString) {
    var ret = undefined;
    if (fontString) {
        this.labelsCtx.save();
        this.labelsCtx.font = fontString;
    }
    ret = this.labelsCtx.measureText(text).width;
    if (fontString) {
        this.labelsCtx.restore();
    }
    return ret;
};

Tayberry.prototype.getMultilineTextHeight = function (fontString, maxWidth, text) {
    var ret = undefined;
    if (fontString) {
        this.labelsCtx.save();
        this.labelsCtx.font = fontString;
    }
    ret = this.splitMultilineText(maxWidth, text).length;
    if (fontString) {
        this.labelsCtx.restore();
    }
    return ret;
};

Tayberry.prototype.splitMultilineText = function (maxWidth, text) {
    var lines = [];
    var lineWidth = 0;
    var lineText = '';
    var spaceWidth = this.labelsCtx.measureText(' ').width;
    for (var i = 0; i < text.length;) {
        var wordStart = i;
        while (i < text.length && text[i] !== ' ' && text[i] !== '\r' && text[i] !== '\n') i++;
        var wordEnd = i;
        while (i < text.length && (text[i] === ' ' || text[i] === '\r' || text[i] === '\n')) i++;
        if (wordEnd > wordStart) {
            var word = text.substring(wordStart, wordEnd);
            var wordWidth = this.labelsCtx.measureText(word).width;
            if (lineWidth + wordWidth > maxWidth) {
                if (!lineWidth) {
                    lineText = word;
                }
                lines.push(lineText);
                if (lineWidth) {
                    lineWidth = 0;
                    lineText = word;
                }
            } else {
                lineText += (lineText ? ' ' : '') + word;
                lineWidth += wordWidth + spaceWidth;
            }
        }
    }
    if (lineText) {
        lines.push(lineText);
    }
    return lines;
};

Tayberry.prototype.drawTextMultiline = function (lineHeight, x, y, maxWidth, text) {
    var lines = this.splitMultilineText(maxWidth, text);

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        this.labelsCtx.fillText(line, x, y + lineHeight * i);
    }
};

Tayberry.prototype.render = function () {
    this.calculatePlotArea();
    this.drawTitle();
    this.xAxis.draw();
    this.yAxis.draw();
    this.drawLegend();
    this.createTooltip();
    if (this.options.animations.enabled) {
        this.animator = requestAnimationFrame(this.onAnimate.bind(this));
        this.animatationStart = Utils.now();
        this.animationLength = 500;
    } else {
        this.draw();
    }
};

Tayberry.prototype.clear = function () {
    var plot = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];
    var labels = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

    if (plot) this.plotCtx.clearRect(0, 0, this.plotCanvas.width, this.plotCanvas.height);
    if (labels) this.labelsCtx.clearRect(0, 0, this.labelsCanvas.width, this.labelsCanvas.height);
};

Tayberry.prototype.drawTitle = function () {
    if (this.options.title.text) {
        var x = this.labelsCanvas.width / 2,
            y = 0;
        this.labelsCtx.save();
        this.labelsCtx.textAlign = 'center';
        this.labelsCtx.textBaseline = 'top';
        this.labelsCtx.font = this.titleFont;
        this.labelsCtx.fillStyle = this.options.title.font.colour;
        this.drawTextMultiline(this.getFontHeight(this.options.title.font), x, y, this.labelsCanvas.width, this.options.title.text);
        // this.labelsCtx.fillText(this.options.title.text, x, y);
        this.labelsCtx.restore();
    }
};

Tayberry.prototype.drawLabel = function (sign, text, rect) {
    if (this.options.swapAxes) rect = rect.clone().swapXY();
    var x = (rect.left + rect.right) / 2;
    var y = undefined;
    if (this.options.labels.verticalAlignment === 'top') y = rect.top;else if (this.options.labels.verticalAlignment === 'bottom') y = rect.bottom;else y = (rect.top + rect.bottom) / 2;
    var baseline = 'middle';
    var align = 'center';
    if (this.options.swapAxes) {
        var _ref = [y, x];
        x = _ref[0];
        y = _ref[1];

        if (this.options.labels.verticalPosition === 'outside') align = 'left';else if (this.options.labels.verticalPosition === 'inside') align = 'right';
    } else {
        baseline = Tayberry.mapVerticalPosition(sign, this.options.labels.verticalPosition);
    }
    if (this.plotArea.containsPoint(x, y)) {
        this.plotCtx.save();
        this.plotCtx.textAlign = align;
        this.plotCtx.textBaseline = baseline;
        this.plotCtx.fillText(text, x, y);
        this.plotCtx.restore();
    }
};

Tayberry.prototype.draw = function () {

    this.plotCtx.save();
    this.enumerateBars((function (bar) {
        this.plotCtx.fillStyle = bar.selected ? bar.renderedSeries.highlightColour : bar.renderedSeries.colour;
        this.plotCtx.fillRect(bar.rect.left, bar.rect.top, bar.rect.width, bar.rect.height);
    }).bind(this));
    this.plotCtx.restore();

    if (this.options.labels.enabled) {
        this.plotCtx.save();
        this.enumerateBars((function (bar) {
            this.plotCtx.font = this.labelFont;
            this.plotCtx.fillStyle = this.options.labels.font.colour;
            this.drawLabel(bar.value, this.options.yAxis.labelFormatter(bar.value), bar.rect);
        }).bind(this));
        this.plotCtx.restore();
    }
};

Tayberry.prototype.drawLine = function (x1, y1, x2, y2, colour) {
    this.labelsCtx.save();
    if (colour) {
        this.labelsCtx.strokeStyle = colour;
    }
    this.labelsCtx.beginPath();
    this.labelsCtx.moveTo(x1 + 0.5, y1 + 0.5);
    this.labelsCtx.lineTo(x2 + 0.5, y2 + 0.5);
    this.labelsCtx.stroke();
    this.labelsCtx.restore();
};

Tayberry.prototype.redraw = function (plotOnly) {
    this.clear(true, !plotOnly);
    if (!plotOnly) {
        this.drawTitle();
        this.xAxis.draw();
        this.yAxis.draw();
        this.drawLegend();
    }
    this.draw();
};

Tayberry.prototype.drawLegend = function () {
    if (this.options.legend.enabled) {
        this.labelsCtx.save();
        this.labelsCtx.font = this.legendFont;
        var totalWidth = 0;
        var indicatorSize = this.mapLogicalXUnit(this.options.legend.indicatorSize);
        for (var index = 0; index < this.series.length; index++) {
            var series = this.series[index];
            if (series.name) {
                totalWidth += this.getTextWidth(series.name, this.legendFont) + indicatorSize + this.mapLogicalXUnit(this.options.elementSmallPadding + this.options.elementLargePadding);
            }
        }
        var x = this.plotArea.left + this.plotArea.width / 2 - totalWidth / 2,
            y = this.labelsCanvas.height - indicatorSize;

        for (var index = 0; index < this.renderedSeries.length; index++) {
            var series = this.renderedSeries[index];
            if (series.name) {
                this.labelsCtx.fillStyle = series.colour;
                this.labelsCtx.fillRect(x, y, indicatorSize, indicatorSize);
                this.labelsCtx.textBaseline = 'middle';
                this.labelsCtx.fillStyle = this.options.legend.font.colour;
                x += indicatorSize + this.mapLogicalXUnit(this.options.elementSmallPadding);
                this.labelsCtx.fillText(series.name, x, y + indicatorSize / 2);
                x += this.getTextWidth(series.name, this.legendFont) + this.mapLogicalXUnit(this.options.elementLargePadding);
            }
        }
        this.labelsCtx.restore();
    }
};

},{"./tayberry.base.js":5,"./utils":12}],9:[function(require,module,exports){
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
            var yOrigin = this.yAxis.min <= 0 && 0 <= this.yAxis.max ? 0 : this.yAxis.min > 0 ? this.yAxis.min : this.yAxis.max;
            this.renderedSeries[seriesIndex].data[categoryIndex] = yOrigin + scaleFactor * (value - yOrigin);
        }
    }
    this.redraw(true);
    if (scaleFactor < 1) {
        this.animator = requestAnimationFrame(this.onAnimate.bind(this));
    }
};

Tayberry.prototype.onMouseLeave = function (event) {
    if (event.currentTarget == this.plotCanvas && event.relatedTarget !== this.tooltipElement || event.currentTarget == this.tooltipElement && event.relatedTarget !== this.plotCanvas) {
        this.selectedItem = {};
        this.tooltipElement.style.display = 'none';
        this.redraw();
    }
};

Tayberry.prototype.handleMouseMove = function (clientX, clientY) {
    var boundingRect = new Rect(this.plotCanvas.getBoundingClientRect());
    var ret = false;
    if (boundingRect.containsPoint(clientX, clientY)) {
        var x = clientX - boundingRect.left;
        var y = clientY - boundingRect.top;

        var hitTestResult = this.hitTest(this.mapLogicalXUnit(x), this.mapLogicalYUnit(y));
        if (hitTestResult.found) {
            var aboveZero = hitTestResult.rect.top < hitTestResult.rect.bottom;
            var category = this.xAxis.getCategoryLabel(hitTestResult.categoryIndex, this.series[0].data.length);
            this.tooltipElement.style.display = 'block';
            var tooltipHtml = Utils.formatString(this.options.tooltips.headerTemplate, { category: category }, true);
            if (this.options.tooltips.shared) {
                for (var index = 0; index < this.series.length; index++) {
                    var series = this.series[index];
                    var value = series.data[hitTestResult.categoryIndex];
                    tooltipHtml += Utils.formatString(this.options.tooltips.valueTemplate, {
                        value: this.options.yAxis.labelFormatter(value),
                        name: series.name,
                        colour: series.colour
                    }, true);
                }
            } else {
                var series = this.series[hitTestResult.seriesIndex];
                var value = series.data[hitTestResult.categoryIndex];
                tooltipHtml += Utils.formatString(this.options.tooltips.valueTemplate, {
                    value: this.options.yAxis.labelFormatter(value),
                    name: series.name,
                    colour: series.colour
                }, true);
            }
            tooltipHtml += this.options.tooltips.footerTemplate;
            this.tooltipElement.innerHTML = tooltipHtml;
            var tooltipRect = this.tooltipElement.getBoundingClientRect();
            if (!this.options.tooltips.shared) {
                this.tooltipElement.style.borderColor = this.renderedSeries[hitTestResult.seriesIndex].colour;
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
    var oldSelectedItem = Utils.assign({}, this.selectedItem);
    if (!this.handleMouseMove(event.clientX, event.clientY)) {
        this.selectedItem = {};
    }

    if (oldSelectedItem.categoryIndex !== this.selectedItem.categoryIndex || oldSelectedItem.seriesIndex !== this.selectedItem.seriesIndex) {
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

Tayberry.prototype.calculatePlotArea = function () {
    var MAX_AXIS_CALC_SIZE_ATTEMPTS = 5;

    this.plotArea = new Rect(0, 0, this.labelsCanvas.width, this.labelsCanvas.height);
    if (this.options.title.text) {
        this.plotArea.top += this.mapLogicalYUnit(this.options.elementSmallPadding);
        this.plotArea.top += this.getFontHeight(this.options.title.font) * this.getMultilineTextHeight(this.titleFont, this.labelsCanvas.width, this.options.title.text);
    }
    if (this.options.legend.enabled) this.plotArea.bottom -= this.mapLogicalYUnit(this.options.elementSmallPadding + this.options.elementLargePadding + this.options.legend.indicatorSize);

    this.yAxis.adjustSize(this.plotArea, true, true);
    this.xAxis.adjustSize(this.plotArea, true, true);

    for (var i = 0; i < MAX_AXIS_CALC_SIZE_ATTEMPTS; i++) {
        this.yAxis.calculateExtent();
        this.xAxis.calculateExtent();
        this.yAxis.updateFormatter();
        this.xAxis.updateFormatter();
        if (!this.yAxis.adjustSize(this.plotArea) && !this.xAxis.adjustSize(this.plotArea)) break;
    }
    this.plotArea.left = Math.ceil(this.plotArea.left);
    this.plotArea.top = Math.ceil(this.plotArea.top);
    this.plotArea.right = Math.floor(this.plotArea.right);
    this.plotArea.bottom = Math.floor(this.plotArea.bottom);
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

Tayberry.prototype.enumerateBars = function (callback) {
    var categoryCount = this.renderedSeries[0].data.length;
    if (categoryCount) {
        var isStacked = this.options.barMode === 'stacked';
        var isOverlaid = this.options.barMode === 'overlaid';
        var isHorizontal = this.options.swapAxes;
        var plotArea = this.plotArea.clone();
        if (isHorizontal) plotArea.swapXY();
        var isNormal = !isStacked && !isOverlaid;
        var barCount = isStacked || isOverlaid ? 1 : this.series.length;
        var categoryWidth = plotArea.width / categoryCount;
        // const barWidth = (categoryWidth * (1 - this.options.categorySpacing) / barCount);
        var yOrigin = this.yAxis.getOrigin();

        for (var categoryIndex = 0; categoryIndex < categoryCount; categoryIndex++) {
            var categoryXStart = plotArea.left + Math.floor(categoryIndex * categoryWidth);
            var categoryXEnd = plotArea.left + Math.floor((categoryIndex + 1) * categoryWidth);
            var barXStart = categoryXStart + Math.ceil(categoryWidth * this.options.categorySpacing / 2);
            var barXEnd = categoryXEnd - Math.floor(categoryWidth * this.options.categorySpacing / 2);

            var yBottomPositive = yOrigin,
                yBottomNegative = yOrigin,
                yRunningTotalPositive = 0,
                yRunningTotalNegative = 0;
            var barIndex = 0;
            for (var seriesIndex = 0; seriesIndex < this.renderedSeries.length; seriesIndex++) {
                var value = this.renderedSeries[seriesIndex].data[categoryIndex];
                var barWidth = Math.floor((barXEnd - barXStart) / barCount);
                var xStart = Math.floor(barXStart + barIndex * barWidth);
                var xEnd = Math.ceil(barXStart + (barIndex + 1) * barWidth);
                if (Utils.isMissingValue(value)) continue;
                var yTop = this.yAxis.getValueDisplacement(value + (value > 0 ? yRunningTotalPositive : yRunningTotalNegative));
                var rect = new Rect(xStart, yTop, xEnd, value > 0 ? yBottomPositive : yBottomNegative);
                rect.left += Math.ceil(this.options.barPadding * this.scaleFactor / 2);
                rect.right -= Math.floor(this.options.barPadding * this.scaleFactor / 2);
                if (rect.right < rect.left) rect.right = rect.left;
                if (isHorizontal) rect.swapXY();
                rect.clip(this.plotArea);

                var stopEnumerating = callback({
                    seriesIndex: seriesIndex,
                    categoryIndex: categoryIndex,
                    series: this.renderedSeries[seriesIndex],
                    renderedSeries: this.renderedSeries[seriesIndex],
                    value: this.series[seriesIndex].data[categoryIndex],
                    renderedValue: this.renderedSeries[seriesIndex].data[categoryIndex],
                    rect: rect,
                    selected: this.selectedItem.categoryIndex === categoryIndex && (this.options.tooltips.shared || this.selectedItem.seriesIndex === seriesIndex)
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
                    // x += barWidth;
                    barIndex++;
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
