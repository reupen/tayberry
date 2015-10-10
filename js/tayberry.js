'use strict';
var Tayberry = require('./tayberry.base.js').Tayberry;
require('./tayberry.axes.js');
require('./tayberry.core.js');
require('./tayberry.drawing.js');
require('./tayberry.events.js');
require('./tayberry.options.js');
require('./tayberry.sizing.js');


module.exports = {
    create: function (element, options) {
        var chart = new Tayberry();
        chart.create(element);
        chart.setOptions(options);
        chart.render();
    }
};
