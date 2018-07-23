const connect = (
  mapStateToProps
  // mapDispatchToProps,
  // mergeProps,
  // options
) => EmberComponent => {
  const update = componentInstance => {
    const { simpleReduxStore, attrs } = componentInstance;
    const state = simpleReduxStore.getState();
    let stateProps;

    // Check arity, if arity is 1 then no `ownProps` is needed
    if (mapStateToProps.length !== 1) {
      const ownProps = componentInstance.getProperties(Object.keys(attrs));
      stateProps = mapStateToProps(state, ownProps);
    } else {
      stateProps = mapStateToProps(state);
    }
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
