/**
Copyright 2019 LGS Innovations

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
**/
(() => {
  'use strict';

  const Manager = require('./manager');
  const Messenger = require('./messenger');
  const path = require('path');
  const {TAG: tag, SCOPES: scopes} = require('./constants');
  const {CrudService} = require('@lgslabs/bits-memory-crud');
  const {ResourceManager} = require('@lgslabs/bits-auto-discovery');

  const API_DATA = Object.freeze({
    name: 'BaseLoggingApi',
    filepath: path.join(__dirname, 'api'),
  });

  const TOPIC_CRYPTO_API = 'crypto-api';

  class LoggingService extends CrudService {
    constructor() {
      super();
      this._cryptoApiResMgr = null;
      this._boundResourceAdded = null;
      this._boundResourceRemoved = null;
    }

    load({messageCenter}) {
      return super.load({
        messageCenter,
        tag,
        scopes,
        routePath: '/api/base/logging',
        routerFilepath: path.join(__dirname, 'router'),
        apiExport: CrudService.ApiExport.GLOBAL,
        apiData: API_DATA,
      });
    }

    unload(options) {
      return this._cryptoApiResMgr.unload()
      .then(() => super.unload(options));
    }

    postload({messageCenter}) {
      this._boundResourceAdded = this._onResourceAdded.bind(this, messageCenter);
      this._boundResourceRemoved = this._onResourceRemoved.bind(this);
      this._cryptoApiResMgr = new ResourceManager({topic: TOPIC_CRYPTO_API});
      this._cryptoApiResMgr.on('add', this._boundResourceAdded);
      this._cryptoApiResMgr.on('remove', this._boundResourceRemoved);
      return this._cryptoApiResMgr.load(messageCenter);
    }

    _onResourceAdded(messageCenter, res) {
      try {
        const CryptoApi = require(res.getValue().filepath);
        this._manager.cryptoApi = new CryptoApi(messageCenter);
      } catch (err) {
        logger.error('Error creating the crypto-api', err);
      }
    }

    _onResourceRemoved(res) {
      this._manager.cryptoApi = null;
    }

    createManager() {
      return Promise.resolve(new Manager());
    }

    createMessenger() {
      return Promise.resolve(new Messenger());
    }
  }

  module.exports = LoggingService;
})();
