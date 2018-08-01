/* eslint-env node */
module.exports = {
  description: 'Install dependencies and blueprints',

  normalizeEntityName: function() {},

  afterInstall() {
    return this.addPackageToProject('ember-auto-import');
  },
};
