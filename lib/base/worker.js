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

  const DispatchService = require('../dispatcher/service');
  const HelperService = require('../helper/service');
  const logger = require('@lgslabs/bits-logger').getLogger();

  class Worker {
    load({messageCenter}) {
      const dispatchService = new DispatchService();
      const helperService = new HelperService();
      const mod = JSON.parse(process.env.mod);

      return Promise.resolve()
      .then(() => helperService.load({messageCenter}))
      .then(() => dispatchService.load({messageCenter, mod}))
      .catch((err) => {
        logger.error(`Error dispatching module ${mod.name}`, err);
        return Promise.reject(err);
      });
    }
  }

  module.exports = Worker;
})();
