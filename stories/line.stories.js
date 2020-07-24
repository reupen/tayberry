import Tayberry from '../src/tayberry';
import { withKnobs } from '@storybook/addon-knobs';

import { createChartContainer } from './utils';

export default {
  title: 'Line',
  decorators: [withKnobs],
};

export const category = () => {
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
  };

  Tayberry.create(div, options);

  return div;
};

export const manyDataPoints = () => {
  const div = createChartContainer();

  let randomData1 = [];
  let randomData2 = [];

  for (let i = 0; i < 500; i++) {
    randomData1.push(Math.random() * 50 + 50);
    randomData2.push(Math.random() * 50);
  }

  const options = {
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
  };

  Tayberry.create(div, options);

  return div;
};

manyDataPoints.story = {
  name: 'Many data points',
};
