const defaultMergeProps = (stateProps, dispatchProps, ownProps) => ({
  ...ownProps,
  ...stateProps,
  ...dispatchProps,
});

const connect = (
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
  // options
) => EmberComponent => {
  const update = componentInstance => {
    const { simpleReduxStore, attrs } = componentInstance;
    const state = simpleReduxStore.getState();
    let stateProps, dispatchProps, finalProps;
    let ownProps = componentInstance.getProperties(Object.keys(attrs));

    // Check arity, if arity is 1 then no `ownProps` is needed
    if (!mapStateToProps) {
      stateProps = {};
    } else if (mapStateToProps.length !== 1) {
      stateProps = mapStateToProps(state, ownProps);
    } else {
      stateProps = mapStateToProps(state);
    }

    dispatchProps = mapDispatchToProps;

    // Do mergeProps
    if (mergeProps) {
      // Create an object with all existing attrs set to undefined.
      // This prevents attrs to be leaked to component if `mergeProps` does not
      // define it.
      const resetProps = Object.keys(attrs).reduce((result, key) => {
        result[key] = undefined;
        return result;
      }, {});
      finalProps = {
        ...resetProps,
        ...mergeProps(stateProps, dispatchProps, ownProps),
      };
    } else {
      finalProps = defaultMergeProps(stateProps, dispatchProps, ownProps);
    }

    componentInstance.setProperties(finalProps);
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
