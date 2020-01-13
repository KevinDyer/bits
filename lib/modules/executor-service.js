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

  const EventEmitter = require('events');
  const executor = require('../module-execution/executor');
  const logger = require('@lgslabs/bits-logger').getLogger();
  const {isOneshot, RESTART_POLICY} = require('./constants');

  class ModuleExecutorService extends EventEmitter {
    constructor() {
      super();
      this._nullifyProperties();
    }

    load({messageCenter}) {
      this._messageCenter = messageCenter;
      this._modules = {};
      this._boundOnExecutorExit = this._onExecutorExit.bind(this);
      logger.debug('Loading the executor service');
      executor.on('exit', this._boundOnExecutorExit);

      return Promise.resolve();
    }

    unload() {
      return Promise.resolve()
      .then(() => executor.removeListener('exit', this._boundOnExecutorExit))
      .then(() => this._nullifyProperties());
    }

    summonTheModule(mod) {
      if (this._modules.hasOwnProperty(mod.id) && !isOneshot(mod)) {
        return Promise.reject(new Error(`Already running module ${mod.name}`));
      } else {
        this._modules[mod.id] = {
          id: mod.id,
          name: mod.name,
          restartPolicy: (mod.load && mod.load.hasOwnProperty('restartPolicy')) ? mod.load.restartPolicy : RESTART_POLICY.NEVER,
          worker: null,
        };
        const env = {};
        env.mod = JSON.stringify(mod);
        this._modules[mod.id].worker = executor.create(env);

        return Promise.resolve()
        .then(() => this._addWorkerListeners(mod));
      }
    }

    destroyTheModule(mod, signal) {
      if (!this._modules.hasOwnProperty(mod.id)) {
        logger.warn(`Can not clean up module ${mod.name} because we are not running it - continuing on...`); // Will happen on clean up of a module that crashes during load;
        return Promise.resolve();
      } else {
        return Promise.resolve()
        .then(() => this._destroyTheModule(mod, signal))
        .then(() => {
          delete this._modules[mod.id];
        });
      }
    }

    _destroyTheModule(mod, signal = 'SIGTERM') {
      const {worker} = this._modules[mod.id] || {};
      if (undefined === worker) {
        logger.warn(`${mod.name} has no process to kill. This is unusual`);
        return Promise.resolve();
      }
      return Promise.resolve()
      .then(() => worker.kill(signal))
      .then(() => this._removeWorkerListeners(worker))
      .then(() => this._messageCenter.cleanUpWorker(worker))
      .catch((err) => {
        logger.warn('Error destroying module', err);
        return Promise.resolve();
      });
    }

    moduleCompletedLoad(mod) {
      if (this._modules.hasOwnProperty(mod.id)) {
        if (isOneshot(mod)) return this._oneshotCompletedLoad(mod);
        return Promise.resolve();
      } else {
        return Promise.reject(new Error(`Unable to swap listeners - ${mod.name} module not found.`));
      }
    }

    moduleUnloading(mod) {
      return Promise.resolve()
      .then(() => {
        this._modules[mod.id]._unloadHandler = (code, signal) => {
          this.emit('module-unloaded', {module: mod, code, signal});
        };
        this._modules[mod.id].worker.once('exit', this._modules[mod.id]._unloadHandler);
      });
    }

    _nullifyProperties() {
      this._boundOnExecutorExit = null;
      this._modules = null;
    }

    _addWorkerListeners(mod) {
      const {worker, listeners} = this._modules[mod.id];
      logger.debug(`Adding load listeners for ${mod.name}`);

      if (listeners !== undefined) {
        logger.error(`Already loaded ${mod.name} unable to add listeners`);
        return Promise.reject(new Error(`Already loaded module: ${mod.name}`));
      }

      if (worker === undefined) {
        logger.error(`Cannot add listeners to ${mod.name} without worker`);
        return Promise.reject(new Error(`No worker: ${mod.name}`));
      }

      this._modules[mod.id].listeners = {
        disconnect: this._onWorkerDisconnect.bind(this, mod),
        error: this._onWorkerError.bind(this, mod),
        exit: this._onWorkerExit.bind(this, mod),
        online: this._onWorkerOnline.bind(this, mod),
      };

      Object.entries(this._modules[mod.id].listeners).forEach(([event, listener]) => worker.on(event, listener));
    }

    _removeWorkerListeners(worker) {
      if (!(worker && worker.hasOwnProperty('listeners'))) return;
      Object.entries(worker.listeners).forEach(([event, listener]) => worker.removeListener(event, listener));
    }

    _onWorkerDisconnect(mod) {
      logger.debug(`${mod.name} worker disconnect`);
      this.emit('module-disconnect', mod);
    }

    _onWorkerError(mod, err) {
      logger.error(`${mod.name} worker error`, err);
      this.emit('module-error', {module: mod, error: err});
    }

    _onWorkerExit(mod, code, signal) {
      if (signal) {
        logger.error(`${mod.name} worker was killed by ${signal}`);
      } else if (code !== 0) {
        logger.error(`${mod.name} exited with code ${code}`);
      } else {
        logger.info(`${mod.name} exited successfully`);
      }
      this.emit('module-exit', {module: mod, code, signal});
    }

    _onWorkerOnline(mod) {
      logger.info(`${mod.name} worker is online`);
      this.emit('module-online', mod);
    }

    _onExecutorExit(worker, code, signal) {
      if (0 === code || (code === null && 'SIGTERM' === signal)) { // we send SIGTERM for a happy shutdown, SIGKILL for a sad shutdown
        logger.info(`Client with id ${worker.id} (oneshot policy) exited successfully`);
      } else {
        logger.error(`Client with id ${worker.id} died a horrible death`);
      }
    }

    _oneshotCompletedLoad(mod) {
      return Promise.resolve()
      .then(() => {
        if (!mod.shotFired) {
          return this._destroyTheModule(mod)
          .then(() => this._modules[mod.id].shotFired = true);
        }
      });
    }
  }

  module.exports = ModuleExecutorService;
})();
