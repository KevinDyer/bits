/*!
Copyright 2019 LGS Innovations

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http: //www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

(() => {
  'use strict';

  const chai = require('chai');
  const EventEmitter = require('events');
  const MessageCenter = require('@lgslabs/bits-message-center');
  const UserApi = require('./../../lib/users/user-api');
  const UserMessenger = require('./../../lib/users/user-messenger');

  const {expect} = chai;

  describe('UserMessenger', () => {
    it('should santized user items', () => {
      const messageCenter = new MessageCenter(require('cluster'), process);
      const manager = new class extends EventEmitter {
        list() {
          return [{
            id: 1,
            username: 'test',
            salt: '0123456789abcdef0123456789abcdef',
            passwordHash: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
            scopes: [
              {name: 'base', displayName: 'Administrator'},
              {name: 'users', displayName: 'User Management'},
              {name: 'public', displayName: 'Public'},
            ],
            isAnonymous: true,
            createdAt: 1516378921603,
            updatedAt: 1516378921603,
          }];
        }
      };
      const messenger = new UserMessenger(manager);
      const api = new UserApi(messageCenter);

      return Promise.resolve()
      .then(() => messenger.load(messageCenter))
      .then(() => api.list())
      .then(([user]) => { // 'back end' list
        expect(user).to.have.all.keys('id', 'username', 'scopes', 'isAnonymous', 'createdAt', 'updatedAt', 'passwordHash', 'salt');
      })
      .then(() => messenger._list({scopes: []}))
      .then(([user]) => { // 'front end' list
        expect(user).to.have.all.keys('id', 'username', 'scopes', 'isAnonymous', 'createdAt', 'updatedAt');
      });
    });
  });
})();
