import configureStore from '../state/configure-store';

export function initialize(application) {
  const store = configureStore();
  application.register('simple-redux:store', store, { instantiate: false });
  application.inject('component', 'simpleReduxStore', 'simple-redux:store');
}

export default {
  initialize,
};
