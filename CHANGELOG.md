# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.0] - 2019-03-25

### Added

- Support Ember >= 3.6.0. (#47)
- Upgrade majority of dependencies (Babel 7, Ember CLI, etc).
- Drop `ember-cli-mocha` in favor of `ember-mocha`.

### Changed

- Stop using `Ember.NAME_KEY` for connected component name as it is deprecated.

## [0.3.0] - 2018-10-07

### Added

- Display errors as an overlay. (#19)
- Updated various dependencies. (#5, #7, #9, #10, #17, #18)

## [0.2.0] - 2018-08-14

### Added

- Start using Greenkeeper to monitor the project.

### Fixed

- `Assertion Failed: calling set on destroyed object` issue when store is updated.

## [0.1.2] - 2018-08-08

### Fixed

- Errors being swallowed by `connectAdvanced`.

## [0.1.1] - 2018-08-02

### Fixed

- Props are not available in `init` and `didUpdateAttrs` hooks.

## [0.1.0] - 2018-08-02

### Added

- `connect()`, `connectAdvanced()`, `provider`, `createProvider` APIs.

[unreleased]: https://github.com/pswai/ember-simple-redux/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/pswai/ember-simple-redux/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/pswai/ember-simple-redux/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/pswai/ember-simple-redux/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/pswai/ember-simple-redux/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/pswai/ember-simple-redux/compare/v0.1.0...v0.1.1
