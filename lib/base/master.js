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

  const logger = require('@lgslabs/bits-logger').getLogger();
  const ModuleService = require('../modules/service');
  const ScopesService = require('../scopes/service');

  class Master {
    load({messageCenter}) {
      const moduleService = new ModuleService();
      const scopesService = new ScopesService();

      return Promise.resolve()
      .then(() => scopesService.load({messageCenter}))
      .catch((err) => {
        logger.error('Base failed to initialize', err);
        return Promise.reject(err);
      })
      .then(() => logger.info('Application started'))
      .then(() => moduleService.load({messageCenter, scopeManager: scopesService.manager}))
      .then(() => logger.info('Base has completed loading'))
      .then(() => messageCenter.sendEvent('base#Base initialized', {scopes: null}))
      .catch((err) => {
        logger.error('Error starting application', err);
        return Promise.reject(err);
      });
    }
  }

  module.exports = Master;
})();
