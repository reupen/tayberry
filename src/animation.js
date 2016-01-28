'use strict';
import {Tayberry} from './base';
import {Rect} from './helpers/rect';
import * as Utils from './helpers/utils.js';

Tayberry.prototype.revokeAnimation = function (series) {
    for (let index = this.pendingAnimations.length; index; index--) {
        if (this.pendingAnimations[index-1].series === series) {
            this.pendingAnimations.splice(index-1, 1);
        }
    }
};

Tayberry.prototype.startAnimation = function (animation) {
    animation.initialStage = animation.initialStage || 0;
    var newAnimation = Utils.assign({}, [{
        length: 500*(1-animation.initialStage),
        startTime: (typeof performance !== 'undefined' && typeof performance.now !== 'undefined') ? performance.now() : null
    },
        animation
    ]);
    this.pendingAnimations.push(newAnimation);
    if (!this.animator)
        this.animator = requestAnimationFrame(this.onAnimate.bind(this));
    return newAnimation;
};

Tayberry.prototype.onAnimate = function (timestamp) {
    var elapsed;
    for (let index = this.pendingAnimations.length - 1; index >= 0; index--) {
        let animation = this.pendingAnimations[index];
        if (animation.startTime === null) {
            animation.startTime = timestamp;
        }
        elapsed = timestamp - animation.startTime;
        for (let i = 0; i < this.renderers.length; i++) {
            if (animation.onFrame) {
                animation.onFrame(animation.initialStage + Math.min(elapsed / animation.length, 1) * (1 - animation.initialStage));
            }
            this.renderers[i].onAnimationFrame(elapsed, animation);
        }
        if (elapsed >= animation.length) {
            this.pendingAnimations.splice(index, 1);
            if (animation.onCompletion) {
                animation.onCompletion();
            }
        }
    }
    this.redraw(true);
    if (this.pendingAnimations.length) {
        this.animator = requestAnimationFrame(this.onAnimate.bind(this));
    } else {
        this.animator = null;
    }
};

