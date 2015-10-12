(function () {
    'use strict';
    var Tayberry = require('./tayberry.base.js').Tayberry;
    require('./tayberry.axes.js');
    require('./tayberry.core.js');
    require('./tayberry.drawing.js');
    require('./tayberry.events.js');
    require('./tayberry.defaults.js');
    require('./tayberry.sizing.js');
    
    module.exports = {
        /**
         * Creates a Tayberry chart
         *
         * @param element   ID of container div, or HTMLElement
         * @param options   Options object
         */
        create: function (element, options) {
            var chart = new Tayberry();
            chart.create(element);
            chart.setOptions(options);
            chart.render();
        }
    };

})();
