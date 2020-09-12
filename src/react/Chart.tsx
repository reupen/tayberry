import React, { useEffect, useRef } from 'react';
import { create } from '../tayberry';
import { OptionsInput } from '../types/input-options';

export type ChartProps = {
  className?: string;
  height?: string | number;
  width?: string | number;
} & OptionsInput;

export const Chart: React.FC<ChartProps> = ({
  className,
  height,
  width,
  ...chartOptions
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const nativeChart = create(ref.current, chartOptions);

    return () => {
      nativeChart.destroy();
    };
  }, [chartOptions]);

  return <div className={className} ref={ref} style={{ height, width }} />;
};
