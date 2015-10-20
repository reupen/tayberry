# TayberryJS 0.2.0

&copy; Reupen Shah 2015

TayberryJS is an HTML5 canvas-based JavaScript charting library. Currently featuring bar charts, with more features coming soon.

## Demos
[Click here for some demos and examples.](https://reupen.github.io/tayberry)

## What's good about it?

### Built on HTML5 canvas. 

That means a couple of DOM elements, not the 10s or even 100s you would face with SVG.

### Self-contained

Zero external dependencies. No jQuery, no D3.

### Easy-to-use and customisable

Creating a chart is as simple as:

```javascript
Tayberry.create('container-id', {
    xAxis: {
        categories: ['1', '2', '3', '4', '5+']
    },
    series: [{
        data: [.306, .341, .156, .129, .069],
        name: '2011'
    }]
});
```

## Supported browsers

Tayberry only supports modern browsers. Tested on Firefox 42, Chrome 45 and Internet Explorer 11.

## Usage

Create a container `div` in your page, with a set width and height, and load tayberry.min.js. Call `Tayberry.create`
just like the example above. That's with the id of your div as the first argument, and an object specifying chart options as the second.

Available attributes on the option object are (full details still to be completed):

| Field           | Allowed values | Description |
| ---------------------- | ------------- |------------- |
| barMode                       | 'normal'\|'stacked'\|'overlaid'                |      |
| barPadding                    | logical pixels          | Padding between bars in the same category |
| categorySpacing               | percentage in [0, 1)                | Spacing between categories |
| elementLargePadding           | logical pixels |       |
| elementSmallPadding           | logical pixels |       |
| font.colour                   | HTML colour code    | Font colour
| font.face                     | string              | Font name
| font.size                     | logical pixels      | Font size
| labels.enabled                | boolean             | Show data labels in the plot area
| labels.verticalAlignment      | 'top'\|'middle'\|'bottom'                | Where in each bar labels should appear
| labels.verticalPosition       | 'outside'\|'inside'\|'middle' |      | 
| legend.enabled                | boolean         |      |
| legend.indicatorSize          | logical pixels  |       |
| presets                       | array           |      |
| series                        | array of objects |      |
| swapAxes                      | boolean |      |
| title.font.size               | logical pixels  | Font size of the chart title
| title.text                    | string          | Title for the chart
| tooltips.footerTemplate       | string          |      |
| tooltips.headerTemplate       | string          |      |
| tooltips.shared               | boolean         |      |
| tooltips.valueTemplate        | string          |      |
| [xAxis|yAxis].categories              | array           | (categorial axes only)      |
| [xAxis|yAxis].currencySymbol          | string          | (linear axes only)     |
| [xAxis|yAxis].labelPosition           | 'left'\|'middle'\|'right' |
| [xAxis|yAxis].gridLines.colour        | HTML colour code |      |
| [xAxis|yAxis].labelFormat             | 'number'\|'percentage'\|'currency'                | (linear axes only)
| [xAxis|yAxis].labelFormatter          | function          |      |
| [xAxis|yAxis].labelPrefix             | string          | (linear axes only)      |
| [xAxis|yAxis].labelSuffix             | string          | (linear axes only)      |
| [xAxis|yAxis].min                     | number          | Use this to override the automatic axis minimum value calculation (linear axes only)
| [xAxis|yAxis].max                     | number          | Use this to override the automatic axis maximum value calculation (linear axes only)
| [xAxis|yAxis].placement               | 'start'\|'end'  |       |
| [xAxis|yAxis].tickStep                | logical pixels  | Hint used for the distance between ticks (linear axes only)
| [xAxis|yAxis].tickStepValue           | axis units      | Distance between ticks in axis units; overrides tickStep (linear axes only)
| [xAxis|yAxis].title                   | string          |      |
| [xAxis|yAxis].type                    | 'linear'\|'categorial'          |      |

See the demos for some examples.

## Licence

TayberryJS is released under the Lesser GNU Public Licence. If this poses a problem for you, feel free to open an issue.

## Downloads

Head over to the releases page for the current version.

TayberryJS is at an early alpha stage. There will be some bugs, but please do open issues to provide feedback.

## Roadmap

Some upcoming features planned are:
* horizontal bars
* line charts
* dynamic chart updates
* mixed bar and line charts
