import {Tayberry as TayberryBase} from './base';
import './axis';
import './core';
import './drawing';
import './events';
import './defaults';
import './sizing';
import './legend';
import './animation';
import './renderer.base';
import './renderer.bar';
import './renderer.line';


/**
 * Chart object – public interface of the underlying implementation
 */
class Chart {
    /**
     * Creates a chart.
     *
     * @param element   {String|HTMLElement}    ID of container div, or HTMLElement
     * @param options   {Object}                Options object
     */
    constructor(element, options) {
        this._impl = new TayberryBase();
        this._impl.create(element);
        this._impl.setOptions(options);
        this._impl.render();
    }

    /**
     * Adds one or more series to the chart.
     *
     * @param series    {Object|Array}  series object or list of series objects to add
     */
    addSeries(series) {
        this._checkState();
        this._impl.addSeries(series);
    }

    /**
     * Gets the number of series currently in the chart.
     */
    getSeriesCount() {
        this._checkState();
        return this._impl.options.series.length;
    }
    
    /**
     * Gets the number of series currently in the chart.
     */
    removeSeriesByIndex(index) {
        this._checkState();
        
        return this._impl.removeSeries(index);
    }
    
    /**
     * Destroys the chart.
     */
    destroy() {
        this._impl.destroy();
        this._impl = null;
    }

    /**
     * Checks if the chart has been destoryed, and throws an exception if so.
     *
     * @private
     */
    _checkState() {
        if (!this._impl)
            throw Error('Chart has been destroyed');
    }
}

let Tayberry = {
    /**
     * Creates a Tayberry chart
     *
     * @param element   {String|HTMLElement}    ID of container div, or HTMLElement
     * @param options   {Object}                Options object
     *
     * @return          {Chart}                 Chart object
     */
    create: function (element, options) {
        return new Chart(element, options);
    }
};

export default Tayberry;