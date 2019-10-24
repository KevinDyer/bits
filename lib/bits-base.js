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
  const express = require('express');
  const passport = require('passport');
  const multer = require('multer');

  const BaseLoadUrl = require('./helpers/base-load-url');
  const MessageCenter = require('./message-center');

  /*
   * Utils
   */
  const UtilFs = require('./helpers/fs');
  const LazyRequireLoader = require('./utils/lazy-require-loader');

  /**
   * Home - managers pertaining to base ui components
   */

  if (!global.hasOwnProperty('AuthStrategies')) {
    global.AuthStrategies = new LazyRequireLoader();
  }

  if (!global.hasOwnProperty('utils')) {
    global.utils = new LazyRequireLoader();
  }
  global.utils.add('childProcess', path.join(__dirname, 'helpers/child-process'));
  global.utils.add('Certificate', path.join(__dirname, 'utils/certificate'));
  global.utils.add('crypto', path.join(__dirname, 'utils/crypto'));
  global.utils.add('fs', path.join(__dirname, 'helpers/fs'));
  global.utils.add('Key', path.join(__dirname, 'utils/key'));
  global.utils.add('os', path.join(__dirname, 'utils/os'));
  global.utils.add('LevelDB', path.join(__dirname, 'utils/leveldb'));
  global.utils.add('UtilChildProcess', path.join(__dirname, 'helpers/child-process'));
  global.utils.add('UtilCrypto', path.join(__dirname, 'utils/crypto'));
  global.utils.add('UtilFs', path.join(__dirname, 'helpers/fs'));
  global.utils.add('UtilOs', path.join(__dirname, 'utils/os'));
  global.utils.add('UtilStream', path.join(__dirname, 'utils/stream'));
  global.utils.add('UtilScopes', path.join(__dirname, 'scopes/scopes-util'));
  global.utils.add('UtilPem', path.join(__dirname, 'utils/util-pem'));

  /*
  * Helpers
  */
  if (!global.hasOwnProperty('helper')) {
    global.helper = new LazyRequireLoader();
  }
  global.helper.add('AuthApi', path.join(__dirname, 'auth/auth-api'));
  global.helper.add('BaseActivityApi', path.join(__dirname, 'activity/activity-api'));
  global.helper.add('BaseHelperApi', path.join(__dirname, 'helper/helper-api'));
  global.helper.add('BaseLoggingApi', path.join(__dirname, 'logging/logging-api'));
  global.helper.add('BaseModuleApi', path.join(__dirname, 'modules/module-api'));
  global.helper.add('BaseScopesApi', path.join(__dirname, 'scopes/scopes-api'));
  global.helper.add('BaseServer', path.join(__dirname, 'helpers/base-server'));
  global.helper.add('BaseUserApi', path.join(__dirname, 'users/user-api'));
  global.helper.add('CertificateApi', path.join(__dirname, 'certificate/certificate-api'));
  global.helper.add('ChildProcess', path.join(__dirname, 'helpers/child-process'));
  global.helper.add('CrudApi', path.join(__dirname, 'helpers/crud-api'));
  global.helper.add('CrudManager', path.join(__dirname, 'helpers/crud-manager'));
  global.helper.add('CrudMessenger', path.join(__dirname, 'helpers/crud-messenger'));
  global.helper.add('CrudRouter', path.join(__dirname, 'helpers/crud-router.js'));
  global.helper.add('CryptoApi', path.join(__dirname, 'crypto/crypto-api'));
  global.helper.add('Daemon', path.join(__dirname, 'helpers/daemon'));
  global.helper.add('FS', path.join(__dirname, 'helpers/fs'));
  global.helper.add('KeyApi', path.join(__dirname, 'key/key-api'));
  global.helper.add('KeyValueApi', path.join(__dirname, 'helpers/key-value-api'));
  global.helper.add('KeyValueManager', path.join(__dirname, 'helpers/key-value-manager'));
  global.helper.add('KeyValueMessenger', path.join(__dirname, 'helpers/key-value-messenger'));
  global.helper.add('KeyValueService', path.join(__dirname, 'helpers/key-value-service'));
  global.helper.add('Messenger', path.join(__dirname, 'helpers/messenger'));
  global.helper.add('LazyLoad', path.join(__dirname, 'helpers/lazy-load'));
  global.helper.add('PersistentKeyValueManager', path.join(__dirname, 'helpers/persistent-key-value-manager'));
  global.helper.add('PersistentKeyValueService', path.join(__dirname, 'helpers/persistent-key-value-service'));
  global.helper.add('PouchDBCrudManager', path.join(__dirname, 'helpers/pouchdb-crud-manager'));
  global.helper.add('SystemApi', path.join(__dirname, 'system/api'));

  global.helper.express = express;
  global.helper.passport = passport;
  global.helper.multer = multer;

  /*
   * Logging
   */
  const LoggerFactory = require('./logging/logger-factory');

  const logger = LoggerFactory.getLogger();

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
      const ModuleManager = require('./modules/module-manager');
      const HelperManager = require('./helper/helper-manager');
      const BaseServer = require('./base-server');
      const LoggingManager = require('./logging/logging-manager');
      const CertificateManager = require('./certificate/cert-manager');
      const KeyManager = require('./key/key-manager');
      const CryptoManager = require('./crypto/crypto-manager');
      const UserManager = require('./users/user-manager');
      const AuthManager = require('./auth/auth-manager');
      const ClientManager = require('./client-manager');
      const ActivityManager = require('./activity/activity-manager');
      const ScopesManager = require('./scopes/scopes-manager');
      const SystemService = require('./system/service');
      const ProxyManager = require('./proxy/proxy-manager');

      // Setup managers
      this._helperManager = new HelperManager();
      this._keyManager = new KeyManager();
      this._certificateManager = new CertificateManager();
      this._cryptoManager = new CryptoManager(this._keyManager, this._messageCenter);
      this._loggingManager = new LoggingManager(this._cryptoManager);
      this._scopeManager = new ScopesManager(this._messageCenter);
      this._userManager = new UserManager(this._scopeManager);
      this._authManager = new AuthManager(this._userManager, this._baseServer);
      this._baseServer = new BaseServer(this._authManager, this._keyManager, this._certificateManager);
      this._clientManager = new ClientManager(this._authManager, this._messageCenter);
      this._activityManager = new ActivityManager(this._userManager);
      this._systemService = new SystemService();

      // Base things managers
      this._proxyManager = new ProxyManager(this._baseServer);
      this._baseLoadUrl = new BaseLoadUrl();

      // Managers to run the apps
      this._moduleManager = new ModuleManager({
        scopeManager: this._scopeManager,
        cryptoManager: this._cryptoManager,
        userManager: this._userManager,
        loggingManager: this._loggingManager,
        keyManager: this._keyManager,
      });

      logger.debug('Initializing base', global.paths.data);
      return Promise.resolve()
      .then(() => UtilFs.ensureDirectoryExists(global.paths.data))
      .then(() => this._helperManager.load(this._messageCenter))
      .then(() => this._keyManager.load(this._messageCenter))
      .then(() => this._certificateManager.load(this._messageCenter))
      .then(() => this._cryptoManager.load(this._messageCenter))
      .then(() => this._loggingManager.load(this._messageCenter, this._baseServer))
      .then(() => this._scopeManager.load(this._messageCenter))
      .then(() => this._userManager.load(this._messageCenter, this._baseServer))
      .then(() => this._authManager.load(this._baseServer, this._messageCenter))
      .then(() => this._activityManager.load(this._messageCenter))
      .then(() => this._proxyManager.load(this._messageCenter))
      .then(() => this._systemService.load({messageCenter: this._messageCenter}))
      .then(() => this._baseLoadUrl.load('BITS', this._messageCenter))
      .then(() => {
        logger.debug('Starting Web Server');
        return this._baseServer.load(this._messageCenter);
      })
      .then((server) => this._clientManager.load(server))
      .catch((err) => {
        logger.error('Base failed to initialize', err);
        return Promise.reject(err);
      });
    }

    load() {
      return this._moduleManager.load(this._messageCenter, this._baseServer)
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
