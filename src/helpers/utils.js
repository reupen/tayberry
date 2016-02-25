'use strict';

export function identity(obj) {
    return obj;
}

export function isMissingValue(n) {
    return n === null || typeof n === 'undefined' || (isNaN(n) && typeof n === 'number');
}

export function coalesce(...vals) {
    for (let i = 0; i < vals.length; i++) {
        if (!isMissingValue(vals[i])) {
            return vals[i];
        }
    }
}

export function reduce(array, func, getter, ignoreMissing = false) {
    var ret, i;
    if (array.reduce && !getter && !ignoreMissing) {
        ret = array.reduce(function (a, b) {
            return func(a, b);
        });
    } else {
        let retInitialised = false;
        getter = getter || identity;
        for (i = 0; i < array.length; i++) {
            const value = getter(array[i], i);
            if (!ignoreMissing || !isMissingValue(value)) {
                ret = retInitialised ? func(ret, value) : value;
                retInitialised = true;
            }
        }
    }
    return ret;
}

export function sign(n) {
    return n > 0 ? 1 : (n < 0 ? -1 : 0);
}

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

export function none(array) {
    return array.every(elem => !elem);
}

export function assign(targetObject, sourceObjects) {
    return innerAssign(false, targetObject, sourceObjects);
}

export function deepAssign(targetObject, sourceObjects) {
    return innerAssign(true, targetObject, sourceObjects);
}

export function formatString(formatString, formatValues, escapeAsHtml) {
    return formatString.replace(/{(\w+)}/g, function (match, placeholder) {
        const value = formatValues[placeholder];
        return typeof value !== 'undefined' ? (escapeAsHtml ? stringToHtml(value) : value) : match;
    });
}

export function locateDecimalPoint(number) {
    return Math.floor(Math.log(number) / Math.log(10));
}

export function formatNumberThousands(number, decimalPlaces = 0) {
    var parts = number.toFixed(decimalPlaces).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

export function createAutoNumberFormatter(scale, prefix = '', suffix = '', precision = 2) {
    let decimalPlaces = locateDecimalPoint(scale);
    decimalPlaces = decimalPlaces < 0 ? -decimalPlaces + precision - 1 : 0;
    return x => prefix + formatNumberThousands(x, decimalPlaces) + suffix;
}

export function createFixedNumberFormatter(scale, prefix = '', suffix = '', decimalPlaces = 2) {
    return x => prefix + formatNumberThousands(x, decimalPlaces) + suffix;
}

export function createPercentageFormatter(scale, prefix = '', suffix = '%', precision = 2) {
    let decimalPlaces = locateDecimalPoint(scale * 100);
    decimalPlaces = decimalPlaces < precision ? -decimalPlaces + precision - 1 : 0;
    return x => prefix + formatNumberThousands(x * 100, decimalPlaces) + suffix;
}

export function stringToHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

export function throttle(fn, threshold) {
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
    }
}

