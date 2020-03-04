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

  const HelperManager = require('../../lib/helper/manager');
  const HelperMessenger = require('../../lib/helper/messenger');
  const {SCOPES: scopes, TAG: tag} = require('../../lib/helper/constants');

  describe('HelperManager (Worker)', () => {
    const messageCenter = require('@lgslabs/bits-message-center/test/mocks/message-center');
    let manager = null;
    let masterManager = null;
    let messenger = null;

    beforeEach((done) => {
      manager = new HelperManager();
      masterManager = new HelperManager();
      messenger = new HelperMessenger();
      return Promise.resolve()
      .then(() => masterManager.load())
      .then(() => messenger.load({messageCenter, manager: masterManager, tag, scopes}))
      .then(done);
    });

    afterEach((done) => {
      return Promise.resolve()
      .then(() => messenger.unload())
      .then(() => masterManager.unload())
      .then(() => {
        manager = null;
        masterManager = null;
        messenger = null;
      })
      .then(done);
    });

    describe('load', () => {
      it('should load', () => {
        return manager.loadWorker({messageCenter});
      });
    });

    describe('unload', () => {
      it('should unload', () => {
        return manager.loadWorker({messageCenter})
        .then(() => manager.unloadWorker());
      });
    });
  });
})();
