(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Tayberry = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Utils = require('./helpers/utils.js');

var Axis = (function () {
    _createClass(Axis, null, [{
        key: 'create',
        value: function create(tayberry, options, index, axisType, xYSwapped) {
            var isHorizontal = axisType === 'x' && !xYSwapped || axisType === 'y' && xYSwapped;
            if (options.type === 'linear') return new LinearAxis(tayberry, index, options, axisType, isHorizontal);else return new CategorialAxis(tayberry, index, options, axisType, isHorizontal);
        }
    }]);

    function Axis(tayberry, index, options, axisType, isHorizontal) {
        _classCallCheck(this, Axis);

        this.tayberry = tayberry;
        this.options = options;
        this.axisType = axisType;
        this.isHorizontal = isHorizontal;
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
                this.options.placement = this.isVertical ^ this.index > 0 ? 'start' : 'end';
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
            return this.isVertical ? this.tayberry.mapLogicalXUnit(x) : this.tayberry.mapLogicalYUnit(x);
        }
    }, {
        key: 'mapLogicalYOrXUnit',
        value: function mapLogicalYOrXUnit(x) {
            return !this.isVertical ? this.tayberry.mapLogicalXUnit(x) : this.tayberry.mapLogicalYUnit(x);
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
                if (this.isVertical) {
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
                if (this.isVertical) {
                    plotArea.left += size - this.calculatedSize;
                } else {
                    plotArea.top += size - this.calculatedSize;
                }
            } else {
                size *= -1;
                if (this.isVertical) {
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
        value: function draw(offsetRect) {
            this.drawTicksAndLabels(offsetRect);
            this.drawTitle(offsetRect);
        }
    }, {
        key: 'drawTicksAndLabels',
        value: function drawTicksAndLabels(offsetRect) {
            var _this2 = this;

            var tb = this.tayberry;
            var labelPadding = this.mapLogicalXOrYUnit(tb.options.elementSmallPadding);
            var labelPaddingX = this.isVertical ? labelPadding * (this.isPlacedAtStart ? -1 : 1) : 0;
            var labelPaddingY = !this.isVertical ? labelPadding * (this.isPlacedAtStart ? -1 : 1) : 0;
            var fontHeight = tb.getFontHeight(this.options.font);
            var xOffset = this.isVertical ? offsetRect[this.startProperty] : 0;
            var yOffset = !this.isVertical ? offsetRect[this.startProperty] : 0;

            tb.labelsCtx.save();
            tb.labelsCtx.font = this.labelFont;
            tb.labelsCtx.fillStyle = this.options.font.colour;
            tb.labelsCtx.textAlign = this.isVertical ? this.isPlacedAtStart ? 'right' : 'left' : 'center';
            tb.labelsCtx.textBaseline = this.isVertical ? 'middle' : this.isPlacedAtStart ? 'bottom' : 'top';

            var lastXEnds = [],
                tickIndex = 0,
                maxWidth = 0;

            this.enumerateTicks(function (tick) {
                var xStart = undefined,
                    xEnd = undefined;
                var formattedValue = _this2.options.labelFormatter(tick.value);
                var row = tickIndex % _this2.numLabelLines;
                var rowOffset = _this2.isVertical ? 0 : fontHeight * row;
                var textWidth = tb.getTextWidth(formattedValue, _this2.labelFont);
                if (!_this2.isVertical) {
                    xStart = tick.x - textWidth / 2;
                    xEnd = tick.x + textWidth / 2;
                }

                if (_this2.isVertical || (typeof lastXEnds[row] === 'undefined' || xStart > lastXEnds[row] + 1) && xStart >= 0 && xEnd < tb.labelsCanvas.width) {
                    maxWidth = Math.max(maxWidth, textWidth);
                    tb.labelsCtx.fillText(formattedValue, tick.x + labelPaddingX + xOffset, tick.y + labelPaddingY + rowOffset + yOffset);
                    lastXEnds[row] = xEnd;
                }
                if (_this2.options.gridLines.colour) tb.drawLine(tick.x1, tick.y1, tick.x2, tick.y2, _this2.options.gridLines.colour);
                tickIndex++;
            });

            this.adjustOffsetRect(offsetRect, this.isVertical ? maxWidth + labelPadding : fontHeight + labelPadding);

            tb.labelsCtx.restore();
        }
    }, {
        key: 'adjustOffsetRect',
        value: function adjustOffsetRect(offsetRect, displacement) {
            offsetRect[this.startProperty] += this.isPlacedAtStart ? -displacement : displacement;
        }
    }, {
        key: 'drawTitle',
        value: function drawTitle(offsetRect) {
            if (this.options.title.text) {
                var tb = this.tayberry;
                tb.labelsCtx.save();
                tb.labelsCtx.font = this.titleFont;
                tb.labelsCtx.fillStyle = this.options.title.font.colour;
                tb.labelsCtx.textAlign = 'center';

                var labelPaddingSize = this.mapLogicalXOrYUnit(tb.options.elementSmallPadding);
                var labelPadding = labelPaddingSize * (this.isPlacedAtStart ? -1 : 1);
                var xOffset = this.isVertical ? offsetRect[this.startProperty] : 0;
                var yOffset = !this.isVertical ? offsetRect[this.startProperty] : 0;
                var fontHeight = tb.getFontHeight(this.options.title.font);

                if (this.isVertical) {
                    tb.labelsCtx.textBaseline = 'bottom';
                    var x = tb.plotArea[this.startProperty] + xOffset + labelPadding;
                    var y = tb.plotArea.yMidpoint + yOffset;
                    tb.labelsCtx.translate(x, y);
                    tb.labelsCtx.rotate((this.isPlacedAtStart ? -1 : 1) * Math.PI / 2);
                    tb.labelsCtx.fillText(this.options.title.text, 0, 0);
                } else {
                    tb.labelsCtx.textBaseline = this.isPlacedAtStart ? 'bottom' : 'top';
                    var x = tb.plotArea.xMidpoint + xOffset;
                    var y = tb.plotArea[this.startProperty] + labelPadding + yOffset;
                    //tb.mapLogicalYOrXUnit(tb.options.font.size * 2 + tb.options.elementSmallPadding + tb.options.elementLargePadding)
                    tb.labelsCtx.fillText(this.options.title.text, x, y);
                }
                this.adjustOffsetRect(offsetRect, fontHeight + labelPaddingSize);
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
        key: 'isVertical',
        get: function get() {
            return !this.isHorizontal;
        }
    }, {
        key: 'startProperty',
        get: function get() {
            if (this.isVertical) return this.isPlacedAtStart ? 'left' : 'right';else return this.isPlacedAtStart ? 'top' : 'bottom';
        }
    }, {
        key: 'endProperty',
        get: function get() {
            if (this.isVertical) return !this.isPlacedAtStart ? 'left' : 'right';else return !this.isPlacedAtStart ? 'top' : 'bottom';
        }
    }]);

    return Axis;
})();

var CategorialAxis = (function (_Axis) {
    _inherits(CategorialAxis, _Axis);

    function CategorialAxis() {
        _classCallCheck(this, CategorialAxis);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(CategorialAxis).apply(this, arguments));
    }

    _createClass(CategorialAxis, [{
        key: 'enumerateTicks',
        value: function enumerateTicks(callback) {
            var tb = this.tayberry;

            var categoryCount = this.options.categories.length;
            var plotArea = tb.plotArea.clone();
            if (this.isVertical) plotArea.swapXY();
            var categoryWidth = plotArea.width / tb.categoryCount;
            var factor = 0.5;

            if (!this.isVertical) {
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
                if (this.isVertical) {
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
    }, {
        key: 'getOrigin',
        value: function getOrigin() {
            return this.tayberry.plotArea[this.isVertical ? 'bottom' : 'left'];
        }
    }, {
        key: 'getValueDisplacement',
        value: function getValueDisplacement(value) {
            var ret = this.getOrigin() + this.plotDisplacement * (value + 0.5) / this.options.categories.length;
            ret = this.isVertical ? Math.floor(ret) : Math.ceil(ret);
            return ret;
        }
    }, {
        key: 'plotDisplacement',
        get: function get() {
            return this.isVertical ? -this.tayberry.plotArea.height : this.tayberry.plotArea.width;
        }
    }]);

    return CategorialAxis;
})(Axis);

var LinearAxis = (function (_Axis2) {
    _inherits(LinearAxis, _Axis2);

    function LinearAxis() {
        _classCallCheck(this, LinearAxis);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(LinearAxis).apply(this, arguments));
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
                if (this.isVertical) {
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
                var _ref2 = this.isYAxis ? this.tayberry.getDataMinMax(this) : this.tayberry.getDataXMinMax(this);

                var _ref3 = _slicedToArray(_ref2, 2);

                var dataMin = _ref3[0];
                var dataMax = _ref3[1];

                var dataRange = dataMax - dataMin;
                if (!overriddenStart) {
                    targetStart = dataMin;
                    if (this.isYAxis) {
                        targetStart = targetStart - dataRange * 0.1;
                        if (dataMin >= 0 && targetStart < 0) targetStart = 0;
                    }
                }
                if (!overriddenEnd) {
                    targetEnd = dataMax;
                    if (this.isYAxis) {
                        targetEnd = dataMax + dataRange * 0.1;
                        if (dataMax <= 0 && targetStart > 0) targetEnd = 0;
                    }
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
            if (!overriddenStart && this.isYAxis) this.min = this.tickStart;
            if (!overriddenEnd && this.isYAxis) this.max = this.tickEnd;
        }
    }, {
        key: 'getOrigin',
        value: function getOrigin() {
            var ret = this.tayberry.plotArea[this.isVertical ? 'bottom' : 'left'] - (0 - this.min) * this.plotDisplacement / (this.max - this.min);
            if (this.isVertical) ret--;
            ret = this.isVertical ? Math.floor(ret) : Math.ceil(ret);
            return ret;
        }
    }, {
        key: 'getValueDisplacement',
        value: function getValueDisplacement(value) {
            var ret = this.getOrigin() - value * this.plotDisplacement / (this.max - this.min);
            ret = this.isVertical ? Math.floor(ret) : Math.ceil(ret);
            return ret;
        }
    }, {
        key: 'getCategoryLabel',
        value: function getCategoryLabel(index, totalCategories, isRange) {
            if (isRange) {
                var start = index / totalCategories;
                var end = (index + 1) / totalCategories;
                var axisRange = this.max - this.min;
                return Utils.formatString('{0} ≤ x < {1}', [this.options.labelFormatter(this.min + start * axisRange), this.options.labelFormatter(this.min + end * axisRange)]);
            } else {
                return this.options.labelFormatter(index);
            }
        }
    }, {
        key: 'plotDisplacement',
        get: function get() {
            return this.isVertical ? this.tayberry.plotArea.height - 1 : -(this.tayberry.plotArea.width - 1);
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

},{"./helpers/utils.js":10}],2:[function(require,module,exports){
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
        this.categories = [];
        this.titleFont = null;
        this.labelFont = null;
        this.legendFont = null;
        this.renderers = [];
    }

    _createClass(Tayberry, [{
        key: "seriesCount",
        get: function get() {
            return this.options.series.length;
        }
    }, {
        key: "categoryCount",
        get: function get() {
            return this.options.series.length ? this.options.series[0].data.length : 0;
        }
    }]);

    return Tayberry;
})();

exports.Tayberry = Tayberry;

},{}],3:[function(require,module,exports){
'use strict';

var Colour = require('./helpers/colour').Colour;
var Utils = require('./helpers/utils');

var Tayberry = require('./base').Tayberry;
var Axis = require('./axis').Axis;
var BarRenderer = require('./renderer.bar').BarRenderer;
var LineRenderer = require('./renderer.line').LineRenderer;

var currentAutoColourIndex = 0;

Tayberry.getAutoColour = function () {
    var ret = Tayberry.defaultColours[currentAutoColourIndex % Tayberry.defaultColours.length];
    currentAutoColourIndex++;
    return ret;
};

Tayberry.getDataValue = function (dataPoint) {
    var ret = undefined;
    if (Array.isArray(dataPoint)) {
        ret = dataPoint[1];
    } else {
        ret = dataPoint;
    }
    return ret;
};

Tayberry.getDataXValue = function (data, index) {
    var ret = undefined;
    if (Array.isArray(data[index])) {
        ret = data[index][0];
    } else {
        ret = index;
    }
    return ret;
};

Tayberry.setDataValue = function (data, index, newValue) {
    if (Array.isArray(data[index])) {
        data[index][1] = newValue;
    } else {
        data[index] = newValue;
    }
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
    this.yAxes = null;
    this.xAxes = null;
    this.initialise();
};

Tayberry.prototype.destroy = function () {
    this.labelsCanvas.parentNode.removeChild(this.labelsCanvas);
    this.tooltipElement.parentNode.removeChild(this.tooltipElement);
    this.options = {};
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
    this.yAxes.map(function (e) {
        return e.updateFonts();
    });
    this.xAxes.map(function (e) {
        return e.updateFonts();
    });
};

Tayberry.prototype.setOptions = function (options) {
    var optionOverrides = [this.defaultOptions()];
    if (!options.presets) {
        options.presets = ['default'];
    }
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
    this.options.allAxes.font = Utils.deepAssign({}, [this.options.font, this.options.allAxes.font]);
    this.options.allAxes.title.font = Utils.deepAssign({}, [this.options.font, this.options.allAxes.title.font]);
    if (!Array.isArray(this.options.yAxis)) this.options.yAxis = [this.options.yAxis || {}];
    if (!Array.isArray(this.options.xAxis)) this.options.xAxis = [this.options.xAxis || {}];
    for (var i = 0; i < this.options.yAxis.length; i++) {
        this.options.yAxis[i] = Utils.deepAssign({}, [i === 0 ? Tayberry.defaultPrimaryYAxis : Tayberry.defaultSecondaryYAxis, this.options.allAxes, this.options.yAxis[i]]);
    }
    for (var i = 0; i < this.options.xAxis.length; i++) {
        this.options.xAxis[i] = Utils.deepAssign({}, [Tayberry.defaultXAxis, this.options.allAxes, this.options.xAxis[i]]);
    }

    this.yAxes = [];
    this.xAxes = [];
    for (var i = 0; i < this.options.xAxis.length; i++) {
        this.xAxes.push(Axis.create(this, this.options.xAxis[i], i, 'x', this.options.swapAxes));
    }
    for (var i = 0; i < this.options.yAxis.length; i++) {
        this.yAxes.push(Axis.create(this, this.options.yAxis[i], i, 'y', this.options.swapAxes));
    }
    this.createRenderers();
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

Tayberry.calculateGlowColour = function (highlightColour) {
    var newColour = new Colour(highlightColour);
    newColour.a = 0.4;
    return newColour.toString();
};

Tayberry.prototype.createRenderers = function () {
    var series = undefined,
        groupedSeries = { 'bar': [], 'line': [] };
    if (!Array.isArray(this.options.series)) {
        series = [this.options.series];
    } else {
        series = this.options.series;
    }

    for (var i = 0; i < series.length; i++) {
        var curSeries = series[i];
        curSeries.index = i;
        curSeries.colour = curSeries.colour || Tayberry.getAutoColour();
        curSeries.highlightColour = curSeries.highlightColour || Tayberry.calculateHighlightColour(curSeries.colour);
        curSeries.glowColour = curSeries.glowColour || Tayberry.calculateGlowColour(curSeries.highlightColour);
        curSeries.xAxis = this.xAxes[curSeries.xAxisIndex || 0];
        curSeries.yAxis = this.yAxes[curSeries.yAxisIndex || 0];
        curSeries.plotType = curSeries.plotType || this.options.plotType;
        if (groupedSeries.hasOwnProperty(curSeries.plotType)) {
            groupedSeries[curSeries.plotType].push(curSeries);
        }
    }
    if (groupedSeries['bar'].length) {
        this.renderers.push(new BarRenderer(this.plotCtx, this, groupedSeries['bar']));
    }
    if (groupedSeries['line'].length) {
        this.renderers.push(new LineRenderer(this.plotCtx, this, groupedSeries['line']));
    }
};

Tayberry.prototype.getDataMinMax = function (axis) {
    var minNormal, maxNormal, minStacked, maxStacked;
    if (this.options.barPlot.mode === 'stacked') {
        var seriesPositiveTotals = [];
        var seriesNegativeTotals = [];
        var barSeries = this.options.series.filter(function (series) {
            return series.plotType === 'bar' && series.yAxis === axis;
        });
        if (barSeries.length) {
            for (var categoryIndex = 0; categoryIndex < barSeries[0].data.length; categoryIndex++) {
                seriesPositiveTotals[categoryIndex] = 0;
                seriesNegativeTotals[categoryIndex] = 0;
                for (var seriesIndex = 0; seriesIndex < barSeries.length; seriesIndex++) {
                    var value = Tayberry.getDataValue(barSeries[seriesIndex].data[categoryIndex]);
                    if (!Utils.isMissingValue(value)) {
                        if (value < 0) {
                            seriesNegativeTotals[categoryIndex] += value;
                        } else {
                            seriesPositiveTotals[categoryIndex] += value;
                        }
                    }
                }
            }
        }
        minStacked = Math.min(0, Utils.reduce(seriesNegativeTotals, Math.min, undefined, true));
        maxStacked = Math.max(Utils.reduce(seriesPositiveTotals, Math.max, undefined, true), 0);
    }
    {
        var seriesMinima = [];
        var seriesMaxima = [];
        for (var index = 0; index < this.options.series.length; index++) {
            var series = this.options.series[index];
            if (series.yAxis === axis && (series.plotType !== 'bar' || this.options.barPlot.mode !== 'stacked')) {
                seriesMinima.push(Utils.reduce(series.data, Math.min, Tayberry.getDataValue, true));
                seriesMaxima.push(Utils.reduce(series.data, Math.max, Tayberry.getDataValue, true));
            }
        }
        minNormal = Utils.reduce(seriesMinima, Math.min, undefined, true);
        maxNormal = Utils.reduce(seriesMaxima, Math.max, undefined, true);
    }
    var min = Utils.reduce([minNormal, minStacked], Math.min, undefined, true);
    var max = Utils.reduce([maxNormal, maxStacked], Math.max, undefined, true);
    return [min, max];
};

Tayberry.prototype.getDataXMinMax = function (axis) {
    var min, max;
    var seriesMinima = [];
    var seriesMaxima = [];
    for (var index = 0; index < this.options.series.length; index++) {
        var series = this.options.series[index];
        if (series.xAxis === axis) {
            seriesMinima.push(Utils.reduce(series.data, Math.min, Tayberry.getDataXValue, true));
            seriesMaxima.push(Utils.reduce(series.data, Math.max, Tayberry.getDataXValue, true));
        }
    }
    min = Utils.reduce(seriesMinima, Math.min, undefined, true);
    max = Utils.reduce(seriesMaxima, Math.max, undefined, true);
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

},{"./axis":1,"./base":2,"./helpers/colour":7,"./helpers/utils":10,"./renderer.bar":11,"./renderer.line":13}],4:[function(require,module,exports){
'use strict';

var Tayberry = require('./base.js').Tayberry;
var Utils = require('./helpers/utils');

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
        xAxis: [],
        yAxis: [],
        animations: {
            enabled: true
        },
        series: [],
        backgroundColour: undefined,
        swapAxes: false,
        plotType: 'bar',
        barPlot: {
            mode: 'normal', //[normal|stacked|overlaid]
            barPadding: 2,
            categorySpacing: 0.3
        },
        linePlot: {
            lineWidth: 2,
            highlightedLineWidth: 4,
            showMarkers: 'auto',
            noMarkersThreshold: 100,
            markerSize: 10,
            highlightedMarkerSize: 18
        },
        elementSmallPadding: 5,
        elementLargePadding: 10,
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

Tayberry.defaultXAxis = {
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
};

Tayberry.defaultYAxis = {
    title: {
        text: '',
        font: {}
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
    type: 'linear',
    gridLines: {}

};

Tayberry.defaultPrimaryYAxis = Utils.deepAssign({}, [Tayberry.defaultYAxis, {
    gridLines: {
        colour: '#ccc'
    }
}]);

Tayberry.defaultSecondaryYAxis = Tayberry.defaultYAxis;

Tayberry.presets = {
    histogram: {
        barPlot: {
            mode: 'overlaid',
            categorySpacing: 0,
            barPadding: 1
        }
    },
    darkGrid: {
        allAxes: {
            gridLines: {
                colour: 'rgba(255, 255, 255, 0.6)'
            }
        },
        plotBackgroundColour: '#E5E5E5'
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

},{"./base.js":2,"./helpers/utils":10}],5:[function(require,module,exports){
'use strict';

var Tayberry = require('./base').Tayberry;
var Rect = require('./helpers/rect').Rect;
var Utils = require('./helpers/utils');

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
    this.drawLabelLayer();
    this.createTooltip();
    if (this.options.animations.enabled) {
        this.animator = requestAnimationFrame(this.onAnimate.bind(this));
        this.animationStart = typeof performance !== 'undefined' && typeof performance.now !== 'undefined' ? performance.now() : null;
        this.animationLength = 500;
    } else {
        this.drawPlotLayer();
    }
};

Tayberry.prototype.clear = function () {
    var plot = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];
    var labels = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

    if (plot) this.plotCtx.clearRect(0, 0, this.plotCanvas.width, this.plotCanvas.height);
    if (labels) this.labelsCtx.clearRect(0, 0, this.labelsCanvas.width, this.labelsCanvas.height);
};

Tayberry.prototype.drawBackground = function () {
    if (this.options.plotBackgroundColour) {
        this.labelsCtx.save();
        this.labelsCtx.fillStyle = this.options.plotBackgroundColour;
        this.labelsCtx.fillRect(this.plotArea.left, this.plotArea.top, this.plotArea.width, this.plotArea.height);
        this.labelsCtx.restore();
    }
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

Tayberry.prototype.drawPlotLayer = function () {
    for (var i = 0; i < this.renderers.length; i++) {
        this.renderers[i].drawPlot();
    }
    for (var i = 0; i < this.renderers.length; i++) {
        this.renderers[i].drawLabels();
    }
};

Tayberry.prototype.drawLine = function (x1, y1, x2, y2, colour) {
    var ctx = arguments.length <= 5 || arguments[5] === undefined ? this.labelsCtx : arguments[5];

    ctx.save();
    if (colour) {
        ctx.strokeStyle = colour;
    }
    ctx.beginPath();
    ctx.moveTo(x1 + 0.5, y1 + 0.5);
    ctx.lineTo(x2 + 0.5, y2 + 0.5);
    ctx.stroke();
    ctx.restore();
};

Tayberry.prototype.drawLabelLayer = function () {
    this.drawBackground();
    this.drawTitle();
    var offsetRect = new Rect(0);
    this.xAxes.map(function (e) {
        return e.draw(offsetRect);
    });
    this.yAxes.map(function (e) {
        return e.draw(offsetRect);
    });
    this.drawLegend();
};

Tayberry.prototype.redraw = function (plotOnly) {
    this.clear(true, !plotOnly);
    if (!plotOnly) {
        this.drawLabelLayer();
    }
    this.drawPlotLayer();
};

Tayberry.prototype.drawLegend = function () {
    if (this.options.legend.enabled) {
        this.labelsCtx.save();
        this.labelsCtx.font = this.legendFont;
        var totalWidth = 0;
        var indicatorSize = this.mapLogicalXUnit(this.options.legend.indicatorSize);
        for (var index = 0; index < this.options.series.length; index++) {
            var series = this.options.series[index];
            if (series.name) {
                totalWidth += this.getTextWidth(series.name, this.legendFont) + indicatorSize + this.mapLogicalXUnit(this.options.elementSmallPadding + this.options.elementLargePadding);
            }
        }
        var x = this.plotArea.left + this.plotArea.width / 2 - totalWidth / 2,
            y = this.labelsCanvas.height - indicatorSize;

        for (var index = 0; index < this.options.series.length; index++) {
            var series = this.options.series[index];
            if (series.name) {
                series.renderer.drawLegendIndicator(this.labelsCtx, series, new Rect(x, y, x + indicatorSize, y + indicatorSize));
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

},{"./base":2,"./helpers/rect":9,"./helpers/utils":10}],6:[function(require,module,exports){
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
    for (var i = 0; i < this.renderers.length; i++) {
        this.renderers[i].onAnimationFrame(elapsed, this.animationLength);
    }
    this.redraw(true);
    if (elapsed < this.animationLength) {
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
            var tooltipHtml = '';
            var aboveZero = hitTestResult.rect.top < hitTestResult.rect.bottom;
            this.tooltipElement.style.display = 'block';
            if (this.options.tooltips.shared) {
                var category = this.xAxes[0].getCategoryLabel(hitTestResult.categoryIndex, this.categoryCount, hitTestResult.isXRange);
                tooltipHtml += Utils.formatString(this.options.tooltips.headerTemplate, { category: category }, true);
                for (var index = 0; index < this.seriesCount; index++) {
                    var series = this.options.series[index];
                    var value = Tayberry.getDataValue(series.data[hitTestResult.categoryIndex]);
                    tooltipHtml += Utils.formatString(this.options.tooltips.valueTemplate, {
                        value: series.yAxis.options.labelFormatter(value),
                        name: series.name,
                        colour: series.colour
                    }, true);
                }
            } else {
                var series = hitTestResult.series;
                var value = hitTestResult.value;
                var category = series.xAxis.getCategoryLabel(hitTestResult.categoryIndex, this.categoryCount, hitTestResult.isXRange);
                tooltipHtml += Utils.formatString(this.options.tooltips.headerTemplate, { category: category }, true);
                tooltipHtml += Utils.formatString(this.options.tooltips.valueTemplate, {
                    value: series.yAxis.options.labelFormatter(value),
                    name: series.name,
                    colour: series.colour
                }, true);
            }
            tooltipHtml += this.options.tooltips.footerTemplate;
            this.tooltipElement.innerHTML = tooltipHtml;
            var tooltipRect = this.tooltipElement.getBoundingClientRect();
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
    var oldSelectedItem = Utils.assign({}, this.selectedItem);
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

},{"./base":2,"./helpers/rect":9,"./helpers/utils":10}],7:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Utils = require('./utils');

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

},{"./utils":10}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Rect = (function () {
    function Rect() {
        _classCallCheck(this, Rect);

        if (arguments.length === 1) {
            if (_typeof(arguments[0]) === 'object') {
                var rect = arguments[0];
                this.left = rect.left;
                this.top = rect.top;
                this.right = rect.right;
                this.bottom = rect.bottom;
            } else {
                var val = arguments[0];
                this.left = val;
                this.top = val;
                this.right = val;
                this.bottom = val;
            }
        } else if (arguments.length === 4) {
            this.left = arguments[0];
            this.top = arguments[1];
            this.right = arguments[2];
            this.bottom = arguments[3];
        }
    }

    _createClass(Rect, [{
        key: 'containsPoint',
        value: function containsPoint(x, y) {
            return this.containsX(x) && this.containsY(y);
        }
    }, {
        key: 'containsY',
        value: function containsY(y) {
            return y >= this.top && y < this.bottom || y >= this.bottom && y < this.top;
        }
    }, {
        key: 'containsX',
        value: function containsX(x) {
            return x >= this.left && x < this.right || x >= this.right && x < this.left;
        }
    }, {
        key: 'inflate',
        value: function inflate(val) {
            this.left -= val;
            this.top -= val;
            this.right += val;
            this.bottom += val;
            return this;
        }
    }, {
        key: 'clip',
        value: function clip(clipRect) {
            //FIXME: In theory, we should be more careful about how we handle rects where right < left or bottom < top
            if (this.left < clipRect.minX) this.left = clipRect.minX;else if (this.left > clipRect.maxX) this.left = clipRect.maxX;

            if (this.right < clipRect.minX) this.right = clipRect.minX;else if (this.right > clipRect.maxX) this.right = clipRect.maxX;

            if (this.top < clipRect.minY) this.top = clipRect.minY;else if (this.top > clipRect.maxY) this.top = clipRect.maxY;

            if (this.bottom > clipRect.maxY) this.bottom = clipRect.maxY;else if (this.bottom < clipRect.minY) this.bottom = clipRect.minY;

            return this;
        }
    }, {
        key: 'clone',
        value: function clone() {
            return new Rect(this);
        }
    }, {
        key: 'swapXY',
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
        key: 'width',
        get: function get() {
            return this.right - this.left;
        }
    }, {
        key: 'height',
        get: function get() {
            return this.bottom - this.top;
        }
    }, {
        key: 'maxY',
        get: function get() {
            return Math.max(this.bottom, this.top);
        }
    }, {
        key: 'minY',
        get: function get() {
            return Math.min(this.bottom, this.top);
        }
    }, {
        key: 'minX',
        get: function get() {
            return Math.min(this.left, this.right);
        }
    }, {
        key: 'maxX',
        get: function get() {
            return Math.max(this.left, this.right);
        }
    }, {
        key: 'xMidpoint',
        get: function get() {
            return (this.left + this.right) / 2;
        }
    }, {
        key: 'yMidpoint',
        get: function get() {
            return (this.top + this.bottom) / 2;
        }
    }, {
        key: 'area',
        get: function get() {
            return this.width * this.height;
        }
    }]);

    return Rect;
})();

exports.Rect = Rect;

},{}],10:[function(require,module,exports){
'use strict';

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

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
            var retInitialised = false;
            getter = getter || exports.identity;
            for (i = 0; i < array.length; i++) {
                var value = getter(array[i], i);
                if (!ignoreMissing || !exports.isMissingValue(value)) {
                    ret = retInitialised ? func(ret, value) : value;
                    retInitialised = true;
                }
            }
        }
        return ret;
    };

    exports.sign = Math.sign || function (n) {
        return n > 0 ? 1 : n < 0 ? -1 : 0;
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
                        if (deepAssign && !Array.isArray(nextValue) && (typeof nextValue === 'undefined' ? 'undefined' : _typeof(nextValue)) === 'object' && nextValue !== null) to[nextKey] = innerAssign(true, {}, [to[nextKey], nextValue]);else to[nextKey] = nextValue;
                    }
                }
            }
            return to;
        }
    };

    exports.none = function (array) {
        return array.every(function (elem) {
            return !elem;
        });
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
        decimalPlaces = decimalPlaces < precision ? -decimalPlaces + precision - 1 : 0;
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

},{}],11:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Rect = require('./helpers/rect').Rect;
var Utils = require('./helpers/utils');
var renderer = require('./renderer.base');
var Tayberry = require('./base.js').Tayberry;

var BarRenderer = (function (_renderer$Renderer) {
    _inherits(BarRenderer, _renderer$Renderer);

    function BarRenderer() {
        _classCallCheck(this, BarRenderer);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(BarRenderer).apply(this, arguments));
    }

    _createClass(BarRenderer, [{
        key: 'drawPlot',
        value: function drawPlot() {
            this.ctx.save();
            var barEnumerator = new BarEnumerator(this);
            var bar = undefined;
            while (bar = barEnumerator.next()) {
                this.ctx.fillStyle = bar.selected ? bar.renderedSeries.highlightColour : bar.renderedSeries.colour;
                this.ctx.fillRect(bar.rect.left, bar.rect.top, bar.rect.width, bar.rect.height);
            }
            this.ctx.restore();
        }
    }, {
        key: 'drawLabels',
        value: function drawLabels() {
            if (this.tb.options.labels.enabled) {
                this.ctx.save();
                var barEnumerator = new BarEnumerator(this);
                var bar = undefined;
                while (bar = barEnumerator.next()) {
                    this.ctx.font = this.tb.labelFont;
                    this.ctx.fillStyle = this.tb.options.labels.font.colour;
                    this.drawLabel(bar.value, bar.series.yAxis.options.labelFormatter(bar.value), bar.rect);
                }
                this.ctx.restore();
            }
        }
    }, {
        key: 'hitTest',
        value: function hitTest(x, y) {
            // TODO: Optimise
            var ret = {
                found: false,
                plotType: 'bar',
                isXRange: true
            };

            var categoryCount = this.renderedSeries[0].data.length;
            var isHorizontal = this.tb.options.swapAxes;
            var plotArea = this.tb.plotArea.clone();
            if (isHorizontal) plotArea.swapXY();
            var categoryIndex = Math.floor(categoryCount * ((isHorizontal ? y : x) - plotArea.left) / plotArea.width);

            var matches = [];

            var barEnumerator = new BarEnumerator(this, categoryIndex);
            var bar = undefined;
            while (bar = barEnumerator.next()) {
                if (bar.categoryIndex > categoryIndex) break;
                var sortDistance = undefined,
                    priority = undefined,
                    realDistance = undefined;
                if (bar.rect.containsPoint(x, y)) {
                    sortDistance = 0;
                    priority = 0;
                } else if (bar.rect.containsX(x)) {
                    sortDistance = y < bar.rect.top ? bar.rect.top - y : y - bar.rect.bottom;
                    priority = isHorizontal ? 2 : 1;
                } else if (bar.rect.containsY(y)) {
                    sortDistance = x < bar.rect.left ? bar.rect.left - x : x - bar.rect.right;
                    priority = isHorizontal ? 1 : 2;
                } else {
                    var xDist = Math.min(Math.abs(x - bar.rect.left), Math.abs(x - bar.rect.right));
                    var yDist = Math.min(Math.abs(y - bar.rect.top), Math.abs(y - bar.rect.bottom));
                    realDistance = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
                    sortDistance = isHorizontal ? yDist : xDist;
                    priority = 3;
                }

                if (typeof realDistance === 'undefined') realDistance = sortDistance;

                matches.push({
                    sortDistance: sortDistance,
                    distance: realDistance,
                    priority: priority,
                    data: {
                        categoryIndex: bar.categoryIndex,
                        seriesIndex: bar.seriesIndex,
                        rect: bar.rect,
                        series: this.series[bar.seriesIndex],
                        value: Tayberry.getDataValue(this.series[bar.seriesIndex].data[bar.categoryIndex])
                    }
                });
            }

            if (matches.length) {
                matches.sort(function (a, b) {
                    var ret = a.priority - b.priority;
                    if (!ret) ret = a.sortDistance - b.sortDistance;
                    if (!ret) ret = a.data.rect.height - b.data.rect.height;
                    return ret;
                });
                ret.found = true;
                ret.normalisedDistance = matches[0].distance + Math.sqrt(matches[0].data.rect.area);
                ret = Utils.assign(ret, matches[0].data);
            }
            return ret;
        }
    }]);

    return BarRenderer;
})(renderer.Renderer);

var BarEnumerator = (function (_renderer$ByCategoryE) {
    _inherits(BarEnumerator, _renderer$ByCategoryE);

    function BarEnumerator(renderer) {
        var startCategoryIndex = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

        _classCallCheck(this, BarEnumerator);

        var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(BarEnumerator).call(this, renderer, startCategoryIndex));

        if (_this2.categoryCount) {
            _this2.isStacked = _this2.tb.options.barPlot.mode === 'stacked';
            _this2.isOverlaid = _this2.tb.options.barPlot.mode === 'overlaid';
            _this2.isNormal = !_this2.isStacked && !_this2.isOverlaid;
            _this2.barCount = _this2.isStacked || _this2.isOverlaid ? 1 : _this2.seriesCount;
            _this2.categoryWidth = _this2.plotArea.width / _this2.categoryCount;
            // used for stacked bar charts - must be on single y-axis
            _this2.yOrigin = _this2.renderer.series[0].yAxis.getOrigin();

            _this2.onNewCategory();
        }
        return _this2;
    }

    _createClass(BarEnumerator, [{
        key: 'onNewCategory',
        value: function onNewCategory() {
            this.yBottomPositive = this.yOrigin;
            this.yBottomNegative = this.yOrigin;
            this.yRunningTotalPositive = 0;
            this.yRunningTotalNegative = 0;
            this.barIndex = 0;
        }
    }, {
        key: 'next',
        value: function next() {
            var ret = undefined;

            if (this.categoryIndex < this.categoryCount) {
                var series = this.renderer.renderedSeries[this.seriesIndex];
                var value = Tayberry.getDataValue(series.data[this.categoryIndex]);
                var categoryXStart = this.plotArea.left + Math.floor(this.categoryIndex * this.categoryWidth);
                var categoryXEnd = this.plotArea.left + Math.floor((this.categoryIndex + 1) * this.categoryWidth);
                var barXStart = categoryXStart + Math.ceil(this.categoryWidth * this.tb.options.barPlot.categorySpacing / 2);
                var barXEnd = categoryXEnd - Math.floor(this.categoryWidth * this.tb.options.barPlot.categorySpacing / 2);

                var barWidth = Math.floor((barXEnd - barXStart) / this.barCount);
                var xStart = Math.floor(barXStart + this.barIndex * barWidth);
                var xEnd = Math.ceil(barXStart + (this.barIndex + 1) * barWidth);

                var yTop = series.yAxis.getValueDisplacement(value + (value > 0 ? this.yRunningTotalPositive : this.yRunningTotalNegative));
                var rect = new Rect(xStart, yTop, xEnd, this.isStacked ? value > 0 ? this.yBottomPositive : this.yBottomNegative : series.yAxis.getOrigin());
                rect.left += Math.ceil(series.xAxis.mapLogicalXOrYUnit(this.tb.options.barPlot.barPadding) / 2);
                rect.right -= Math.floor(series.xAxis.mapLogicalXOrYUnit(this.tb.options.barPlot.barPadding) / 2);
                if (rect.right < rect.left) rect.right = rect.left;
                if (this.isHorizontal) rect.swapXY();
                rect.clip(this.tb.plotArea);

                ret = {
                    seriesIndex: this.seriesIndex,
                    categoryIndex: this.categoryIndex,
                    series: this.renderer.series[this.seriesIndex],
                    renderedSeries: this.renderer.renderedSeries[this.seriesIndex],
                    value: Tayberry.getDataValue(this.renderer.series[this.seriesIndex].data[this.categoryIndex]),
                    renderedValue: Tayberry.getDataValue(this.renderer.renderedSeries[this.seriesIndex].data[this.categoryIndex]),
                    rect: rect,
                    selected: this.tb.selectedItem.categoryIndex === this.categoryIndex && (this.tb.options.tooltips.shared || this.tb.selectedItem.series === this.renderer.series[this.seriesIndex])
                };

                if (this.isStacked) {
                    if (value > 0) {
                        this.yRunningTotalPositive += value;
                        this.yBottomPositive = yTop;
                    } else {
                        this.yRunningTotalNegative += value;
                        this.yBottomNegative = yTop;
                    }
                } else if (this.isNormal) {
                    this.barIndex++;
                }

                this.nextValue();
            }
            return ret;
        }
    }]);

    return BarEnumerator;
})(renderer.ByCategoryEnumerator);

exports.BarRenderer = BarRenderer;

},{"./base.js":2,"./helpers/rect":9,"./helpers/utils":10,"./renderer.base":12}],12:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Utils = require('./helpers/utils');
var Easing = require('./helpers/easing');
var Tayberry = require('./base').Tayberry;

var Renderer = (function () {
    function Renderer(ctx, tayberry, series) {
        _classCallCheck(this, Renderer);

        this.ctx = ctx;
        this.tb = tayberry;
        this.series = null;
        this.renderedSeries = null;
        this.setSeries(series);
    }

    _createClass(Renderer, [{
        key: 'setSeries',
        value: function setSeries(series) {
            var seriesIndex;
            this.series = series;
            this.renderedSeries = series.slice(0);
            for (seriesIndex = 0; seriesIndex < this.renderedSeries.length; seriesIndex++) {
                var actualSeries = this.series[seriesIndex];
                actualSeries.renderer = this;
                var elem = Utils.assign({}, actualSeries);
                elem.data = this.renderedSeries[seriesIndex].data.slice(0);
                if (elem.data.length && Array.isArray(elem.data[0])) {
                    for (var dataIndex = 0; dataIndex < elem.data.length; dataIndex++) {
                        elem.data[dataIndex] = elem.data[dataIndex].slice(0);
                    }
                }
                this.renderedSeries[seriesIndex] = elem;
            }
        }
    }, {
        key: 'onAnimationFrame',
        value: function onAnimationFrame(elapsedTime, totalTime) {
            var scaleFactor;
            scaleFactor = Math.min(Easing.inQuad(elapsedTime, totalTime), 1);
            for (var categoryIndex = 0; categoryIndex < this.series[0].data.length; categoryIndex++) {
                for (var seriesIndex = 0; seriesIndex < this.series.length; seriesIndex++) {
                    var series = this.series[seriesIndex];
                    var value = Tayberry.getDataValue(series.data[categoryIndex]);
                    var yOrigin = series.yAxis.min <= 0 && 0 <= series.yAxis.max ? 0 : series.yAxis.min > 0 ? series.yAxis.min : series.yAxis.max;
                    Tayberry.setDataValue(this.renderedSeries[seriesIndex].data, categoryIndex, yOrigin + scaleFactor * (value - yOrigin));
                }
            }
        }
    }, {
        key: 'drawLegendIndicator',
        value: function drawLegendIndicator(ctx, series, rect) {
            ctx.fillStyle = series.colour;
            ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
        }
    }, {
        key: 'drawLabel',
        value: function drawLabel(sign, text, rect) {
            if (this.tb.options.swapAxes) rect = rect.clone().swapXY();
            var x = (rect.left + rect.right) / 2;
            var y = undefined;
            if (this.tb.options.labels.verticalAlignment === 'top') y = rect.top;else if (this.tb.options.labels.verticalAlignment === 'bottom') y = rect.bottom;else y = (rect.top + rect.bottom) / 2;
            var baseline = 'middle';
            var align = 'center';
            if (this.tb.options.swapAxes) {
                var _ref = [y, x];
                x = _ref[0];
                y = _ref[1];

                if (this.tb.options.labels.verticalPosition === 'outside') align = 'left';else if (this.tb.options.labels.verticalPosition === 'inside') align = 'right';
            } else {
                baseline = Tayberry.mapVerticalPosition(sign, this.tb.options.labels.verticalPosition);
            }
            if (this.tb.plotArea.containsPoint(x, y)) {
                this.ctx.save();
                this.ctx.textAlign = align;
                this.ctx.textBaseline = baseline;
                this.ctx.fillText(text, x, y);
                this.ctx.restore();
            }
        }
    }, {
        key: 'drawPlot',
        value: function drawPlot() {}
    }, {
        key: 'drawLabels',
        value: function drawLabels() {}
    }, {
        key: 'hitTest',
        value: function hitTest() {}
    }]);

    return Renderer;
})();

var Enumerator = (function () {
    function Enumerator(renderer) {
        var startCategoryIndex = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

        _classCallCheck(this, Enumerator);

        this.renderer = renderer;
        this.tb = renderer.tb;

        this.categoryCount = this.renderer.renderedSeries[0].data.length;
        this.categoryIndex = 0;
        this.seriesIndex = 0;
        this.seriesCount = this.renderer.renderedSeries.length;
        if (this.categoryCount) {
            this.isHorizontal = this.tb.options.swapAxes;
            this.plotArea = this.tb.plotArea.clone();
            if (this.isHorizontal) this.plotArea.swapXY();
            this.startCategoryIndex = Math.max(startCategoryIndex, 0);
            this.startCategoryIndex = Math.min(this.startCategoryIndex, this.categoryCount - 1);
            this.categoryIndex = this.startCategoryIndex;
        }
    }

    _createClass(Enumerator, [{
        key: 'nextValue',
        value: function nextValue() {}
    }]);

    return Enumerator;
})();

var ByCategoryEnumerator = (function (_Enumerator) {
    _inherits(ByCategoryEnumerator, _Enumerator);

    function ByCategoryEnumerator() {
        _classCallCheck(this, ByCategoryEnumerator);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(ByCategoryEnumerator).apply(this, arguments));
    }

    _createClass(ByCategoryEnumerator, [{
        key: 'onNewCategory',
        value: function onNewCategory() {}
    }, {
        key: 'nextValue',
        value: function nextValue() {

            var value = undefined;
            do {
                if (this.seriesIndex + 1 === this.seriesCount) {
                    this.seriesIndex = 0;
                    this.categoryIndex++;
                    if (this.categoryIndex >= this.categoryCount) break;
                    this.onNewCategory();
                } else {
                    this.seriesIndex++;
                }
                value = Tayberry.getDataValue(this.renderer.renderedSeries[this.seriesIndex].data[this.categoryIndex]);
            } while (Utils.isMissingValue(value));
        }
    }]);

    return ByCategoryEnumerator;
})(Enumerator);

var BySeriesEnumerator = (function (_Enumerator2) {
    _inherits(BySeriesEnumerator, _Enumerator2);

    function BySeriesEnumerator() {
        _classCallCheck(this, BySeriesEnumerator);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(BySeriesEnumerator).apply(this, arguments));
    }

    _createClass(BySeriesEnumerator, [{
        key: 'nextValue',
        value: function nextValue() {

            var value = undefined;
            do {
                if (this.categoryIndex + 1 === this.categoryCount) {
                    this.categoryIndex = this.startCategoryIndex;
                    this.seriesIndex++;
                    if (this.seriesIndex >= this.seriesCount) break;
                } else {
                    this.categoryIndex++;
                }
                value = Tayberry.getDataValue(this.renderer.renderedSeries[this.seriesIndex].data[this.categoryIndex]);
            } while (Utils.isMissingValue(value));
        }
    }]);

    return BySeriesEnumerator;
})(Enumerator);

exports.Renderer = Renderer;
exports.ByCategoryEnumerator = ByCategoryEnumerator;
exports.BySeriesEnumerator = BySeriesEnumerator;

},{"./base":2,"./helpers/easing":8,"./helpers/utils":10}],13:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Utils = require('./helpers/utils');
var Rect = require('./helpers/rect').Rect;
var renderer = require('./renderer.base');
var Tayberry = require('./base').Tayberry;

var autoMarkerIndex = 0;
var markers = ['square', 'diamond', 'circle', 'triangle', 'triangle-inversed'];

var LineRenderer = (function (_renderer$Renderer) {
    _inherits(LineRenderer, _renderer$Renderer);

    function LineRenderer() {
        _classCallCheck(this, LineRenderer);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(LineRenderer).apply(this, arguments));
    }

    _createClass(LineRenderer, [{
        key: 'setSeries',
        value: function setSeries(series) {
            var totalPoints = 0;
            for (var i = 0; i < series.length; i++) {
                if (!series[i].markerType) {
                    series[i].markerType = markers[autoMarkerIndex % markers.length];
                    autoMarkerIndex++;
                }
                totalPoints += series[i].data.length;
            }
            var showMarkers = this.tb.options.linePlot.showMarkers;
            this.showMarkers = showMarkers === 'auto' ? totalPoints < this.tb.options.linePlot.noMarkersThreshold : showMarkers;
            _get(Object.getPrototypeOf(LineRenderer.prototype), 'setSeries', this).call(this, series);
        }
    }, {
        key: 'drawMarker',
        value: function drawMarker(type, x, y, size) {
            var ctx = arguments.length <= 4 || arguments[4] === undefined ? this.ctx : arguments[4];

            if (type === 'square') {
                ctx.fillRect(x - size / 2, y - size / 2, size, size);
            } else if (type === 'diamond') {
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(-Math.PI / 4);
                ctx.fillRect(0 - size / 2, 0 - size / 2, size, size);
                ctx.restore();
            } else if (type === 'circle') {
                size = Math.round(size * 1.2);
                ctx.beginPath();
                ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
                ctx.fill();
            } else if (type === 'triangle' || type === 'triangle-inversed' && (size = -size)) {
                size = Math.round(size * 1.2);
                ctx.beginPath();
                ctx.moveTo(x - size / 2, y + size / 2);
                ctx.lineTo(x, y - size / 2);
                ctx.lineTo(x + size / 2, y + size / 2);
                ctx.closePath();
                ctx.fill();
            }
        }
    }, {
        key: 'drawPlot',
        value: function drawPlot() {
            this.ctx.save();
            var pointEnumerator = new PointEnumerator(this);
            var pt = undefined;
            while (pt = pointEnumerator.next()) {
                if (pt.firstPoint) {
                    this.ctx.lineWidth = pt.seriesSelected ? this.tb.options.linePlot.highlightedLineWidth : this.tb.options.linePlot.lineWidth;
                    this.ctx.strokeStyle = pt.seriesSelected ? pt.renderedSeries.highlightColour : pt.renderedSeries.colour;
                    this.ctx.beginPath();
                    this.ctx.moveTo(pt.x, pt.y);
                } else {
                    this.ctx.lineTo(pt.x, pt.y);
                }
                if (pt.lastPoint) {
                    this.ctx.stroke();
                }
            }
            if (this.showMarkers) {
                pointEnumerator = new PointEnumerator(this);
                while (pt = pointEnumerator.next()) {
                    if (pt.selected) {
                        this.ctx.fillStyle = pt.renderedSeries.glowColour;
                        this.drawMarker(pt.renderedSeries.markerType, pt.x, pt.y, this.tb.options.linePlot.highlightedMarkerSize);
                    }
                    this.ctx.fillStyle = pt.renderedSeries.colour;
                    this.drawMarker(pt.renderedSeries.markerType, pt.x, pt.y, this.tb.options.linePlot.markerSize);
                }
            }
            this.ctx.restore();
        }
    }, {
        key: 'drawLegendIndicator',
        value: function drawLegendIndicator(ctx, series, rect) {
            ctx.save();
            ctx.lineWidth = 2;
            ctx.strokeStyle = series.colour;
            this.tb.drawLine(rect.left, rect.yMidpoint, rect.right, rect.yMidpoint);
            ctx.fillStyle = series.colour;
            this.drawMarker(series.markerType, rect.xMidpoint, rect.yMidpoint, this.tb.options.linePlot.markerSize, ctx);
            ctx.restore();
        }
    }, {
        key: 'drawLabels',
        value: function drawLabels() {
            if (this.tb.options.labels.enabled) {
                this.ctx.save();
                this.ctx.font = this.tb.labelFont;
                this.ctx.fillStyle = this.tb.options.labels.font.colour;
                var pointEnumerator = new PointEnumerator(this);
                var pt = undefined;
                while (pt = pointEnumerator.next()) {
                    var rect = new Rect(pt.x, pt.y, pt.x, pt.y).inflate(this.tb.options.linePlot.markerSize / 2);
                    this.drawLabel(pt.value, pt.series.yAxis.options.labelFormatter(pt.value), rect);
                }
                this.ctx.restore();
            }
        }
    }, {
        key: 'hitTest',
        value: function hitTest(x, y) {
            // TODO: Optimise
            var ret = {
                found: false,
                plotType: 'line',
                isXRange: false
            };

            var matches = [];

            var pointEnumerator = new PointEnumerator(this);
            var pt = undefined;
            while (pt = pointEnumerator.next()) {
                var distance = Math.sqrt(Math.pow(pt.x - x, 2) + Math.pow(pt.y - y, 2));
                var horizontalDistance = Math.abs(this.tb.options.swapAxes ? pt.y - y : pt.x - x);
                matches.push({ distance: distance, horizontalDistance: horizontalDistance, priority: 0, data: pt });
                //if (!pt.firstPoint) {
                //    if (x >= lastPt.x && x < pt.x) {
                //const alpha = Math.arctan((pt.y - lastPt.y) / (pt.x - lastPt.x));
                //const yAtX = (x - lastPt.x) * Math.tan(alpha) + lastPt.y;
                //if (yAtX - 2 <= y < yAtX + 2) {
                //    matches.push({
                //        categoryIndex: pt.categoryIndex,
                //        seriesIndex: pt.seriesIndex,
                //        x: bar.rect,
                //        series: this.series[bar.seriesIndex],
                //        dataPoint: this.series[bar.seriesIndex].data[bar.categoryIndex]
                //
                //    })
                //}
                //}
                //}
                //lastPt = pt;
            }
            if (matches.length) {
                matches.sort(function (e1, e2) {
                    return e1.horizontalDistance - e2.horizontalDistance || e1.distance - e2.distance;
                });
                if (true || matches[0].distance <= 5) {
                    pt = matches[0].data;
                    var rect = new Rect(pt.x, pt.y, pt.x, pt.y).inflate(this.tb.options.linePlot.markerSize / 2);
                    Utils.assign(ret, [{
                        found: true,
                        rect: rect,
                        normalisedDistance: matches[0].distance + Math.sqrt(rect.area)
                    }, pt]);
                }
            }

            return ret;
        }
    }]);

    return LineRenderer;
})(renderer.Renderer);

var PointEnumerator = (function (_renderer$BySeriesEnu) {
    _inherits(PointEnumerator, _renderer$BySeriesEnu);

    function PointEnumerator() {
        _classCallCheck(this, PointEnumerator);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(PointEnumerator).apply(this, arguments));
    }

    _createClass(PointEnumerator, [{
        key: 'next',
        value: function next() {
            var ret = undefined;

            if (this.seriesIndex < this.seriesCount) {
                var series = this.renderer.renderedSeries[this.seriesIndex];
                var value = Tayberry.getDataValue(series.data[this.categoryIndex]);
                var xValue = Tayberry.getDataXValue(series.data, this.categoryIndex);
                var x = series.xAxis.getValueDisplacement(xValue);
                var y = series.yAxis.getValueDisplacement(value);

                if (this.isHorizontal) {
                    ;

                    var _ref = [y, x];
                    x = _ref[0];
                    y = _ref[1];
                }ret = {
                    firstPoint: this.categoryIndex === 0,
                    lastPoint: this.categoryIndex + 1 === this.categoryCount,
                    seriesIndex: this.seriesIndex,
                    categoryIndex: this.categoryIndex,
                    series: this.renderer.series[this.seriesIndex],
                    renderedSeries: this.renderer.renderedSeries[this.seriesIndex],
                    value: Tayberry.getDataValue(this.renderer.series[this.seriesIndex].data[this.categoryIndex]),
                    renderedValue: Tayberry.getDataValue(this.renderer.renderedSeries[this.seriesIndex].data[this.categoryIndex]),
                    x: x,
                    y: y,
                    seriesSelected: !this.tb.options.tooltips.shared && this.tb.selectedItem.series === this.renderer.series[this.seriesIndex],
                    selected: this.tb.selectedItem.categoryIndex === this.categoryIndex && (this.tb.options.tooltips.shared || this.tb.selectedItem.series === this.renderer.series[this.seriesIndex])
                };

                this.nextValue();
            }
            return ret;
        }
    }]);

    return PointEnumerator;
})(renderer.BySeriesEnumerator);

exports.LineRenderer = LineRenderer;

},{"./base":2,"./helpers/rect":9,"./helpers/utils":10,"./renderer.base":12}],14:[function(require,module,exports){
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
    var _this = this;

    var MAX_AXIS_CALC_SIZE_ATTEMPTS = 5;

    this.plotArea = new Rect(0, 0, this.labelsCanvas.width, this.labelsCanvas.height);
    if (this.options.title.text) {
        this.plotArea.top += this.mapLogicalYUnit(this.options.elementSmallPadding);
        this.plotArea.top += this.getFontHeight(this.options.title.font) * this.getMultilineTextHeight(this.titleFont, this.labelsCanvas.width, this.options.title.text);
    }
    if (this.options.legend.enabled) this.plotArea.bottom -= this.mapLogicalYUnit(this.options.elementSmallPadding + this.options.elementLargePadding + this.options.legend.indicatorSize);

    this.yAxes.map(function (e) {
        return e.adjustSize(_this.plotArea, true, true);
    });
    this.xAxes.map(function (e) {
        return e.adjustSize(_this.plotArea, true, true);
    });

    for (var i = 0; i < MAX_AXIS_CALC_SIZE_ATTEMPTS; i++) {
        this.yAxes.map(function (e) {
            return e.calculateExtent();
        });
        this.xAxes.map(function (e) {
            return e.calculateExtent();
        });
        this.yAxes.map(function (e) {
            return e.updateFormatter();
        });
        this.xAxes.map(function (e) {
            return e.updateFormatter();
        });
        if (Utils.none(this.yAxes.map(function (e) {
            return e.adjustSize(_this.plotArea);
        })) && Utils.none(this.xAxes.map(function (e) {
            return e.adjustSize(_this.plotArea);
        }))) break;
    }
    this.plotArea.left = Math.ceil(this.plotArea.left);
    this.plotArea.top = Math.ceil(this.plotArea.top);
    this.plotArea.right = Math.floor(this.plotArea.right);
    this.plotArea.bottom = Math.floor(this.plotArea.bottom);
};

Tayberry.prototype.hitTest = function (x, y) {
    var ret = {
        found: false
    };
    var matches = [];
    for (var i = 0; i < this.renderers.length; i++) {
        var hitTestResult = this.renderers[i].hitTest(x, y);
        if (hitTestResult.found) {
            matches.push(hitTestResult);
        }
    }
    if (matches.length) {
        matches.sort(function (a, b) {
            return a.normalisedDistance - b.normalisedDistance;
        });
        ret = matches[0];
    }
    return ret;
};

},{"./base.js":2,"./helpers/rect":9,"./helpers/utils":10}],15:[function(require,module,exports){
'use strict';

(function () {
    'use strict';

    var Tayberry = require('./base.js').Tayberry;
    require('./axis.js');
    require('./core.js');
    require('./drawing.js');
    require('./events.js');
    require('./defaults.js');
    require('./sizing.js');

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

},{"./axis.js":1,"./base.js":2,"./core.js":3,"./defaults.js":4,"./drawing.js":5,"./events.js":6,"./sizing.js":14}]},{},[15])(15)
});


//# sourceMappingURL=tayberry.js.map
