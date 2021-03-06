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

  const Manager = require('./manager');
  const Messenger = require('./messenger');
  const {TAG: tag, READ_SCOPES: readScopes, WRITE_SCOPES: writeScopes} = require('./constants');
  const {CrudService} = require('@lgslabs/bits-memory-crud');

  const API_DATA = {
    name: 'BaseScopesApi',
    filepath: require('path').join(__dirname, 'api'),
  };

  class ScopesService extends CrudService {
    load({messageCenter} = {}) {
      const options = {
        messageCenter,
        tag,
        readScopes,
        writeScopes,
        apiExport: ScopesService.ApiExport.GLOBAL,
        apiData: API_DATA,
      };
      return super.load(options);
    }

    createManager() {
      return Promise.resolve(new Manager());
    }

    createMessenger() {
      return Promise.resolve(new Messenger());
    }
  }

  module.exports = ScopesService;
})();
