export function createProvider(storeKey = 'simpleReduxStore') {
  return function provider(application, store) {
    const fullName = `simple-redux:store`;
    application.register(fullName, store, { instantiate: false });
    application.inject('component', storeKey, fullName);
  };
}

export default createProvider();
