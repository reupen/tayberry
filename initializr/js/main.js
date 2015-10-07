var chart = new Tayberry();

chart.create('mychart');

chart.setData(
    [{
        data: [50, 20, 70, 1, 15, 16, 17],
        name: 'moo'
    },{
        data: [30, 10, 70, 25, 15, 10, 17],
        name: 'baa'
    }]
);
chart.setCategories(['a', 'b', 'c', 'd', 'e', 'f', 'g']);

chart.render();
