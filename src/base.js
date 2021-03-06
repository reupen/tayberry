export class Tayberry {
  constructor() {
    this.selectedItem = {};
    this.containerElement = null;
    this.labelsCanvas = null;
    this.labelsCtx = null;
    this.options = null;
    this.scaleFactor = null;
    this.titleFont = null;
    this.plotArea = null;
    this.categories = [];
    this.titleFont = null;
    this.labelFont = null;
    this.renderers = [];
    this.renderersByType = {};
    this.onClickReal = null;
    this.onMouseLeaveReal = null;
    this.onMouseMoveReal = null;
    this.processingResize = false;
    this.pendingAnimations = [];
    this.legend = null;
    this.callbacks = {
      onResize: [],
      onInit: [],
    };
  }

  get seriesCount() {
    return this.options.series.length;
  }

  get categoryCount() {
    return this.options.series.length ? this.options.series[0].data.length : 0;
  }

  get defaultAnimationLength() {
    return this.options.animations.enabled ? this.options.animations.length : 0;
  }
}
