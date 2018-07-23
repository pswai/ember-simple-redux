import Application from '@ember/application';

import { initialize } from 'dummy/initializers/simple-redux-store';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import isReduxStore from '../../utils/is-redux-store';

module('Unit | Initializer | simple-redux-store', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.TestApplication = Application.extend();
    this.TestApplication.initializer({
      name: 'initializer under test',
      initialize,
    });

    this.application = this.TestApplication.create({ autoboot: false });
  });

  hooks.afterEach(function() {
    run(this.application, 'destroy');
  });

  test('it registers `simple-redux:store`', async function(assert) {
    await run(() => this.application.boot());
    const registeredStuff = this.application.resolveRegistration(
      'simple-redux:store'
    );
    assert.ok(
      isReduxStore(registeredStuff),
      'simple-redux:store is Redux store'
    );
  });
});
