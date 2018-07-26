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

  test('it passes original props to connected component', async function(assert) {
    const connectedComponent = connect()(ClickForInstance);
    this.owner.register('component:test-target', connectedComponent);

    const spy = sinon.spy();
    this.set('spy', spy);
    await render(hbs`{{test-target onClick=spy foo=1 bar='test'}}`);
    await click('.test-target');

    const instance = spy.getCall(0).args[0];
    assert.equal(instance.get('foo'), 1);
    assert.equal(instance.get('bar'), 'test');
  });

  test('mapStateToProps: called with Redux state and `ownProps` when arity 0', async function(assert) {
    const state = {};
    const store = createStore(() => state);
    this.owner.register('simple-redux:store', store);

    // Arity: 0
    const mapStateToProps = () => {};
    const spy = sinon.spy(mapStateToProps);
    const connectedComponent = connect(spy)(Component);
    this.owner.register('component:test-target', connectedComponent);

    await render(hbs`{{test-target foo=1}}`);

    const { args } = spy.getCall(0);
    assert.equal(args[0], state, '`state` should be as is');
    assert.deepEqual(args[1], { foo: 1 }, '`ownProps` should be passed');
  });

  test('mapStateToProps: called with Redux state only when arity 1', async function(assert) {
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

  test('mapStateToProps: called with Redux state and `ownProps` when arity 2', async function(assert) {
    const state = {};
    const store = createStore(() => state);
    this.owner.register('simple-redux:store', store);

    // Arity: 2
    const mapStateToProps = (state, ownProps) => ({ state, ownProps });
    const spy = sinon.spy(mapStateToProps);
    const connectedComponent = connect(spy)(Component);
    this.owner.register('component:test-target', connectedComponent);

    await render(hbs`{{test-target foo=1}}`);

    const { args } = spy.getCall(0);
    assert.equal(args[0], state, '`state` should be as is');
    assert.deepEqual(args[1], { foo: 1 }, '`ownProps` should be passed');
  });

  test('mapStateToProps: it sets `stateProps` to connected component', async function(assert) {
    const store = createStore(() => ({
      count: 5,
    }));
    this.owner.register('simple-redux:store', store);

    const mapStateToProps = (state, ownProps) => ({
      count: state.count,
      fooPlusCount: state.count + ownProps.foo,
    });
    const connectedComponent = connect(mapStateToProps)(ClickForInstance);
    this.owner.register('component:test-target', connectedComponent);

    const spy = sinon.spy();
    this.set('spy', spy);
    await render(hbs`{{test-target onClick=spy foo=1 bar='test'}}`);
    await click('.test-target');

    const instance = spy.getCall(0).args[0];
    assert.equal(instance.get('count'), 5);
    assert.equal(instance.get('fooPlusCount'), 6);
    assert.equal(instance.get('bar'), 'test', '`bar` should be still there');
  });

  test('default mergeProps: `stateProps` overrides `ownProps`', async function(assert) {
    const store = createStore(() => ({
      count: 5,
    }));
    this.owner.register('simple-redux:store', store);

    const mapStateToProps = ({ count }) => ({ foo: count });
    const connectedComponent = connect(mapStateToProps)(ClickForInstance);
    this.owner.register('component:test-target', connectedComponent);

    const spy = sinon.spy();
    this.set('spy', spy);
    await render(hbs`{{test-target onClick=spy foo=1 bar='test'}}`);
    await click('.test-target');

    const instance = spy.getCall(0).args[0];
    assert.equal(instance.get('foo'), 5);
    assert.equal(instance.get('bar'), 'test', '`bar` should be still there');
  });

  test('default mergeProps: `dispatchProps` overrides `ownProps`', async function(assert) {
    const mapDispatchToProps = { foo() {} };
    const connectedComponent = connect(
      null,
      mapDispatchToProps
    )(ClickForInstance);
    this.owner.register('component:test-target', connectedComponent);

    const spy = sinon.spy();
    this.set('spy', spy);
    await render(hbs`{{test-target onClick=spy foo=1 bar='test'}}`);
    await click('.test-target');

    const instance = spy.getCall(0).args[0];
    assert.equal(typeOf(instance.get('foo')), 'function'); // The bound action creator
    assert.equal(instance.get('bar'), 'test', '`bar` should be still there');
  });

  test('default mergeProps: `dispatchProps` overrides `stateProps`', async function(assert) {
    const store = createStore(() => ({
      count: 5,
    }));
    this.owner.register('simple-redux:store', store);
    const mapStateToProps = ({ count }) => ({ foo: count });
    const mapDispatchToProps = { foo() {} };
    const connectedComponent = connect(
      mapStateToProps,
      mapDispatchToProps
    )(ClickForInstance);
    this.owner.register('component:test-target', connectedComponent);

    const spy = sinon.spy();
    this.set('spy', spy);
    await render(hbs`{{test-target onClick=spy bar='test'}}`);
    await click('.test-target');

    const instance = spy.getCall(0).args[0];
    assert.equal(typeOf(instance.get('foo')), 'function'); // The bound action creator
    assert.equal(instance.get('bar'), 'test', '`bar` should be still there');
  });

  test('mergeProps: result set to connected component', async function(assert) {
    const store = createStore(() => ({
      count: 5,
    }));
    this.owner.register('simple-redux:store', store);

    const mapStateToProps = ({ count }) => ({ foo: count });
    const mapDispatchToProps = { foo() {} };
    const mergeProps = (stateProps, dispatchProps, ownProps) => ({
      stateFoo: stateProps.foo,
      dispatchFoo: dispatchProps.foo,
      ownFoo: ownProps.foo,
      onClick: ownProps.onClick,
    });
    const connectedComponent = connect(
      mapStateToProps,
      mapDispatchToProps,
      mergeProps
    )(ClickForInstance);
    this.owner.register('component:test-target', connectedComponent);

    const spy = sinon.spy();
    this.set('spy', spy);
    await render(hbs`{{test-target onClick=spy foo=1 bar='test'}}`);
    await click('.test-target');

    const instance = spy.getCall(0).args[0];
    assert.equal(instance.get('stateFoo'), 5);
    assert.equal(typeOf(instance.get('dispatchFoo')), 'function'); // The bound action creator
    assert.equal(instance.get('ownFoo'), 1);
    assert.equal(instance.get('foo'), undefined, '`foo` should be undefined');
    assert.equal(instance.get('bar'), undefined, '`bar` should be undefined');
  });

  test('mergeProps: prevents leaking props (only the result will be passed to component)', async function(assert) {
    const mergeProps = (stateProps, dispatchProps, ownProps) => ({
      onClick: ownProps.onClick,
    });
    const connectedComponent = connect(
      null,
      null,
      mergeProps
    )(ClickForInstance);
    this.owner.register('component:test-target', connectedComponent);

    const spy = sinon.spy();
    this.set('spy', spy);
    await render(hbs`{{test-target onClick=spy foo=1 bar='test'}}`);
    await click('.test-target');

    const instance = spy.getCall(0).args[0];
    assert.equal(typeOf(instance.get('onClick')), 'function');
    assert.notOk(
      instance.hasOwnProperty('foo'),
      'Property `foo` should not exist'
    );
    assert.notOk(
      instance.hasOwnProperty('bar'),
      'Property `bar` should not exist'
    );
    assert.equal(instance.get('foo'), undefined, '`foo` should be undefined');
    assert.equal(instance.get('bar'), undefined, '`bar` should be undefined');
  });

  test('mergeProps: prevents leaking props even after updates', async function(assert) {
    const DEFAULT_STATE = { passingProp: 'foo' };
    const reducer = (state = DEFAULT_STATE, action) => {
      if (action.type === 'CHANGE_TO_BAR') {
        return {
          passingProp: 'bar',
        };
      }
      return state;
    };
    const store = createStore(reducer);
    this.owner.register('simple-redux:store', store);

    const mapStateToProps = state => state;
    const mergeProps = (stateProps, dispatchProps, ownProps) => ({
      onClick: ownProps.onClick,
      [stateProps.passingProp]: ownProps[stateProps.passingProp],
    });
    const connectedComponent = connect(
      mapStateToProps,
      null,
      mergeProps
    )(ClickForInstance);
    this.owner.register('component:test-target', connectedComponent);

    const spy = sinon.spy();
    this.set('spy', spy);
    await render(hbs`{{test-target onClick=spy foo=1 bar='test'}}`);
    await click('.test-target');

    const instance = spy.getCall(0).args[0];
    assert.equal(typeOf(instance.get('onClick')), 'function');
    assert.ok(instance.hasOwnProperty('foo'), 'Property `foo` should exist');
    assert.notOk(
      instance.hasOwnProperty('bar'),
      'Property `bar` should not exist'
    );

    store.dispatch({
      type: 'CHANGE_TO_BAR',
    });
    assert.equal(typeOf(instance.get('onClick')), 'function');
    assert.notOk(
      instance.hasOwnProperty('foo'),
      'Property `foo` should not exist'
    );
    assert.ok(instance.hasOwnProperty('bar'), 'Property `bar` should exist');
  });
});
