class Rect {
    constructor() {
        var rect;
        if (arguments.length === 1) {
            rect = arguments[0];
            this.left = rect.left;
            this.top = rect.top;
            this.right = rect.right;
            this.bottom = rect.bottom;
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

    containsPoint(x, y) {
        return x >= this.minX && x < this.maxX && y >= this.minY && y < this.maxY;
    }

    clip(clipRect) {
        if (this.left < this.right) {
            if (this.left < clipRect.left) this.left = clipRect.left;
            if (this.right > clipRect.right) this.right = clipRect.right;
        } else {
            if (this.right < clipRect.left) this.right = clipRect.left;
            if (this.left > clipRect.right) this.left = clipRect.right;
        }
        if (this.top < this.bottom) {
            if (this.top < clipRect.top) this.top = clipRect.top;
            if (this.bottom > clipRect.bottom) this.bottom = clipRect.bottom;
        } else {
            if (this.bottom < clipRect.top) this.bottom = clipRect.top;
            if (this.top > clipRect.bottom) this.top = clipRect.bottom;
        }
        return this;
    }
}

exports.Rect = Rect;