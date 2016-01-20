'use strict';

export function linear(time, duration) {
    return (time / duration);
}

export function inQuad(time, duration) {
    var factor = time / duration;
    return factor * factor;
}

export function outQuad(time, duration) {
    var factor = time / duration;
    return factor * (2 - factor);
}
