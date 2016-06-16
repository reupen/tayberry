'use strict';
import {Tayberry} from './base';
import * as Utils from './helpers/utils.js';
import * as constants from './constants';

Tayberry.prototype.defaultOptions = function () {
    return {
        title: {
            text: '',
            font: {
                size: 20
            }
        },
        font: {
            colour: '#444',
            size: 12,
            face: 'sans-serif',
            style: '',
            autoScale: true
        },
        allAxes: {
            font: {},
            title: {
                font: {}
            }
        },
        xAxis: [],
        yAxis: [],
        animations: {
            enabled: true,
            length: 500
        },
        series: [],
        backgroundColour: undefined,
        swapAxes: false,
        plotType: 'bar',
        barPlot: {
            mode: 'normal', //[normal|stacked|overlaid]
            barPadding: 2,
            categorySpacing: 0.3
        },
        linePlot: {
            lineWidth: 2,
            highlightedLineWidth: 4,
            showMarkers: 'auto',
            noMarkersThreshold: 100,
            markerSize: 10,
            highlightedMarkerSize: 18
        },
        elementSmallPadding: 5,
        elementLargePadding: 10,
        presets: [],
        tooltips: {
            shared: false,
            headerTemplate: '<strong>{category}</strong><table>',
            valueTemplate: '<tr><td style="padding-right: 0.5em"><span style="color: {colour}">\u25CF</span> {name}</td><td style="text-align: right">{value}</td></tr>',
            footerTemplate: '</table>',
            font: {}
        },
        legend: {
            enabled: true,
            indicatorSize: 15,
            font: {},
            hiddenAlphaMultiplier: 0.5,
            placement: 'bottom'
        },
        labels: {
            enabled: false,
            verticalAlignment: 'top',
            verticalPosition: 'outside',
            font: {}
        }
    }
};

Tayberry.defaultSeries = {
    visible: constants.visibilityState.visible
};

Tayberry.defaultXAxis = {
    title: {
        text: '',
        font: {}
    },
    type: 'categorial',
    min: null,
    max: null,
    tickStep: 40,
    tickStepValue: null,
    font: {},
    categories: [],
    labelPosition: 'middle', //left|middle|right
    placement: 'auto',
    gridLines: {}
};

Tayberry.defaultYAxis = {
    title: {
        text: '',
        font: {}
    },
    min: undefined,
    max: undefined,
    tickStep: 40,
    tickStepValue: null,
    font: {},
    labelFormat: 'number', //[number|percentage|currency],
    labelFormatter: undefined,
    labelPrefix: undefined,
    labelSuffix: undefined,
    currencySymbol: '£',
    placement: 'auto',
    type: 'linear',
    gridLines: {}

};

Tayberry.defaultPrimaryYAxis = Utils.deepAssign({}, [Tayberry.defaultYAxis, {
    gridLines: {
        colour: '#ccc'
    }
}]);

Tayberry.defaultSecondaryYAxis = Tayberry.defaultYAxis;

Tayberry.presets = {
    histogram: {
        barPlot: {
            mode: 'overlaid',
            categorySpacing: 0,
            barPadding: 1
        }
    },
    darkGrid: {
        allAxes: {
            gridLines: {
                colour: 'rgba(255, 255, 255, 0.6)'
            }
        },
        plotBackgroundColour: '#E5E5E5'
    }
};

Tayberry.defaultColours = [
    '#6FE87B', //green
    '#FFAB51', //orange
    '#51A8FF', //blue
    '#B651FF', //purple
    '#FF6051', //red
    '#636363', //dark grey
    '#FFE314', //yellow
    '#A88572', //brown
    '#B7B7B7' //light grey
];
