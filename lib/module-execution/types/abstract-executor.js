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

  const EventEmitter = require('events');

  class AbstractExecutor extends EventEmitter {
    constructor() {
      super();
      this._isMaster = false;
      this._isWorker = false;
      this._type = '';
    }

    get isMaster() {
      return this._isMaster;
    }

    get isWorker() {
      return this._isWorker;
    }

    get type() {
      return this._type;
    }

    create() {}

    send() {}

    _getMcid(env) {
      const id = Number(JSON.parse(env.mod).id);
      if (isNaN(id)) throw new Error('invalid id on env.mod payload');
      return id;
    }
  }
  module.exports = AbstractExecutor;
})();
