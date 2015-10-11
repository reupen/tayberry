var Utils = require('./utils.js');

class Colour {
    /**
     * Constructs a Colour object.
     *
     * @param colourCode    an HTML colour code in hex or integer (rgb) form
     */
    constructor() {
        if (arguments.length === 1) {
            let arg1 = arguments[0];
            if (typeof arg1 === 'string')
                this.parseString(arg1);
            else {
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
    parseString (str) {
        let regExHex = /^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})|^#?([0-9A-F]{1})([0-9A-F]{1})([0-9A-F]{1})$/i;
        let regExInt = /^rgba?\((\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(\s*,\s*([0-9]*\.?[0-9]+))+\)$/i;
        const groupsHex = regExHex.exec(str);
        const groupsInt = regExInt.exec(str);
        if (groupsHex) {
            this.r = parseInt(groupsHex[1] || groupsHex[4], 16);
            this.g = parseInt(groupsHex[2] || groupsHex[5], 16);
            this.b = parseInt(groupsHex[3] || groupsHex[6], 16);
            this.a = null;
        }
        else if (groupsInt) {
            this.r = parseInt(groupsInt[1]);
            this.g = parseInt(groupsInt[2]);
            this.b = parseInt(groupsInt[3]);
            this.a = groupsInt[5] ? parseFloat(groupsInt[5]) : null;
        } else {
            this.r = null;
            this.g = null;
            this.b = null;
            this.a = null;
        }
        return this;
    }

    /**
     * Clips a colour component to be in the range [0, 255], and round it them to
     * the nearest integer
     * @param component
     * @returns {Colour}
     */
    clipComponent(component) {
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
    clip () {
        this.clipComponent('r');
        this.clipComponent('g');
        this.clipComponent('b');
        return this;
    }

    /**
     * Multiplies each colour component by a number
     * @param number
     * @returns {Colour}
     */
    multiplyBy (number) {
        this.r *= number;
        this.g *= number;
        this.b *= number;
        this.clip();
        return this;
    }

    /**
     * Adds a number to each colour component
     * @param number
     * @returns {Colour}
     */
    increaseBy (number) {
        this.r += number;
        this.g += number;
        this.b += number;
        this.clip();
        return this;
    }

    get sum() {
        return this.r + this.g + this.b;
    }

    /**
     * Formats this colour as a string
     * @returns {String}
     */
    toString() {
        var ret;
        if (this.a) {
            ret = Utils.formatString('rgba({r},{g},{b},{a})', this);
        } else {
            ret = Utils.formatString('rgb({r},{g},{b})', this);
        }
        return ret;
    }

    /**
     * Multiplies each colour component of a colour code by a number
     * @param colour
     * @param number
     * @returns {String}
     */
    static multiplyBy(colour, number) {
        return (new Colour(colour)).multiplyBy(number).toString();
    }

}

exports.Colour = Colour;