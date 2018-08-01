import Ember from 'ember';
import getMutableAttributes from './utils/get-mutable-attributes';

function makeUpdater(sourceSelector, store) {
  return function updater(props, prevState) {
    try {
      const nextProps = sourceSelector(store.getState(), props);
      if (nextProps !== prevState.props || prevState.error) {
        return {
          shouldComponentUpdate: true,
          props: nextProps,
          error: null,
        };
      }
      return {
        shouldComponentUpdate: false,
      };
    } catch (error) {
      return {
        shouldComponentUpdate: true,
        error,
      };
    }
  };
}

function connectAdvanced(
  selectorFactory,
  {
    getDisplayName = name => `ConnectAdvanced(${name})`,
    methodName = 'connectAdvanced',
    renderCountProp = undefined,
    shouldHandleStateChanges = true,
    storeKey = 'simpleReduxStore',
    withRef = false,
    ...connectOptions
  } = {}
) {
  return function wrapWithConnect(WrappedComponent) {
    function createUpdater(store, wrappedComponentName) {
      const displayName = getDisplayName(wrappedComponentName);

      const selectorFactoryOptions = {
        ...connectOptions,
        getDisplayName,
        methodName,
        renderCountProp,
        shouldHandleStateChanges,
        storeKey,
        withRef,
        displayName,
        wrappedComponentName,
        WrappedComponent,
      };

      const sourceSelector = selectorFactory(
        store.dispatch,
        selectorFactoryOptions
      );
      return makeUpdater(sourceSelector, store);
    }

    function runUpdater(componentInstance) {
      const { attrs, _simpleRedux } = componentInstance;
      const ownProps = getMutableAttributes(attrs);
      const { props: nextProps, shouldComponentUpdate } = Object.assign(
        _simpleRedux,
        _simpleRedux.updater(ownProps, _simpleRedux)
      );

      if (shouldComponentUpdate) {
        componentInstance.setProperties(nextProps);

        // This prevents attrs to be leaked to component
        Object.keys(attrs).forEach(key => {
          if (!nextProps.hasOwnProperty(key)) {
            delete componentInstance[key];
          }
        });
      }
    }

    return WrappedComponent.extend({
      init() {
        const wrappedComponentName =
          this.get(Ember.NAME_KEY) ||
          this.get('_debugContainerKey') ||
          'Component';
        const store = this[storeKey];
        const updater = createUpdater(store, wrappedComponentName);
        let unsubscribe;

        Object.defineProperty(this, '_simpleRedux', {
          configurable: true,
          enumerable: false,
          writable: true,
          value: {
            store,
            updater,
            unsubscribe,
            renderCount: 0,
          },
        });

        if (shouldHandleStateChanges) {
          store.subscribe(() => runUpdater(this));
          runUpdater(this);
        }

        this._super(...arguments);
      },

      didReceiveAttrs() {
        runUpdater(this);
        this._super(...arguments);
      },

      didRender() {
        if (renderCountProp) {
          this.set(renderCountProp, this._simpleRedux.renderCount++);
        }
      },

      willDestroy() {
        if (this._simpleRedux.unsubscribe) {
          this._simpleRedux.unsubscribe();
        }
        this._super(...arguments);
      },
    });
  };
}

export default connectAdvanced;
