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

  const ScopesManager = require('../../lib/scopes/manager');
  const {STATIC_SCOPES, SECRET_SCOPES} = require('../../lib/scopes/constants');

  const DEFAULT_SCOPES_LENGTH = Object.keys(STATIC_SCOPES).length - SECRET_SCOPES.length;

  const SCOPE = {name: 'test', displayName: 'Test'};

  describe('ScopesManager', () => {
    const messageCenter = require('@lgslabs/bits-message-center/test/mocks/message-center');
    let manager = null;

    beforeEach(() => {
      manager = new ScopesManager();
      return manager.load({messageCenter});
    });

    afterEach(() => {
      return manager.unload({messageCenter});
    });

    describe('create', () => {
      it('should reject for non-string name', () => {
        expect(manager.create({})).rejects.toThrow('scope/invalid-name');
      });

      it('should reject for empty name', () => {
        expect(manager.create({name: ''})).rejects.toThrow('scope/invalid-name');
      });

      it('should reject for duplicate name', () => {
        manager.__scopes.test = SCOPE;
        expect(manager.create({name: 'test'})).rejects.toThrow('scope/name-exists');
      });

      it('should reject for non-string displayName', () => {
        expect(manager.create({name: 'test'})).rejects.toThrow('scope/invalid-displayName');
      });

      it('should reject for empty displayName', () => {
        expect(manager.create({name: 'test', displayName: ''})).rejects.toThrow('scope/invalid-displayName');
      });

      it('should create the scope', () => {
        expect(manager.create(SCOPE)).resolves;
      });

      it('should emit the created event', (done) => {
        manager.on('created', () => done());
        manager.create(SCOPE);
      });
    });

    describe('list', () => {
      it('should return an empty array', () => {
        manager.list()
        .then((result) => {
          expect(Array.isArray(result)).toBeTruthy();
          expect(result.length).toBe(DEFAULT_SCOPES_LENGTH);
        });
      });

      it('should return an array with the scope added', () => {
        manager.__scopes.test = SCOPE;
        manager.list()
        .then((result) => {
          expect(Array.isArray(result)).toBeTruthy();
          expect(result.length).toBe(DEFAULT_SCOPES_LENGTH + 1);
        });
      });
    });

    describe('get', () => {
      it('should return null for unknown scope', () => {
        manager.get('test')
        .then((scope) => expect(scope).toBeNull());
      });

      it('should return the scope by name', () => {
        manager.__scopes.test = SCOPE;
        manager.get('test')
        .then((scope) => expect(scope).toBe(SCOPE));
      });
    });
  });
})();
