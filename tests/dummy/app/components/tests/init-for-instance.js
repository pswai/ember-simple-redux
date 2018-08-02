import Component from '@ember/component';

export default Component.extend({
  classNames: ['test-target'],

  init() {
    this._super(...arguments);

    this.get('onInit')(this);
  },

  onInit() {},
});
