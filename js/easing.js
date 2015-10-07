exports.linear = function (time, duration) {
    return (time / duration);
};

exports.linear = function (time, duration) {
    return (time / duration);
};

exports.inQuad = function (time, duration) {
    var factor = time / duration;
    return factor * factor;
};

exports.outQuad = function (time, duration) {
    var factor = time / duration;
    return factor * (2 - factor);
};
