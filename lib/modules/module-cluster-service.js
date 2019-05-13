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

  const cluster = require('cluster');
  const EventEmitter = require('events');
  const logger = require('../logging/logger-factory').getLogger();
  const ModuleConstants = require('./module-constants');


  class ModuleClusterService extends EventEmitter {
    constructor() {
      super();
      this._boundOnClusterExit = this._onClusterExit.bind(this);
      this._modules = {};
    }

    load(messageCenter) {
      this._messageCenter = messageCenter;
      logger.debug('Loading the cluster service');
      cluster.on('exit', this._boundOnClusterExit);

      return Promise.resolve();
    }

    unload() {
      return Promise.resolve()
      .then(() => cluster.removeListener('exit', this._boundOnClusterExit));
    }

    summonTheModule(mod) {
      if (this._modules.hasOwnProperty(mod.id) && !ModuleConstants.isOneshot(mod)) {
        return Promise.reject(new Error(`Already running module ${mod.name}`));
      } else {
        this._modules[mod.id] = {
          id: mod.id,
          name: mod.name,
          restartPolicy: (mod.load && mod.load.hasOwnProperty('restartPolicy')) ? mod.load.restartPolicy : ModuleConstants.RESTART_POLICY.NEVER,
          worker: null,
        };
        const env = {};
        env.mod = JSON.stringify(mod);
        this._modules[mod.id].worker = cluster.fork(env);

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
      return Promise.resolve()
      .then(() => {
        const modToKill = this._modules[mod.id];
        if (!modToKill.hasOwnProperty('worker')) logger.warn(`${mod.name} has no process to kill. This is unusual`);
        modToKill.worker.kill(signal);
        return Promise.resolve();
      })
      .then(() => this._removeWorkerListeners(mod))
      .then(() => this._messageCenter.cleanUpWorker(this._modules[mod.id].worker));
    }

    moduleCompletedLoad(mod) {
      if (this._modules.hasOwnProperty(mod.id)) {
        if (ModuleConstants.isOneshot(mod)) return this._oneshotCompletedLoad(mod);
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

    _removeWorkerListeners(mod) {
      const {worker} = this._modules[mod.id];
      if (!(worker && worker.hasOwnProperty('listeners'))) {
        logger.error(`No worker to remove listeners for on ${mod.name}. This is unusual but not impossible.`);
        return;
      }

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

    _onClusterExit(worker, code, signal) {
      if (0 === code || (code === null && 'SIGTERM' === signal)) { // we send SIGTERM for a happy shutdown, SIGKILL for a sad shutdown
        logger.info('Client with pid %s (oneshot policy) exited successfully', worker.process.pid);
      } else {
        logger.error('Client with pid %s died a horrible death', worker.process.pid);
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

  module.exports = ModuleClusterService;
})();
