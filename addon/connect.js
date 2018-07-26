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
    const { simpleReduxStore, attrs } = componentInstance;
    const state = simpleReduxStore.getState();
    let stateProps, dispatchProps;
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

    // Do mergeProps and set it to component instance
    const finalProps = mergeProps(stateProps, dispatchProps, ownProps);
    componentInstance.setProperties(finalProps);

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
