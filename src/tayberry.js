(function () {
    'use strict';
    var Tayberry = require('./base.js').Tayberry;
    require('./axis.js');
    require('./core.js');
    require('./drawing.js');
    require('./events.js');
    require('./defaults.js');
    require('./sizing.js');

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
