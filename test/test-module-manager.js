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

  const os = require('os');
  const path = require('path');
  const fs = require('fs');
  const chai = require('chai');
  const chaiAsPromised = require('chai-as-promised');

  const modulesDir = path.join(os.tmpdir(), `${Date.now()}`);

  fs.mkdirSync(modulesDir);

  global.paths = global.paths || {};
  global.paths = Object.assign(global.paths, {data: os.tmpdir(), modules: modulesDir});

  const ModuleManager = require('./../lib/modules/manager');

  chai.use(chaiAsPromised);

  class MessageCenter {
    addEventListener() {}
    addRequestListener() {}
    sendRequest() {
      return Promise.resolve();
    }
    sendEvent() {
      return Promise.resolve();
    }
    addEventSubscriberListener() {}
    addRequestSubsciberListener() {}

    removeEventListener() {}
    removeRequestListener() {}
    removeRequest() {}
    removeEventSubscriberListener() {}
    removeRequestSubsciberListener() {}
  }

  after((done) => {
    fs.rmdirSync(modulesDir);
    done();
  });

  describe('Module Manager creation', () => {
    describe('construction', () => {
      it('should construct', () => {
        new ModuleManager();
      });
    });

    describe('loading', () => {
      let moduleManager = null;
      beforeEach('Create ModuleManager', () => {
        moduleManager = new ModuleManager();
      });

      it('should load', () => {
        return moduleManager.load({messageCenter: new MessageCenter()});
      });

      it('should unload', () => {
        const messageCenter = new MessageCenter();
        return moduleManager.load({messageCenter})
        .then(() => moduleManager.unload({messageCenter}));
      });
    });

    describe('operation', () => {
      let moduleManager = null;
      beforeEach('Create ModuleManager', () => {
        moduleManager = new ModuleManager();
        return moduleManager.load({messageCenter: new MessageCenter()});
      });

      it('should load modules', () => {
        return moduleManager.loadModules();
      });
    });
  });
})();
