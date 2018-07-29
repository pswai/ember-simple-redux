import { bindActionCreators } from 'redux';
import getMutableAttributes from './utils/get-mutable-attributes';

const defaultMergeProps = (stateProps, dispatchProps, ownProps) => ({
  ...ownProps,
  ...stateProps,
  ...dispatchProps,
});

const connect = (
  mapStateToProps,
  mapDispatchToProps,
  mergeProps = defaultMergeProps
  // options
) => EmberComponent => {
  const update = componentInstance => {
    const {
      simpleReduxStore: { getState, dispatch },
      attrs,
    } = componentInstance;
    const state = getState();
    let stateProps, dispatchProps, finalProps;
    let ownProps = getMutableAttributes(attrs);

    // Check arity, if arity is 1 then no `ownProps` is needed
    // Follow the sequence in react-redux: Missing, Function
    if (!mapStateToProps) {
      stateProps = {};
    } else if (typeof mapStateToProps === 'function') {
      if (mapStateToProps.length !== 1) {
        stateProps = mapStateToProps(state, ownProps);
      } else {
        stateProps = mapStateToProps(state);
      }
    } else {
      const componentName = componentInstance.get('_debugContainerKey');
      throw new Error(
        `Invalid value of type ${typeof mapStateToProps} for mapStateToProps argument when connecting component ${componentName}.`
      );
    }

    // Check arity, if arity is 1 then no `ownProps` is needed
    // Follow the sequence in react-redux: Object, Missing, Function
    if (mapDispatchToProps && typeof mapDispatchToProps === 'object') {
      dispatchProps = bindActionCreators(mapDispatchToProps, dispatch);
    } else if (!mapDispatchToProps) {
      dispatchProps = {
        dispatch: dispatch,
      };
    } else if (typeof mapDispatchToProps === 'function') {
      if (mapDispatchToProps.length !== 1) {
        dispatchProps = mapDispatchToProps(dispatch, ownProps);
      } else {
        dispatchProps = mapDispatchToProps(dispatch);
      }
    } else {
      const componentName = componentInstance.get('_debugContainerKey');
      throw new Error(
        `Invalid value of type ${typeof mapDispatchToProps} for mapDispatchToProps argument when connecting component ${componentName}.`
      );
    }

    // Do mergeProps and set it to component instance
    if (typeof mergeProps === 'function') {
      finalProps = mergeProps(stateProps, dispatchProps, ownProps);
      componentInstance.setProperties(finalProps);
    } else {
      const componentName = componentInstance.get('_debugContainerKey');
      throw new Error(
        `Invalid value of type ${typeof mergeProps} for mergeProps argument when connecting component ${componentName}.`
      );
    }

    // This prevents attrs to be leaked to component
    Object.keys(attrs).forEach(key => {
      if (!finalProps.hasOwnProperty(key)) {
        delete componentInstance[key];
      }
    });
  };

  return EmberComponent.extend({
    init() {
      const store = this.simpleReduxStore;

      if (mapStateToProps) {
        this.unsubscribe = store.subscribe(() => update(this));
      }

      update(this);
      this._super(...arguments);
    },

    didUpdateAttrs() {
      update(this);
      this._super(...arguments);
    },

    willDestroy() {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
      this._super(...arguments);
    },
  });
};

export default connect;
