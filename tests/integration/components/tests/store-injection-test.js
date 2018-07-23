import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import isReduxStore from '../../../utils/is-redux-store';

module('Integration | Component | tests/store-injection', function(hooks) {
  setupRenderingTest(hooks);

  test('initializer injected `simpleReduxStore` to components', async function(assert) {
    const spy = sinon.spy();
    this.set('spy', spy);

    await render(hbs`{{tests/store-injection onClick=spy}}`);
    await click('.test-target');

    assert.ok(spy.calledOnce, 'Spy called exactly once');
    assert.ok(
      isReduxStore(spy.getCall(0).args[0]),
      'Spy called with Redux store'
    );
  });
});
