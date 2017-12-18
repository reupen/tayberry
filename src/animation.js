'use strict';
import {Tayberry} from './base';
import * as Utils from './helpers/utils.js';
import * as constants from './constants';

Tayberry.prototype.revokeAnimation = function (series) {
    for (let index = this.pendingAnimations.length; index; index--) {
        if (this.pendingAnimations[index - 1].series === series) {
            this.pendingAnimations.splice(index - 1, 1);
        }
    }
};

Tayberry.prototype.startAnimation = function (animation) {
    animation.initialStage = animation.initialStage || 0;
    var newAnimation = Utils.assign({}, [{
        length: this.defaultAnimationLength * (1 - animation.initialStage),
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
        if (animation.onFrame) {
            animation.onFrame(animation.initialStage + Math.min(elapsed / animation.length, 1) * (1 - animation.initialStage));
        }
        if (elapsed >= animation.length) {
            this.pendingAnimations.splice(index, 1);
            if (animation.onCompletion) {
                setTimeout(animation.onCompletion, 0);
            }
        }
    }
    for (let i = 0; i < this.renderers.length; i++) {
        this.renderers[i].onAnimationFrame();
    }
    this.redraw(true);
    if (this.pendingAnimations.length) {
        this.animator = requestAnimationFrame(this.onAnimate.bind(this));
    } else {
        this.animator = null;
    }
};

Tayberry.prototype.setSeriesVisibility = function (series, visible, subtype, onCompletion) {
    series.visible = visible ? constants.visibilityState.visible : constants.visibilityState.hidden;
    series.visible |= constants.visibilityState.transitioning;

    if (series.animationState) {
        const newType = visible ? 'show' : 'hide';
        if (series.animationState.type !== newType) {
            series.animationState.type = newType;
            series.animationState.stage = 1 - series.animationState.stage;

            delete series.animationState.animator;
            this.revokeAnimation(series);
        }
    } else {
        series.animationState = {
            type: (series.visible & constants.visibilityState.visible) ? 'show' : 'hide',
            subtype: subtype,
            stage: 0
        };
    }
    if (!series.animationState.animator) {
        series.animationState.animator = this.startAnimation({
            type: visible ? 'showSeries' : 'hideSeries',
            series: series,
            initialStage: series.animationState.stage,
            onFrame: (stage) => series.animationState.stage = stage,
            onCompletion: () => {
                series.visible = (series.visible & ~constants.visibilityState.transitioning);
                delete series.animationState;

                if (onCompletion) {
                    onCompletion();
                }
            }
        });
    }
};

Tayberry.prototype.toggleSeriesVisibility = function (series) {
    this.setSeriesVisibility(series, !(series.visible & constants.visibilityState.visible));
};
