import Ember from 'ember';

const { computed, on, GlimmerComponent } = Ember;

export default GlimmerComponent.extend({
  isOpen: false,
  endValue: computed('isOpen', function() {
    return this.get('isOpen') ? 400 : 0;
  }),

  mouse: [],
  now: 't' + 0,

  circles: computed('mouse', 'now', function() {
    const [mouseX, mouseY] = this.mouse;

    if (mouseX == null) {
      return {};
    }

    return {
      [this.now]: {
        opacity: { val: 1 },
        scale: { val: 0 },
        x: { val: mouseX },
        y: { val: mouseY }
      }
    };

  }),

  actions: {
    mouseMove({pageX, pageY}) {
      this.setProperties({
        mouse: [pageX - 25, pageY - 25],
        now: 't' + Date.now()
      });
    },
    toggle() {
      this.toggleProperty('isOpen');
    },

    willEnter(key, value) {
      return value;
    },

    willLeave(key, valOfKey) {
      return {
        ...valOfKey,
        opacity: {val: 0, config: [60, 15]},
        scale: {val: 2, config: [60, 15]},
      };
    },
  }
});
