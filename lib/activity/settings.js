(() => {
  'use strict';

  const KEY_ACTIVITY_LIMIT = 'activityLimit';

  const DEFAULT_ACTIVITY_LIMIT = 1000;

  const {LevelDbKeyValueService} = require('@lgslabs/bits-level-kv');

  class ActivitySettings extends LevelDbKeyValueService {
    load(options) {
      return super.load(options)
      .then(() => this._initializeDefaults());
    }

    _initializeDefaults() {
      return Promise.resolve()
      .then(() => this._initializeDefault({key: KEY_ACTIVITY_LIMIT, value: DEFAULT_ACTIVITY_LIMIT}));
    }

    _initializeDefault({key, value}) {
      return Promise.resolve()
      .then(() => this.manager.has({key: key}))
      .then((exists) => {
        if (!exists) {
          return this.manager.set({key: key, value: value});
        }
        this.manager.on('delete', (op) => {
          if (key === op.key) {
            this.manager.set({key, value});
          }
        });
      });
    }

    getActivityLimit() {
      return Promise.resolve()
      .then(() => this.manager.get({key: KEY_ACTIVITY_LIMIT}))
      .then((activityLimit) => Number(activityLimit));
    }

    on(...params) {
      return this.manager.on(...params);
    }

    removeListener(...params) {
      return this.manager.removeListener(...params);
    }
  }

  module.exports = ActivitySettings;
})();
