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

  const LazyLoad = require('../../lib/helpers/lazy-load');

  const noop = () => null;

  describe('LazyLoad', () => {
    let lazyLoad = null;
    const messageCenter = require('@lgslabs/bits-message-center/test/mocks/message-center');

    beforeEach(() => {
      lazyLoad = new LazyLoad();
    });

    describe('load', () => {
      it('should throw an error for a non-string module name', () => {
        expect(lazyLoad.load()).rejects.toThrow('moduleName must be a string');
      });

      it('should throw an error for a non-function onLoaded', () => {
        expect(lazyLoad.load({messageCenter, moduleName: 'test'})).rejects.toThrow('onLoaded must be a function');
      });

      it('should throw an error for a non-function onUnloaded', () => {
        expect(lazyLoad.load({messageCenter, moduleName: 'test', onLoaded: noop})).rejects.toThrow('onUnloaded must be a function');
      });

      it('should load', () => {
        jest.spyOn(messageCenter, 'sendRequest').mockImplementationOnce(() => Promise.resolve([{name: 'test'}]));
        expect(lazyLoad.load({messageCenter, moduleName: 'test', onLoaded: noop, onUnloaded: noop})).resolves;
      });
    });

    describe('unload', () => {
      it('should unload', () => {
        jest.spyOn(messageCenter, 'sendRequest').mockImplementationOnce(() => Promise.resolve([{name: 'test'}]));
        return Promise.resolve()
        .then(() => expect(lazyLoad.load({messageCenter, moduleName: 'test', onLoaded: noop, onUnloaded: noop})).resolves)
        .then(() => expect(lazyLoad.unload()).resolves);
      });
    });

    describe('_onList', () => {
      it('should call onLoaded function', (done) => {
        jest.spyOn(messageCenter, 'sendRequest').mockImplementation(() => Promise.resolve([{name: 'test', isLoaded: true}]));
        lazyLoad.load({messageCenter, moduleName: 'test', onLoaded: () => done(), onUnloaded: noop})
        .then(() => lazyLoad._onList());
      });

      it('should call onUnloaded function', (done) => {
        jest.spyOn(messageCenter, 'sendRequest').mockImplementation(() => Promise.resolve([{name: 'test', isLoaded: false}]));
        lazyLoad.load({messageCenter, moduleName: 'test', onLoaded: noop, onUnloaded: () => done()})
        .then(() => {
          lazyLoad._isLoaded = true;
          return lazyLoad._onList();
        });
      });
    });
  });
})();
