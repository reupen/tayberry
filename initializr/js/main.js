//Tayberry.create('chart1', {
//    xAxis: {
//        categories: ['a', 'b', 'c', 'd', 'e', 'f', 'g']
//    },
//    stacked: true,
//    series: [{
//        data: [50, -20, 70, 1, 15, -25, 17],
//        name: 'moo'
//    }, {
//        data: [30, 10, 70, 25, 15, 10, 17],
//        name: 'baa'
//    }]
//
//});

Tayberry.create('chart2', {
    xAxis: {
        categories: ['a', 'b', 'c', 'd', 'e', 'f', 'g']
    },
    yAxis: {
        labelFormat: 'percentage'
    },
    stacked: false,
    series: [{
        data: [1.1, 1.2, 1.3],
        name: 'moo'
    }]

});

