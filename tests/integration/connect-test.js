import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Component from '@ember/component';
import { typeOf } from '@ember/utils';
import { createStore } from 'redux';
import connect from 'ember-simple-redux/connect';
import ClickForInstance from 'dummy/components/tests/click-for-instance';
import sinon from 'sinon';

module('Integration | connect', function(hooks) {
  setupRenderingTest(hooks);

  test('it returns another component', function(assert) {
    const component = Component.extend();
    const connectedComponent = connect()(component);

    assert.equal(typeOf(connectedComponent), 'class');
    assert.notEqual(
      component,
      connectedComponent,
      'Connected component should be a different class'
    );
  });

  test('it calls `mapStateToProps` with Redux state (arity: 0)', async function(assert) {
    const state = {};
    const store = createStore(() => state);
    this.owner.register('simple-redux:store', store);

    // Arity: 0
    const mapStateToProps = () => {};
    const spy = sinon.spy(mapStateToProps);
    const connectedComponent = connect(spy)(Component);
    this.owner.register('component:test-target', connectedComponent);

    await render(hbs`{{test-target foo='1'}}`);

    const { args } = spy.getCall(0);
    assert.equal(args[0], state, '`state` should be as is');
    assert.deepEqual(args[1], { foo: '1' }, '`ownProps` should be passed');
  });

  test('it calls `mapStateToProps` with Redux state (arity: 1)', async function(assert) {
    const state = {};
    const store = createStore(() => state);
    this.owner.register('simple-redux:store', store);

    // Arity: 1
    const mapStateToProps = state => state;
    const spy = sinon.spy(mapStateToProps);
    const connectedComponent = connect(spy)(Component);
    this.owner.register('component:test-target', connectedComponent);

    await render(hbs`{{test-target}}`);

    const { args } = spy.getCall(0);
    assert.equal(args[0], state, '`state` should be as is');
    assert.equal(args.length, 1, '`ownProps` should not be passed');
  });

  test('it calls `mapStateToProps` with Redux state (arity: 2)', async function(assert) {
    const state = {};
    const store = createStore(() => state);
    this.owner.register('simple-redux:store', store);

    // Arity: 2
    const mapStateToProps = (state, ownProps) => ({ state, ownProps });
    const spy = sinon.spy(mapStateToProps);
    const connectedComponent = connect(spy)(Component);
    this.owner.register('component:test-target', connectedComponent);

    await render(hbs`{{test-target foo='1'}}`);

    const { args } = spy.getCall(0);
    assert.equal(args[0], state, '`state` should be as is');
    assert.deepEqual(args[1], { foo: '1' }, '`ownProps` should be passed');
  });

  test('it passes original props to connected component', async function(assert) {
    const connectedComponent = connect()(ClickForInstance);
    this.owner.register('component:test-target', connectedComponent);

    const spy = sinon.spy();
    this.set('spy', spy);
    await render(hbs`{{test-target onClick=spy foo='1' bar='test'}}`);
    await click('.test-target');

    const instance = spy.getCall(0).args[0];
    assert.equal(instance.get('foo'), '1');
    assert.equal(instance.get('bar'), 'test');
  });

  test('it sets result of `mapStateToProps` to connected component', async function(assert) {
    const store = createStore(() => ({
      count: 5,
    }));
    this.owner.register('simple-redux:store', store);

    const mapStateToProps = ({ count }) => ({ count });
    const connectedComponent = connect(mapStateToProps)(ClickForInstance);
    this.owner.register('component:test-target', connectedComponent);

    const spy = sinon.spy();
    this.set('spy', spy);
    await render(hbs`{{test-target onClick=spy foo='1' bar='test'}}`);
    await click('.test-target');

    const instance = spy.getCall(0).args[0];
    assert.equal(instance.get('count'), 5);
  });
});
