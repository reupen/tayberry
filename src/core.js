'use strict';
import { Colour } from './helpers/colour';
import * as Utils from './helpers/utils.js';

import { Tayberry } from './base';
import { Axis } from './axis';
import { BarRenderer } from './renderer.bar';
import { LineRenderer } from './renderer.line';
import { Legend } from './legend';

let currentAutoColourIndex = 0;

const RENDERER_TYPES = ['bar', 'line'];

Tayberry.getAutoColour = function () {
  let ret =
    Tayberry.defaultColours[currentAutoColourIndex % Tayberry.defaultColours.length];
  currentAutoColourIndex++;
  return ret;
};

Tayberry.getDataValue = function (dataPoint) {
  let ret;
  if (Array.isArray(dataPoint)) {
    ret = dataPoint[1];
  } else {
    ret = dataPoint;
  }
  return ret;
};

Tayberry.getDataXValue = function (data, index) {
  let ret;
  if (Array.isArray(data[index])) {
    ret = data[index][0];
  } else {
    ret = index;
  }
  return ret;
};

Tayberry.setDataValue = function (data, index, newValue) {
  if (Array.isArray(data[index])) {
    data[index][1] = newValue;
  } else {
    data[index] = newValue;
  }
};

Tayberry.prototype.createCanvas = function () {
  let ret = document.createElement('canvas');
  // IE11 hack-fix - clientWidth sometimes incorrect on first access
  ret.style.width = Math.floor(this.containerElement.clientWidth) + 'px';
  ret.style.width = Math.floor(this.containerElement.clientWidth) + 'px';
  ret.style.height = Math.floor(this.containerElement.clientHeight) + 'px';
  ret.style.position = 'absolute';
  this.containerElement.appendChild(ret);
  return ret;
};

Tayberry.prototype.create = function (containerElement) {
  if (typeof containerElement == 'string') {
    this.containerElement = document.getElementById(containerElement);
  } else {
    this.containerElement = containerElement;
  }
  this.resizeObserver = new ResizeObserver(() => this.onWindowResize());
  this.labelsCanvas = this.createCanvas();
  this.labelsCtx = this.labelsCanvas.getContext('2d');
  this.plotCanvas = this.createCanvas();
  this.plotCtx = this.plotCanvas.getContext('2d');
  this.options = {};
  this.yAxes = null;
  this.xAxes = null;
  this.initialise();
};

Tayberry.prototype.destroy = function () {
  if (this.animator) {
    window.cancelAnimationFrame(this.animator);
  }
  this.labelsCanvas.parentNode.removeChild(this.labelsCanvas);
  this.tooltipElement.parentNode.removeChild(this.tooltipElement);
  this.options = {};
  this.plotCanvas.removeEventListener('click', this.onClickReal);
  this.plotCanvas.removeEventListener('mousemove', this.onMouseMoveReal);
  this.plotCanvas.removeEventListener('mouseleave', this.onMouseLeaveReal);
  this.plotCanvas.parentNode.removeChild(this.plotCanvas);
  // this.plotCanvas.removeEventListener('touchstart', this.onTouchStartReal);
  this.resizeObserver.disconnect();
};

Tayberry.prototype.initialise = function () {
  this.scaleFactor = window.devicePixelRatio || 1.0;
  this.labelsCanvas.width = Math.round(
    this.labelsCanvas.clientWidth * this.scaleFactor
  );
  this.labelsCanvas.height = Math.round(
    this.labelsCanvas.clientHeight * this.scaleFactor
  );
  this.plotCanvas.width = this.labelsCanvas.width;
  this.plotCanvas.height = this.labelsCanvas.height;
  this.scaleFactorX = this.labelsCanvas.width / this.labelsCanvas.clientWidth;
  this.scaleFactorY = this.labelsCanvas.height / this.labelsCanvas.clientHeight;
  this.selectedItem = {};
  this.plotArea = null;
};

Tayberry.prototype.getFontHeight = function (font, forDom) {
  let ret = font.size;
  if (font.autoScale) ret *= Math.pow(this.labelsCanvas.width / 800, 0.25);
  if (!forDom) ret = this.mapLogicalYUnit(ret);
  return ret;
};

Tayberry.prototype.createFontString = function (font, forDom) {
  return (
    (font.style ? font.style + ' ' : '')
    + this.getFontHeight(font, forDom).toFixed(1)
    + 'px '
    + font.face
  );
};

Tayberry.prototype.updateFonts = function () {
  //this.labelsCtx.font = this.createFontString(this.options.font);
  this.titleFont = this.createFontString(this.options.title.font);
  this.labelFont = this.createFontString(this.options.labels.font);
  this.legend.updateFonts();
  this.yAxes.map((e) => e.updateFonts());
  this.xAxes.map((e) => e.updateFonts());
};

Tayberry.prototype.setOptions = function (options) {
  let optionOverrides = [this.defaultOptions()];
  if (!options.presets) {
    options.presets = ['default'];
  }
  if (options.presets) {
    for (let index = 0; index < options.presets.length; index++) {
      optionOverrides.push(Tayberry.presets[options.presets[index]]);
    }
  }
  optionOverrides.push(options);
  this.options = Utils.deepAssign({}, optionOverrides);
  this.options.title.font = Utils.deepAssign({}, [
    this.options.font,
    this.options.title.font,
  ]);
  this.options.tooltips.font = Utils.deepAssign({}, [
    this.options.font,
    this.options.tooltips.font,
  ]);
  this.options.labels.font = Utils.deepAssign({}, [
    this.options.font,
    this.options.labels.font,
  ]);
  this.options.legend.font = Utils.deepAssign({}, [
    this.options.font,
    this.options.legend.font,
  ]);
  this.options.allAxes.font = Utils.deepAssign({}, [
    this.options.font,
    this.options.allAxes.font,
  ]);
  this.options.allAxes.title.font = Utils.deepAssign({}, [
    this.options.font,
    this.options.allAxes.title.font,
  ]);
  if (!Array.isArray(this.options.yAxis))
    this.options.yAxis = [this.options.yAxis || {}];
  if (!Array.isArray(this.options.xAxis))
    this.options.xAxis = [this.options.xAxis || {}];
  for (let i = 0; i < this.options.yAxis.length; i++) {
    this.options.yAxis[i] = Utils.deepAssign({}, [
      i === 0 ? Tayberry.defaultPrimaryYAxis : Tayberry.defaultSecondaryYAxis,
      this.options.allAxes,
      this.options.yAxis[i],
    ]);
  }
  for (let i = 0; i < this.options.xAxis.length; i++) {
    this.options.xAxis[i] = Utils.deepAssign({}, [
      Tayberry.defaultXAxis,
      this.options.allAxes,
      this.options.xAxis[i],
    ]);
  }

  if (!Array.isArray(this.options.series)) this.options.series = [this.options.series];

  this.yAxes = [];
  this.xAxes = [];
  for (let i = 0; i < this.options.xAxis.length; i++) {
    this.xAxes.push(
      Axis.create(this, this.options.xAxis[i], i, 'x', this.options.swapAxes)
    );
  }
  for (let i = 0; i < this.options.yAxis.length; i++) {
    this.yAxes.push(
      Axis.create(this, this.options.yAxis[i], i, 'y', this.options.swapAxes)
    );
  }
  this.legend = new Legend(this);
  this.updateFonts();
  this.createRenderers();
  this.calculatePlotArea();
  this.callbacks['onInit'].forEach((func) => func());
  this.plotCanvas.addEventListener(
    'click',
    (this.onClickReal = this.onClick.bind(this))
  );
  this.plotCanvas.addEventListener(
    'mousemove',
    (this.onMouseMoveReal = this.onMouseMove.bind(this))
  );
  this.plotCanvas.addEventListener(
    'mouseleave',
    (this.onMouseLeaveReal = this.onMouseLeave.bind(this))
  );
  //this.plotCanvas.addEventListener('touchstart', this.onTouchStartReal = this.onTouchStart.bind(this));
  this.resizeObserver.observe(this.containerElement);
};

Tayberry.prototype.addSeries = function (series) {
  if (!Array.isArray(series)) series = [series];

  let groupedSeries = this.processSeries(series);

  this.options.series = this.options.series.concat(series);

  for (let i = 0; i < RENDERER_TYPES.length; i++) {
    const type = RENDERER_TYPES[i];

    if (groupedSeries[type].length) {
      if (!this.renderersByType[type]) {
        this.createRenderer(type, groupedSeries[type]);
      } else {
        this.renderersByType[type].addSeries(groupedSeries[type]);
      }
    }
  }

  this.calculatePlotArea();
  this.callbacks['onResize'].forEach((func) => func());
  this.clear(true, true);
  this.drawLabelLayer();

  if (this.options.animations.enabled) {
    for (let i = 0; i < series.length; i++)
      this.setSeriesVisibility(series[i], true, 'height');
  } else {
    this.drawPlotLayer();
  }
};

Tayberry.prototype.removeSeries = function (index) {
  const series = this.options.series[index];

  this.setSeriesVisibility(series, false, 'height', () => {
    if (!series.renderer.removeSeries(series)) {
      series.renderer.deinitialise();
      this.renderers.splice(this.renderers.indexOf(series.renderer), 1);
      delete this.renderersByType[series.plotType];
    }
    this.options.series.splice(index, 1);

    this.calculatePlotArea();
    this.callbacks['onResize'].forEach((func) => func());
    this.clear(true, true);
    this.drawLabelLayer();
    this.drawPlotLayer();
  });
};

Tayberry.calculateHighlightColour = function (colour) {
  let newColour = new Colour(colour);
  return newColour.increaseBy(30 * (newColour.sum >= 180 * 3 ? -1 : 1)).toString();
};

Tayberry.calculateGlowColour = function (highlightColour) {
  let newColour = new Colour(highlightColour);
  newColour.a = 0.4;
  return newColour.toString();
};

Tayberry.prototype.processSeries = function (series) {
  let groupedSeries = { bar: [], line: [] };

  for (let i = 0; i < series.length; i++) {
    const curSeries = (series[i] = Utils.deepAssign({}, [
      Tayberry.defaultSeries,
      series[i],
    ]));
    curSeries.index = i;
    curSeries.colour = curSeries.colour || Tayberry.getAutoColour();
    curSeries.highlightColour =
      curSeries.highlightColour || Tayberry.calculateHighlightColour(curSeries.colour);
    curSeries.glowColour =
      curSeries.glowColour || Tayberry.calculateGlowColour(curSeries.highlightColour);
    curSeries.rState = {
      colour: curSeries.colour,
      highlightColour: curSeries.highlightColour,
      glowColour: curSeries.glowColour,
    };
    curSeries.xAxis = this.xAxes[curSeries.xAxisIndex || 0];
    curSeries.yAxis = this.yAxes[curSeries.yAxisIndex || 0];
    curSeries.plotType = curSeries.plotType || this.options.plotType;
    if (Object.prototype.hasOwnProperty.call(groupedSeries, curSeries.plotType)) {
      groupedSeries[curSeries.plotType].push(curSeries);
    }
  }
  return groupedSeries;
};

Tayberry.prototype.createRenderers = function () {
  let series;
  if (!Array.isArray(this.options.series)) {
    series = [this.options.series];
  } else {
    series = this.options.series;
  }

  let groupedSeries = this.processSeries(series);

  for (let i = 0; i < RENDERER_TYPES.length; i++) {
    const type = RENDERER_TYPES[i];

    if (groupedSeries[type].length) {
      this.createRenderer(type, groupedSeries[type]);
    }
  }
};

Tayberry.prototype.createRenderer = function (type, series) {
  let typeMap = {
    bar: BarRenderer,
    line: LineRenderer,
  };

  let renderer = new typeMap[type](this.plotCtx, this, series);
  this.renderersByType[type] = renderer;
  this.renderers.push(renderer);
};

Tayberry.prototype.getDataMinMax = function (axis) {
  var minNormal, maxNormal, minStacked, maxStacked;
  if (this.options.barPlot.mode === 'stacked') {
    let seriesPositiveTotals = [];
    let seriesNegativeTotals = [];
    const barSeries = this.options.series.filter(
      (series) => series.plotType === 'bar' && series.yAxis === axis
    );
    if (barSeries.length) {
      for (
        let categoryIndex = 0;
        categoryIndex < barSeries[0].data.length;
        categoryIndex++
      ) {
        seriesPositiveTotals[categoryIndex] = 0;
        seriesNegativeTotals[categoryIndex] = 0;
        for (let seriesIndex = 0; seriesIndex < barSeries.length; seriesIndex++) {
          const value = Tayberry.getDataValue(
            barSeries[seriesIndex].data[categoryIndex]
          );
          if (!Utils.isMissingValue(value)) {
            if (value < 0) {
              seriesNegativeTotals[categoryIndex] += value;
            } else {
              seriesPositiveTotals[categoryIndex] += value;
            }
          }
        }
      }
    }
    minStacked = Math.min(
      0,
      Utils.reduce(seriesNegativeTotals, Math.min, undefined, true)
    );
    maxStacked = Math.max(
      Utils.reduce(seriesPositiveTotals, Math.max, undefined, true),
      0
    );
  }
  {
    let seriesMinima = [];
    let seriesMaxima = [];
    for (let index = 0; index < this.options.series.length; index++) {
      const series = this.options.series[index];
      if (
        series.yAxis === axis
        && (series.plotType !== 'bar' || this.options.barPlot.mode !== 'stacked')
      ) {
        seriesMinima.push(
          Utils.reduce(series.data, Math.min, Tayberry.getDataValue, true)
        );
        seriesMaxima.push(
          Utils.reduce(series.data, Math.max, Tayberry.getDataValue, true)
        );
      }
    }
    minNormal = Utils.reduce(seriesMinima, Math.min, undefined, true);
    maxNormal = Utils.reduce(seriesMaxima, Math.max, undefined, true);
  }
  const min = Utils.reduce([minNormal, minStacked], Math.min, undefined, true);
  const max = Utils.reduce([maxNormal, maxStacked], Math.max, undefined, true);
  return [min, max];
};

Tayberry.prototype.getDataXMinMax = function (axis) {
  var min, max;
  const seriesMinima = [];
  const seriesMaxima = [];
  for (let index = 0; index < this.options.series.length; index++) {
    const series = this.options.series[index];
    if (series.xAxis === axis) {
      seriesMinima.push(
        Utils.reduce(series.data, Math.min, Tayberry.getDataXValue, true)
      );
      seriesMaxima.push(
        Utils.reduce(series.data, Math.max, Tayberry.getDataXValue, true)
      );
    }
  }
  min = Utils.reduce(seriesMinima, Math.min, undefined, true);
  max = Utils.reduce(seriesMaxima, Math.max, undefined, true);
  return [min, max];
};

Tayberry.prototype.createTooltip = function () {
  if (this.tooltipElement) {
    this.tooltipElement.parentNode.removeChild(this.tooltipElement);
    this.tooltipElement = null;
  }
  this.tooltipElement = document.createElement('div');
  this.tooltipElement.className = 'tayberry-tooltip';
  this.tooltipElement.style.position = 'absolute';
  this.tooltipElement.style.left = '0px';
  this.tooltipElement.style.top = '0px';
  this.tooltipElement.style.zIndex = '99999';
  this.tooltipElement.style.font = this.createFontString(
    this.options.tooltips.font,
    true
  );
  this.tooltipElement.style.borderRadius = '3px';
  this.tooltipElement.style.backgroundColor = 'white';
  this.tooltipElement.style.border = '2px solid #bbb';
  this.tooltipElement.style.padding = '0.15em 0.4em';
  this.tooltipElement.style.display = 'none';
  this.tooltipElement.innerHTML = '';
  document.body.appendChild(this.tooltipElement);
  this.tooltipElement.addEventListener('mousemove', this.onMouseMove.bind(this));
  this.tooltipElement.addEventListener('mouseleave', this.onMouseLeave.bind(this));
};
