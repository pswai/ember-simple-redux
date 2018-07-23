import Component from '@ember/component';
import layout from '../../templates/components/tests/store-injection';

export default Component.extend({
  layout,

  classNames: ['test-target'],

  onClick() {},

  click() {
    this.get('onClick')(this.simpleReduxStore);
  },
});
