/**
Copyright 2017 LGS Innovations

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

  const EventEmitter = require('events');
  const LoggerFactory = require('../logging/logger-factory');
  const UtilExec = require('../helpers/child-process');
  const Messenger = require('./system-messenger');
  const logger = LoggerFactory.getLogger();

  class SystemManager extends EventEmitter {
    constructor(bitsId) {
      super();
      this._bitsId = bitsId;
      this._messenger = new Messenger(this);
    }

    load(messageCenter) {
      return Promise.resolve()
      .then(() => this._messenger.load(messageCenter));
    }

    unload() {
      return Promise.resolve()
      .then(() => this._messenger.unload());
    }

    getTime() {
      return Promise.resolve(new Date());
    }

    setTime() {
      return Promise.reject(new Error('operation-not-supported'));
    }

    restart() {
      logger.info('Bits has requested a reboot! ... rebooting now');
      return UtilExec.createSpawnPromise('reboot');
    }

    shutdown() {
      logger.info('Bits has requested a shutdown! ... shutting down now');
      return UtilExec.createSpawnPromise('shutdown', ['-h', 'now']);
    }

    getBitsId() {
      return Promise.resolve(this._bitsId.getBitsId());
    }
  }

  module.exports = SystemManager;
})();
