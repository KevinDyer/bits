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

  const BitsId = require('./bits-id');
  const executor = require('../module-execution/executor');
  const HelperService = require('../helper/service');
  const LazyRequireLoader = require('../utils/lazy-require-loader');
  const logger = require('@lgslabs/bits-logger').getLogger();
  const MessageCenter = require('@lgslabs/bits-message-center');
  const path = require('path');

  if (!global.hasOwnProperty('helper')) {
    global.helper = new LazyRequireLoader();
  }
  // Need to export the Helper API here,
  // otherwise the Helper Service will try
  // to use its own API to publish its API.
  global.helper.add('BaseHelperApi', path.join(__dirname, '../helper/api'));

  class BaseService {
    load() {
      const bitsId = new BitsId();
      const helperService = new HelperService();

      return Promise.resolve()
      .then(() => bitsId.load())
      .then(() => Object.defineProperty(global, 'bitsId', {
        value: bitsId.getBitsId(),
        writable: false,
      }))
      .then(() => {
        const messageCenter = new MessageCenter(executor.getAllExecutors());
        const {isMaster, isWorker} = executor;

        if (isMaster) {
          const BaseMaster = require('./master');
          const baseMaster = new BaseMaster();
          const BitsFs = require('@lgslabs/bits-fs');

          logger.debug('Initializing base', global.paths.data);
          return Promise.resolve()
          .then(() => BitsFs.ensureDirectoryExists(global.paths.data))
          .then(() => helperService.load({isMaster, messageCenter}))
          .then(() => baseMaster.load({messageCenter}));
        } else if (isWorker) {
          const BaseWorker = require('./worker');
          const baseWorker = new BaseWorker();

          return Promise.resolve()
          .then(() => helperService.load({isMaster, messageCenter}))
          .then(() => baseWorker.load({messageCenter}));
        }
      });
    }
  }

  module.exports = BaseService;
})();
