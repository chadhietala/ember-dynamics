/*globals _*/
import Ember from 'ember';
import layout from '../templates/components/mo-spring';
import mapTree from '../utils/map-tree';
import { interpolateValue } from '../utils/update-tree';
import configAnimation from '../utils/create-animation-loop';
import animationStep from '../utils/animation-step';
import zero from '../utils/zero';

const { GlimmerComponent, on } = Ember;

const startAnimation = configAnimation();

export default GlimmerComponent.extend({
  layout: layout,

  getInitialState: on('init', function() {
    let { endValue, defaultValue } =  this.attrs;
    let currValue;

    if (defaultValue == null) {
      if (typeof endValue === 'function') {
        currValue = endValue();
      } else {
        currValue = endValue;
      }
    } else {
      currValue = defaultValue;
    }

    this.setProperties({ currValue: currValue, currVelocity: mapTree(zero, currValue) });
  }),

  didUpdateAttrs() {
    this.startAnimating();
  },

  stopAnimation: null,
  isRemoved: false,
  animationStep: null,

  willDestroyElement() {
    this.stopAnimation();
    this.isRemoved = true;
  },

  didInsertElement() {
    this.animationStep = animationStep.bind(null, true, () => this.stopAnimation(), () => this.attrs);
    this.startAnimating();
  },

  startAnimating() {
    this.stopAnimation = startAnimation(
      this,
      this.animationStep,
      this.animationRender.bind(this)
    );
  },

  animationRender(alpha, nextState, prevState) {
    if (!this.isRemoved) {
      this.setProperties({
        currValue: interpolateValue(alpha, nextState.currValue, prevState.currValue),
        currVelocity: nextState.currVelocity,
      });
    }
  }
});
