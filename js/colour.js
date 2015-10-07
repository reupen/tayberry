var Utils = require('./utils.js');

var Colour = function () {
    var str;
    if (arguments.length === 1) {
        str = arguments[0];
        this.parseString(str);
    }
};


Colour.prototype.parseString = function (str) {
    var regEx;
    regEx = /^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})|^#?([0-9A-F]{1})([0-9A-F]{1})([0-9A-F]{1})$/i;
    let groups = regEx.exec(str);
    if (groups) {
        this.r = parseInt(groups[1] || groups[4], 16);
        this.g = parseInt(groups[2] || groups[5], 16);
        this.b = parseInt(groups[3] || groups[6], 16);
        this.a = null;
    } else {
        this.r = null;
        this.g = null;
        this.b = null;
        this.a = null;
    }
};

Colour.prototype.toString = function() {
    var ret;
    if (this.a) {
        ret = Utils.formatString('rgba({r},{g},{b},{a})', this);
    } else {
        ret = Utils.formatString('rgb({r},{g},{b})', this);
    }
    return ret;
};

exports.Colour = Colour;