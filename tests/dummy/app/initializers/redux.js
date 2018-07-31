import { provider } from 'ember-simple-redux';
import configureStore from '../state/configure-store';

export function initialize(application) {
  const store = configureStore();
  provider(application, store);
}

export default {
  initialize,
};
