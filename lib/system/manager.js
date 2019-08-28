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

  const logger = require('@lgslabs/bits-logger').getLogger();
  const {Manager} = require('@lgslabs/bits-core');
  const ChildProcessPromise = require('@lgslabs/child-process-promise');

  class SystemManager extends Manager {
    constructor() {
      super();
      this._bitsId = null;
    }

    load({messageCenter, bitsId}) {
      this._bitsId = bitsId;
      return super.load({messageCenter});
    }

    getTime() {
      return Promise.resolve(new Date());
    }

    restart() {
      logger.info('Bits has requested a reboot! ... rebooting now');
      return ChildProcessPromise.spawn('reboot');
    }

    shutdown() {
      logger.info('Bits has requested a shutdown! ... shutting down now');
      return ChildProcessPromise.spawn('shutdown', ['-h', 'now']);
    }
  }

  module.exports = SystemManager;
})();
