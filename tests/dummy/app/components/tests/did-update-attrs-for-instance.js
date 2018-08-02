import Component from '@ember/component';

export default Component.extend({
  classNames: ['test-target'],

  didUpdateAttrs() {
    this._super(...arguments);

    this.get('onDidUpdateAttrs')(this);
  },

  onDidUpdateAttrs() {},
});
