# TayberryJS 0.1.0

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
| title.text             | String | Chart title  |
| title.font.size        | Chart title size (logical pixels)                           |
| font.colour           | Font colour                           |
| barMode                       | 'normal'\|'stacked'\|'overlaid'                |
| barPadding                    | logical pixels          | Padding between bars in the same category |
| categorySpacing               | percentage in [0, 1)                | Spacing between categories |
| defaultPalette                | array of colour codes |
| elementLargePadding           | logical pixels |
| elementSmallPadding           | logical pixels |
| font.colour                   | colour code   |
| font.face                     | string |
| font.size                     | logical pixels |
| labels.enabled                | true|false      | Show data labels in the plot area
| labels.verticalAlignment      | 'top'\|'middle'\|'bottom'                | Where in each bar labels should appear
| labels.verticalPosition       | 'outside'\|'inside'\|'middle' | 
| legend.enabled                | true|false      |
| legend.indicatorSize          |                 | 
| presets                       | array           |
| series                        | array of objects |
| title.font.size               | logical pixels  | Font size of the chart title
| title.text                    | string          | Title for the chart
| tooltips.footerTemplate       |                 |
| tooltips.headerTemplate       |                 |
| tooltips.shared               | true|false      |
| tooltips.valueTemplate        |                 |
| xAxis.categories              | array           |
| xAxis.labelPosition           | 'left'\|'middle'\|'right' |
| xAxis.title                   | string          |
| yAxis.currencySymbol          | string          |
| yAxis.gridLines.colour        |                 |
| yAxis.labelFormat             | 'number'\|'percentage'\|'currency'                |
| yAxis.labelFormatter          | function          |
| yAxis.labelPrefix             |                |
| yAxis.labelSuffix             |                 |
| yAxis.min                     | number          | Use this to override the automatic axis minimum value calculation
| yAxis.max                     | number          | Use this to override the automatic axis maximum value calculation
| yAxis.tickStep                | logical pixels  | 
| yAxis.title                   | string          |

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
