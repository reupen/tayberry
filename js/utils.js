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

    exports.now = performance.now || function () {
            return new Date().getTime();
        };

    exports.assign = function (target) {
        if (Object.assign) {
            return Object.assign.apply(Object, arguments);
        } else {
            if (target === undefined || target === null) {
                throw new TypeError('Cannot convert first argument to object');
            }

            var to = Object(target);
            for (var i = 1; i < arguments.length; i++) {
                var nextSource = arguments[i];
                if (nextSource === undefined || nextSource === null) {
                    continue;
                }
                nextSource = Object(nextSource);

                var keysArray = Object.keys(nextSource);
                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                    var nextKey = keysArray[nextIndex];
                    var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== undefined && desc.enumerable) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
            return to;
        }
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
