import Tayberry from '../src/tayberry';
import { withKnobs } from '@storybook/addon-knobs';

import { createChartContainer } from './utils';

export default {
  title: 'Mixed',
  decorators: [withKnobs],
};

export const lineAndBar = () => {
  const div = createChartContainer();
  const options = {
    title: {
      text: 'Consumer price inflation',
    },
    xAxis: {
      categories: [
        'Oct',
        'Nov',
        'Dec',
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sept',
      ],
      title: {
        text: 'Month',
      },
    },
    yAxis: [
      {
        title: {
          text: 'Index',
        },
      },
      {
        title: {
          text: 'Inflation',
        },
        labelFormat: 'percentage',
      },
    ],
    tooltips: {
      shared: true,
    },
    series: [
      {
        data: [
          128.5,
          128.2,
          128.2,
          127.1,
          127.4,
          127.6,
          128.0,
          128.2,
          128.2,
          128.0,
          128.4,
          128.2,
        ],
        name: 'CPI',
        plotType: 'bar',
      },
      {
        data: [0.013, 0.01, 0.005, 0.003, 0, 0, -0.001, 0.001, 0, 0.001, 0, -0.001],
        name: 'CPI inflation',
        plotType: 'line',
        yAxisIndex: 1,
      },
    ],
  };

  Tayberry.create(div, options);

  return div;
};

lineAndBar.story = {
  name: 'Line and bar',
};
