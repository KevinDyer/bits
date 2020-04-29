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
  const path = require('path');
  const {Worker, isMainThread, parentPort} = require('worker_threads');

  class WorkerThreadExecutor extends AbstractExecutor {
    constructor() {
      super();
      this._isMaster = isMainThread;
      this._isWorker = !isMainThread;
      this._type = 'thread';

      if (this._isWorker) {
        parentPort.on('message', (...args) => this.emit('message', ...args));
      }
    }

    create(env={}) {
      const child = new Worker(path.resolve(global.paths.base, './app.js'), {
        env: Object.assign({}, process.env, env, {argv: JSON.stringify(process.argv)}),
      });

      ['error', 'exit', 'message', 'online'].forEach((event) => {
        child.on(event, (...args) => this.emit(event, ...args));
      });
      child.kill = child.terminate;
      child.send = child.postMessage;
      child.id = child.threadId;
      this.emit('created', child);
      return child;
    }

    send(...args) {
      this.emit('send', ...args);
      return parentPort.postMessage(...args);
    }
  }
  module.exports = WorkerThreadExecutor;
})();
