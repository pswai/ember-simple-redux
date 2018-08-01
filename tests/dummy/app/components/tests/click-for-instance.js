import Component from '@ember/component';

export default Component.extend({
  classNames: ['test-target'],

  onClick() {},

  click() {
    this.get('onClick')(this);
  },
});
