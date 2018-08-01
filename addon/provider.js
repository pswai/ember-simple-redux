export function createProvider(storeKey = 'simpleReduxStore') {
  return function provider(store, application) {
    const fullName = `simple-redux:${storeKey}`;
    application.register(fullName, store, { instantiate: false });
    application.inject('component', storeKey, fullName);
  };
}

export default createProvider();
