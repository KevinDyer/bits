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
  'use-strict';

  const BitsFs = require('@lgslabs/bits-fs');
  const logger = require('@lgslabs/bits-logger').getLogger();
  const ModuleMasterApi = require('../modules/master-api');
  const path = require('path');
  const {isOneshot} = require('../modules/constants');
  const {Manager} = require('@lgslabs/bits-core');

  class Dispatcher extends Manager {
    constructor() {
      super();
      this._messageCenter = null;
      this._module = null;
      this._moduleApi = null;
      this._boundDie = null;
      this._boundProcessSeriousError = null;
    }

    load(options) {
      const {mod, messageCenter} = options;
      this._messageCenter = messageCenter;
      this._module = mod;

      this._moduleApi = new ModuleMasterApi(messageCenter, this._module);
      this._boundDie = this.die.bind(this);
      this._boundProcessSeriousError = this._processSeriousError.bind(this);

      logger.debug(`Dispatcher loaded.  Ready to load module ${this._module.name}`);
      return super.load(options)
      .then(() => this._dispatchModule());
    }

    _processSeriousError(err) {
      return this._moduleApi.loadComplete({err: err})
      .catch((err) => logger.error('Unable to process serious error', err));
    }

    die() {
      const mod = this._module;
      logger.warn('die module', mod.name);
      return Promise.resolve()
      .then(() => this._callModuleIndexJsUnload(mod))
      .then(() => {
        if (!(isOneshot(this._module))) {
          Promise.resolve() // No Return we want the base to get the response to the request
          .then(() => {
            process.exit(0);
          });
        }
      });
    }

    _callModuleIndexJsUnload(mod) {
      if (mod.indexJs && 'function' === typeof(mod.indexJs.unload)) {
        return Promise.resolve()
        .then(() => mod.indexJs.unload(this._messageCenter));
      } else {
        return Promise.resolve();
      }
    }

    // Should only be called from child process
    _dispatchModule() {
      const processSeriousError = (err) => {
        return this._moduleApi.loadComplete({err: err})
        .catch((err) => {
          logger.error('Unable to process serious error', err);
          return Promise.reject(err);
        });
      };

      process.on('SIGTERM', () => {
        setTimeout(() => {
          logger.debug('We have been asked to exit so now we\'re dying');
          this.die();
        });
      });

      return Promise.resolve()
      .then(() => {
        process.on('uncaughtException', processSeriousError);
        process.on('unhandledRejection', processSeriousError);
      })
      .then(() => this._loadModuleIndexJs(this._module))
      // Call load on module's index.js
      .then(() => this._callModuleIndexJsLoad(this._module, this._messageCenter))
      .then(() => this._moduleApi.loadComplete({result: 'success'}))
      .then(() => {
        process.removeListener('uncaughtException', processSeriousError);
        process.removeListener('unhandledRejection', processSeriousError);
      })
      .catch((err) => {
        if (!err || !(err instanceof Error)) {
          err = new Error('Unknown load error');
        }
        process.removeListener('uncaughtException', processSeriousError);
        process.removeListener('unhandledRejection', processSeriousError);
        return this._moduleApi.loadComplete({err})
        .then(() => Promise.reject(err));
      });
    }

    _loadModuleIndexJs(mod) {
      if ('string' !== typeof(mod.installedDir)) {
        return Promise.reject(new TypeError('Module install directory must be a string'));
      }

      const indexJsPath = path.resolve(mod.installedDir, 'index.js');
      return BitsFs.stat(indexJsPath)
      .then((stat) => stat.isFile(), () => false)
      .then((isFile) => {
        if (isFile) {
          const re = new RegExp(mod.installedDir);

          Object.keys(require.cache)
          .filter((path) => re.test(path))
          .forEach((path) => {
            require.cache[path] = null;
          });

          mod.indexJs = require(indexJsPath);
        }
      })
      .then(() => mod);
    }

    _callModuleIndexJsLoad(mod) {
      if (mod.shotFired) {
        logger.info('Oneshot module, load already called', mod.name);
        return Promise.resolve(mod);
      } else if (mod.indexJs) {
        if ('function' === typeof(mod.indexJs.load)) {
          return Promise.resolve()
          .then(() => mod.indexJs.load(this._messageCenter));
        } else {
          return Promise.reject(new Error('index js does not define load'));
        }
      } else {
        logger.warn(`${mod.name} does not have an index.js skipping`);
        return Promise.resolve(mod);
      }
    }
  };

  module.exports = Dispatcher;
})();
