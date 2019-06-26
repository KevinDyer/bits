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
  const path = require('path');
  const {TAG: tag, SCOPES: scopes} = require('./constants');
  const {CrudService} = require('@lgslabs/bits-memory-crud');

  const API_DATA = {
    name: 'BaseLoggingApi',
    filepath: path.join(__dirname, 'api'),
  };

  class LoggingService extends CrudService {
    load({messageCenter, cryptoManager}) {
      return super.load({
        cryptoManager,
        messageCenter,
        tag,
        scopes,
        routePath: '/api/base/logging',
        routerFilepath: path.join(__dirname, 'router'),
        apiExport: CrudService.ApiExport.GLOBAL,
        apiData: API_DATA,
      });
    }

    createManager() {
      return Promise.resolve(new Manager());
    }

    createMessenger() {
      return Promise.resolve(new Messenger());
    }
  }

  module.exports = LoggingService;
})();
