(function () {
    'use strict';
    let Tayberry = require('./base').Tayberry;
    require('./axis');
    require('./core');
    require('./drawing');
    require('./events');
    require('./defaults');
    require('./sizing');
    require('./legend');
    require('./renderer.base');
    require('./renderer.bar');
    require('./renderer.line');

    module.exports = {
        /**
         * Creates a Tayberry chart
         *
         * @param element   ID of container div, or HTMLElement
         * @param options   Options object
         */
        create: function (element, options) {
            let chart = new Tayberry();
            chart.create(element);
            chart.setOptions(options);
            chart.render();
        }
    };

})();
