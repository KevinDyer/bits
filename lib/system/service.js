(() => {
  'use strict';

  const BitsId = require('./bits-id');
  const Manager = require('./manager');
  const Messenger = require('./messenger');
  const {Service} = require('@lgslabs/bits-core');
  const {TAG, READ_SCOPES, WRITE_SCOPES} = require('./constants');

  class SystemService extends Service {
    load({messageCenter} = {}) {
      const bitsId = new BitsId();
      const options = {
        bitsId,
        messageCenter,
        tag: TAG,
        readScopes: READ_SCOPES,
        writeScopes: WRITE_SCOPES,
      };

      return bitsId.load(options)
      .then(() => super.load(options));
    }

    createManager() {
      return Promise.resolve(new Manager());
    }

    createMessenger() {
      return Promise.resolve(new Messenger());
    }
  }

  module.exports = SystemService;
})();
