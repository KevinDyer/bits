(() => {
  'use strict';

  const BitsId = require('./bits-id');
  const Manager = require('./manager');
  const Messenger = require('./messenger');
  const path = require('path');
  const {Service} = require('@lgslabs/bits-core');
  const {TAG, READ_SCOPES, WRITE_SCOPES} = require('./constants');

  const API_DATA = {
    name: 'SystemApi',
    filepath: path.resolve(__dirname, './api'),
  };

  class SystemService extends Service {
    load({messageCenter} = {}) {
      const bitsId = new BitsId();
      const options = {
        bitsId,
        messageCenter,
        tag: TAG,
        readScopes: READ_SCOPES,
        writeScopes: WRITE_SCOPES,
        apiExport: Service.ApiExport.GLOBAL,
        apiData: API_DATA,
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
