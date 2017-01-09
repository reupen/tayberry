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
    private impl: any;

    /**
     * Creates a chart.
     *
     * @param element   {String|HTMLElement}    ID of container div, or HTMLElement
     * @param options   {Object}                Options object
     */
    constructor(element: string|HTMLElement, options: any) {
        this.impl = new TayberryBase();
        this.impl.create(element);
        this.impl.setOptions(options);
        this.impl.render();
    }

    /**
     * Adds one or more series to the chart.
     *
     * @param series    {Object|Array}  series object or list of series objects to add
     */
    addSeries(series: any): void {
        this.checkState();
        this.impl.addSeries(series);
    }

    /**
     * Gets the number of series currently in the chart.
     */
    getSeriesCount(): number {
        this.checkState();
        return this.impl.options.series.length;
    }

    /**
     * Gets the number of series currently in the chart.
     */
    removeSeriesByIndex(index: number): void {
        this.checkState();

        this.impl.removeSeries(index);
    }

    /**
     * Destroys the chart.
     */
    destroy(): void {
        this.impl.destroy();
        this.impl = null;
    }

    /**
     * Checks if the chart has been destoryed, and throws an exception if so.
     */
    private checkState(): void {
        if (!this.impl)
            throw Error('Chart has been destroyed');
    }
}

let Tayberry = {
    /**
     * Creates a Tayberry chart
     *
     * @param element   ID of container div, or HTMLElement
     * @param options   Options object
     *
     * @return          Chart object
     */
    create: function (element: string|HTMLElement, options: any): Chart {
        return new Chart(element, options);
    }
};

export default Tayberry;