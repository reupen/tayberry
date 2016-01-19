(function () {
    "use strict";

    exports.identity = function (obj) {
        return obj;
    };

    exports.isMissingValue = function (n) {
        return n === null || typeof n === 'undefined' || (isNaN(n) && typeof n === 'number');
    };

    exports.coalesce = function(...vals) {
        for (let i = 0; i<vals.length; i++) {
            if (!exports.isMissingValue(vals[i])) {
                return vals[i];
            }
        }
    };

    exports.reduce = function (array, func, getter, ignoreMissing = false) {
        var ret, i;
        if (array.reduce && !getter && !ignoreMissing) {
            ret = array.reduce(function (a, b) {
                return func(a, b);
            });
        } else {
            let retInitialised = false;
            getter = getter || exports.identity;
            for (i = 0; i < array.length; i++) {
                const value = getter(array[i], i);
                if (!ignoreMissing || !exports.isMissingValue(value)) {
                    ret = retInitialised ? func(ret, value) : value;
                    retInitialised = true;
                }
            }
        }
        return ret;
    };

    exports.sign = Math.sign || function (n) {
            return n > 0 ? 1 : (n < 0 ? -1 : 0);
        };

    var innerAssign = function (deepAssign, targetObject, sourceObjects) {
        if (!Array.isArray(sourceObjects))
            sourceObjects = [sourceObjects];
        if (!deepAssign && Object.assign) {
            return Object.assign.apply(Object, [targetObject].concat(sourceObjects));
        } else {
            if (targetObject === undefined || targetObject === null) {
                throw new TypeError('Cannot convert first argument to object');
            }

            var to = Object(targetObject);
            for (let i = 0; i < sourceObjects.length; i++) {
                let currentSourceObject = sourceObjects[i];
                if (currentSourceObject === undefined || currentSourceObject === null) {
                    continue;
                }
                currentSourceObject = Object(currentSourceObject);

                const keysArray = Object.keys(currentSourceObject);
                for (let nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                    const nextKey = keysArray[nextIndex];
                    const nextValue = currentSourceObject[nextKey];
                    const desc = Object.getOwnPropertyDescriptor(currentSourceObject, nextKey);
                    if (desc !== undefined && desc.enumerable) {
                        if (deepAssign && !Array.isArray(nextValue) && typeof nextValue === 'object' && nextValue !== null)
                            to[nextKey] = innerAssign(true, {}, [to[nextKey], nextValue]);
                        else
                            to[nextKey] = nextValue;
                    }
                }
            }
            return to;
        }
    };

    exports.none = function(array) {
        return array.every(elem => !elem);
    };

    exports.assign = function (targetObject, sourceObjects) {
        return innerAssign(false, targetObject, sourceObjects);
    };

    exports.deepAssign = function (targetObject, sourceObjects) {
        return innerAssign(true, targetObject, sourceObjects);
    };

    exports.formatString = function (formatString, formatValues, escapeAsHtml) {
        return formatString.replace(/{(\w+)}/g, function (match, placeholder) {
            const value = formatValues[placeholder];
            return typeof value !== 'undefined' ? (escapeAsHtml ? exports.stringToHtml(value) : value) : match;
        });
    };

    exports.locateDecimalPoint = function (number) {
        return Math.floor(Math.log(number) / Math.log(10));
    };

    exports.formatNumberThousands = function (number, decimalPlaces = 0) {
        var parts = number.toFixed(decimalPlaces).split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    };

    exports.createAutoNumberFormatter = function (scale, prefix = '', suffix = '', precision = 2) {
        let decimalPlaces = exports.locateDecimalPoint(scale);
        decimalPlaces = decimalPlaces < 0 ? -decimalPlaces + precision - 1 : 0;
        return x => prefix + exports.formatNumberThousands(x, decimalPlaces) + suffix;
    };

    exports.createFixedNumberFormatter = function (scale, prefix = '', suffix = '', decimalPlaces = 2) {
        return x => prefix + exports.formatNumberThousands(x, decimalPlaces) + suffix;
    };

    exports.createPercentageFormatter = function (scale, prefix = '', suffix = '%', precision = 2) {
        let decimalPlaces = exports.locateDecimalPoint(scale * 100);
        decimalPlaces = decimalPlaces < precision ? -decimalPlaces + precision - 1 : 0;
        return x => prefix + exports.formatNumberThousands(x * 100, decimalPlaces) + suffix;
    };

    exports.stringToHtml = function (str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    };

    exports.throttle = function (fn, threshold) {
        var last,
            deferTimer;
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

})();
