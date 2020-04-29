/*!
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
*/
(() => {
  'use strict';

  const AbstractExecutor = require('./abstract-executor');
  const cluster = require('cluster');

  class ClusterExecutor extends AbstractExecutor {
    constructor() {
      super();
      this.__eventProxies();
      this._isMaster = cluster.isMaster;
      this._isWorker = cluster.isWorker;
      this._type = 'cluster';
    }

    __eventProxies() {
      ['disconnect', 'error', 'exit', 'online', 'fork'].forEach((event) => {
        const emitEvent = 'fork' === event ? 'created' : event;
        cluster.on(event, (...args) => this.emit(emitEvent, ...args));
      });

      process.on('message', (...args) => this.emit('message', ...args));
    }

    create(env={}) {
      const child = cluster.fork(env);
      child.mcid = this._getMcid(env);
      return child;
    }

    send(...args) {
      return process.send(...args);
    }
  }
  module.exports = ClusterExecutor;
})();
