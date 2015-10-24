class Tayberry {
    constructor() {
        this.selectedItem = {};
        this.containerElement = null;
        this.labelsCanvas = null;
        this.labelsCtx = null;
        this.renderedSeries = null;
        this.options = null;
        this.scaleFactor = null;
        this.titleFont = null;
        this.plotArea = null;
        this.series = [];
        this.categories = [];
        this.titleFont = null;
        this.labelFont = null;
        this.legendFont = null;
    }

    get seriesCount() {
        return this.series.length;
    }

    get categoryCount() {
        return this.series.length ? this.series[0].data.length : 0;
    }
}

exports.Tayberry = Tayberry;


