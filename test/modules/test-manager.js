/**
Copyright 2018 LGS Innovations

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

  const ModuleManager = require('../../lib/modules/manager');

  describe('Module Manager', () => {
    const messageCenter = require('@lgslabs/bits-message-center/test/mocks/message-center');

    describe('loading', () => {
      let moduleManager = null;
      beforeEach(() => {
        moduleManager = new ModuleManager();
      });

      it('should load', () => {
        return moduleManager.load({messageCenter});
      });

      it('should unload', () => {
        return moduleManager.load({messageCenter})
        .then(() => moduleManager.unload({messageCenter}));
      });
    });

    describe('operation', () => {
      let moduleManager = null;
      beforeEach(() => {
        moduleManager = new ModuleManager();
        return moduleManager.load({messageCenter});
      });

      it('should load modules', () => {
        return moduleManager.loadModules();
      });
    });
  });
})();
