import Ember from 'ember';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { click, render, getContext } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Component from '@ember/component';
import { typeOf } from '@ember/utils';
import { createStore } from 'redux';
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

  const matcher = sinon.match.instanceOf(Error).and(sinon.match({ message }));
  expect(spy, `Expected ${cb} to throw an error`).to.have.been.calledOnceWith(
    matcher
  );

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
        expect(instance.get('foo')).to.be.a('function'); // The bound action creator
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
        expect(instance.get('foo')).to.be.a('function'); // The bound action creator
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
        expect(instance.get('dispatchFoo')).to.be.a('function'); // The bound action creator
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
        expect(instance.get('onClick')).to.be.a('function');
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
        expect(instance.get('onClick')).to.be.a('function');
        expect(instance).to.have.own.property('foo');
        expect(instance).to.not.have.own.property('bar');

        store.dispatch({
          type: 'CHANGE_TO_BAR',
        });
        expect(instance.get('onClick')).to.be.a('function');
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

  /**********************************************************************************/
  /*                                                                                */
  /* Cases Listed in https://github.com/reduxjs/react-redux/blob/master/docs/api.md */
  /*                                                                                */
  /**********************************************************************************/
  // it("Examples: inject just dispatch and don't listen to store", async function() {
  //   const store = createStore(() => ({
  //     count: 5,
  //   }));
  //   this.owner.register('simple-redux:store', store);

  //   const connectedComponent = connect()(ClickForInstance);
  //   this.owner.register('component:base-target', ClickForInstance);
  //   this.owner.register('component:test-target', connectedComponent);

  //   const spy = sinon.spy();
  //   this.set('spy', spy);
  //   await render(hbs`{{base-target onClick=spy foo=1 bar='test'}}`);
  //   await click('.test-target');

  //   await render(hbs`{{test-target onClick=spy foo=1 bar='test'}}`);
  //   await click('.test-target');

  //   const baseInstance = spy.getCall(0).args[0];
  //   const connectedInatance = spy.getCall(1).args[0];

  //   assert.deepEqual(
  //     [...Object.getOwnPropertyNames(connectedInatance)],
  //     [...Object.getOwnPropertyNames(baseInstance), 'dispatch'],
  //     'Connected component should have 1 more prop'
  //   );
  // });
});
