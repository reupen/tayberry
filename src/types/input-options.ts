import {
  AnimationOptions,
  AxisOptions,
  BarPlotOptions,
  FontOptions,
  LabelOptions,
  LegendOptions,
  LinePlotOptions,
  SeriesOptions,
  TitleOptions,
  TooltipOptions,
} from './internal-options';

export type FontOptionsInput = Partial<FontOptions>;

export type TitleOptionsInput = Partial<TitleOptions>;

export type SeriesOptionsInput = Partial<SeriesOptions> & Pick<SeriesOptions, 'data'>;

export type AnimationOptionsInput = Partial<AnimationOptions>;

export type AxisOptionsInput = Partial<AxisOptions>;

export type BarPlotOptionsInput = Partial<BarPlotOptions>;

export type LinePlotOptionsInput = Partial<LinePlotOptions>;

export type LegendOptionsInput = Partial<LegendOptions>;

export type LabelOptionsInput = Partial<LabelOptions>;

export type TooltipOptionsInput = Partial<TooltipOptions>;

export type OptionsInput = {
  allAxes?: AxisOptionsInput;
  animations?: AnimationOptionsInput;
  backgroundColour?: string;
  barPlot?: BarPlotOptionsInput;
  elementSmallPadding?: number;
  elementLargePadding?: number;
  font?: FontOptionsInput;
  labels?: LabelOptionsInput;
  legend?: LegendOptionsInput;
  linePlot?: LinePlotOptionsInput;
  plotType?: 'bar' | 'line';
  presets?: string[];
  series: [SeriesOptionsInput, ...SeriesOptionsInput[]];
  swapAxes?: boolean;
  title?: TitleOptionsInput;
  tooltips?: TooltipOptionsInput;
  xAxis?: AxisOptionsInput[] | AxisOptionsInput;
  yAxis?: AxisOptionsInput[] | AxisOptionsInput;
};
