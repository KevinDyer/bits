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
  const cluster = require('cluster');
  const LazyRequireLoader = require('../utils/lazy-require-loader');
  const MessageCenter = require('@lgslabs/bits-message-center');
  const path = require('path');

  if (!global.hasOwnProperty('utils')) {
    global.utils = new LazyRequireLoader();
  }

  if (!global.hasOwnProperty('helper')) {
    global.helper = new LazyRequireLoader();
  }
  global.helper.add('BaseHelperApi', path.join(__dirname, '../helper/api'));
  global.helper.add('LazyLoad', path.join(__dirname, '../helpers/lazy-load'));

  if (!global.hasOwnProperty('paths')) {
    global.paths = {};
  }

  class BaseService {
    load() {
      const bitsId = new BitsId();
      return Promise.resolve()
      .then(() => bitsId.load())
      .then(() => Object.defineProperty(global, 'bitsId', {
        value: bitsId.getBitsId(),
        writable: false,
      }))
      .then(() => {
        const messageCenter = new MessageCenter(cluster, process);

        if (cluster.isMaster) {
          const BaseMaster = require('./master');
          const baseMaster = new BaseMaster();
          return baseMaster.load({messageCenter});
        } else if (cluster.isWorker) {
          const BaseWorker = require('./worker');
          const baseWorker = new BaseWorker();
          return baseWorker.load({messageCenter});
        }
      });
    }
  }

  module.exports = BaseService;
})();
