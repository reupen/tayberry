'use strict';
var Tayberry = require('./tayberry.base.js').Tayberry;

Tayberry.prototype.defaultOptions = function () {
    return {
        defaultPalette : [
            '#6FE87B', //green
            '#FFAB51', //orange
            '#51A8FF', //blue
            '#B651FF', //purple
            '#FF6051', //red
            '#636363' //dark grey
        ],
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
            step: 1,
            categories: []
        },
        yAxis: {
            title: 'Y title',
            gridLines: {
                colour: '#ccc'
            },
            min: undefined,
            max: undefined,
            tickStep: 30
        },
        series: [],
        stacked: false,
        barPadding: 2,
        elementPadding: 5,
        categorySpacing: 0.3,
        legend: {
            enabled: true,
            indicatorSize: 15
        },
        labels: {
            enabled: true,
            verticalAlignment: 'top',
            verticalPosition: 'outside'
        }
    }
};
