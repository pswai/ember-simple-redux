/* eslint-env node */
module.exports = {
  description: 'Install dependencies and blueprints',

  afterInstall() {
    return this.addPackageToProject('ember-auto-import');
  },
};
