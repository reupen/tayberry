'use strict';
var Tayberry = require('./tayberry.base.js').Tayberry;

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
            face: 'sans-serif'
        },
        xAxis: {
            title: '',
            type: 'categorial',
            min: null,
            max: null,
            tickStep: 40,
            tickStepValue: null,
            categories: [],
            labelPosition: 'middle', //left|middle|right
            placement: 'auto',
            gridLines: {}
        },
        yAxis: {
            title: '',
            gridLines: {
                colour: '#ccc'
            },
            min: undefined,
            max: undefined,
            tickStep: 40,
            tickStepValue: null,
            labelFormat: 'number', //[number|percentage|currency],
            labelFormatter: undefined,
            labelPrefix: undefined,
            labelSuffix: undefined,
            currencySymbol: '£',
            placement: 'auto',
            type: 'linear'
        },
        series: [],
        swapAxes: false,
        barMode: 'normal', //[normal|stacked|overlaid]
        barPadding: 2,
        elementSmallPadding: 5,
        elementLargePadding: 10,
        categorySpacing: 0.3,
        presets: [],
        tooltips: {
            shared: false,
            headerTemplate: '<strong>{category}</strong><table>',
            valueTemplate: '<tr><td style="padding-right: 0.5em"><span style="color: {colour}">\u25CF</span> {name}</td><td style="text-align: right">{value}</td></tr>',
            footerTemplate: '</table>'
        },
        legend: {
            enabled: true,
            indicatorSize: 15
        },
        labels: {
            enabled: false,
            verticalAlignment: 'top',
            verticalPosition: 'outside'
        }
    }
};

Tayberry.presets = {
    histogram: {
        xAxis: {
            labelPosition: 'left'
        },
        barMode: 'overlaid',
        categorySpacing: 0,
        barPadding: 1
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
