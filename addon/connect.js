const connect = (
  mapStateToProps
  // mapDispatchToProps,
  // mergeProps,
  // options
) => EmberComponent => {
  const update = componentInstance => {
    const { simpleReduxStore, attrs } = componentInstance;
    const state = simpleReduxStore.getState();
    let ownProps;

    // Check arity, if arity is 1 then no `ownProps` is needed
    if (mapStateToProps.length !== 1) {
      ownProps = componentInstance.getProperties(Object.keys(attrs));
    }
    const stateProps = mapStateToProps(state, ownProps);
    componentInstance.setProperties(stateProps);
  };

  return EmberComponent.extend({
    init() {
      const store = this.simpleReduxStore;

      if (mapStateToProps) {
        update(this);
        this.unsubscribe = store.subscribe(() => update(this));
      }
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
