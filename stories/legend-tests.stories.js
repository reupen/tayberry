import { create } from '../src/tayberry';
import { button, withKnobs } from '@storybook/addon-knobs';

import { createChartContainer } from './utils';

export default {
  title: 'Legend tests',
  decorators: [withKnobs],
};

export const legendTest1 = () => {
  const div = createChartContainer();
  const options = {
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
  };

  const chart = create(div, options);

  button('Add series', () => {
    chart.addSeries({
      data: [0.306, 0.341, 0.156, 0.129, 0.069],
      name: '2011 abcd',
    });
    return false;
  });

  button('Remove series', () => {
    const seriesCount = chart.getSeriesCount();
    if (seriesCount) chart.removeSeriesByIndex(seriesCount - 1);
    return false;
  });

  return div;
};

legendTest1.story = {
  name: 'Legend test 1',
};

export const legendTest2 = () => {
  const div = createChartContainer();
  const options = {
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
  };

  const chart = create(div, options);

  button('Add series', () => {
    chart.addSeries({
      data: [3, 4, 3, 5, 8, 9, 1, 3, 3, 5, 3, 6],
      name: 'Refunds',
    });
    return false;
  });

  button('Remove series', () => {
    const seriesCount = chart.getSeriesCount();
    if (seriesCount) chart.removeSeriesByIndex(seriesCount - 1);
    return false;
  });

  return div;
};

legendTest2.story = {
  name: 'Legend test 2',
};
