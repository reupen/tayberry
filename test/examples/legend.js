/* global Tayberry */

Tayberry.create('chart1', {
    title: {
        text: 'UK household sizes'
    },
    yAxis: {
        labelFormat: 'percentage'
    },
    xAxis: {
        categories: ['1', '2', '3', '4', '5+']
    },
    labels: {
        enabled: true
    },
    series: [{
        data: [.132, .290, .224, .180, .173],
        name: '1961 abcd'
    }, {
        data: [.306, .341, .156, .129, .069],
        name: '2011 abcd'
    }, {
        data: [.306, .341, .156, .129, .069],
        name: '2011 abcd'
    }, {
        data: [.306, .341, .156, .129, .069],
        name: '2011 abcd'
    }, {
        data: [.306, .341, .156, .129, .069],
        name: '2011 abcd'
    }, {
        data: [.306, .341, .156, .129, .069],
        name: '2011 abcd'
    }, {
        data: [.306, .341, .156, .129, .069],
        name: '2011 abcd'
    }, {
        data: [.306, .341, .156, .129, .069],
        name: '2011 abcd'
    }, {
        data: [.306, .341, .156, .129, .069],
        name: '2011 abcd'
    }]

});

Tayberry.create('chart2', {
    title: {
        text: 'Contribution to revenue growth'
    },
    xAxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
        title: {
            text: 'Month'
        }
    },
    yAxis: {
        title: {
            text: 'Impact'
        },
        labelFormat: 'currency'
    },
    barPlot: {
        mode: 'stacked'
    },
    tooltips: {
        shared: true
    },
    series: [{
        data: [10, 9, 8, 7, 6, 5, 4, 3, 3, 0, -3, -5],
        name: 'Frequency'
    }, {
        data: [-5, -6, -8, -10, -9, -7, -7, -3, -2, 2, 1, 3],
        name: 'Price'
    }, {
        data: [2, 1, 3, -1, -3, -3, -4, 3, 4, 7, 3, 2],
        name: 'Special offers'
    }, {
        data: [5, 6, 7, 6, 2, 2, 10, 6, 1, 2, -3, -6],
        name: 'Transaction size'
    }]
});

Tayberry.create('chart3', {
    title: {
        text: 'UK household sizes'
    },
    yAxis: {
        labelFormat: 'percentage'
    },
    xAxis: {
        categories: ['1', '2', '3', '4', '5+']
    },
    labels: {
        enabled: true
    },
    series: [{
        data: [.132, .290, .224, .180, .173],
        name: '1961'
    }, {
        data: [.306, .341, .156, .129, .069],
        name: '2011'
    }]

});

Tayberry.create('chart4', {
    title: {
        text: 'UK population by region (mid-2013)'
    },
    xAxis: {
        categories: ['North East',
            'North West',
            'Yorkshire and The Humber',
            'East Midlands',
            'West Midlands',
            'East',
            'London',
            'South East',
            'South West'
        ]
    },
    swapAxes: true,
    yAxis: {
        labelFormatter: function (val) {
            return (val / 1000000).toFixed(1) + 'm';
        }
    },
    series: [{
        data: [2610481,
            7103261,
            5337711,
            4598431,
            5674712,
            5954316,
            8416543,
            8792766,
            5377596],
        name: 'Population (people)'
    }]
});

Tayberry.create('chart5', {
    title: {
        text: 'UK household sizes'
    },
    yAxis: {
        labelFormat: 'percentage'
    },
    xAxis: {
        categories: ['1', '2', '3', '4', '5+'],
        title: {
            text: '123',
            font: {
                style: 'italic bold'
            }
        }
    },
    labels: {
        enabled: true
    },
    plotType: 'line',
    series: [{
        data: [.132, .290, .224, .180, .173],
        name: '1961',
        colour: '#6FE87B'
    }, {
        data: [.306, .341, .156, .129, .069],
        name: '2011',
        colour: '#FFAB51'
    }]

});

Tayberry.create('chart6', {
    title: {
        text: 'UK household sizes'
    },
    yAxis: [{
        labelFormat: 'percentage'
    }, {
        labelFormat: 'percentage'
    }],
    xAxis: [{
        min: 0,
        max: 10,
        type: 'linear',
        title: {
            text: '123',
            font: {
                style: 'italic bold'
            }
        }
    }],
    labels: {
        enabled: true
    },
    plotType: 'line',
    series: [{
        data: [[0, .132], [3, .290], [4, .224], [6, .180], [10, .173]],
        name: '1961',
        colour: '#6FE87B'
    }, {
        data: [[1, .306], [2, .341], [3, .156], [4, .129], [5, .069]],
        name: '2011',
        colour: '#FFAB51',
        plotType: 'bar',
        yAxisIndex: 1
    }]

});

var randomData1 = [];
var randomData2 = [];
for (var i = 0; i < 500; i++) {
    randomData1.push(Math.random() * 50 + 50);
    randomData2.push(Math.random() * 50);
}

Tayberry.create('chart7', {
    title: {
        text: 'Random data - 1000 points'
    },
    yAxis: {},
    xAxis: {
        type: 'linear',
        title: {
            text: '123',
            font: {
                style: 'italic bold'
            }
        }
    },
    plotType: 'line',
    series: [{
        data: randomData1,
        name: '1961',
        colour: '#6FE87B'
    }, {
        data: randomData2,
        name: '2011',
        colour: '#FFAB51'
    }]

});