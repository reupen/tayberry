var Utils = require('./utils.js');

var Colour = function () {
    var str;
    if (arguments.length === 1) {
        str = arguments[0];
        this.parseString(str);
    }
};


Colour.prototype.parseString = function (str) {
    //TODO: rgb(,,) format
    let regEx = /^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})|^#?([0-9A-F]{1})([0-9A-F]{1})([0-9A-F]{1})$/i;
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
    return this;
};

Colour.prototype.clipComponent = function (component) {
    this[component] = Math.round(this[component]);
    this[component] = Math.min(this[component], 255);
    this[component] = Math.max(this[component], 0);
    return this;
};

Colour.prototype.clip = function () {
    for (let component of ['r', 'g', 'b'])
        this.clipComponent(component);
    return this;
};

Colour.prototype.multiplyBy = function (number) {
    for (let component of ['r', 'g', 'b'])
        this[component] = this[component] * number;
    this.clip();
    return this;
};

Colour.prototype.toString = function () {
    var ret;
    if (this.a) {
        ret = Utils.formatString('rgba({r},{g},{b},{a})', this);
    } else {
        ret = Utils.formatString('rgb({r},{g},{b})', this);
    }
    return ret;
};

Colour.multiplyBy = function (colour, number) {
    return (new Colour(colour)).multiplyBy(number).toString();
};

exports.Colour = Colour;