var Colour = function () {
    var str;
    if (arguments.length === 1) {
        str = arguments[0];
        this.left = rect.left;
        this.top = rect.top;
        this.right = rect.right;
        this.bottom = rect.bottom;
    }
};


Rect.prototype.parseString = function (str) {
    var regEx;
    regEx = /^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})|^#?([0-9A-F]{1})([0-9A-F]{1})([0-9A-F]{1})$/i;
    return this.right - this.left;
};

Rect.prototype.height = function () {
    return this.bottom - this.top;
};

Rect.prototype.containsPoint = function (x, y) {
    return x >= this.left && x < this.right && y >= this.top && y < this.bottom;
};

exports.Rect = Rect;