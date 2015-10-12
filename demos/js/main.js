Tayberry.create('chart1', {
    title: {
        text: 'Forecast errors'
    },
    yAxis: {
        title: 'Frequency'
    },
    xAxis: {
        categories: [-50, -48, -46, -44, -42, -40, -38, -36, -34, -32, -30, -28, -26, -24, -22, -20, -18, -16, -14, -12, -10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50],
        title: 'Error',
        labelPosition: 'left'
    },
    presets: ['histogram'],
    series: [{
        data: [11, 13, 20, 19, 37, 38, 43, 49, 53, 80, 84, 102, 122, 111, 115, 143, 161, 148, 196, 210, 213, 220, 226, 227, 235, 189, 233, 201, 188, 158, 177, 145, 120, 101, 112, 104, 69, 71, 52, 38, 31, 23, 17, 13, 12, 12, 9, 6, 6, 4],
        name: 'Sales',
        colour: 'rgba(128, 128, 128, 0.5)'
    }, {
        data: [4, 3, 1, 4, 15, 9, 23, 26, 35, 44, 30, 70, 58, 75, 85, 107, 112, 120, 144, 158, 184, 196, 197, 190, 202, 222, 221, 226, 209, 221, 191, 198, 189, 168, 151, 142, 121, 112, 80, 82, 69, 49, 51, 51, 34, 27, 20, 11, 11, 12],
        name: 'Customers',
        colour: 'rgba(180, 128, 100, 0.5)'
    }]
});

Tayberry.create('chart2', {
    title: {
        text: 'Contribution to revenue growth'
    },
    xAxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        title: 'Error'
    },
    yAxis: {
        title: 'Impact',
        labelFormat: 'currency'
    },
    barMode: 'stacked',
    tooltips: {
        shared: true
    },
    series: [{
        data: [10, 9, 8, 7, 6, 5, 4],
        name: 'Frequency'
    }, {
        data: [-5, -6, -8, -10, -9, -7, -7],
        name: 'Price'
    }, {
        data: [2, 1, 3, -1, -3, -3, -4],
        name: 'Promotions'
    }, {
        data: [5, 6, 7, 6, 2, 2, 10],
        name: 'Transaction size'
    }]
});

Tayberry.create('chart3', {
    xAxis: {
        categories: ['a', 'b', 'c', 'd', 'e', 'f', 'g']
    },
    barMode: 'overlaid',
    series: [{
        data: [-50, -60, -70, null, -15, -55, -17],
        name: 'moo'
    }]

});

//Tayberry.create('chart3', {
//    xAxis: {
//        categories: ['a', 'b', 'c', 'd', 'e', 'f', 'g']
//    },
//    barMode: 'overlaid',
//    series: [{
//        data: [50, -20, 70, 1, 15, -25, 17],
//        name: 'moo'
//    }, {
//        data: [30, 10, 70, 25, 15, 10, 17],
//        name: 'baa'
//    }]
//
//});
