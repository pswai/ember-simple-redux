import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { run } from '@ember/runloop';
import Application from '@ember/application';
import { initialize } from 'dummy/initializers/simple-redux-store';
import destroyApp from '../../helpers/destroy-app';
import isReduxStore from '../../utils/is-redux-store';

describe('Unit | Initializer | simple-redux-store', function() {
  let application;

  beforeEach(function() {
    run(function() {
      application = Application.create();
      application.deferReadiness();
    });
  });

  afterEach(function() {
    destroyApp(application);
  });

  it('registers `simple-redux:store`', function() {
    initialize(application);
    const registeredStuff = application.resolveRegistration(
      'simple-redux:store'
    );
    expect(isReduxStore(registeredStuff), 'simple-redux:store is Redux store')
      .to.be.true;
  });
});
