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
  const {TAG: tag, SCOPES: scopes} = require('./constants');
  const {Service} = require('@lgslabs/bits-core');

  const API_DATA = {
    name: 'BaseHelperApi',
    filepath: path.join(__dirname, './api'),
  };

  class HelperService extends Service {
    load(options) {
      return super.load(Object.assign(options, {
        tag, scopes,
        apiData: API_DATA,
        apiExport: Service.ApiExport.GLOBAL,
      }));
    }

    createManager() {
      return Promise.resolve(new Manager());
    }

    createMessenger() {
      return Promise.resolve(new Messenger());
    }
  }

  module.exports = HelperService;
})();
