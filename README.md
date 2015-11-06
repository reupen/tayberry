# TayberryJS 0.3

&copy; Reupen Shah 2015

TayberryJS is an HTML5 canvas-based JavaScript charting library. Currently featuring bar and line charts, with more features coming soon.

## Demos

[Click here for some demos and examples](https://reupen.github.io/tayberry).

## What's good about it?

### Built on HTML5 canvas. 

That means a couple of DOM elements, not the 10s or even 100s you would face with SVG.

### Self-contained

Zero external dependencies. No jQuery, no D3.

### Easy-to-use and customisable

Creating a chart is as simple as:
```html
<div id="chart-id" style="width: 600px; height: 350px"></div>
```

```javascript
Tayberry.create('chart-id', {
    xAxis: [{
        categories: ['1', '2', '3', '4', '5+']
    }],
    series: [{
        data: [.306, .341, .156, .129, .069],
        name: '2011'
    }]
});
```

## Supported browsers

TayberryJS only supports modern browsers. As of 0.2.2, it has been tested on:

- Firefox 30+
- Chrome for Windows 45+
- Chrome for Android 45+
- Internet Explorer 10+
- Edge
- Safari for OS X 7.1.6+

## Usage

Create a container `div` in your page, with a set width and height, and load tayberry.min.js. Call `Tayberry.create`
just like the example above. That's with the id of your div as the first argument, and an object specifying chart options as the second.

Available attributes on the option object are (full details still to be completed):

| Field           | Allowed values | Description |
| ---------------------- | ------------- |------------- |
| allAxes.font.\*               | \-              | Overrides font.\* values for axis labels |
| allAxes.title.font.\*         | \-              | Overrides font.\* values for axis titles |
| animations.enabled            | boolean             | Enable animations        |
| backgroundColour              | HTML colour code     |                   |
| barPlot.mode                  | `normal`\|`stacked`\|`overlaid`                |      |
| barPlot.barPadding            | logical pixels          | Padding between bars in the same category |
| barPlot.categorySpacing       | percentage in [0, 1)                | Spacing between categories |
| elementLargePadding           | logical pixels |       |
| elementSmallPadding           | logical pixels |       |
| font.colour                   | HTML colour code    | Font colour
| font.face                     | string              | Font name
| font.size                     | logical pixels      | Font size
| font.style                    | string              | `bold`, `italic` etc. |
| font.autoScale                | boolean             | Auto-scale font with chart width
| labels.enabled                | boolean             | Show data labels in the plot area
| labels.font.\*                | \-                  | Overrides font.\* values for data labels |
| labels.verticalAlignment      | `top`\|`middle`\|`bottom`                | Where in each bar labels should appear
| labels.verticalPosition       | `outside`\|`inside`\|`middle` |      | 
| legend.enabled                | boolean         |      |
| legend.font.\*                | \-                  | Overrides font.\* values for the legend |
| legend.indicatorSize          | logical pixels  | Width/height of the coloured box of each legend item |
| linePlot.lineWidth            | logical pixels          |  |
| linePlot.highlightedLineWidth | logical pixels          |  |
| linePlot.showMarkers          | true, false, `auto`          |  |
| linePlot.noMarkersThreshold   | number                  |  |
| linePlot.markerSize           | logical pixels                  |  |
| linePlot.highlightedMarkerSize | logical pixels                  |  |
| presets                       | array of strings    | Use this to override some of the default settings using a preset. Currently two presets: `histogram` and `darkGrid`|
| series                        | array of objects | Each object represents a series with mandatory property `data` and optional properties `name`, `colour`, `yAxisIndex` and `xAxisIndex`. |
| swapAxes                      | boolean |   Swap the displayed positions of the x- and y-axes; set to true for a horizontal bar chart |
| title.font.\*                  | \-               | Overrides font.\* values for the chart title |
| title.text                    | string          | Title for the chart
| tooltips.font.\*              | \-               | Overrides font.\* values for tooltips |
| tooltips.footerTemplate       | string          | HTML template string used for tooltip footer. |
| tooltips.headerTemplate       | string          | HTML template string used for tooltip header. Use `{category}` to sub in the category name    |
| tooltips.shared               | boolean         | Set to true to share tooltips between all series     |
| tooltips.valueTemplate        | string          | HTML template string used for each series in a tooltip. Fields available: `{name}`, `{value}` and `{colour}` |
| [xAxis\|yAxis][n].categories              | array           | (categorial axes only)      |
| [xAxis\|yAxis][n].currencySymbol          | string          | (linear axes only)     |
| [xAxis\|yAxis][n].font.\*                 | \-              | Overrides allAxes.font.\* values for the axis labels |
| [xAxis\|yAxis][n].labelPosition           | `left`\|`middle`\|`right` |
| [xAxis\|yAxis][n].gridLines.colour        | HTML colour code |      |
| [xAxis\|yAxis][n].labelFormat             | `number`\|`percentage`\|`currency`                | (linear axes only)
| [xAxis\|yAxis][n].labelFormatter          | function          |      |
| [xAxis\|yAxis][n].labelPrefix             | string          | (linear axes only)      |
| [xAxis\|yAxis][n].labelSuffix             | string          | (linear axes only)      |
| [xAxis\|yAxis][n].min                     | number          | Use this to override the automatic axis minimum value calculation (linear axes only)
| [xAxis\|yAxis][n].max                     | number          | Use this to override the automatic axis maximum value calculation (linear axes only)
| [xAxis\|yAxis][n].placement               | `start`\|`end`  |       |
| [xAxis\|yAxis][n].tickStep                | logical pixels  | Hint used for the distance between ticks (linear axes only)
| [xAxis\|yAxis][n].tickStepValue           | axis units      | Distance between ticks in axis units; overrides tickStep (linear axes only)
| [xAxis\|yAxis][n].title.text              | string          |      |
| [xAxis\|yAxis][n].title.font.\*           | \-              | Overrides allAxes.font.\* values for the axis title |
| [xAxis\|yAxis][n].type                    | `linear`\|`categorial`          |      |

See the demos for some examples.

## Licence

TayberryJS is released under the Lesser GNU Public Licence. If this poses a problem for you, feel free to open an issue.

## Downloads

Head over to the releases page for the current version.

TayberryJS is at an early alpha stage. There will be some bugs, but please do open issues to provide feedback.

## Roadmap

Some upcoming features planned are:
* dynamic chart updates
