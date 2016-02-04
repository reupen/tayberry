(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.Tayberry = factory());
}(this, function () { 'use strict';

    var babelHelpers = {};
    babelHelpers.typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
    };

    babelHelpers.classCallCheck = function (instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    };

    babelHelpers.createClass = function () {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();

    babelHelpers.get = function get(object, property, receiver) {
      if (object === null) object = Function.prototype;
      var desc = Object.getOwnPropertyDescriptor(object, property);

      if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);

        if (parent === null) {
          return undefined;
        } else {
          return get(parent, property, receiver);
        }
      } else if ("value" in desc) {
        return desc.value;
      } else {
        var getter = desc.get;

        if (getter === undefined) {
          return undefined;
        }

        return getter.call(receiver);
      }
    };

    babelHelpers.inherits = function (subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }

      subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
          value: subClass,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    };

    babelHelpers.possibleConstructorReturn = function (self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }

      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    };

    babelHelpers.slicedToArray = function () {
      function sliceIterator(arr, i) {
        var _arr = [];
        var _n = true;
        var _d = false;
        var _e = undefined;

        try {
          for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
            _arr.push(_s.value);

            if (i && _arr.length === i) break;
          }
        } catch (err) {
          _d = true;
          _e = err;
        } finally {
          try {
            if (!_n && _i["return"]) _i["return"]();
          } finally {
            if (_d) throw _e;
          }
        }

        return _arr;
      }

      return function (arr, i) {
        if (Array.isArray(arr)) {
          return arr;
        } else if (Symbol.iterator in Object(arr)) {
          return sliceIterator(arr, i);
        } else {
          throw new TypeError("Invalid attempt to destructure non-iterable instance");
        }
      };
    }();

    babelHelpers;

    var Tayberry$1 = function () {
        function Tayberry() {
            babelHelpers.classCallCheck(this, Tayberry);

            this.selectedItem = {};
            this.containerElement = null;
            this.labelsCanvas = null;
            this.labelsCtx = null;
            this.options = null;
            this.scaleFactor = null;
            this.titleFont = null;
            this.plotArea = null;
            this.categories = [];
            this.titleFont = null;
            this.labelFont = null;
            this.legendFont = null;
            this.renderers = [];
            this.onClickReal = null;
            this.onMouseLeaveReal = null;
            this.onMouseMoveReal = null;
            this.onWindowResizeReal = null;
            this.pendingAnimations = [];
            this.callbacks = {
                onResize: [],
                onInit: []
            };
        }

        babelHelpers.createClass(Tayberry, [{
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
    }();

    function identity(obj) {
        return obj;
    }

    function isMissingValue(n) {
        return n === null || typeof n === 'undefined' || isNaN(n) && typeof n === 'number';
    }

    function coalesce() {
        for (var _len = arguments.length, vals = Array(_len), _key = 0; _key < _len; _key++) {
            vals[_key] = arguments[_key];
        }

        for (var i = 0; i < vals.length; i++) {
            if (!isMissingValue(vals[i])) {
                return vals[i];
            }
        }
    }

    function reduce(array, func, getter) {
        var ignoreMissing = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

        var ret, i;
        if (array.reduce && !getter && !ignoreMissing) {
            ret = array.reduce(function (a, b) {
                return func(a, b);
            });
        } else {
            var retInitialised = false;
            getter = getter || identity;
            for (i = 0; i < array.length; i++) {
                var value = getter(array[i], i);
                if (!ignoreMissing || !isMissingValue(value)) {
                    ret = retInitialised ? func(ret, value) : value;
                    retInitialised = true;
                }
            }
        }
        return ret;
    }

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
                        if (deepAssign && !Array.isArray(nextValue) && (typeof nextValue === 'undefined' ? 'undefined' : babelHelpers.typeof(nextValue)) === 'object' && nextValue !== null) to[nextKey] = innerAssign(true, {}, [to[nextKey], nextValue]);else to[nextKey] = nextValue;
                    }
                }
            }
            return to;
        }
    };

    function none(array) {
        return array.every(function (elem) {
            return !elem;
        });
    }

    function assign(targetObject, sourceObjects) {
        return innerAssign(false, targetObject, sourceObjects);
    }

    function deepAssign(targetObject, sourceObjects) {
        return innerAssign(true, targetObject, sourceObjects);
    }

    function formatString(formatString, formatValues, escapeAsHtml) {
        return formatString.replace(/{(\w+)}/g, function (match, placeholder) {
            var value = formatValues[placeholder];
            return typeof value !== 'undefined' ? escapeAsHtml ? stringToHtml(value) : value : match;
        });
    }

    function locateDecimalPoint(number) {
        return Math.floor(Math.log(number) / Math.log(10));
    }

    function formatNumberThousands(number) {
        var decimalPlaces = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

        var parts = number.toFixed(decimalPlaces).split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }

    function createAutoNumberFormatter(scale) {
        var prefix = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
        var suffix = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];
        var precision = arguments.length <= 3 || arguments[3] === undefined ? 2 : arguments[3];

        var decimalPlaces = locateDecimalPoint(scale);
        decimalPlaces = decimalPlaces < 0 ? -decimalPlaces + precision - 1 : 0;
        return function (x) {
            return prefix + formatNumberThousands(x, decimalPlaces) + suffix;
        };
    }

    function createFixedNumberFormatter(scale) {
        var prefix = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
        var suffix = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];
        var decimalPlaces = arguments.length <= 3 || arguments[3] === undefined ? 2 : arguments[3];

        return function (x) {
            return prefix + formatNumberThousands(x, decimalPlaces) + suffix;
        };
    }

    function createPercentageFormatter(scale) {
        var prefix = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
        var suffix = arguments.length <= 2 || arguments[2] === undefined ? '%' : arguments[2];
        var precision = arguments.length <= 3 || arguments[3] === undefined ? 2 : arguments[3];

        var decimalPlaces = locateDecimalPoint(scale * 100);
        decimalPlaces = decimalPlaces < precision ? -decimalPlaces + precision - 1 : 0;
        return function (x) {
            return prefix + formatNumberThousands(x * 100, decimalPlaces) + suffix;
        };
    }

    function stringToHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    function throttle(fn, threshold) {
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
    }

    var Axis = function () {
        babelHelpers.createClass(Axis, null, [{
            key: 'create',
            value: function create(tayberry, options, index, axisType, xYSwapped) {
                var isHorizontal = axisType === 'x' && !xYSwapped || axisType === 'y' && xYSwapped;
                if (options.type === 'linear') return new LinearAxis(tayberry, index, options, axisType, isHorizontal);else return new CategorialAxis(tayberry, index, options, axisType, isHorizontal);
            }
        }]);

        function Axis(tayberry, index, options, axisType, isHorizontal) {
            babelHelpers.classCallCheck(this, Axis);

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

        babelHelpers.createClass(Axis, [{
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
                return reduce(ticks, Math.max, function (x) {
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
        }, {
            key: 'valueOrigin',
            get: function get() {
                return this.min <= 0 && 0 <= this.max ? 0 : this.min > 0 ? this.min : this.max;
            }
        }]);
        return Axis;
    }();

    var CategorialAxis = function (_Axis) {
        babelHelpers.inherits(CategorialAxis, _Axis);

        function CategorialAxis() {
            babelHelpers.classCallCheck(this, CategorialAxis);
            return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(CategorialAxis).apply(this, arguments));
        }

        babelHelpers.createClass(CategorialAxis, [{
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
                    this.options.labelFormatter = identity;
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
    }(Axis);

    var LinearAxis = function (_Axis2) {
        babelHelpers.inherits(LinearAxis, _Axis2);

        function LinearAxis() {
            babelHelpers.classCallCheck(this, LinearAxis);
            return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(LinearAxis).apply(this, arguments));
        }

        babelHelpers.createClass(LinearAxis, [{
            key: 'updateFormatter',
            value: function updateFormatter() {
                if (!this.options.labelFormatter) {
                    if (this.options.labelFormat === 'percentage') {
                        this.options.labelFormatter = createPercentageFormatter(this.max - this.min, this.options.labelPrefix, this.options.labelSuffix);
                    } else if (this.options.labelFormat === 'currency') {
                        this.options.labelFormatter = createFixedNumberFormatter(this.max - this.min, this.options.labelPrefix || this.options.currencySymbol, this.options.labelSuffix);
                    } else {
                        this.options.labelFormatter = createAutoNumberFormatter(this.max - this.min, this.options.labelPrefix, this.options.labelSuffix);
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
                var overriddenStart = !isMissingValue(targetStart);
                var overriddenEnd = !isMissingValue(targetEnd);

                if (!overriddenStart || !overriddenEnd) {
                    var _ref2 = this.isYAxis ? this.tayberry.getDataMinMax(this) : this.tayberry.getDataXMinMax(this);

                    var _ref3 = babelHelpers.slicedToArray(_ref2, 2);

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
                    return formatString('{0} ≤ x < {1}', [this.options.labelFormatter(this.min + start * axisRange), this.options.labelFormatter(this.min + end * axisRange)]);
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
    }(Axis);

    var Colour = function () {
        /**
         * Constructs a Colour object.
         *
         * @param colourCode    an HTML colour code in hex or integer (rgb) form
         */

        function Colour() {
            babelHelpers.classCallCheck(this, Colour);

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

        babelHelpers.createClass(Colour, [{
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
                    this.a = 1.0;
                } else if (groupsInt) {
                    this.r = parseInt(groupsInt[1]);
                    this.g = parseInt(groupsInt[2]);
                    this.b = parseInt(groupsInt[3]);
                    this.a = groupsInt[5] ? parseFloat(groupsInt[5]) : 1.0;
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
            key: 'multiplyAlpha',
            value: function multiplyAlpha(multiplier) {
                this.a *= multiplier;
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
                if (!isMissingValue(this.a) && this.a !== 1.0) {
                    ret = formatString('rgba({r},{g},{b},{a})', this);
                } else {
                    ret = formatString('rgb({r},{g},{b})', this);
                }
                return ret;
            }
        }, {
            key: 'sum',
            get: function get() {
                return this.r + this.g + this.b;
            }
        }], [{
            key: 'createFromBlend',
            value: function createFromBlend(colour1, colour2, blendPosition) {
                var blender = function blender(c1, c2) {
                    return c1 + blendPosition * (c2 - c1);
                };
                return new Colour({
                    r: blender(colour1.r, colour2.r),
                    g: blender(colour1.g, colour2.g),
                    b: blender(colour1.b, colour2.b),
                    a: blender(coalesce(colour1.a, 1), coalesce(colour2.a, 1))
                }).clip();
            }
        }]);
        return Colour;
    }();

    var visibilityState = {
        visible: 1 << 0,
        hidden: 1 << 1,
        transitioning: 1 << 2
    };

    var Renderer = function () {
        function Renderer(ctx, tayberry, series) {
            babelHelpers.classCallCheck(this, Renderer);

            this.ctx = ctx;
            this.tb = tayberry;
            this.series = null;
            this.setSeries(series);
        }

        babelHelpers.createClass(Renderer, [{
            key: 'setSeries',
            value: function setSeries(series) {
                var seriesIndex;
                this.series = series;

                for (seriesIndex = 0; seriesIndex < this.series.length; seriesIndex++) {
                    var _series = this.series[seriesIndex];
                    _series.renderer = this;
                }
            }
        }, {
            key: 'getVisibleSeriesCount',
            value: function getVisibleSeriesCount(excludeSeries) {
                var ret = 0;
                for (var index = 0; index < this.series.length; index++) {
                    if (index !== excludeSeries) {
                        var series = this.series[index];
                        if (series.visible & visibilityState.visible) ret++;
                    }
                }
                return ret;
            }
        }, {
            key: 'onToggleSeriesAnimationFrame',
            value: function onToggleSeriesAnimationFrame() {}
        }, {
            key: 'onAnimationFrame',
            value: function onAnimationFrame() {
                this.onToggleSeriesAnimationFrame();
            }
        }, {
            key: 'drawLegendIndicator',
            value: function drawLegendIndicator(ctx, series, rect, highlighted) {
                ctx.fillStyle = highlighted ? series.highlightColour : series.colour;
                if (!(series.visible & visibilityState.visible)) ctx.fillStyle = new Colour(ctx.fillStyle).multiplyAlpha(this.tb.options.legend.hiddenAlphaMultiplier).toString();
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
                    baseline = Tayberry$1.mapVerticalPosition(sign, this.tb.options.labels.verticalPosition);
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
    }();

    var Enumerator = function () {
        function Enumerator(renderer) {
            var startCategoryIndex = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
            babelHelpers.classCallCheck(this, Enumerator);

            this.renderer = renderer;
            this.tb = renderer.tb;

            this.categoryCount = this.renderer.series[0].data.length;
            this.categoryIndex = 0;
            this.seriesIndex = 0;
            this.seriesCount = this.renderer.series.length;
            if (this.categoryCount) {
                this.isHorizontal = this.tb.options.swapAxes;
                this.plotArea = this.tb.plotArea.clone();
                if (this.isHorizontal) this.plotArea.swapXY();
                this.startCategoryIndex = Math.max(startCategoryIndex, 0);
                this.startCategoryIndex = Math.min(this.startCategoryIndex, this.categoryCount - 1);
                this.categoryIndex = this.startCategoryIndex;
            }
        }

        babelHelpers.createClass(Enumerator, [{
            key: 'nextValue',
            value: function nextValue() {}
        }]);
        return Enumerator;
    }();

    var ByCategoryEnumerator = function (_Enumerator) {
        babelHelpers.inherits(ByCategoryEnumerator, _Enumerator);

        function ByCategoryEnumerator() {
            babelHelpers.classCallCheck(this, ByCategoryEnumerator);
            return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(ByCategoryEnumerator).apply(this, arguments));
        }

        babelHelpers.createClass(ByCategoryEnumerator, [{
            key: 'nextValue',
            value: function nextValue() {

                var value = undefined;
                do {
                    if (this.seriesIndex + 1 === this.seriesCount) {
                        this.seriesIndex = 0;
                        this.categoryIndex++;
                        if (this.categoryIndex >= this.categoryCount) break;
                    } else {
                        this.seriesIndex++;
                    }
                    value = Tayberry$1.getDataValue(this.renderer.series[this.seriesIndex].data[this.categoryIndex]);
                } while (isMissingValue(value));
            }
        }]);
        return ByCategoryEnumerator;
    }(Enumerator);

    var BySeriesEnumerator = function (_Enumerator2) {
        babelHelpers.inherits(BySeriesEnumerator, _Enumerator2);

        function BySeriesEnumerator() {
            babelHelpers.classCallCheck(this, BySeriesEnumerator);
            return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(BySeriesEnumerator).apply(this, arguments));
        }

        babelHelpers.createClass(BySeriesEnumerator, [{
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
                    value = Tayberry$1.getDataValue(this.renderer.series[this.seriesIndex].data[this.categoryIndex]);
                } while (isMissingValue(value));
            }
        }]);
        return BySeriesEnumerator;
    }(Enumerator);

    var Rect = function () {
        function Rect() {
            babelHelpers.classCallCheck(this, Rect);

            if (arguments.length === 1) {
                if (babelHelpers.typeof(arguments[0]) === 'object') {
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

        babelHelpers.createClass(Rect, [{
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
                return Math.abs(this.width) * Math.abs(this.height);
            }
        }]);
        return Rect;
    }();

    var BarRenderer = function (_renderer$Renderer) {
        babelHelpers.inherits(BarRenderer, _renderer$Renderer);

        function BarRenderer(ctx, tayberry, series) {
            babelHelpers.classCallCheck(this, BarRenderer);

            var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(BarRenderer).call(this, ctx, tayberry, series));

            _this.barPositions = null;

            _this.tb.registerCallback('onResize', _this.updateBarWidths.bind(_this));
            _this.tb.registerCallback('onInit', _this.updateBarWidths.bind(_this));
            return _this;
        }

        babelHelpers.createClass(BarRenderer, [{
            key: 'updateBarWidths',
            value: function updateBarWidths() {
                var categoryCount = this.series[0].data.length;
                var isStacked = this.tb.options.barPlot.mode === 'stacked';
                var isOverlaid = this.tb.options.barPlot.mode === 'overlaid';
                var isNormal = !isStacked && !isOverlaid;
                var seriesCount = this.series.length;
                var plotArea = this.tb.options.swapAxes ? this.tb.plotArea.clone().swapXY() : this.tb.plotArea;
                var categoryWidth = plotArea.width / categoryCount;
                var animatingSeriesCount = 0;
                var totalMultiplier = 0;

                for (var seriesIndex = 0; seriesIndex < seriesCount; seriesIndex++) {
                    var series = this.series[seriesIndex];
                    var rState = series.rState;
                    if (series.animationState) {
                        if (!series.animationState.subtype) {
                            var visibleSeriesCount = this.getVisibleSeriesCount(seriesIndex);
                            if (isNormal && visibleSeriesCount > 0) {
                                series.animationState.subtype = 'width';
                            } else if (isStacked && visibleSeriesCount > 0) {
                                series.animationState.subtype = 'height';
                            } else {
                                series.animationState.subtype = 'fade';
                            }

                            rState.colour = series.colour;
                        }

                        var isShow = series.animationState.type === 'show';
                        if (series.animationState.subtype === 'width') {
                            rState.multiplier = isShow ? series.animationState.stage : 1 - series.animationState.stage;
                            rState.yMultiplier = 1;
                        } else if (series.animationState.subtype === 'height') {
                            rState.yMultiplier = isShow ? series.animationState.stage : 1 - series.animationState.stage;
                            rState.multiplier = 1;
                        } else {
                            var transColour = new Colour(series.colour);
                            transColour.a = 0;
                            if (isShow) rState.colour = Colour.createFromBlend(transColour, new Colour(series.colour), series.animationState.stage).toString();else rState.colour = Colour.createFromBlend(new Colour(series.colour), transColour, series.animationState.stage).toString();

                            rState.yMultiplier = 1;
                            rState.multiplier = 1;
                        }
                        ++animatingSeriesCount;
                    } else if (series.visible & visibilityState.visible) {
                        rState.multiplier = 1;
                        rState.yMultiplier = 1;
                    } else {
                        rState.multiplier = 0;
                        rState.yMultiplier = 0;
                    }
                    totalMultiplier += rState.multiplier;
                }

                var totalBarsPerCategory = isStacked || isOverlaid ? 1 : totalMultiplier;
                var yOrigin = this.series[0].yAxis.getOrigin();

                this.barPositions = [];

                for (var categoryIndex = 0; categoryIndex < categoryCount; categoryIndex++) {
                    var yBottomPositive = yOrigin;
                    var yBottomNegative = yOrigin;
                    var yRunningTotalPositive = 0;
                    var yRunningTotalNegative = 0;

                    var categoryXStart = plotArea.left + Math.floor(categoryIndex * categoryWidth);
                    var categoryXEnd = plotArea.left + Math.floor((categoryIndex + 1) * categoryWidth);
                    // FIXME: Need to map this.tb.options.barPlot.categorySpacing
                    var barXStart = categoryXStart + Math.ceil(categoryWidth * this.tb.options.barPlot.categorySpacing / 2);
                    var barXEnd = categoryXEnd - Math.floor(categoryWidth * this.tb.options.barPlot.categorySpacing / 2);

                    var categoryPositions = [];
                    var barIndex = 0;

                    var runningBarWidth = 0;

                    for (var seriesIndex = 0; seriesIndex < seriesCount; seriesIndex++) {
                        var series = this.series[seriesIndex];
                        var rState = series.rState;
                        var value = Tayberry$1.getDataValue(series.data[categoryIndex]) * rState.yMultiplier;

                        var barWidth = Math.floor(rState.multiplier * Math.floor((barXEnd - barXStart) / totalBarsPerCategory));

                        var xStart = Math.floor(barXStart + runningBarWidth) + Math.ceil(series.xAxis.mapLogicalXOrYUnit(this.tb.options.barPlot.barPadding) / 2);
                        var xEnd = Math.ceil(barXStart + runningBarWidth + barWidth) - Math.floor(series.xAxis.mapLogicalXOrYUnit(this.tb.options.barPlot.barPadding) / 2);
                        var yTop = series.yAxis.getValueDisplacement(value + (value > 0 ? yRunningTotalPositive : yRunningTotalNegative));
                        var yBottom = isStacked ? value > 0 ? yBottomPositive : yBottomNegative : yOrigin;

                        categoryPositions.push([xStart, yTop, xEnd, yBottom]);

                        if (isStacked) {
                            if (value > 0) {
                                yRunningTotalPositive += value;
                                yBottomPositive = yTop;
                            } else {
                                yRunningTotalNegative += value;
                                yBottomNegative = yTop;
                            }
                        } else if (isNormal) {
                            barIndex++;
                            runningBarWidth += barWidth;
                        }
                    }

                    this.barPositions.push(categoryPositions);
                }
            }
        }, {
            key: 'onToggleSeriesAnimationFrame',
            value: function onToggleSeriesAnimationFrame() {
                this.updateBarWidths();
            }
        }, {
            key: 'drawPlot',
            value: function drawPlot() {
                this.ctx.save();
                var barEnumerator = new BarEnumerator(this);
                var bar = undefined;
                while (bar = barEnumerator.next()) {
                    if (bar.series.visible & (visibilityState.visible | visibilityState.transitioning)) {
                        this.ctx.fillStyle = bar.selected ? bar.series.rState.highlightColour : bar.series.rState.colour;
                        this.ctx.fillRect(bar.rect.left, bar.rect.top, bar.rect.width, bar.rect.height);
                    }
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
                        if ((bar.series.visible & (visibilityState.visible | visibilityState.transitioning)) === visibilityState.visible) {
                            this.ctx.font = this.tb.labelFont;
                            this.ctx.fillStyle = this.tb.options.labels.font.colour;
                            this.drawLabel(bar.value, bar.series.yAxis.options.labelFormatter(bar.value), bar.rect);
                        }
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
                    type: 'plotItem',
                    isXRange: true
                };

                var categoryCount = this.series[0].data.length;
                var isHorizontal = this.tb.options.swapAxes;
                var plotArea = this.tb.plotArea.clone();
                if (isHorizontal) plotArea.swapXY();
                var categoryIndex = Math.floor(categoryCount * ((isHorizontal ? y : x) - plotArea.left) / plotArea.width);

                var matches = [];

                var barEnumerator = new BarEnumerator(this, categoryIndex);
                var bar = undefined;
                while (bar = barEnumerator.next()) {
                    if (bar.categoryIndex > categoryIndex) break;
                    if (!(bar.series.visible & (visibilityState.visible | visibilityState.transitioning))) continue;

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

                    if (!isMissingValue(realDistance)) {
                        matches.push({
                            sortDistance: sortDistance,
                            distance: realDistance,
                            priority: priority,
                            data: {
                                categoryIndex: bar.categoryIndex,
                                seriesIndex: bar.seriesIndex,
                                rect: bar.rect,
                                series: bar.series,
                                value: Tayberry$1.getDataValue(this.series[bar.seriesIndex].data[bar.categoryIndex])
                            }
                        });
                    }
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
                    if (ret.normalisedDistance < 0) {
                        ret.normalisedDistance = 0;
                    }
                    ret = assign(ret, matches[0].data);
                }
                return ret;
            }
        }]);
        return BarRenderer;
    }(Renderer);

    var BarEnumerator = function (_renderer$ByCategoryE) {
        babelHelpers.inherits(BarEnumerator, _renderer$ByCategoryE);

        function BarEnumerator() {
            babelHelpers.classCallCheck(this, BarEnumerator);
            return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(BarEnumerator).apply(this, arguments));
        }

        babelHelpers.createClass(BarEnumerator, [{
            key: 'next',
            value: function next() {
                var ret = undefined;

                if (this.categoryIndex < this.categoryCount) {
                    var _renderer$barPosition = babelHelpers.slicedToArray(this.renderer.barPositions[this.categoryIndex][this.seriesIndex], 4);

                    var xStart = _renderer$barPosition[0];
                    var yTop = _renderer$barPosition[1];
                    var xEnd = _renderer$barPosition[2];
                    var yBottom = _renderer$barPosition[3];

                    var rect = new Rect(xStart, yTop, xEnd, yBottom);

                    if (rect.right < rect.left) rect.right = rect.left;
                    if (this.isHorizontal) rect.swapXY();
                    rect.clip(this.tb.plotArea);

                    ret = {
                        seriesIndex: this.seriesIndex,
                        categoryIndex: this.categoryIndex,
                        series: this.renderer.series[this.seriesIndex],
                        value: Tayberry$1.getDataValue(this.renderer.series[this.seriesIndex].data[this.categoryIndex]),
                        rect: rect,
                        selected: this.tb.selectedItem.type === 'plotItem' && this.tb.selectedItem.categoryIndex === this.categoryIndex && (this.tb.options.tooltips.shared || this.tb.selectedItem.series === this.renderer.series[this.seriesIndex])
                    };

                    this.nextValue();
                }
                return ret;
            }
        }]);
        return BarEnumerator;
    }(ByCategoryEnumerator);

    var autoMarkerIndex = 0;
    var markers = ['square', 'diamond', 'circle', 'triangle', 'triangle-inversed'];

    var LineRenderer = function (_renderer$Renderer) {
        babelHelpers.inherits(LineRenderer, _renderer$Renderer);

        function LineRenderer(ctx, tayberry, series) {
            babelHelpers.classCallCheck(this, LineRenderer);

            var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(LineRenderer).call(this, ctx, tayberry, series));

            _this.pointPositions = null;

            _this.tb.registerCallback('onResize', _this.updatPointPositions.bind(_this));
            _this.tb.registerCallback('onInit', _this.updatPointPositions.bind(_this));
            return _this;
        }

        babelHelpers.createClass(LineRenderer, [{
            key: 'updatPointPositions',
            value: function updatPointPositions() {
                var seriesCount = this.series.length;

                this.pointPositions = [];

                for (var seriesIndex = 0; seriesIndex < seriesCount; seriesIndex++) {
                    var series = this.series[seriesIndex];
                    var rState = series.rState;
                    if (series.animationState) {
                        if (!series.animationState.subtype) {
                            series.animationState.subtype = 'height';
                        }

                        var isShow = series.animationState.type === 'show';
                        if (series.animationState.subtype === 'height') {
                            rState.yMultiplier = isShow ? series.animationState.stage : 1 - series.animationState.stage;
                            rState.xMultiplier = 1;
                        }
                    } else if (series.visible & visibilityState.visible) {
                        rState.xMultiplier = 1;
                        rState.yMultiplier = 1;
                    } else {
                        rState.xMultiplier = 1;
                        rState.yMultiplier = 0;
                    }
                }

                for (var seriesIndex = 0; seriesIndex < seriesCount; seriesIndex++) {
                    var series = this.series[seriesIndex];
                    var rState = series.rState;
                    var valueCount = series.data.length;
                    var yOrigin = series.yAxis.valueOrigin;
                    var seriesPositions = [];

                    for (var valueIndex = 0; valueIndex < valueCount; valueIndex++) {
                        var value = Tayberry$1.getDataValue(series.data[valueIndex]);
                        var xValue = Tayberry$1.getDataXValue(series.data, valueIndex);

                        var rValue = yOrigin + rState.yMultiplier * (value - yOrigin);
                        var x = series.xAxis.getValueDisplacement(xValue) * rState.xMultiplier;
                        var y = series.yAxis.getValueDisplacement(rValue);

                        seriesPositions.push([x, y]);
                    }

                    this.pointPositions.push(seriesPositions);
                }
            }
        }, {
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
                babelHelpers.get(Object.getPrototypeOf(LineRenderer.prototype), 'setSeries', this).call(this, series);
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
            key: 'onToggleSeriesAnimationFrame',
            value: function onToggleSeriesAnimationFrame() {
                this.updatPointPositions();
            }
        }, {
            key: 'drawPlot',
            value: function drawPlot() {
                this.ctx.save();
                var pointEnumerator = new PointEnumerator(this);
                var pt = undefined;
                while (pt = pointEnumerator.next()) {
                    if (!(pt.series.visible & (visibilityState.visible | visibilityState.transitioning))) continue;

                    if (pt.firstPoint) {
                        this.ctx.lineWidth = pt.seriesSelected ? this.tb.options.linePlot.highlightedLineWidth : this.tb.options.linePlot.lineWidth;
                        this.ctx.strokeStyle = pt.seriesSelected ? pt.series.rState.highlightColour : pt.series.rState.colour;
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
                        if (!(pt.series.visible & (visibilityState.visible | visibilityState.transitioning))) continue;

                        if (pt.selected) {
                            this.ctx.fillStyle = pt.series.rState.glowColour;
                            this.drawMarker(pt.series.markerType, pt.x, pt.y, this.tb.options.linePlot.highlightedMarkerSize);
                        }
                        this.ctx.fillStyle = pt.series.rState.colour;
                        this.drawMarker(pt.series.markerType, pt.x, pt.y, this.tb.options.linePlot.markerSize);
                    }
                }
                this.ctx.restore();
            }
        }, {
            key: 'drawLegendIndicator',
            value: function drawLegendIndicator(ctx, series, rect, highlighted) {
                var colour = highlighted ? series.highlightColour : series.colour;
                ctx.save();
                ctx.lineWidth = 2;
                ctx.strokeStyle = colour;
                this.tb.drawLine(rect.left, rect.yMidpoint, rect.right, rect.yMidpoint);
                ctx.fillStyle = colour;
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
                        if (!(pt.series.visible & (visibilityState.visible | visibilityState.transitioning))) continue;

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
                    type: 'plotItem',
                    isXRange: false
                };

                var matches = [];

                var pointEnumerator = new PointEnumerator(this);
                var pt = undefined;
                while (pt = pointEnumerator.next()) {
                    if (!(pt.series.visible & (visibilityState.visible | visibilityState.transitioning))) continue;

                    var distance = Math.sqrt(Math.pow(pt.x - x, 2) + Math.pow(pt.y - y, 2));
                    var horizontalDistance = Math.abs(this.tb.options.swapAxes ? pt.y - y : pt.x - x);
                    matches.push({
                        distance: distance,
                        horizontalDistance: horizontalDistance,
                        priority: 0,
                        data: pt
                    });
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
                        assign(ret, [{
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
    }(Renderer);

    var PointEnumerator = function (_renderer$BySeriesEnu) {
        babelHelpers.inherits(PointEnumerator, _renderer$BySeriesEnu);

        function PointEnumerator() {
            babelHelpers.classCallCheck(this, PointEnumerator);
            return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(PointEnumerator).apply(this, arguments));
        }

        babelHelpers.createClass(PointEnumerator, [{
            key: 'next',
            value: function next() {
                var ret = undefined;

                if (this.seriesIndex < this.seriesCount) {
                    var _renderer$pointPositi = babelHelpers.slicedToArray(this.renderer.pointPositions[this.seriesIndex][this.categoryIndex], 2);

                    var x = _renderer$pointPositi[0];
                    var y = _renderer$pointPositi[1];

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
                        value: Tayberry$1.getDataValue(this.renderer.series[this.seriesIndex].data[this.categoryIndex]),
                        x: x,
                        y: y,
                        seriesSelected: this.tb.selectedItem.type === 'plotItem' && !this.tb.options.tooltips.shared && this.tb.selectedItem.series === this.renderer.series[this.seriesIndex],
                        selected: this.tb.selectedItem.type === 'plotItem' && this.tb.selectedItem.categoryIndex === this.categoryIndex && (this.tb.options.tooltips.shared || this.tb.selectedItem.series === this.renderer.series[this.seriesIndex])
                    };

                    this.nextValue();
                }
                return ret;
            }
        }]);
        return PointEnumerator;
    }(BySeriesEnumerator);

    var currentAutoColourIndex = 0;

    Tayberry$1.getAutoColour = function () {
        var ret = Tayberry$1.defaultColours[currentAutoColourIndex % Tayberry$1.defaultColours.length];
        currentAutoColourIndex++;
        return ret;
    };

    Tayberry$1.getDataValue = function (dataPoint) {
        var ret = undefined;
        if (Array.isArray(dataPoint)) {
            ret = dataPoint[1];
        } else {
            ret = dataPoint;
        }
        return ret;
    };

    Tayberry$1.getDataXValue = function (data, index) {
        var ret = undefined;
        if (Array.isArray(data[index])) {
            ret = data[index][0];
        } else {
            ret = index;
        }
        return ret;
    };

    Tayberry$1.setDataValue = function (data, index, newValue) {
        if (Array.isArray(data[index])) {
            data[index][1] = newValue;
        } else {
            data[index] = newValue;
        }
    };

    Tayberry$1.prototype.createCanvas = function () {
        var ret = document.createElement('canvas');
        // IE11 hack-fix - clientWidth sometimes incorrect on first access
        ret.style.width = Math.floor(this.containerElement.clientWidth) + 'px';
        ret.style.width = Math.floor(this.containerElement.clientWidth) + 'px';
        ret.style.height = Math.floor(this.containerElement.clientHeight) + 'px';
        ret.style.position = 'absolute';
        this.containerElement.appendChild(ret);
        return ret;
    };

    Tayberry$1.prototype.create = function (containerElement) {
        if (typeof containerElement == 'string') {
            this.containerElement = document.getElementById(containerElement);
        } else {
            this.containerElement = containerElement;
        }
        this.labelsCanvas = this.createCanvas();
        this.labelsCtx = this.labelsCanvas.getContext('2d');
        this.plotCanvas = this.createCanvas();
        this.plotCtx = this.plotCanvas.getContext('2d');
        this.options = {};
        this.yAxes = null;
        this.xAxes = null;
        this.initialise();
    };

    Tayberry$1.prototype.destroy = function () {
        this.labelsCanvas.parentNode.removeChild(this.labelsCanvas);
        this.tooltipElement.parentNode.removeChild(this.tooltipElement);
        this.options = {};
        this.plotCanvas.removeEventListener('click', this.onClickReal);
        this.plotCanvas.removeEventListener('mousemove', this.onMouseMoveReal);
        this.plotCanvas.removeEventListener('mouseleave', this.onMouseLeaveReal);
        // this.plotCanvas.removeEventListener('touchstart', this.onTouchStartReal);
        window.removeEventListener('resize', this.onWindowResizeReal);
    };

    Tayberry$1.prototype.initialise = function () {
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

    Tayberry$1.prototype.getFontHeight = function (font, forDom) {
        var ret = font.size;
        if (font.autoScale) ret *= Math.pow(this.labelsCanvas.width / 800, 0.25);
        if (!forDom) ret = this.mapLogicalYUnit(ret);
        return ret;
    };

    Tayberry$1.prototype.createFontString = function (font, forDom) {
        return (font.style ? font.style + ' ' : '') + this.getFontHeight(font, forDom).toFixed(1) + 'px ' + font.face;
    };

    Tayberry$1.prototype.updateFonts = function () {
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

    Tayberry$1.prototype.setOptions = function (options) {
        var optionOverrides = [this.defaultOptions()];
        if (!options.presets) {
            options.presets = ['default'];
        }
        if (options.presets) {
            for (var index = 0; index < options.presets.length; index++) {
                optionOverrides.push(Tayberry$1.presets[options.presets[index]]);
            }
        }
        optionOverrides.push(options);
        this.options = deepAssign({}, optionOverrides);
        this.options.title.font = deepAssign({}, [this.options.font, this.options.title.font]);
        this.options.tooltips.font = deepAssign({}, [this.options.font, this.options.tooltips.font]);
        this.options.labels.font = deepAssign({}, [this.options.font, this.options.labels.font]);
        this.options.legend.font = deepAssign({}, [this.options.font, this.options.legend.font]);
        this.options.allAxes.font = deepAssign({}, [this.options.font, this.options.allAxes.font]);
        this.options.allAxes.title.font = deepAssign({}, [this.options.font, this.options.allAxes.title.font]);
        if (!Array.isArray(this.options.yAxis)) this.options.yAxis = [this.options.yAxis || {}];
        if (!Array.isArray(this.options.xAxis)) this.options.xAxis = [this.options.xAxis || {}];
        for (var i = 0; i < this.options.yAxis.length; i++) {
            this.options.yAxis[i] = deepAssign({}, [i === 0 ? Tayberry$1.defaultPrimaryYAxis : Tayberry$1.defaultSecondaryYAxis, this.options.allAxes, this.options.yAxis[i]]);
        }
        for (var i = 0; i < this.options.xAxis.length; i++) {
            this.options.xAxis[i] = deepAssign({}, [Tayberry$1.defaultXAxis, this.options.allAxes, this.options.xAxis[i]]);
        }
        for (var i = 0; i < this.options.series.length; i++) {
            this.options.series[i] = deepAssign({}, [Tayberry$1.defaultSeries, this.options.series[i]]);
        }

        this.yAxes = [];
        this.xAxes = [];
        for (var i = 0; i < this.options.xAxis.length; i++) {
            this.xAxes.push(Axis.create(this, this.options.xAxis[i], i, 'x', this.options.swapAxes));
        }
        for (var i = 0; i < this.options.yAxis.length; i++) {
            this.yAxes.push(Axis.create(this, this.options.yAxis[i], i, 'y', this.options.swapAxes));
        }
        this.updateFonts();
        this.createRenderers();
        this.calculatePlotArea();
        this.callbacks['onInit'].forEach(function (func) {
            return func();
        });
        this.plotCanvas.addEventListener('click', this.onClickReal = this.onClick.bind(this));
        this.plotCanvas.addEventListener('mousemove', this.onMouseMoveReal = this.onMouseMove.bind(this));
        this.plotCanvas.addEventListener('mouseleave', this.onMouseLeaveReal = this.onMouseLeave.bind(this));
        //this.plotCanvas.addEventListener('touchstart', this.onTouchStartReal = this.onTouchStart.bind(this));
        window.addEventListener('resize', this.onWindowResizeReal = throttle(this.onWindowResize, 50).bind(this));
    };

    Tayberry$1.calculateHighlightColour = function (colour) {
        var newColour = new Colour(colour);
        return newColour.increaseBy(30 * (newColour.sum >= 180 * 3 ? -1 : 1)).toString();
    };

    Tayberry$1.calculateGlowColour = function (highlightColour) {
        var newColour = new Colour(highlightColour);
        newColour.a = 0.4;
        return newColour.toString();
    };

    Tayberry$1.prototype.createRenderers = function () {
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
            curSeries.colour = curSeries.colour || Tayberry$1.getAutoColour();
            curSeries.highlightColour = curSeries.highlightColour || Tayberry$1.calculateHighlightColour(curSeries.colour);
            curSeries.glowColour = curSeries.glowColour || Tayberry$1.calculateGlowColour(curSeries.highlightColour);
            curSeries.rState = {
                colour: curSeries.colour,
                highlightColour: curSeries.highlightColour,
                glowColour: curSeries.glowColour
            };
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

    Tayberry$1.prototype.getDataMinMax = function (axis) {
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
                        var value = Tayberry$1.getDataValue(barSeries[seriesIndex].data[categoryIndex]);
                        if (!isMissingValue(value)) {
                            if (value < 0) {
                                seriesNegativeTotals[categoryIndex] += value;
                            } else {
                                seriesPositiveTotals[categoryIndex] += value;
                            }
                        }
                    }
                }
            }
            minStacked = Math.min(0, reduce(seriesNegativeTotals, Math.min, undefined, true));
            maxStacked = Math.max(reduce(seriesPositiveTotals, Math.max, undefined, true), 0);
        }
        {
            var seriesMinima = [];
            var seriesMaxima = [];
            for (var index = 0; index < this.options.series.length; index++) {
                var series = this.options.series[index];
                if (series.yAxis === axis && (series.plotType !== 'bar' || this.options.barPlot.mode !== 'stacked')) {
                    seriesMinima.push(reduce(series.data, Math.min, Tayberry$1.getDataValue, true));
                    seriesMaxima.push(reduce(series.data, Math.max, Tayberry$1.getDataValue, true));
                }
            }
            minNormal = reduce(seriesMinima, Math.min, undefined, true);
            maxNormal = reduce(seriesMaxima, Math.max, undefined, true);
        }
        var min = reduce([minNormal, minStacked], Math.min, undefined, true);
        var max = reduce([maxNormal, maxStacked], Math.max, undefined, true);
        return [min, max];
    };

    Tayberry$1.prototype.getDataXMinMax = function (axis) {
        var min, max;
        var seriesMinima = [];
        var seriesMaxima = [];
        for (var index = 0; index < this.options.series.length; index++) {
            var series = this.options.series[index];
            if (series.xAxis === axis) {
                seriesMinima.push(reduce(series.data, Math.min, Tayberry$1.getDataXValue, true));
                seriesMaxima.push(reduce(series.data, Math.max, Tayberry$1.getDataXValue, true));
            }
        }
        min = reduce(seriesMinima, Math.min, undefined, true);
        max = reduce(seriesMaxima, Math.max, undefined, true);
        return [min, max];
    };

    Tayberry$1.prototype.createTooltip = function () {
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

    Tayberry$1.prototype.getTextWidth = function (text, fontString) {
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

    Tayberry$1.prototype.getMultilineTextHeight = function (fontString, maxWidth, text) {
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

    Tayberry$1.prototype.splitMultilineText = function (maxWidth, text) {
        var lines = [];
        var lineWidth = 0;
        var lineText = '';
        var spaceWidth = this.labelsCtx.measureText(' ').width;
        for (var i = 0; i < text.length;) {
            var wordStart = i;
            while (i < text.length && text[i] !== ' ' && text[i] !== '\r' && text[i] !== '\n') {
                i++;
            }var wordEnd = i;
            while (i < text.length && (text[i] === ' ' || text[i] === '\r' || text[i] === '\n')) {
                i++;
            }if (wordEnd > wordStart) {
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

    Tayberry$1.prototype.drawTextMultiline = function (lineHeight, x, y, maxWidth, text) {
        var lines = this.splitMultilineText(maxWidth, text);

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            this.labelsCtx.fillText(line, x, y + lineHeight * i);
        }
    };

    Tayberry$1.prototype.render = function () {
        this.drawLabelLayer();
        this.createTooltip();
        if (this.options.animations.enabled) {
            for (var index = 0; index < this.options.series.length; index++) {
                var series = this.options.series[index];
                this.setSeriesVisibility(series, true, 'height');
            }
        } else {
            this.drawPlotLayer();
        }
    };

    Tayberry$1.prototype.clear = function () {
        var plot = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];
        var labels = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

        if (plot) this.plotCtx.clearRect(0, 0, this.plotCanvas.width, this.plotCanvas.height);
        if (labels) this.labelsCtx.clearRect(0, 0, this.labelsCanvas.width, this.labelsCanvas.height);
    };

    Tayberry$1.prototype.drawBackground = function () {
        if (this.options.plotBackgroundColour) {
            this.labelsCtx.save();
            this.labelsCtx.fillStyle = this.options.plotBackgroundColour;
            this.labelsCtx.fillRect(this.plotArea.left, this.plotArea.top, this.plotArea.width, this.plotArea.height);
            this.labelsCtx.restore();
        }
    };

    Tayberry$1.prototype.drawTitle = function () {
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

    Tayberry$1.prototype.drawPlotLayer = function () {
        for (var i = 0; i < this.renderers.length; i++) {
            this.renderers[i].drawPlot();
        }
        for (var i = 0; i < this.renderers.length; i++) {
            this.renderers[i].drawLabels();
        }
    };

    Tayberry$1.prototype.drawLine = function (x1, y1, x2, y2, colour) {
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

    Tayberry$1.prototype.drawLabelLayer = function () {
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

    Tayberry$1.prototype.redraw = function (plotOnly) {
        this.clear(true, !plotOnly);
        if (!plotOnly) {
            this.drawLabelLayer();
        }
        this.drawPlotLayer();
    };

    Tayberry$1.prototype.registerCallback = function (eventName, func) {
        this.callbacks[eventName].push(func);
    };

    Tayberry$1.prototype.onMouseLeave = function (event) {
        if (event.currentTarget == this.plotCanvas && event.relatedTarget !== this.tooltipElement || event.currentTarget == this.tooltipElement && event.relatedTarget !== this.plotCanvas) {
            this.selectedItem = {};
            this.tooltipElement.style.display = 'none';
            this.redraw();
        }
    };

    Tayberry$1.prototype.handleMouseMove = function (clientX, clientY) {
        var boundingRect = new Rect(this.plotCanvas.getBoundingClientRect());
        var ret = false;
        var tooltipDisplayStyle = 'none';
        if (boundingRect.containsPoint(clientX, clientY)) {
            var x = clientX - boundingRect.left;
            var y = clientY - boundingRect.top;

            var hitTestResult = this.hitTest(this.mapLogicalXUnit(x), this.mapLogicalYUnit(y));
            if (hitTestResult.found) {
                if (hitTestResult.type === 'legend') {
                    this.selectedItem = hitTestResult;
                    ret = true;
                } else if (hitTestResult.type === 'plotItem') {
                    var tooltipHtml = '';
                    var aboveZero = hitTestResult.rect.top < hitTestResult.rect.bottom;
                    tooltipDisplayStyle = 'block';
                    if (this.options.tooltips.shared) {
                        var category = this.xAxes[0].getCategoryLabel(hitTestResult.categoryIndex, this.categoryCount, hitTestResult.isXRange);
                        tooltipHtml += formatString(this.options.tooltips.headerTemplate, { category: category }, true);
                        for (var index = 0; index < this.seriesCount; index++) {
                            var series = this.options.series[index];
                            var value = Tayberry$1.getDataValue(series.data[hitTestResult.categoryIndex]);
                            tooltipHtml += formatString(this.options.tooltips.valueTemplate, {
                                value: series.yAxis.options.labelFormatter(value),
                                name: series.name,
                                colour: series.colour
                            }, true);
                        }
                    } else {
                        var series = hitTestResult.series;
                        var value = hitTestResult.value;
                        var category = series.xAxis.getCategoryLabel(hitTestResult.categoryIndex, this.categoryCount, hitTestResult.isXRange);
                        tooltipHtml += formatString(this.options.tooltips.headerTemplate, { category: category }, true);
                        tooltipHtml += formatString(this.options.tooltips.valueTemplate, {
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

    Tayberry$1.prototype.onClick = function (event) {
        var boundingRect = new Rect(this.plotCanvas.getBoundingClientRect());
        // Why is event.buttons always 0?
        if (event.button === 0 && boundingRect.containsPoint(event.clientX, event.clientY)) {
            var x = event.clientX - boundingRect.left;
            var y = event.clientY - boundingRect.top;
            var hitTestResult = this.hitTest(this.mapLogicalXUnit(x), this.mapLogicalYUnit(y));
            if (hitTestResult.found) {
                if (hitTestResult.type === 'legend') {
                    var series = hitTestResult.data.series;

                    this.toggleSeriesVisibility(series);
                    this.clear(false, true);
                    this.drawLabelLayer();
                }
            }
        }
    };

    Tayberry$1.prototype.onMouseMove = function (event) {
        var oldSelectedItem = assign({}, this.selectedItem);
        if (!this.handleMouseMove(event.clientX, event.clientY)) {
            this.selectedItem = {};
        }

        if (oldSelectedItem.type !== this.selectedItem.type || oldSelectedItem.categoryIndex !== this.selectedItem.categoryIndex || oldSelectedItem.series !== this.selectedItem.series) {
            this.redraw();
        }
    };

    Tayberry$1.prototype.onWindowResize = function () {
        this.tooltipElement.style.display = 'none';
        this.labelsCanvas.style.width = Math.floor(this.containerElement.clientWidth) + 'px';
        this.labelsCanvas.style.height = Math.floor(this.containerElement.clientHeight) + 'px';
        this.plotCanvas.style.width = Math.floor(this.containerElement.clientWidth) + 'px';
        this.plotCanvas.style.height = Math.floor(this.containerElement.clientHeight) + 'px';
        this.initialise();
        this.updateFonts();
        this.calculatePlotArea();
        this.createTooltip();
        this.callbacks['onResize'].forEach(function (func) {
            return func();
        });
        this.redraw();
    };

    Tayberry$1.prototype.defaultOptions = function () {
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
                font: {},
                hiddenAlphaMultiplier: 0.5
            },
            labels: {
                enabled: false,
                verticalAlignment: 'top',
                verticalPosition: 'outside',
                font: {}
            }
        };
    };

    Tayberry$1.defaultSeries = {
        visible: visibilityState.visible
    };

    Tayberry$1.defaultXAxis = {
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

    Tayberry$1.defaultYAxis = {
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

    Tayberry$1.defaultPrimaryYAxis = deepAssign({}, [Tayberry$1.defaultYAxis, {
        gridLines: {
            colour: '#ccc'
        }
    }]);

    Tayberry$1.defaultSecondaryYAxis = Tayberry$1.defaultYAxis;

    Tayberry$1.presets = {
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

    Tayberry$1.defaultColours = ['#6FE87B', //green
    '#FFAB51', //orange
    '#51A8FF', //blue
    '#B651FF', //purple
    '#FF6051', //red
    '#636363', //dark grey
    '#FFE314', //yellow
    '#A88572', //brown
    '#B7B7B7' //light grey
    ];

    Tayberry$1.mapVerticalPosition = function (sign, position) {
        switch (position) {
            case "outside":
                return sign > 0 ? "bottom" : "top";
            case "inside":
                return sign > 0 ? "top" : "bottom";
            default:
                return "middle";
        }
    };

    Tayberry$1.prototype.mapLogicalXUnit = function (x) {
        return this.scaleFactorX * x;
    };

    Tayberry$1.prototype.mapLogicalYUnit = function (x) {
        return this.scaleFactorY * x;
    };

    Tayberry$1.prototype.mapScreenUnit = function (x) {
        return x / this.scaleFactor;
    };

    Tayberry$1.prototype.calculatePlotArea = function () {
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
            if (none(this.yAxes.map(function (e) {
                return e.adjustSize(_this.plotArea);
            })) && none(this.xAxes.map(function (e) {
                return e.adjustSize(_this.plotArea);
            }))) break;
        }
        this.plotArea.left = Math.ceil(this.plotArea.left);
        this.plotArea.top = Math.ceil(this.plotArea.top);
        this.plotArea.right = Math.floor(this.plotArea.right);
        this.plotArea.bottom = Math.floor(this.plotArea.bottom);
    };

    Tayberry$1.prototype.hitTest = function (x, y) {
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
        matches.push(this.hitTestLegend(x, y));
        if (matches.length) {
            matches.sort(function (a, b) {
                return !a.found - !b.found || a.normalisedDistance - b.normalisedDistance;
            });
            ret = matches[0];
        }
        return ret;
    };

    Tayberry$1.prototype.drawLegend = function () {
        if (this.options.legend.enabled) {
            var legendMetrics = this.getLegendMeasurements();
            this.labelsCtx.save();
            this.labelsCtx.font = this.legendFont;

            for (var index = 0; index < legendMetrics.items.length; index++) {
                var item = legendMetrics.items[index];
                var series = item.series;
                var highlighted = this.selectedItem.type === 'legend' && this.selectedItem.data.series === series;
                series.renderer.drawLegendIndicator(this.labelsCtx, series, item.indicatorRect, highlighted);
                this.labelsCtx.textBaseline = 'middle';
                this.labelsCtx.fillStyle = this.options.legend.font.colour;
                if (!(series.visible & visibilityState.visible)) this.labelsCtx.fillStyle = new Colour(this.labelsCtx.fillStyle).multiplyAlpha(this.options.legend.hiddenAlphaMultiplier).toString();
                this.labelsCtx.fillText(series.name, item.textX, item.textY);
            }
            this.labelsCtx.restore();
        }
    };

    Tayberry$1.prototype.hitTestLegend = function (x, y) {
        var ret = {
            found: false,
            type: 'legend'
        };
        var legendMetrics = this.getLegendMeasurements();
        if (legendMetrics.rect.containsPoint(x, y)) {
            for (var index = 0; index < legendMetrics.items.length; index++) {
                var item = legendMetrics.items[index];
                if (item.rect.containsPoint(x, y)) {
                    assign(ret, [{ found: true, normalisedDistance: -5, data: item }]);
                    break;
                }
            }
        }
        return ret;
    };

    Tayberry$1.prototype.getLegendMeasurements = function () {
        var ret = {
            rect: new Rect(0),
            items: []
        };
        if (this.options.legend.enabled) {
            var smallPadding = this.mapLogicalXUnit(this.options.elementSmallPadding);
            var largePadding = this.mapLogicalXUnit(this.options.elementLargePadding);
            var totalWidth = 0;
            var indicatorSize = this.mapLogicalXUnit(this.options.legend.indicatorSize);
            for (var index = 0; index < this.options.series.length; index++) {
                var series = this.options.series[index];
                var textWidth = 0;
                if (series.name) {
                    textWidth = this.getTextWidth(series.name, this.legendFont);
                    totalWidth += textWidth + indicatorSize + smallPadding + largePadding;
                    ret.items.push({ textWidth: textWidth, series: series });
                }
            }
            var x = this.plotArea.left + this.plotArea.width / 2 - totalWidth / 2,
                y = this.labelsCanvas.height - indicatorSize;

            ret.rect.left = x;
            ret.rect.right = x + totalWidth;
            ret.rect.top = y;
            ret.rect.bottom = y + indicatorSize;

            for (var index = 0; index < ret.items.length; index++) {
                var item = ret.items[index];
                item.rect = new Rect(x, ret.rect.top, x + indicatorSize + smallPadding + item.textWidth, ret.rect.bottom);
                item.indicatorRect = new Rect(x, ret.rect.top, x + indicatorSize, ret.rect.bottom);
                x += indicatorSize + smallPadding;
                item.textX = x;
                item.textY = y + indicatorSize / 2;

                x += ret.items[index].textWidth + largePadding;
            }
        }
        return ret;
    };

    Tayberry$1.prototype.revokeAnimation = function (series) {
        for (var index = this.pendingAnimations.length; index; index--) {
            if (this.pendingAnimations[index - 1].series === series) {
                this.pendingAnimations.splice(index - 1, 1);
            }
        }
    };

    Tayberry$1.prototype.startAnimation = function (animation) {
        animation.initialStage = animation.initialStage || 0;
        var newAnimation = assign({}, [{
            length: 500 * (1 - animation.initialStage),
            startTime: typeof performance !== 'undefined' && typeof performance.now !== 'undefined' ? performance.now() : null
        }, animation]);
        this.pendingAnimations.push(newAnimation);
        if (!this.animator) this.animator = requestAnimationFrame(this.onAnimate.bind(this));
        return newAnimation;
    };

    Tayberry$1.prototype.onAnimate = function (timestamp) {
        var elapsed;
        for (var index = this.pendingAnimations.length - 1; index >= 0; index--) {
            var animation = this.pendingAnimations[index];
            if (animation.startTime === null) {
                animation.startTime = timestamp;
            }
            elapsed = timestamp - animation.startTime;
            if (animation.onFrame) {
                animation.onFrame(animation.initialStage + Math.min(elapsed / animation.length, 1) * (1 - animation.initialStage));
            }
            if (elapsed >= animation.length) {
                this.pendingAnimations.splice(index, 1);
                if (animation.onCompletion) {
                    animation.onCompletion();
                }
            }
        }
        for (var i = 0; i < this.renderers.length; i++) {
            this.renderers[i].onAnimationFrame();
        }
        this.redraw(true);
        if (this.pendingAnimations.length) {
            this.animator = requestAnimationFrame(this.onAnimate.bind(this));
        } else {
            this.animator = null;
        }
    };

    Tayberry$1.prototype.setSeriesVisibility = function (series, visible, subtype) {
        series.visible = visible ? visibilityState.visible : visibilityState.hidden;
        series.visible |= visibilityState.transitioning;

        if (series.animationState) {
            var newType = visible ? 'show' : 'hide';
            if (series.animationState.type !== newType) {
                series.animationState.type = newType;
                series.animationState.stage = 1 - series.animationState.stage;

                delete series.animationState.animator;
                this.revokeAnimation(series);
            }
        } else {
            series.animationState = {
                type: series.visible & visibilityState.visible ? 'show' : 'hide',
                subtype: subtype,
                stage: 0
            };
        }
        if (!series.animationState.animator) {
            series.animationState.animator = this.startAnimation({
                type: visible ? 'showSeries' : 'hideSeries',
                series: series,
                initialStage: series.animationState.stage,
                onFrame: function onFrame(stage) {
                    return series.animationState.stage = stage;
                },
                onCompletion: function onCompletion() {
                    series.visible = series.visible & ~visibilityState.transitioning;
                    delete series.animationState;
                }
            });
        }
    };

    Tayberry$1.prototype.toggleSeriesVisibility = function (series) {
        this.setSeriesVisibility(series, !(series.visible & visibilityState.visible));
    };

    var Tayberry = {
        /**
         * Creates a Tayberry chart
         *
         * @param element   ID of container div, or HTMLElement
         * @param options   Options object
         */
        create: function create(element, options) {
            var chart = new Tayberry$1();
            chart.create(element);
            chart.setOptions(options);
            chart.render();
        }
    };

    return Tayberry;

}));
//# sourceMappingURL=tayberry.js.map
