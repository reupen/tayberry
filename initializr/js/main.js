var chart = new Tayberry();

chart.create('mychart');

chart.setOptions({
        xAxis: {
            categories: ['a', 'b', 'c', 'd', 'e', 'f', 'g']
        },
        series: [{
            data: [50, -20, 70, 1, 15, -25, 17],
            name: 'moo'
        }, {
            data: [30, 10, 70, 25, 15, 10, 17],
            name: 'baa'
        }]

    });

chart.render();
