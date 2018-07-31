export function createProvider(storeKey = 'store') {
  return function provider(application, store) {
    const fullName = `simple-redux:${storeKey}`;
    application.register(fullName, store, { instantiate: false });
    application.inject('component', storeKey, fullName);
  };
}

export default createProvider();
