var Utils = require('./utils');
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
    parseString(str) {
        let regExHex = /^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})|^#?([0-9A-F]{1})([0-9A-F]{1})([0-9A-F]{1})$/i;
        let regExInt = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(\s*,\s*([0-9]*\.?[0-9]+)\s*)?\)$/i;
        const groupsHex = regExHex.exec(str);
        const groupsInt = regExInt.exec(str);
        if (groupsHex) {
            let parseHex = function (value) {
                let ret = parseInt(value, 16);
                ret = ret * 0x10 + ret;
                return ret;
            };
            this.r = groupsHex[1] ? parseInt(groupsHex[1], 16) : parseHex(groupsHex[4]);
            this.g = groupsHex[2] ? parseInt(groupsHex[2], 16) : parseHex(groupsHex[5]);
            this.b = groupsHex[3] ? parseInt(groupsHex[3], 16) : parseHex(groupsHex[6]);
            this.a = null;
        }
        else if (groupsInt) {
            this.r = parseInt(groupsInt[1]);
            this.g = parseInt(groupsInt[2]);
            this.b = parseInt(groupsInt[3]);
            this.a = groupsInt[5] ? parseFloat(groupsInt[5]) : null;
        } else {
            throw new RangeError(str + " is not a valid HTML colour");
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
    clip() {
        this.clipComponent('r');
        this.clipComponent('g');
        this.clipComponent('b');
        return this;
    }

    /**
     * Adds a number to each colour component
     * @param number
     * @returns {Colour}
     */
    increaseBy(number) {
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

    static createFromBlend(colour1, colour2, blendPosition) {
        const blender = (c1, c2) => (c1 + blendPosition*(c2 - c1));
        return new Colour({
            r: blender(colour1.r, colour2.r),
            g: blender(colour1.g, colour2.g),
            b: blender(colour1.b, colour2.b),
            a: blender(Utils.coalesce(colour1.a, 1), Utils.coalesce(colour2.a, 1))
        }).clip();
    }

}

exports.Colour = Colour;