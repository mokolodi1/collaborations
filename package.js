
Package.describe({
  name: 'medbook:collaborations',
  version: '2.3.4',
  summary: 'Collaboration based security architecture (similar to Roles and Friends)',
  git: 'https://github.com/ucsc-medbook/collaborations',
  documentation: 'README.md'
});

Package.onUse(function (api) {
  api.versionsFrom('1.1.0.2');

  api.use('meteor-platform@1.2.0');

  api.use([
    'mongo@1.1.0',
    'mongo-livedata@1.0.8',
    'minimongo@1.0.8',
    'accounts-base@1.2.0',
    'accounts-password@1.1.1',
    'aldeed:simple-schema@1.3.3',
    'aldeed:collection2@2.5.0',
    'grove:less@0.1.1',
    'http@1.1.0',
    'underscore@1.0.3',
    'yasaricli:slugify@0.0.7',
    'clinical:base-model@1.3.0',
    'matb33:collection-hooks@0.8.1',
    'clinical:user-model@1.4.1'
    // 'accounts-base',
    // 'accounts-password',
  ], ['client', 'server']);

  api.imply('mongo');
  api.imply('mongo-livedata');
  api.imply('minimongo');
  api.imply('accounts-base');
  api.imply('accounts-password');
  api.imply('clinical:user-model');
  // api.imply('aldeed:collection2');
  // api.imply('clinical:base-model');

  api.addFiles([
    'client/subscriptions.js',
  ], ['client']);

  api.addFiles([
    'lib/collection.collaborations.js',
    'lib/object.collaboration.js',
    'lib/object.user.js',
    'lib/extentions.js',
    //'lib/object.user.js'
  ]);

  api.addFiles([
    'server/accounts.js',
    'server/helpers.js',
    'server/methods.js',
    'server/publications.js',
    //'server/methods.initialization.js'
  ], ['server']);


  api.export([
    'Schemas',
    'Collaborations',
    'Collaboration'
  ]);
});




Package.onTest(function (api) {
  api.versionsFrom('1.1.0.2');

  api.use('meteor-platform@1.2.2');

  api.use('mongo@1.1.0');
  api.use('mongo-livedata@1.0.8');
  api.use('minimongo@1.0.8');

  api.use('accounts-base@1.2.0');
  api.use('accounts-password@1.1.1');
  api.use('autopublish@1.0.3');
  api.use('insecure@1.0.3');
  api.use('tinytest@1.0.5');
  api.use('clinical:verification');
  api.use('clinical:collaborations');

  api.addFiles('tests/tinytests/collaborations.js');
});
