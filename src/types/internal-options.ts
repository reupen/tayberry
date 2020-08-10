import { AxisOptionsInput, FontOptionsInput, TitleOptionsInput } from './input-options';

export type FontOptions = {
  autoScale: boolean;
  colour: string;
  face: string;
  size: number;
  style: string;
};

export type TitleOptions = {
  text: string;
  font: FontOptionsInput;
};

export type SeriesOptions = {
  colour: string;
  data: number[];
  markerType: 'square' | 'diamond' | 'triangle' | 'triangle-down' | 'circle';
  name: string;
  plotType: string;
  xAxisIndex: number;
  yAxisIndex: number;
};

export type AnimationOptions = {
  enabled: boolean;
  length: number;
};

export type AxisOptions = {
  categories: string[];
  currencySymbol: string;
  font: FontOptionsInput;
  gridLines: {
    colour: string;
  };
  labelFormat: 'number' | 'position' | 'currency' | 'percentage';
  labelFormatter: (value: number) => string;
  labelPosition: 'left' | 'middle' | 'right';
  labelPrefix: string;
  labelSuffix: string;
  max: number;
  min: number;
  placement: 'start' | 'end';
  tickStep: number;
  tickStepValue: number;
  title?: TitleOptionsInput;
  type: 'linear' | 'categorical';
};

export type BarPlotOptions = {
  mode: 'normal' | 'stacked' | 'overlaid';
  barPadding: number;
  categorySpacing: number;
};

export type LinePlotOptions = {
  lineWidth: number;
  highlightedLineWidth: number;
  showMarkers: 'auto' | boolean;
  noMarkersThreshold: number;
  markerSize: number;
  highlightedMarkerSize: number;
};

export type LegendOptions = {
  enabled: boolean;
  indicatorSize: number;
  font: FontOptions;
  hiddenAlphaMultiplier: 0.5;
  placement: 'bottom' | 'top' | 'left' | 'right';
};

export type LabelOptions = {
  enabled: boolean;
  verticalAlignment: 'top' | 'middle' | 'bottom';
  verticalPosition: 'outside' | 'inside' | 'middle';
  font: FontOptions;
};

export type TooltipOptions = {
  shared: boolean;
  headerTemplate: string;
  valueTemplate: string;
  footerTemplate: string;
  font: FontOptions;
};

export type Options = {
  allAxes: AxisOptionsInput;
  animations: AnimationOptions;
  backgroundColour: string;
  barPlot: BarPlotOptions;
  elementSmallPadding: number;
  elementLargePadding: number;
  font: FontOptions;
  labels: LabelOptions;
  legend: LegendOptions;
  linePlot: LinePlotOptions;
  plotType: 'bar' | 'line';
  presets: string[];
  series: [SeriesOptions, ...SeriesOptions[]];
  swapAxes: boolean;
  title: TitleOptions;
  tooltips: TooltipOptions;
  xAxis: AxisOptions[];
  yAxis: AxisOptions[];
};
