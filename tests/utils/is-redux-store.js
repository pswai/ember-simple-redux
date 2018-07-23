const isReduxStore = obj => {
  // Use duck-typing
  const expectedKeys = ['dispatch', 'getState', 'replaceReducer', 'subscribe'];
  return expectedKeys.every(key => !!obj[key]);
};

export default isReduxStore;
