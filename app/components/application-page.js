import Ember from 'ember';

const { computed, Component } = Ember;

export default Component.extend({
  isOpen: false,
  endValue: computed('isOpen', function() {
    return this.get('isOpen') ? 400 : 0;
  }),
  actions: {
    toggle() {
      this.toggleProperty('isOpen');
    }
  }
});
