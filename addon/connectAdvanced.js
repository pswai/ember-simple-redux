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

function renderError(error) {
  const $ = Ember.$;

  // Elements
  const $comment = $('<!-- Error Display (ember-simple-redux) -->');
  const $overlay = $('<div id="ember-simple-redux-error-display">');
  const $message = $('<h2>').text(`${error.name}: ${error.message}`);
  const $hr = $('<hr>');
  const $stackTraceHeader = $('<h3>').text('Stacktrace');
  const $stackTrace = $('<pre>').text(error.stack);
  const $moreInfo = $('<p>').text('Full stacktrace can be found in console.');

  // Structure
  $overlay.append($message, $hr, $stackTraceHeader, $stackTrace, $moreInfo);

  // Styles
  $overlay.css({
    zIndex: '999999',
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    padding: '20px',
    backgroundColor: '#ffb3b3',
    fontFamily: `'Helvetica', 'Arial', sans-serif`,
    color: '#b70000',
  });
  $hr.css({
    border: '1px solid #999',
  });
  $stackTrace.css({
    padding: '15px',
    border: '1px dashed red',
    backgroundColor: '#fff',
  });

  // Render
  $comment.appendTo('body');
  $overlay.appendTo('body');

  // Setup listener to remove this layer
  $(document).one('remove-error-display.ember-simple-redux', function() {
    $comment.remove();
    $overlay.remove();
  });
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
      // Skip if the componentInstance is no longer valid
      if (
        componentInstance.get('isDestroyed') ||
        componentInstance.get('isDestroying')
      ) {
        return;
      }

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
        const error = this._simpleRedux.error;
        if (error) {
          renderError(error);
          throw error;
        } else {
          Ember.$(document).trigger('remove-error-display');
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
