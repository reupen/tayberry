import {Tayberry as TayberryBase} from './base';
import './axis';
import './core';
import './drawing';
import './events';
import './defaults';
import './sizing';
import './legend';
import './renderer.base';
import './renderer.bar';
import './renderer.line';


let Tayberry = {
    /**
     * Creates a Tayberry chart
     *
     * @param element   ID of container div, or HTMLElement
     * @param options   Options object
     */
    create: function (element, options) {
        let chart = new TayberryBase();
        chart.create(element);
        chart.setOptions(options);
        chart.render();
    }
};

export default Tayberry;