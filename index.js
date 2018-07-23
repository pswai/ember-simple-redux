'use strict';

module.exports = {
  name: 'ember-simple-redux',

  options: {
    autoImport: {
      webpack: {
        devtool: 'inline-source-map',
      },
    },
    babel: {
      plugins: ['transform-object-rest-spread'],
    },
  },
};
