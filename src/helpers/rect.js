'use strict';

export class Rect {
  constructor() {
    if (arguments.length === 1) {
      if (typeof arguments[0] === 'object') {
        const rect = arguments[0];
        this.left = rect.left;
        this.top = rect.top;
        this.right = rect.right;
        this.bottom = rect.bottom;
      } else {
        const val = arguments[0];
        this.left = val;
        this.top = val;
        this.right = val;
        this.bottom = val;
      }
    } else if (arguments.length === 4) {
      this.left = arguments[0];
      this.top = arguments[1];
      this.right = arguments[2];
      this.bottom = arguments[3];
    }
  }

  get width() {
    return this.right - this.left;
  }

  get height() {
    return this.bottom - this.top;
  }

  get maxY() {
    return Math.max(this.bottom, this.top);
  }

  get minY() {
    return Math.min(this.bottom, this.top);
  }

  get minX() {
    return Math.min(this.left, this.right);
  }

  get maxX() {
    return Math.max(this.left, this.right);
  }

  get xMidpoint() {
    return (this.left + this.right) / 2;
  }

  get yMidpoint() {
    return (this.top + this.bottom) / 2;
  }

  get area() {
    return Math.abs(this.width) * Math.abs(this.height);
  }

  containsPoint(x, y) {
    return this.containsX(x) && this.containsY(y);
  }

  containsY(y) {
    return (y >= this.top && y < this.bottom) || (y >= this.bottom && y < this.top);
  }

  containsX(x) {
    return (x >= this.left && x < this.right) || (x >= this.right && x < this.left);
  }

  inflate(val) {
    this.left -= val;
    this.top -= val;
    this.right += val;
    this.bottom += val;
    return this;
  }

  clip(clipRect) {
    //FIXME: In theory, we should be more careful about how we handle rects where right < left or bottom < top
    if (this.left < clipRect.minX) this.left = clipRect.minX;
    else if (this.left > clipRect.maxX) this.left = clipRect.maxX;

    if (this.right < clipRect.minX) this.right = clipRect.minX;
    else if (this.right > clipRect.maxX) this.right = clipRect.maxX;

    if (this.top < clipRect.minY) this.top = clipRect.minY;
    else if (this.top > clipRect.maxY) this.top = clipRect.maxY;

    if (this.bottom > clipRect.maxY) this.bottom = clipRect.maxY;
    else if (this.bottom < clipRect.minY) this.bottom = clipRect.minY;

    return this;
  }

  clone() {
    return new Rect(this);
  }

  swapXY() {
    [this.left, this.top] = [this.top, this.left];
    [this.bottom, this.right] = [this.right, this.bottom];
    return this;
  }
}
