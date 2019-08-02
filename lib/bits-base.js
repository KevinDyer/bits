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

  const path = require('path');
  const EventEmitter = require('events');
  const cluster = require('cluster');

  const MessageCenter = require('@lgslabs/bits-message-center');

  /*
   * Utils
   */
  const UtilFs = require('@lgslabs/bits-fs');
  const LazyRequireLoader = require('./utils/lazy-require-loader');

  if (!global.hasOwnProperty('utils')) {
    global.utils = new LazyRequireLoader();
  }
  global.utils.add('childProcess', path.join(__dirname, 'helpers/child-process'));
  global.utils.add('Certificate', path.join(__dirname, 'utils/certificate'));
  global.utils.add('Key', path.join(__dirname, 'utils/key'));
  global.utils.add('LevelDB', path.join(__dirname, 'utils/leveldb'));
  global.utils.add('UtilChildProcess', path.join(__dirname, 'helpers/child-process'));
  global.utils.add('UtilStream', path.join(__dirname, 'utils/stream'));
  global.utils.add('UtilPem', path.join(__dirname, 'utils/util-pem'));

  /*
  * Helpers
  */
  if (!global.hasOwnProperty('helper')) {
    global.helper = new LazyRequireLoader();
  }
  global.helper.add('BaseHelperApi', path.join(__dirname, 'helper/helper-api'));
  global.helper.add('CertificateApi', path.join(__dirname, 'certificate/certificate-api'));
  global.helper.add('ChildProcess', path.join(__dirname, 'helpers/child-process'));
  global.helper.add('KeyApi', path.join(__dirname, 'key/key-api'));
  global.helper.add('LazyLoad', path.join(__dirname, 'helpers/lazy-load'));
  global.helper.add('SystemApi', path.join(__dirname, 'system/api'));

  /*
   * Logging
   */
  const logger = require('@lgslabs/bits-logger').getLogger();

  if (!global.hasOwnProperty('paths')) {
    global.paths = {};
  }

  // Note whatever you do in the constructor will happen in all child processes
  // as well as in the master
  class Base extends EventEmitter {
    constructor(options) {
      super();

      this._messageCenter = new MessageCenter(cluster, process);

      this.options = options || {};
      this._initialized = false;
    }

    sendError(err) {
      logger.debug('%s: %s', err.errno, err.string);
      this.emit('base error', err);
    }

    initialize() {
      logger.debug('Initializing base', global.paths.data);
      return Promise.resolve()
      .then(() => UtilFs.ensureDirectoryExists(global.paths.data))
      .then(() => {
        const HelperManager = require('./helper/helper-manager');
        this._helperManager = new HelperManager();
        return this._helperManager.load(this._messageCenter);
      })
      .then(() => {
        const KeyManager = require('./key/key-manager');
        this._keyManager = new KeyManager();
        return this._keyManager.load(this._messageCenter);
      })
      .then(() => {
        const CertificateManager = require('./certificate/cert-manager');
        this._certificateManager = new CertificateManager();
        return this._certificateManager.load(this._messageCenter);
      })
      .then(() => {
        const ScopesService = require('./scopes/service');
        this._scopeService = new ScopesService();
        return this._scopeService.load({
          messageCenter: this._messageCenter,
        });
      })
      .then(() => {
        const ActivityService = require('./activity/service');
        this._activityService = new ActivityService();
        return this._activityService.load({messageCenter: this._messageCenter});
      })
      .then(() => {
        const SystemService = require('./system/service');
        this._systemService = new SystemService();
        return this._systemService.load({
          messageCenter: this._messageCenter,
        });
      })
      .catch((err) => {
        logger.error('Base failed to initialize', err);
        return Promise.reject(err);
      });
    }

    load() {
      const ModuleService = require('./modules/service');
      // Managers to run the apps
      this._moduleService = new ModuleService();

      return this._moduleService.load({
        messageCenter: this._messageCenter,
        scopeManager: this._scopeService.manager,
        userManager: this._userManager,
        keyManager: this._keyManager,
      })
      .then(() => this._messageCenter.sendEvent('base#Base initialized', {scopes: null}));
    }

    // This is used for a module to elevate itself above the confines of Base and become something more
    // A new magical force known as a module
    dispatchModule(mod) {
      const DispatchManager = require('./dispatcher/dispatch-manager');
      const HelperManager = require('./helper/helper-manager');

      this._helperManager = new HelperManager();
      this._dispatchManager = new DispatchManager(mod);

      return Promise.resolve()
      .then(() => this._helperManager.load(this._messageCenter))
      .then(() => this._dispatchManager.load(this._messageCenter))
      .catch((err) => {
        logger.error('Error dispatching module', err);
        return Promise.reject(err);
      });
    }
  }

  module.exports = Base;
})();
