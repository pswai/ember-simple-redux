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
    // Declare this here so that we can access statics like `defaultProps` here
    let ConnectedComponent;

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
      const ownProps = {
        ...ConnectedComponent.defaultProps,
        ...getMutableAttributes(attrs),
      };
      const { props: nextProps, shouldComponentUpdate } = Object.assign(
        _simpleRedux,
        _simpleRedux.updater(ownProps, _simpleRedux)
      );

      if (shouldComponentUpdate) {
        componentInstance.setProperties(nextProps);

        // This prevents attrs to be leaked to component
        Object.keys(attrs).forEach(key => {
          if (!nextProps || !nextProps.hasOwnProperty(key)) {
            delete componentInstance[key];
          }
        });
      }
    }

    ConnectedComponent = WrappedComponent.extend({
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
        }

        // Different with React, side effects are allowed even in `init`.
        // So updater is run as early as possible.
        // In `react-redux`, this is run in `getDerivedStateFromProps`.
        runUpdater(this);
        this._super(...arguments);
      },

      didUpdateAttrs() {
        runUpdater(this);
        this._super(...arguments);
      },

      willRender() {
        if (this._simpleRedux.error) {
          throw this._simpleRedux.error;
        }

        // We don't need to worry about removing this property because
        // `renderCountProp` can't be changed after the component is connected.
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

    return ConnectedComponent;
  };
}

export default connectAdvanced;
