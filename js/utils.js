(function () {
    "use strict";

    exports.identity = function (obj) {
        return obj;
    };

    exports.reduce = function (array, func, getter) {
        var ret, i;
        if (array.reduce && !getter) {
            ret = array.reduce(function (a, b) {
                return func(a, b);
            });
        } else {
            getter = getter || exports.identity;
            if (array.length) {
                ret = getter(array[0]);
                for (i = 1; i < array.length; i++) {
                    ret = func(ret, getter(array[i]));
                }
            }
        }
        return ret;
    };

    exports.sign = Math.sign || function (n) {
            return n > 0 ? 1 : (n < 0 ? -1 : 0);
        };

    exports.now = performance.now || function () {
            return new Date().getTime();
        };

    var innerAssign = function (deepAssign, targetObject) {
        if (!deepAssign && Object.assign) {
            return Object.assign.apply(Object, arguments);
        } else {
            if (targetObject === undefined || targetObject === null) {
                throw new TypeError('Cannot convert first argument to object');
            }

            var to = Object(targetObject);
            for (let i = 2; i < arguments.length; i++) {
                let currentSourceObject = arguments[i];
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
                        if (deepAssign && typeof to[nextKey] === "object" && !Array.isArray(nextValue) && typeof nextValue === 'object')
                            innerAssign(true, to[nextKey], nextValue);
                        else
                            to[nextKey] = nextValue;
                    }
                }
            }
            return to;
        }
    };

    exports.assign = function (targetObject) {
        return innerAssign.apply(null, [false, targetObject].concat(Array.prototype.slice.call(arguments, 1)));
    };

    exports.deepAssign = function (targetObject) {
        return innerAssign.apply(null, [true, targetObject].concat(Array.prototype.slice.call(arguments, 1)));
    };

    exports.formatString = function (formatString, formatValues) {
        return formatString.replace(/{(\w+)}/g, function (match, placeholder) {
            const value = formatValues[placeholder];
            return typeof value !== 'undefined' ? value : match;
        });
    };

    exports.formatNumberThousands = function(number) {
        var parts = number.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }

})();
