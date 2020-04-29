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

  const ExecutorService = require('./executor-service');
  const Manager = require('./manager');
  const MasterMessenger = require('./master-messenger');
  const Messenger = require('./messenger');
  const path = require('path');
  const {TAG: tag, SCOPES: scopes, READ_SCOPES: readScopes, WRITE_SCOPES: writeScopes, ROUTE_PATH: routePath} = require('./constants');
  const {CrudService} = require('@lgslabs/bits-memory-crud');

  const API_DATA = {
    name: 'BaseModuleApi',
    filepath: path.join(__dirname, 'api'),
  };

  class ModuleService extends CrudService {
    _nullifyProperties() {
      super._nullifyProperties();
      this._executorService = null;
      this._infrastructureMessenger = null;
    }

    load({messageCenter, scopeManager}) {
      this._executorService = new ExecutorService();
      this._infrastructureMessenger = new MasterMessenger();

      const options = {
        tag,
        messageCenter,
        scopes,
        readScopes,
        writeScopes,
        scopeManager,
        routePath,
        apiExport: CrudService.ApiExport.GLOBAL,
        apiData: API_DATA,
        filter: true,
        executorService: this._executorService,
      };
      return super.load(options)
      .then(() => this._executorService.load({messageCenter}))
      .then(() => this._infrastructureMessenger.load({
        messageCenter,
        tag,
        manager: this._manager,
      }))
      .then(() => this._manager.loadModules());
    }

    unload(options) {
      return Promise.resolve()
      .then(() => this._infrastructureMessenger.unload(options))
      .then(() => this._executorService.unload(options))
      .then(() => super.unload(options));
    }

    createManager() {
      return Promise.resolve(new Manager());
    }

    createMessenger() {
      return Promise.resolve(new Messenger());
    }
  }

  module.exports = ModuleService;
})();
