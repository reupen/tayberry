'use strict';
var Tayberry = require('./tayberry.base.js').Tayberry;

Tayberry.prototype.defaultOptions = function () {
    return {
        defaultPalette: [
            '#6FE87B', //green
            '#FFAB51', //orange
            '#51A8FF', //blue
            '#B651FF', //purple
            '#FF6051', //red
            '#636363' //dark grey
        ],
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
            min: 0,
            max: 100,
            step: 1,
            categories: [],
            labelPosition: 'middle', //left|middle|right
            placement: 'end'
        },
        yAxis: {
            title: '',
            gridLines: {
                colour: '#ccc'
            },
            min: undefined,
            max: undefined,
            tickStep: 30,
            labelFormat: 'number', //[number|percentage|currency],
            labelFormatter: undefined,
            labelPrefix: undefined,
            labelSuffix: undefined,
            currencySymbol: '£',
            placement: 'start',
            type: 'linear'
        },
        series: [],
        barChart: {
            orientation: "vertical"
        },
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
