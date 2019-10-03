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
  const path = require('path');

  describe('HelperManager (Master)', () => {
    const messageCenter = require('@lgslabs/bits-message-center/test/mocks/message-center');
    let manager = null;

    beforeEach(() => {
      manager = new HelperManager();
    });

    describe('load', () => {
      it('should load', () => {
        return manager.load({messageCenter});
      });
    });

    describe('unload', () => {
      it('should unload', () => {
        return manager.load({messageCenter})
        .then(() => manager.unload());
      });
    });

    describe('add', () => {
      const lazyloadHelper = {name: 'test', filepath: path.join(__dirname, '../../lib/helpers/lazy-load')};

      beforeEach(() => {
        manager.load({messageCenter});
      });

      afterEach(() => {
        manager.unload({messageCenter});
      });

      it('should reject for invalid filepath', () => {
        expect(manager.add({name: 'test', filepath: ''})).rejects.toThrow();
      });

      it('should add the helper', () => {
        expect(manager._helpers.length).toBe(0);
        manager.add(lazyloadHelper)
        .then(() => expect(manager._helpers.length).toBe(1));
      });

      it('should replace an existing helper', () => {
        manager._helpers.push(lazyloadHelper);
        expect(manager._helpers.length).toBe(1);
        manager.add(lazyloadHelper)
        .then(() => expect(manager._helpers.length).toBe(1));
      });

      it('should emit the added event', (done) => {
        manager.on('added', (result) => {
          expect(Array.isArray(result)).toBeTruthy();
          expect(result.length).toBe(1);
          done();
        });
        manager.add(lazyloadHelper);
      });
    });

    describe('remove', () => {
      const lazyloadHelper = {name: 'test', filepath: path.join(__dirname, '../../lib/helpers/lazy-load')};

      beforeEach(() => {
        manager.load({messageCenter});
      });

      afterEach(() => {
        manager.unload({messageCenter});
      });

      it('should resolve for unknown helper', () => {
        expect(manager.remove({})).resolve;
      });

      it('should remove a known helper', () => {
        expect(manager._helpers.length).toBe(0);
        manager.add(lazyloadHelper)
        .then(() => expect(manager.remove(lazyloadHelper)).resolves);
      });

      it('should emit the removed event', (done) => {
        manager.on('removed', (result) => {
          expect(Array.isArray(result)).toBeTruthy();
          expect(result.length).toBe(1);
          done();
        });
        manager.add(lazyloadHelper)
        .then(() => manager.remove(lazyloadHelper));
      });
    });

    describe('list', () => {
      it('should return the list of helpers', () => {
        manager.load({messageCenter})
        .then(() => manager.list())
        .then((result) => {
          expect(Array.isArray(result)).toBeTruthy();
          expect(result.length).toBe(0);
        });
      });
    });
  });
})();
