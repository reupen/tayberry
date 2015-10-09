'use strict';
var Rect = require('./rect').Rect;
var Colour = require('./colour').Colour;

var Tayberry = function () {
    this.palette = [
        '#6FE87B', //green
        '#FFAB51', //orange
        '#51A8FF', //blue
        '#B651FF', //purple
        '#FF6051', //red
        '#636363' //dark grey
    ];
    this.selectedItem = {};
    this.containerElement = null;
    this.canvas = null;
    this.ctx = null;
    this.renderedSeries = null;
    this.options = null;
    this.scaleFactor = null;
    this.titleFont = null;
    this.plotArea = null;
    this.yTickStep = null;
};

Tayberry.Utils = require('./utils.js');

var Easing = require('./easing.js');

Tayberry.Easing = Easing;

Tayberry.prototype.create = function (containerElement) {
    if (typeof containerElement == 'string') {
        this.containerElement = document.getElementById(containerElement);
    } else {
        this.containerElement = containerElement;
    }
    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.containerElement.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.renderedSeries = null;
    this.options = {
        title: {
            text: 'Title',
            font: {
                size: 24
            }
        },
        font: {
            colour: '#444',
            size: 12,
            face: 'sans-serif'
        },
        xAxis: {
            title: 'X title',
            type: 'category',
            min: 0,
            max: 100,
            step: 1
        },
        yAxis: {
            title: 'Y title',
            gridLines: {
                colour: '#ccc'
            }
        },
        stacked: true,
        barPadding: 2,
        elementPadding: 5,
        categorySpacing: 0.3,
        legend: {
            indicatorSize: 15
        },
        labels: {
            enabled: true,
            position: 'top',
            alignment: 'bottom' //FIXME
        }
    };
    this.initialise();
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseleave', this.onMouseLeave.bind(this));
    this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this));
    window.addEventListener('resize', this.onWindowResize.bind(this));
};

Tayberry.prototype.initialise = function () {
    this.scaleFactor = window.devicePixelRatio || 1.0;
    this.canvas.width = this.containerElement.clientWidth * this.scaleFactor;
    this.canvas.height = this.containerElement.clientHeight * this.scaleFactor;
    this.selectedItem = {};
    this.ctx.font = this.mapLogicalUnit(this.options.font.size) + 'px ' + this.options.font.face;
    this.titleFont = this.mapLogicalUnit(this.options.title.font.size) + 'px ' + this.options.font.face;
    this.plotArea = null;
    this.yTickStep = 30 * this.scaleFactor;
};

Tayberry.prototype.mapLogicalUnit = function (x) {
    return this.scaleFactor * x;
};

Tayberry.prototype.mapScreenUnit = function (x) {
    return x / this.scaleFactor;
};

Tayberry.prototype.getTextWidth = function (text) {
    return this.ctx.measureText(text).width;
};

Tayberry.prototype.calculatePlotArea = function () {
    this.plotArea = new Rect(0, 0, this.canvas.width, this.canvas.height);
    if (this.options.title.text) {
        this.plotArea.top += this.mapLogicalUnit(this.options.elementPadding + this.options.title.font.size);
    }
    if (this.options.yAxis.title) {
        this.plotArea.left += this.mapLogicalUnit(this.options.elementPadding + this.options.font.size);
    }
    if (this.options.xAxis.title) {
        this.plotArea.bottom -= this.mapLogicalUnit(this.options.elementPadding + this.options.font.size);
    }
    this.plotArea.bottom -= this.mapLogicalUnit(this.options.font.size + this.options.font.size);
    this.plotArea.bottom -= this.mapLogicalUnit(this.options.elementPadding + this.options.legend.indicatorSize);
};

Tayberry.prototype.finalisePlotArea = function () {
    this.plotArea.left += this.getTextWidth(this.yMax) + this.mapLogicalUnit(this.options.elementPadding);
    this.plotArea.left = Math.floor(this.plotArea.left);
    this.plotArea.top = Math.floor(this.plotArea.top);
    this.plotArea.right = Math.ceil(this.plotArea.right);
    this.plotArea.bottom = Math.ceil(this.plotArea.bottom);
};

/**
 * Format:
 * [{
 *   data: {array|object},
 *   name: {string}
 * },{
 *   data: {array|object},
 *   name: {string}
 * }]
 * @param series
 */
Tayberry.prototype.setData = function (series) {
    var i, data;
    if (!Array.isArray(series)) {
        this.series = [series];
    } else {
        this.series = series;
    }
    this.renderedSeries = series.slice(0);
    for (i = 0; i < this.renderedSeries.length; i++) {
        let actualSeries = this.series[i];
        let elem = Tayberry.Utils.assign({}, actualSeries);
        elem.data = this.renderedSeries[i].data.slice(0);
        elem.colour = actualSeries.colour || this.palette[i];
        elem.highlightColour = actualSeries.highlightColour || Colour.multiplyBy(elem.colour, 1.2);
        elem.name = actualSeries.name;
        this.renderedSeries[i] = elem;
    }
    //this.initialise();
};


Tayberry.prototype.setCategories = function (categories) {
    this.categories = (categories);
    if (this.options.xAxis.type === 'numeric' || this.options.xAxis.type === 'numerical') {
        this.categories = [];
        for (let i = this.options.xAxis.min; i <= this.options.xAxis.max; i += this.options.xAxis.step) {
            i = Math.round(i / this.options.xAxis.step) * this.options.xAxis.step;
            this.categories.push(i);
        }
    }
};

Tayberry.prototype.calculateYAxisExtent = function () {
    var categoryIndex, seriesIndex, yMin, yMax, targetTicks, approxStep, scale, actualStep, yStart;
    this.seriesTotals = [];
    const seriesMinima = [];
    const seriesMaxima = [];
    if (this.series[0].data.length) {
        for (categoryIndex = 0; categoryIndex < this.series[0].data.length; categoryIndex++) {
            this.seriesTotals[categoryIndex] = 0;
            for (seriesIndex = 0; seriesIndex < this.series.length; seriesIndex++) {
                //TODO: non-stacked
                this.seriesTotals[categoryIndex] += this.series[seriesIndex].data[categoryIndex];
            }
        }
        for (let series of this.series) {
            seriesMinima.push(Tayberry.Utils.reduce(series.data, Math.min));
            seriesMaxima.push(Tayberry.Utils.reduce(series.data, Math.max));
        }
        yMin = this.options.stacked ? 0 : Tayberry.Utils.reduce(seriesMinima, Math.min);
        yMax = Tayberry.Utils.reduce(this.options.stacked ? this.seriesTotals : seriesMaxima, Math.max);
    }

    const yRange = yMax - yMin;
    let targetYStart = yMin - yRange * 0.1;
    let targetYEnd = yMax + yRange * 0.1;
    const targetYRange = targetYEnd - targetYStart;

    targetTicks = this.plotArea.height() / this.yTickStep;
    approxStep = targetYRange / targetTicks;
    scale = Math.pow(10, Math.floor(Math.log(approxStep) / Math.log(10)));
    this.yStep = Math.ceil(approxStep / scale) * scale;
    yStart = Math.floor(targetYStart / scale) * scale;
    if (yStart < 0 && yMin >= 0)
        yStart = 0;
    const yEnd = Math.ceil(targetYEnd / scale) * scale;
    this.yMin = yStart;
    this.yMax = yEnd;
};

Tayberry.prototype.render = function () {
    this.calculatePlotArea();
    this.calculateYAxisExtent();
    this.finalisePlotArea();
    this.animator = requestAnimationFrame(this.onAnimate.bind(this));
    this.animatationStart = performance.now();
    this.animationLength = 500;
    this.drawXAxis();
    this.drawYAxis();
    this.createTooltip();
};

Tayberry.prototype.getYHeight = function (value) {
    return Math.round((value - this.yMin) * this.plotArea.height() / (this.yMax - this.yMin));
};

Tayberry.prototype.getBarRect = function (seriesIndex, categoryIndex) {
};

Tayberry.prototype.hitTest = function (x, y) {
    var rect, ret;
    // TODO: Optimise
    ret = {
        found: false,
        categoryIndex: undefined,
        seriesIndex: undefined,
        rect: undefined
    };

    this.enumerateBars(function (bar) {
        if (bar.rect.containsPoint(x, y)) {
            ret.found = true;
            ret.categoryIndex = bar.categoryIndex;
            ret.seriesIndex = bar.seriesIndex;
            ret.rect = bar.rect;
            return true;
        }
    }.bind(this));

    return ret;
};

Tayberry.prototype.clear = function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

Tayberry.prototype.drawTitle = function () {
    if (this.options.title.text) {
        const x = (this.canvas.width) / 2, y = 0;
        this.ctx.save();
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.font = this.titleFont;
        this.ctx.fillStyle = this.options.font.colour;
        this.ctx.fillText(this.options.title.text, x, y);
        this.ctx.restore();
    }
};

Tayberry.prototype.drawLabel = function (text, rect) {
    const x = (rect.left + rect.right) / 2;
    let y;
    if (this.options.labels.position === 'top')
        y = rect.top;
    else if (this.options.labels.position === 'bottom')
        y = rect.bottom;
    else
        y = (rect.top + rect.bottom) / 2;
    if (this.plotArea.containsPoint(x, y)) {
        this.ctx.save();
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = this.options.labels.alignment;
        this.ctx.fillStyle = this.options.font.colour;
        this.ctx.fillText(text, x, y);
        this.ctx.restore();
    }
};

Tayberry.prototype.enumerateBars = function (callback) {
    const categoryCount = this.renderedSeries[0].data.length;
    if (categoryCount) {
        const barCount = (this.options.stacked ? 1 : this.series.length);
        const categoryWidth = Math.floor(this.plotArea.width() / categoryCount);
        const barWidth = Math.floor(categoryWidth * (1 - this.options.categorySpacing) / barCount);

        for (let categoryIndex = 0; categoryIndex < categoryCount; categoryIndex++) {
            let x = this.plotArea.left + Math.floor(categoryIndex * categoryWidth + categoryWidth * this.options.categorySpacing / 2);
            const cx = barWidth;
            let yBottom = this.plotArea.bottom;
            let yRunningTotal = 0;
            for (let seriesIndex = 0; seriesIndex < this.renderedSeries.length; seriesIndex++) {
                const value = this.renderedSeries[seriesIndex].data[categoryIndex];
                const yTop = this.plotArea.bottom - this.getYHeight(value + yRunningTotal);
                let rect = new Rect(x, yTop, x + cx, yBottom);
                rect.left += this.options.barPadding * this.scaleFactor / 2;
                rect.right -= this.options.barPadding * this.scaleFactor / 2;
                if (rect.right < rect.left)
                    rect.right = rect.left;
                rect.clip(this.plotArea);

                const stopEnumerating = callback({
                    seriesIndex: seriesIndex,
                    categoryIndex: categoryIndex,
                    renderedSeries: this.renderedSeries[seriesIndex],
                    rect: rect,
                    selected: this.selectedItem.categoryIndex === categoryIndex && this.selectedItem.seriesIndex === seriesIndex
                });
                if (stopEnumerating)
                    break;
                if (this.options.stacked) {
                    yRunningTotal += value;
                    yBottom = yTop;
                } else {
                    x += barWidth;
                }
            }
        }
    }
};

Tayberry.prototype.draw = function () {

    this.ctx.save();
    this.enumerateBars(function (bar) {
        this.ctx.fillStyle = bar.selected ? bar.renderedSeries.highlightColour : bar.renderedSeries.colour;
        this.ctx.fillRect(bar.rect.left, bar.rect.top, bar.rect.width(), bar.rect.height());
    }.bind(this));
    this.ctx.restore();

    if (this.options.labels.enabled) {
        this.ctx.save();
        this.enumerateBars(function (bar) {
            this.drawLabel(this.series[bar.seriesIndex].data[bar.categoryIndex].toString(), bar.rect);
        }.bind(this));
        this.ctx.restore();
    }
};

Tayberry.prototype.drawLine = function (x1, y1, x2, y2, colour) {
    this.ctx.save();
    if (colour) {
        this.ctx.strokeStyle = colour;
    }
    this.ctx.beginPath();
    this.ctx.moveTo(x1 + 0.5, y1 + 0.5);
    this.ctx.lineTo(x2 + 0.5, y2 + 0.5);
    this.ctx.stroke();
    this.ctx.restore();
};

Tayberry.prototype.redraw = function () {
    this.clear();
    this.drawTitle();
    this.drawXAxis();
    this.drawYAxis();
    this.drawLegend();
    this.draw();
};

Tayberry.prototype.createTooltip = function () {

    var rect, style, styleSheet;
    style = document.createElement("style");
    document.head.appendChild(style);
    this.styleSheet = style.sheet;

    rect = this.containerElement.getBoundingClientRect();
    this.tooltipElement = document.createElement('div');
    this.tooltipElement.className = 'charty-tooltip';
    this.tooltipElement.style.position = 'absolute';
    this.tooltipElement.style.left = rect.left + 'px';
    this.tooltipElement.style.top = rect.top + 'px';
    this.tooltipElement.style.zIndex = '99999';
    this.tooltipElement.style.borderRadius = '3px';
    this.tooltipElement.style.backgroundColor = 'white';
    this.tooltipElement.style.border = '2px solid black';
    this.tooltipElement.style.padding = '0.15em 0.4em';
    this.tooltipElement.style.display = 'none';
    this.tooltipElement.innerHTML = '';
    if (this.styleSheet.length)
        this.styleSheet.deleteRule(0);
    // this.styleSheet.insertRule('.charty-tooltip::before, .charty-tooltip:before { border-top-color: ' + this.colour + ' !important}', 0);
    document.body.appendChild(this.tooltipElement);
    this.tooltipElement.addEventListener('mousemove', this.onMouseMove.bind(this))
    this.tooltipElement.addEventListener('mouseleave', this.onMouseLeave.bind(this))
};

Tayberry.prototype.drawLegend = function () {
    let totalWidth = 0;
    const indicatorSize = this.mapLogicalUnit(this.options.legend.indicatorSize);
    for (let series of this.series) {
        if (series.name) {
            totalWidth += this.getTextWidth(series.name) + indicatorSize + this.mapLogicalUnit(4) + this.mapLogicalUnit(this.options.elementPadding);
        }
    }
    let x = this.plotArea.left + this.plotArea.width() / 2 - totalWidth / 2,
        y = this.canvas.height - indicatorSize;

    for (let series of this.renderedSeries) {
        if (series.name) {
            this.ctx.fillStyle = series.colour;
            this.ctx.fillRect(x, y, indicatorSize, indicatorSize);
            this.ctx.textBaseline = 'middle';
            this.ctx.fillStyle = this.options.font.colour;
            x += indicatorSize + this.mapLogicalUnit(4);
            this.ctx.fillText(series.name, x, y + indicatorSize / 2);
            x += this.getTextWidth(series.name) + this.mapLogicalUnit(this.options.elementPadding);
        }
    }

};

Tayberry.prototype.drawXAxis = function () {
    var i, barCount, barWidth, x, y;
    barCount = this.renderedSeries[0].data.length;
    barWidth = Math.floor(this.plotArea.width() / this.series[0].data.length);
    this.ctx.save();
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'bottom';
    // this.drawLine(this.plotArea.left, this.plotArea.bottom, this.plotArea.right, this.plotArea.bottom, this.colour);
    for (i = 0; i < barCount; i++) {
        x = this.plotArea.left + Math.floor(i * barWidth + barWidth / 2);
        y = this.plotArea.bottom + this.mapLogicalUnit(this.options.font.size + this.options.elementPadding);
        this.ctx.fillText(this.categories[i], x, y);
    }
    x = this.plotArea.left + this.plotArea.width() / 2;
    y = this.plotArea.bottom + this.mapLogicalUnit(this.options.font.size + this.options.elementPadding) * 2;
    this.ctx.fillText(this.options.xAxis.title, x, y);
    this.ctx.restore();
};

Tayberry.prototype.drawYAxis = function () {
    var yValue, x, y, targetTicks, approxStep, scale, actualStep, yStart;

    this.ctx.save();
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'middle';

    //this.drawLine(this.plotArea.left-1, this.plotArea.top, this.plotArea.left-1, this.plotArea.bottom, this.colour);
    for (yValue = this.yMin; yValue <= this.yMax && this.yStep; yValue += this.yStep) {
        x = this.plotArea.left - this.mapLogicalUnit(this.options.font.size) / 2;
        y = this.plotArea.top + this.plotArea.height() - this.getYHeight(yValue);
        this.ctx.fillText(yValue.toString(), x, y);
        this.drawLine(this.plotArea.left, y, this.plotArea.right, y, this.options.yAxis.gridLines.colour);
    }

    x = 0;
    y = this.plotArea.top + this.plotArea.height() / 2;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    this.ctx.translate(x, y);
    this.ctx.rotate(-Math.PI / 2);
    this.ctx.fillText(this.options.yAxis.title, 0, 0);
    this.ctx.restore();
};

Tayberry.prototype.onAnimate = function (timestamp) {
    var elapsed, scaleFactor;
    elapsed = timestamp - this.animatationStart;
    scaleFactor = Math.min(Tayberry.Easing.inQuad(elapsed, this.animationLength), 1);
    for (let categoryIndex = 0; categoryIndex < this.series[0].data.length; categoryIndex++) {
        for (let seriesIndex = 0; seriesIndex < this.series.length; seriesIndex++) {
            this.renderedSeries[seriesIndex].data[categoryIndex] = scaleFactor * this.series[seriesIndex].data[categoryIndex];
        }
    }
    this.redraw();
    if (scaleFactor < 1) {
        this.animator = requestAnimationFrame(this.onAnimate.bind(this));
    }
};

Tayberry.prototype.onMouseLeave = function (event) {
    if ((event.currentTarget == this.canvas && event.relatedTarget !== this.tooltipElement) || (event.currentTarget == this.tooltipElement && event.relatedTarget !== this.canvas)) {
        this.selectedItem = {};
        this.tooltipElement.style.display = 'none';
        this.redraw();
    }
};

Tayberry.prototype.handleMouseMove = function (clientX, clientY) {
    let boundingRect = new Rect(this.canvas.getBoundingClientRect());
    let ret = false;
    if (boundingRect.containsPoint(clientX, clientY)) {
        let x = clientX - boundingRect.left;
        let y = clientY - boundingRect.top;

        let hitTestResult = this.hitTest(this.mapLogicalUnit(x), this.mapLogicalUnit(y));
        if (hitTestResult.found) {
            this.tooltipElement.style.display = 'block';
            this.tooltipElement.innerHTML = this.series[hitTestResult.seriesIndex].data[hitTestResult.categoryIndex];
            let tooltipRect = this.tooltipElement.getBoundingClientRect();
            this.tooltipElement.style.borderColor = this.renderedSeries[hitTestResult.seriesIndex].highlightColour;
            this.tooltipElement.style.left = window.pageXOffset + boundingRect.left + this.mapScreenUnit(hitTestResult.rect.width()) / 2 + hitTestResult.rect.left / this.scaleFactor - tooltipRect.width / 2 + 'px';
            this.tooltipElement.style.top = window.pageYOffset + boundingRect.top + this.mapScreenUnit(hitTestResult.rect.top) - tooltipRect.height - this.options.elementPadding + 'px';
            this.selectedItem = hitTestResult;
            ret = true;
        }
    }
    return ret;
};

Tayberry.prototype.onTouchStart = function (event) {
    for (let touch of event.targetTouches) {
        if (this.handleMouseMove(touch.clientX, touch.clientY)) {
            event.preventDefault();
            this.redraw();
            break;
        }
    }
};


Tayberry.prototype.onMouseMove = function (event) {
    let oldSelectedItem = this.selectedItem;
    if (!this.handleMouseMove(event.clientX, event.clientY)) {
        this.selectedItem = {};
    }

    if (oldSelectedItem.categoryIndex !== this.selectedItem.categoryIndex && oldSelectedItem.seriesIndex !== this.selectedItem.seriesIndex) {
        this.redraw();
    }
};

Tayberry.prototype.onWindowResize = function (event) {
    //TODO: THROTTLE
    this.initialise();
    this.calculatePlotArea();
    this.calculateYAxisExtent();
    this.finalisePlotArea();
    this.redraw();
};

module.exports = Tayberry;