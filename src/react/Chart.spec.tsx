/* eslint-env jasmine */

import { render } from '@testing-library/react';
import React from 'react';

import { Chart } from './Chart';
import { OptionsInput } from '../types/input-options';

describe('Chart', () => {
  it('renders two canvases', () => {
    const options: OptionsInput = {
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
        min: -1,
        max: 0,
        tickStepValue: 1,
      },
      presets: ['histogram', 'darkGrid'],
      series: [
        {
          data: [11, 13],
          name: 'Sales',
          colour: 'rgba(140, 40, 138, 0.5)',
        },
        {
          data: [4, 3],
          name: 'Customers',
          colour: 'rgba(48, 140, 100, 0.5)',
        },
      ],
    };

    const { container } = render(<Chart {...options} />);
    expect(container.querySelectorAll('canvas').length).toBe(2);
  });
});
