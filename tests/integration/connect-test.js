import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Component from '@ember/component';
import connect from 'ember-simple-redux/connect';

module('Integration | connect', function(hooks) {
  setupTest(hooks);

  test('returns a function', function(assert) {
    const ret = connect()(Component);
    assert.equal(typeof ret, 'function');
  });
});
