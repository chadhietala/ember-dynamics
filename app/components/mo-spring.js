/*globals _*/
import Ember from 'ember';
import layout from '../templates/components/mo-spring';
import createAnimationLoop from '../utils/create-animation-loop';
import mapTree from '../utils/map-tree';
import stepper from '../utils/stepper';
import noVelocity from '../utils/no-velocity';


const { Component, on } = Ember;

const animationLoop = createAnimationLoop({
  timeStep: 1 / 60,
  timeScale: 1,
  maxSteps: 10,
});

function zero() {
  return 0;
}

function interpolateValue(alpha, nextValue, prevValue) {
  if (nextValue === null) {
    return null;
  }
  if (prevValue == null) {
    return nextValue;
  }
  if (typeof nextValue === 'number') {
    return nextValue * alpha + prevValue * (1 - alpha);
  }
  if (nextValue.val != null && nextValue.config && nextValue.config.length === 0) {
    return nextValue;
  }
  if (nextValue.val != null) {
    let ret = {
      val: interpolateValue(alpha, nextValue.val, prevValue.val),
    };
    if (nextValue.config) {
      ret.config = nextValue.config;
    }
    return ret;
  }
  if (Array.isArray(nextValue)) {
    return nextValue.map((_, i) => interpolateValue(alpha, nextValue[i], prevValue[i]));
  }
  if (_.isPlainObject(nextValue)) {
    return Object.keys(nextValue).reduce((ret, key) => {
      ret[key] = interpolateValue(alpha, nextValue[key], prevValue[key]);
      return ret;
    }, {});
  }
  return nextValue;
}

export function updateCurrValue(frameRate, currValue, currVelocity, endValue, k, b) {
  if (endValue === null) {
    return null;
  }
  if (typeof endValue === 'number') {
    if (k == null || b == null) {
      return endValue;
    }
    // TODO: do something to stepper to make this not allocate (2 steppers?)
    return stepper(frameRate, currValue, currVelocity, endValue, k, b)[0];
  }
  if (endValue.val != null && endValue.config && endValue.config.length === 0) {
    return endValue;
  }
  if (endValue.val != null) {
    const [_k, _b] = endValue.config || [170, 26];
    let ret = {
      val: updateCurrValue(frameRate, currValue.val, currVelocity.val, endValue.val, _k, _b),
    };
    if (endValue.config) {
      ret.config = endValue.config;
    }
    return ret;
  }
  if (Array.isArray(endValue)) {
    return endValue.map((_, i) => updateCurrValue(frameRate, currValue[i], currVelocity[i], endValue[i], k, b));
  }
  if (_.isPlainObject(endValue)) {
    return Object.keys(endValue).reduce((ret, key) => {
      ret[key] = updateCurrValue(frameRate, currValue[key], currVelocity[key], endValue[key], k, b);
      return ret;
    }, {});
  }
  return endValue;
}

export function updateCurrVelocity(frameRate, currValue, currVelocity, endValue, k, b) {
  if (endValue === null) {
    return null;
  }
  if (typeof endValue === 'number') {
    if (k == null || b == null) {
      return mapTree(zero, currVelocity);
    }
    // TODO: do something to stepper to make this not allocate (2 steppers?)
    return stepper(frameRate, currValue, currVelocity, endValue, k, b)[1];
  }
  if (endValue.val != null && endValue.config && endValue.config.length === 0) {
    return mapTree(zero, currVelocity);
  }
  if (endValue.val != null) {
    const [_k, _b] = endValue.config || [170, 26];
    let ret = {
      val: updateCurrVelocity(frameRate, currValue.val, currVelocity.val, endValue.val, _k, _b),
    };
    if (endValue.config) {
      ret.config = endValue.config;
    }
    return ret;
  }
  if (Array.isArray(endValue)) {
    return endValue.map((_, i) => updateCurrVelocity(frameRate, currValue[i], currVelocity[i], endValue[i], k, b));
  }
  if (_.isPlainObject(endValue)) {
    return Object.keys(endValue).reduce((ret, key) => {
      ret[key] = updateCurrVelocity(frameRate, currValue[key], currVelocity[key], endValue[key], k, b);
      return ret;
    }, {});
  }
  return mapTree(zero, currVelocity);
}

export default Component.extend({
  layout: layout,

  getInitialState: on('didInsertElement', function() {
    let { endValue } =  this.attrs;
    if (typeof endValue === 'function') {
      endValue = endValue();
    }
    this.setProperties({ currValue: endValue, currVelocity: mapTree(zero, endValue) });
  }),

  unsubscribeAnimation: null,

  didUpdateAttrs() {
    this.startAnimating();
  },

  didInsertElement() {
    this.startAnimating();
  },

  startAnimating() {
    if (!this.unsubscribeAnimation) {
      // means we're not animating
      this.unsubscribeAnimation = animationLoop.subscribe(
        this.animationStep.bind(this),
        this.animationRender.bind(this),
        this.getProperties('currValue', 'currVelocity')
      );
      animationLoop.start();
    }
  },

  animationStep(timeStep, state) {
    const { currValue, currVelocity } = state;
    let { endValue } = this.attrs;

    if (typeof endValue === 'function') {
      endValue = endValue(currValue);
    }

    const newCurrValue = updateCurrValue(timeStep, currValue, currVelocity, endValue);
    const newCurrVelocity = updateCurrVelocity(timeStep, currValue, currVelocity, endValue);

    if (noVelocity(currVelocity) && noVelocity(newCurrVelocity)) {
      this.unsubscribeAnimation();
      this.unsubscribeAnimation = undefined;
    }

    return {
      currValue: newCurrValue,
      currVelocity: newCurrVelocity,
    };
  },

  animationRender(alpha, nextState, prevState) {
    this.setProperties({
      currValue: interpolateValue(alpha, nextState.currValue, prevState.currValue),
      currVelocity: nextState.currVelocity,
    });
  },
});
