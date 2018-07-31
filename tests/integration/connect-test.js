import Ember from 'ember';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { click, render, getContext } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Component from '@ember/component';
import { typeOf } from '@ember/utils';
import { createStore, bindActionCreators } from 'redux';
import connect from 'ember-simple-redux/connect';
import ClickForInstance from 'dummy/components/tests/click-for-instance';
import sinon from 'sinon';

// This function is used to assert throws
// Bug: https://github.com/emberjs/ember-mocha/issues/141
async function expectThrow(cb, message) {
  // Stubbing `exception` for older Ember (>= 2.12)
  // Ember.onerror for newer Ember (>= 2.18)
  const spy = sinon.stub(Ember.Test.adapter, 'exception');
  const oldOnerror = Ember.onError;
  Ember.onerror = spy;

  await cb();

  const matcher = sinon.match.instanceOf(Error);
  expect(spy, `Expected ${cb} to throw an error`).to.have.been.calledOnceWith(
    matcher
  );
  expect(spy.getCall(0).args[0]).to.have.property('message', message);

  Ember.onerror = oldOnerror;
  spy.restore();
}

function setupStore(reducer) {
  const context = getContext();
  const store = createStore(reducer);
  context.owner.register('simple-redux:store', store);
  return store;
}

describe('Integration | connect', function() {
  setupRenderingTest();

  it('returns another component', function() {
    const component = Component.extend();
    const connectedComponent = connect()(component);

    expect(typeOf(connectedComponent)).to.equal('class');
    expect(
      component,
      'Connected component should be a different class'
    ).to.not.equal(connectedComponent);
  });

  it('passes original props to connected component', async function() {
    const connectedComponent = connect()(ClickForInstance);
    this.owner.register('component:test-target', connectedComponent);

    const spy = sinon.spy();
    this.set('spy', spy);
    await render(hbs`{{test-target onClick=spy foo=1 bar='test'}}`);
    await click('.test-target');

    const instance = spy.getCall(0).args[0];
    expect(instance.get('foo')).to.equal(1);
    expect(instance.get('bar')).to.equal('test');
  });

  describe('with `mapStateToProps`', function() {
    describe('as function', function() {
      it('calls `mapStateToProps` with Redux state and `ownProps` when arity 0', async function() {
        const state = {};
        setupStore(() => state);

        // Arity: 0
        const mapStateToProps = () => {};
        const spy = sinon.spy(mapStateToProps);
        const connectedComponent = connect(spy)(Component);
        this.owner.register('component:test-target', connectedComponent);

        await render(hbs`{{test-target foo=1}}`);

        const { args } = spy.getCall(0);
        expect(args[0], '`state` should be as is').to.equal(state);
        expect(args[1], '`ownProps` should be passed').to.deep.equal({
          foo: 1,
        });
      });

      it('calls `mapStateToProps` with Redux state only when arity 1', async function() {
        const state = {};
        setupStore(() => state);

        // Arity: 1
        const mapStateToProps = state => state;
        const spy = sinon.spy(mapStateToProps);
        const connectedComponent = connect(spy)(Component);
        this.owner.register('component:test-target', connectedComponent);

        await render(hbs`{{test-target}}`);

        const { args } = spy.getCall(0);
        expect(args[0], '`state` should be as is').to.equal(state);
        expect(args.length, '`ownProps` should not be passed').to.equal(1);
      });

      it('calls `mapStateToProps` with Redux state and `ownProps` when arity 2', async function() {
        const state = {};
        setupStore(() => state);

        // Arity: 2
        const mapStateToProps = (state, ownProps) => ({ state, ownProps });
        const spy = sinon.spy(mapStateToProps);
        const connectedComponent = connect(spy)(Component);
        this.owner.register('component:test-target', connectedComponent);

        await render(hbs`{{test-target foo=1}}`);

        const { args } = spy.getCall(0);
        expect(args[0], '`state` should be as is').to.equal(state);
        expect(args[1], '`ownProps` should be passed').to.deep.equal({
          foo: 1,
        });
      });

      it('sets `stateProps` to connected component', async function() {
        setupStore(() => ({
          count: 5,
        }));

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
        expect(instance.get('count')).to.equal(5);
        expect(instance.get('fooPlusCount')).to.equal(6);
        expect(instance.get('bar'), '`bar` should be still there').to.equal(
          'test'
        );
      });
    });

    describe('invalid', function() {
      it('throws with proper message', async function() {
        // Purposely pass number
        const connectedComponent = connect(123)(Component);
        this.owner.register('component:test-target', connectedComponent);

        await expectThrow(
          () => render(hbs`{{test-target}}`),
          'Invalid value of type number for mapStateToProps argument when connecting component component:test-target.'
        );
      });
    });
  });

  describe('with `mapDispatchToProps`', function() {
    describe('as function', function() {
      it('calls `mapDispatchToProps` with `dispatch` and `ownProps` when arity 0', async function() {
        const store = setupStore(() => {});

        // Arity: 0
        const mapDispatchToProps = () => {};
        const spy = sinon.spy(mapDispatchToProps);
        const connectedComponent = connect(
          null,
          spy
        )(Component);
        this.owner.register('component:test-target', connectedComponent);

        await render(hbs`{{test-target}}`);

        const { args } = spy.getCall(0);
        expect(args[0], '`dispatch` should be as is').to.equal(store.dispatch);
        expect(args.length, '`ownProps` should be passed').to.equal(2);
      });

      it('calls `mapDispatchToProps` with `dispatch` only when arity 1', async function() {
        const store = setupStore(() => {});

        // Arity: 1
        const mapDispatchToProps = dispatch => ({
          dispatchProp() {
            dispatch({});
          },
        });
        const spy = sinon.spy(mapDispatchToProps);
        const connectedComponent = connect(
          null,
          spy
        )(Component);
        this.owner.register('component:test-target', connectedComponent);

        await render(hbs`{{test-target}}`);

        const { args } = spy.getCall(0);
        expect(args[0], '`dispatch` should be as is').to.equal(store.dispatch);
        expect(args.length, '`ownProps` should not be passed').to.equal(1);
      });

      it('calls `mapDispatchToProps` with `dispatch` and `ownProps` when arity 2', async function() {
        const store = setupStore(() => {});

        // Arity: 2
        const mapDispatchToProps = (dispatch, ownProps) => ({
          dispatchProp() {
            dispatch(ownProps);
          },
        });
        const spy = sinon.spy(mapDispatchToProps);
        const connectedComponent = connect(
          null,
          spy
        )(Component);
        this.owner.register('component:test-target', connectedComponent);

        await render(hbs`{{test-target}}`);

        const { args } = spy.getCall(0);
        expect(args[0], '`dispatch` should be as is').to.equal(store.dispatch);
        expect(args.length, '`ownProps` should be passed').to.equal(2);
      });
    });

    describe('as object', function() {
      it('wraps each property with `dispatch`', async function() {
        const store = setupStore(() => {});
        const mapDispatchToProps = {
          foo: sinon.stub().returns({
            type: 'DO_SOMETHING',
          }),
        };
        const dispatchSpy = sinon.spy(store, 'dispatch');
        const BaseComponent = Component.extend({
          didInsertElement() {
            this.foo();
          },
        });
        const connectedComponent = connect(
          null,
          mapDispatchToProps
        )(BaseComponent);
        this.owner.register('component:test-target', connectedComponent);

        await render(hbs`{{test-target}}`);

        expect(dispatchSpy.calledOnce, '`dispatch` should be called once').to.be
          .true;
        expect(mapDispatchToProps.foo.calledOnce, '`foo` should be called once')
          .to.be.true;
      });
    });

    describe('misssing', function() {
      it('adds `dispatch` to props', async function() {
        const store = setupStore(() => {});

        const connectedComponent = connect(
          null,
          null
        )(ClickForInstance);
        this.owner.register('component:test-target', connectedComponent);

        const spy = sinon.spy();
        this.set('spy', spy);
        await render(hbs`{{test-target onClick=spy}}`);
        await click('.test-target');

        const instance = spy.getCall(0).args[0];
        expect(
          instance.get('dispatch'),
          '`dispatch` should be injected'
        ).to.equal(store.dispatch);
      });
    });

    describe('invalid', function() {
      it('throws with proper message', async function() {
        // Purposely pass number
        const connectedComponent = connect(
          null,
          123
        )(Component);
        this.owner.register('component:test-target', connectedComponent);

        await expectThrow(
          () => render(hbs`{{test-target}}`),
          'Invalid value of type number for mapDispatchToProps argument when connecting component component:test-target.'
        );
      });
    });
  });

  describe('with `mergeProps`', function() {
    describe('missing', function() {
      it('gives `stateProps` precedence over `ownProps`', async function() {
        setupStore(() => ({
          count: 5,
        }));

        const mapStateToProps = ({ count }) => ({ foo: count });
        const connectedComponent = connect(mapStateToProps)(ClickForInstance);
        this.owner.register('component:test-target', connectedComponent);

        const spy = sinon.spy();
        this.set('spy', spy);
        await render(hbs`{{test-target onClick=spy foo=1 bar='test'}}`);
        await click('.test-target');

        const instance = spy.getCall(0).args[0];
        expect(instance.get('foo')).to.equal(5);
        expect(instance.get('bar'), '`bar` should be still there').to.equal(
          'test'
        );
      });

      it('gives `dispatchProps` precedence over `ownProps`', async function() {
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
        expect(instance).respondsTo('foo'); // The bound action creator
        expect(instance.get('bar'), '`bar` should be still there').to.equal(
          'test'
        );
      });

      it('gives `dispatchProps` precedence over `stateProps`', async function() {
        setupStore(() => ({
          count: 5,
        }));
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
        expect(instance).respondsTo('foo'); // The bound action creator
        expect(instance.get('bar'), '`bar` should be still there').to.equal(
          'test'
        );
      });
    });

    describe('as function', function() {
      it('sets the result to connected component', async function() {
        setupStore(() => ({
          count: 5,
        }));

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
        expect(instance.get('stateFoo')).to.equal(5);
        expect(instance).respondsTo('dispatchFoo'); // The bound action creator
        expect(instance.get('ownFoo')).to.equal(1);
        expect(instance.get('foo')).to.be.undefined;
        expect(instance.get('bar')).to.be.undefined;
      });

      it('prevents leaking props (only the result will be passed to component)', async function() {
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
        expect(instance).respondsTo('onClick');
        expect(instance).to.not.have.own.property('foo');
        expect(instance).to.not.have.own.property('bar');
        expect(instance.get('foo')).to.be.undefined;
        expect(instance.get('bar')).to.be.undefined;
      });

      it('prevents leaking props even after updates', async function() {
        const DEFAULT_STATE = { passingProp: 'foo' };
        const reducer = (state = DEFAULT_STATE, action) => {
          if (action.type === 'CHANGE_TO_BAR') {
            return {
              passingProp: 'bar',
            };
          }
          return state;
        };
        const store = setupStore(reducer);

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
        expect(instance).respondsTo('onClick');
        expect(instance).to.have.own.property('foo');
        expect(instance).to.not.have.own.property('bar');

        store.dispatch({
          type: 'CHANGE_TO_BAR',
        });
        expect(instance).respondsTo('onClick');
        expect(instance).to.not.have.own.property('foo');
        expect(instance).to.have.own.property('bar');
      });
    });

    describe('invalid', function() {
      it('throws with proper message', async function() {
        // Purposely pass number
        const connectedComponent = connect(
          null,
          null,
          123
        )(Component);
        this.owner.register('component:test-target', connectedComponent);

        await expectThrow(
          () => render(hbs`{{test-target}}`),
          'Invalid value of type number for mergeProps argument when connecting component component:test-target.'
        );
      });
    });
  });

  /*******************************************************************************************/
  /*                                                                                         */
  /* Cases Listed in https://github.com/reduxjs/react-redux/blob/master/docs/api.md#examples */
  /* Some cases are omitted due to high similarity (those with action creators)              */
  /*                                                                                         */
  /*******************************************************************************************/
  describe('in API examples', function() {
    // https://github.com/reduxjs/react-redux/blob/master/docs/api.md#inject-just-dispatch-and-dont-listen-to-store
    it("injects just `dispatch` and don't listen to store", async function() {
      const store = setupStore(() => {});
      const subscribeSpy = sinon.spy(store, 'subscribe');

      const connectedComponent = connect()(ClickForInstance);
      this.owner.register('component:base-target', ClickForInstance);
      this.owner.register('component:test-target', connectedComponent);

      const spy = sinon.spy();
      this.set('spy', spy);
      await render(hbs`
        {{base-target onClick=spy}}
        {{test-target onClick=spy}}
      `);
      await Promise.all([
        click('.test-target:nth-child(1)'),
        click('.test-target:nth-child(2)'),
      ]);

      const baseInstanceProps = Object.getOwnPropertyNames(
        spy.getCall(0).args[0]
      );
      const connectedInstance = spy.getCall(1).args[0];
      const connectedInstanceProps = Object.getOwnPropertyNames(
        connectedInstance
      );

      // Injects just dispatch
      expect(connectedInstance).itself.respondsTo('dispatch');
      expect(connectedInstanceProps)
        .to.include.members(baseInstanceProps)
        .and.have.lengthOf(baseInstanceProps.length + 2);

      // Don't listen to store
      expect(subscribeSpy).to.have.not.been.called;
    });

    // https://github.com/reduxjs/react-redux/blob/master/docs/api.md#inject-all-action-creators--addtodo-completetodo--without-subscribing-to-the-store
    it('injects all action creates without subscribing to the store', async function() {
      const store = setupStore(() => {});
      const subscribeSpy = sinon.spy(store, 'subscribe');
      const dispatchSpy = sinon.spy(store, 'dispatch');

      const actionCreators = {
        foo: sinon.stub().returns({ type: 'foo' }),
        bar() {},
      };
      const connectedComponent = connect(
        null,
        actionCreators
      )(ClickForInstance);
      this.owner.register('component:test-target', connectedComponent);

      const spy = sinon.spy();
      this.set('spy', spy);
      await render(hbs`{{test-target onClick=spy}}`);
      await click('.test-target');

      const instance = spy.getCall(0).args[0];

      // Injects `foo` and `bar` wrapped with `dispatch`
      expect(instance).itself.respondsTo('foo');
      expect(instance).itself.respondsTo('bar');

      instance.get('foo')();
      expect(actionCreators.foo).to.have.been.calledOnce;
      expect(dispatchSpy).to.have.been.calledOnce;

      // Don't listen to store
      expect(subscribeSpy).to.have.not.been.called;
    });

    // https://github.com/reduxjs/react-redux/blob/master/docs/api.md#inject-dispatch-and-every-field-in-the-global-state
    it('injects `dispatch` and every field in the global state', async function() {
      setupStore(() => ({ foo: 3, bar: 4 }));

      const connectedComponent = connect(state => state)(ClickForInstance);
      this.owner.register('component:test-target', connectedComponent);

      const spy = sinon.spy();
      this.set('spy', spy);
      await render(hbs`{{test-target onClick=spy}}`);
      await click('.test-target');

      const instance = spy.getCall(0).args[0];

      // Injects `dispatch`
      expect(instance).itself.respondsTo('dispatch');

      // Injects every field
      expect(instance).to.own.property('foo', 3);
      expect(instance).to.own.property('bar', 4);
    });

    // https://github.com/reduxjs/react-redux/blob/master/docs/api.md#inject-dispatch-and-todos
    it('injects `dispatch` and `todos`', async function() {
      const todos = [];
      setupStore(() => ({ todos }));

      const mapStateToProps = state => ({ todos: state.todos });
      const connectedComponent = connect(mapStateToProps)(ClickForInstance);
      this.owner.register('component:test-target', connectedComponent);

      const spy = sinon.spy();
      this.set('spy', spy);
      await render(hbs`{{test-target onClick=spy}}`);
      await click('.test-target');

      const instance = spy.getCall(0).args[0];

      // Injects `dispatch`
      expect(instance).itself.respondsTo('dispatch');

      // Injects every field
      expect(instance).to.have.own.property('todos', todos);
    });

    // https://github.com/reduxjs/react-redux/blob/master/docs/api.md#inject-todos-and-all-action-creators
    it('injects `todos` and all action creators', async function() {
      const todos = [];
      const store = setupStore(() => ({ todos }));
      const dispatchSpy = sinon.spy(store, 'dispatch');

      const mapStateToProps = state => ({ todos: state.todos });
      const actionCreators = {
        foo: sinon.stub().returns({ type: 'foo' }),
        bar() {},
      };
      const connectedComponent = connect(
        mapStateToProps,
        actionCreators
      )(ClickForInstance);
      this.owner.register('component:test-target', connectedComponent);

      const spy = sinon.spy();
      this.set('spy', spy);
      await render(hbs`{{test-target onClick=spy}}`);
      await click('.test-target');

      const instance = spy.getCall(0).args[0];

      // Injects `todos`
      expect(instance).to.have.own.property('todos', todos);

      // Injects all action creators
      expect(instance).respondsTo('foo');
      expect(instance).respondsTo('bar');

      instance.get('foo')();
      expect(dispatchSpy).to.have.been.calledOnce;
    });

    // https://github.com/reduxjs/react-redux/blob/master/docs/api.md#inject-todos-and-all-action-creators-addtodo-completetodo--as-actions
    it('injects `todos` and all action creators as `actions`', async function() {
      const todos = [];
      const store = setupStore(() => ({ todos }));
      const dispatchSpy = sinon.spy(store, 'dispatch');

      const mapStateToProps = state => ({ todos: state.todos });
      const actionCreators = dispatch => ({
        actions: bindActionCreators(
          {
            foo: sinon.stub().returns({ type: 'foo' }),
            bar() {},
          },
          dispatch
        ),
      });
      const connectedComponent = connect(
        mapStateToProps,
        actionCreators
      )(ClickForInstance);
      this.owner.register('component:test-target', connectedComponent);

      const spy = sinon.spy();
      this.set('spy', spy);
      await render(hbs`{{test-target onClick=spy}}`);
      await click('.test-target');

      const instance = spy.getCall(0).args[0];

      // Injects `todos`
      expect(instance).to.have.own.property('todos', todos);

      // Injects all action creators as `actions`
      expect(instance)
        .to.have.own.property('actions')
        .that.itself.respondsTo('foo')
        .and.itself.respondsTo('bar');

      instance.get('actions.foo')();
      expect(dispatchSpy).to.have.been.calledOnce;
    });

    // https://github.com/reduxjs/react-redux/blob/master/docs/api.md#inject-todos-of-a-specific-user-depending-on-props
    it('injects `todos` of a specific user depending on props', async function() {
      const todos = {
        foo: [],
        bar: [],
      };
      setupStore(() => ({ todos }));

      const mapStateToProps = (state, ownProps) => ({
        todos: state.todos[ownProps.userId],
      });
      const connectedComponent = connect(mapStateToProps)(ClickForInstance);
      this.owner.register('component:test-target', connectedComponent);

      const spy = sinon.spy();
      this.set('spy', spy);
      await render(hbs`{{test-target onClick=spy userId='bar'}}`);
      await click('.test-target');

      const instance = spy.getCall(0).args[0];

      // Injects the correct `todos`
      expect(instance).to.have.own.property('todos', todos.bar);
    });

    // https://github.com/reduxjs/react-redux/blob/master/docs/api.md#inject-todos-of-a-specific-user-depending-on-props-and-inject-propsuserid-into-the-action
    it('injects `todos` of a specific user depending on props and injects `props.userId` into the action', async function() {
      const todos = {
        foo: [],
        bar: [],
      };
      setupStore(() => ({ todos }));

      const mapStateToProps = state => ({
        todos: state.todos,
      });
      const actionCreators = {
        addTodo: sinon.stub().returns({ type: 'ADD_TODO' }),
      };
      const mergeProps = (stateProps, dispatchProps, ownProps) =>
        Object.assign({}, ownProps, {
          todos: stateProps.todos[ownProps.userId],
          addTodo: text => dispatchProps.addTodo(ownProps.userId, text),
        });
      const connectedComponent = connect(
        mapStateToProps,
        actionCreators,
        mergeProps
      )(ClickForInstance);
      this.owner.register('component:test-target', connectedComponent);

      const spy = sinon.spy();
      this.set('spy', spy);
      await render(hbs`{{test-target onClick=spy userId='bar'}}`);
      await click('.test-target');

      const instance = spy.getCall(0).args[0];

      // Injects the correct `todos`
      expect(instance).to.have.own.property('todos', todos.bar);

      // The `addTodo` action is bound
      expect(instance).itself.respondsTo('addTodo');

      instance.get('addTodo')('Save the world!');
      expect(actionCreators.addTodo).to.have.been.calledOnceWithExactly(
        'bar',
        'Save the world!'
      );
    });

    // https://github.com/reduxjs/react-redux/blob/master/docs/api.md#factory-functions
    describe('supports `mapStateToProps` as factory function', function() {
      it('uses the returned function as `mapStateToProps`', async function() {
        let computeCount = 0;
        let memoizedReturnCount = 0;
        const store = setupStore(() => ({ value: 1 }));

        const mapStateFactory = () => {
          let lastProp, lastVal, lastResult;
          return (state, props) => {
            if (props.name === lastProp && lastVal === state.value) {
              memoizedReturnCount++;
              return lastResult;
            }
            computeCount++;
            lastProp = props.name;
            lastVal = state.value;
            return (lastResult = {
              someObject: { prop: props.name, stateVal: state.value },
            });
          };
        };

        const connectedComponent = connect(mapStateFactory)(Component);
        this.owner.register('component:test-target', connectedComponent);

        await render(hbs`
          {{test-target name='foo'}}
          {{test-target name='bar'}}
        `);

        store.dispatch({ type: 'RANDOM' });
        expect(computeCount, 'Should only compute twice').to.equal(2);
        expect(
          memoizedReturnCount,
          'Subsequent calls should be memoized'
        ).to.equal(2);
      });

      it('verifies `stateProps` to be plain object');
    });

    describe('supports `mapDispatchToProps` as factory function', function() {
      it('uses the returned function as `mapDispatchToProps`');

      it('verifies `dispatchProps` to be plain object');
    });
  });
});
