/* global Tayberry, $ */
'use strict';

var randomData1 = [];
var randomData2 = [];

for (var i = 0; i < 500; i++) {
  randomData1.push(Math.random() * 50 + 50);
  randomData2.push(Math.random() * 50);
}

var createdCharts = {};

var standardTestCharts = {
  chart1: {
    title: {
      text: 'Forecast errors',
    },
    yAxis: {
      title: {
        text: 'Frequency',
      },
    },
    xAxis: {
      title: {
        text: 'Error',
      },
      type: 'linear',
      min: -50,
      max: 50,
      tickStepValue: 10,
    },
    presets: ['histogram', 'darkGrid'],
    series: [
      {
        data: [
          11,
          13,
          20,
          19,
          37,
          38,
          43,
          49,
          53,
          80,
          84,
          102,
          122,
          111,
          115,
          143,
          161,
          148,
          196,
          210,
          213,
          220,
          226,
          227,
          235,
          189,
          233,
          201,
          188,
          158,
          177,
          145,
          120,
          101,
          112,
          104,
          69,
          71,
          52,
          38,
          31,
          23,
          17,
          13,
          12,
          12,
          9,
          6,
          6,
          4,
        ],
        name: 'Sales',
        colour: 'rgba(140, 40, 138, 0.5)',
      },
      {
        data: [
          4,
          3,
          1,
          4,
          15,
          9,
          23,
          26,
          35,
          44,
          30,
          70,
          58,
          75,
          85,
          107,
          112,
          120,
          144,
          158,
          184,
          196,
          197,
          190,
          202,
          222,
          221,
          226,
          209,
          221,
          191,
          198,
          189,
          168,
          151,
          142,
          121,
          112,
          80,
          82,
          69,
          49,
          51,
          51,
          34,
          27,
          20,
          11,
          11,
          12,
        ],
        name: 'Customers',
        colour: 'rgba(48, 140, 100, 0.5)',
      },
    ],
  },
  chart2: {
    title: {
      text: 'Contribution to revenue growth',
    },
    animations: {
      enabled: false,
    },
    xAxis: {
      categories: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sept',
        'Oct',
        'Nov',
        'Dec',
      ],
      title: {
        text: 'Month',
      },
    },
    yAxis: {
      title: {
        text: 'Impact',
      },
      labelFormat: 'currency',
    },
    barPlot: {
      mode: 'stacked',
    },
    tooltips: {
      shared: true,
    },
    series: [
      {
        data: [10, 9, 8, 7, 6, 5, 4, 3, 3, 0, -3, -5],
        name: 'Frequency',
      },
      {
        data: [-5, -6, -8, -10, -9, -7, -7, -3, -2, 2, 1, 3],
        name: 'Price',
      },
      {
        data: [2, 1, 3, -1, -3, -3, -4, 3, 4, 7, 3, 2],
        name: 'Special offers',
      },
      {
        data: [5, 6, 7, 6, 2, 2, 10, 6, 1, 2, -3, -6],
        name: 'Transaction size',
      },
    ],
  },
  chart3: {
    title: {
      text: 'UK household sizes',
    },
    yAxis: {
      labelFormat: 'percentage',
    },
    xAxis: {
      categories: ['1', '2', '3', '4', '5+'],
    },
    labels: {
      enabled: true,
    },
    series: [
      {
        data: [0.132, 0.29, 0.224, 0.18, 0.173],
        name: '1961',
      },
      {
        data: [0.306, 0.341, 0.156, 0.129, 0.069],
        name: '2011',
      },
    ],
  },
  chart4: {
    title: {
      text: 'UK population by region (mid-2013)',
    },
    xAxis: {
      categories: [
        'North East',
        'North West',
        'Yorkshire and The Humber',
        'East Midlands',
        'West Midlands',
        'East',
        'London',
        'South East',
        'South West',
      ],
    },
    swapAxes: true,
    yAxis: {
      labelFormatter: function (val) {
        return (val / 1000000).toFixed(1) + 'm';
      },
    },
    series: [
      {
        data: [
          2610481,
          7103261,
          5337711,
          4598431,
          5674712,
          5954316,
          8416543,
          8792766,
          5377596,
        ],
        name: 'Population (people)',
      },
    ],
  },
  chart5: {
    title: {
      text: 'UK household sizes',
    },
    yAxis: {
      labelFormat: 'percentage',
    },
    xAxis: {
      categories: ['1', '2', '3', '4', '5+'],
      title: {
        text: '123',
        font: {
          style: 'italic bold',
        },
      },
    },
    labels: {
      enabled: true,
    },
    plotType: 'line',
    series: [
      {
        data: [0.132, 0.29, 0.224, 0.18, 0.173],
        name: '1961',
        colour: '#6FE87B',
      },
      {
        data: [0.306, 0.341, 0.156, 0.129, 0.069],
        name: '2011',
        colour: '#FFAB51',
      },
    ],
  },
  chart6: {
    title: {
      text: 'UK household sizes',
    },
    yAxis: [
      {
        labelFormat: 'percentage',
      },
      {
        labelFormat: 'percentage',
      },
    ],
    xAxis: [
      {
        min: 0,
        max: 10,
        type: 'linear',
        title: {
          text: '123',
          font: {
            style: 'italic bold',
          },
        },
      },
    ],
    labels: {
      enabled: true,
    },
    plotType: 'line',
    series: [
      {
        data: [
          [0, 0.132],
          [3, 0.29],
          [4, 0.224],
          [6, 0.18],
          [10, 0.173],
        ],
        name: '1961',
        colour: '#6FE87B',
      },
      {
        data: [
          [1, 0.306],
          [2, 0.341],
          [3, 0.156],
          [4, 0.129],
          [5, 0.069],
        ],
        name: '2011',
        colour: '#FFAB51',
        plotType: 'bar',
        yAxisIndex: 1,
      },
    ],
  },
  chart7: {
    title: {
      text: 'Random data - 1000 points',
    },
    yAxis: {},
    xAxis: {
      type: 'linear',
      title: {
        text: '123',
        font: {
          style: 'italic bold',
        },
      },
    },
    plotType: 'line',
    series: [
      {
        data: randomData1,
        name: '1961',
        colour: '#6FE87B',
      },
      {
        data: randomData2,
        name: '2011',
        colour: '#FFAB51',
      },
    ],
  },
};

var legendTestCharts = {
  chart1: {
    title: {
      text: 'UK household sizes',
    },
    yAxis: {
      labelFormat: 'percentage',
    },
    xAxis: {
      categories: ['1', '2', '3', '4', '5+'],
    },
    labels: {
      enabled: true,
    },
    legend: {
      placement: 'bottom',
    },
    series: [
      {
        data: [0.132, 0.29, 0.224, 0.18, 0.173],
        name: '1961 abcd',
      },
      {
        data: [0.306, 0.341, 0.156, 0.129, 0.069],
        name: '2011 abcd',
      },
      {
        data: [0.306, 0.341, 0.156, 0.129, 0.069],
        name: '2011 abcd',
      },
      {
        data: [0.306, 0.341, 0.156, 0.129, 0.069],
        name: '2011 abcd',
      },
      {
        data: [0.306, 0.341, 0.156, 0.129, 0.069],
        name: '2011 abcd',
      },
      {
        data: [0.306, 0.341, 0.156, 0.129, 0.069],
        name: '2011 abcd',
      },
      {
        data: [0.306, 0.341, 0.156, 0.129, 0.069],
        name: '2011 abcd',
      },
      {
        data: [0.306, 0.341, 0.156, 0.129, 0.069],
        name: '2011 abcd',
      },
      {
        data: [0.306, 0.341, 0.156, 0.129, 0.069],
        name: '2011 abcd',
      },
    ],
  },
  chart2: {
    title: {
      text: 'Contribution to revenue growth',
    },
    xAxis: {
      categories: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sept',
        'Oct',
        'Nov',
        'Dec',
      ],
      title: {
        text: 'Month',
      },
    },
    yAxis: {
      title: {
        text: 'Impact',
      },
      labelFormat: 'currency',
    },
    barPlot: {
      mode: 'stacked',
    },
    tooltips: {
      shared: true,
    },
    series: [
      {
        data: [10, 9, 8, 7, 6, 5, 4, 3, 3, 0, -3, -5],
        name: 'Frequency',
      },
      {
        data: [-5, -6, -8, -10, -9, -7, -7, -3, -2, 2, 1, 3],
        name: 'Price',
      },
      {
        data: [2, 1, 3, -1, -3, -3, -4, 3, 4, 7, 3, 2],
        name: 'Special offers',
      },
      {
        data: [5, 6, 7, 6, 2, 2, 10, 6, 1, 2, -3, -6],
        name: 'Transaction size',
      },
    ],
  },
};

function createChartSet(chartSet) {
  Object.keys(createdCharts).forEach(function (key) {
    createdCharts[key].destroy();
  });

  createdCharts = {};

  Object.keys(chartSet).forEach(function (key) {
    createdCharts[key] = Tayberry.create(key, $.extend(true, {}, chartSet[key]));
  });
}

$('#chart1-add').on('click', function () {
  createdCharts['chart1'].addSeries({
    data: [
      15,
      9,
      23,
      26,
      35,
      44,
      30,
      70,
      58,
      75,
      85,
      107,
      112,
      120,
      144,
      158,
      184,
      196,
      197,
      190,
      202,
      222,
      221,
      226,
      209,
      221,
      191,
      198,
      189,
      168,
      151,
      142,
      121,
      112,
      80,
      82,
      69,
      49,
      51,
      51,
      34,
      27,
      20,
      11,
      11,
      12,
      4,
      3,
      1,
      4,
    ],
    name: 'Refunds',
    colour: 'rgba(150, 100, 100, 0.5)',
  });
});

$('#chart1-remove').on('click', function () {
  const chart = createdCharts['chart1'];
  const seriesCount = chart.getSeriesCount();
  if (seriesCount) chart.removeSeriesByIndex(seriesCount - 1);
});

$('#chart2-remove').on('click', function () {
  const chart = createdCharts['chart2'];
  const seriesCount = chart.getSeriesCount();
  if (seriesCount) chart.removeSeriesByIndex(seriesCount - 1);
});

$('#chart2-add').on('click', function () {
  createdCharts['chart2'].addSeries({
    data: [3, 4, 3, 5, 8, 9, 1, 3, 3, 5, 3, 6],
    name: 'Refunds',
  });
});

$('#set-general').on('click', function () {
  createChartSet(standardTestCharts);
});

$('#set-legend').on('click', function () {
  createChartSet(legendTestCharts);
});

createChartSet(standardTestCharts);
