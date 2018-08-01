import { provider } from 'ember-simple-redux';
import configureStore from '../state/configure-store';

export function initialize(application) {
  const store = configureStore();
  provider(store, application);
}

export default {
  initialize,
};
