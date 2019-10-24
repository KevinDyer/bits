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

  const path = require('path');
  const fs = require('fs');
  const os = require('os');
  const EventEmitter = require('events');
  const chai = require('chai');
  const expect = chai.expect;

  const MessageCenter = require('@lgslabs/bits-message-center');
  const UtilFs = require('@lgslabs/bits-fs');
  const PouchdbCrudManager = require('./../../lib/helpers/pouchdb-crud-manager');

  class MockCluster extends EventEmitter {
    get isMaster() {
      return true;
    }
  }

  describe('PouchdbCrudManager', () => {
    let messageCenter = null;
    beforeEach('Create message center', () => {
      const cluster = new MockCluster();
      messageCenter = new MessageCenter(cluster, process);
    });

    let dbPath = null;
    beforeEach('Create DB folder', (done) => {
      fs.mkdtemp(path.join(os.tmpdir(), 'pouchdb-test-'), (err, folder) => {
        if (err) {
          done(err);
        } else {
          dbPath = folder;
          done();
        }
      });
    });

    afterEach('Remove DB folder', () => {
      if (dbPath) {
        UtilFs.rmdir(dbPath, {recursive: true});
        dbPath = null;
      }
    });

    let manager = null;
    beforeEach('Create manager', () => {
      manager = new PouchdbCrudManager('test', dbPath);
    });

    beforeEach('Load manager', () => {
      return manager.load(messageCenter);
    });

    describe('create', () => {
      it('should return an item with \'id\' property', () => {
        return Promise.resolve()
        .then(() => manager.create({type: 'test'}))
        .then((item) => {
          expect(item).to.be.a('object');
          expect(item).to.not.be.null;
          const {id} = item;
          expect(id).to.equal('0');
        });
      });
    });

    describe('list', () => {
      it('should return items with \'id\' property', () => {
        return Promise.resolve()
        .then(() => manager.create({type: 'test'}))
        .then(() => manager.list())
        .then(([item]) => {
          expect(item).to.be.a('object');
          expect(item).to.not.be.null;
          const {id} = item;
          expect(id).to.equal('0');
        });
      });
    });

    describe('get', () => {
      it('should return items with \'id\' property', () => {
        return Promise.resolve()
        .then(() => manager.create({type: 'test'}))
        .then(() => manager.get('0'))
        .then((item) => {
          expect(item).to.be.a('object');
          expect(item).to.not.be.null;
          const {id} = item;
          expect(id).to.equal('0');
        });
      });
    });

    describe('update', () => {
      it('should return items with \'id\' property', () => {
        messageCenter.on('sendRequest', (response, event) => {
          if ('mongodb#Collection findOneAndUpdate' !== event) {
            return;
          }
          response.result = {value: {_id: '1'}};
        });
        return Promise.resolve()
        .then(() => manager.create({type: 'test'}))
        .then(() => manager.update('0', {$set: {}}))
        .then((item) => {
          expect(item).to.be.a('object');
          expect(item).to.not.be.null;
          const {id} = item;
          expect(id).to.equal('0');
        });
      });
    });

    describe('delete', () => {
      it('should return items with \'id\' property', () => {
        return Promise.resolve()
        .then(() => manager.create({type: 'test'}))
        .then(() => manager.delete('0'))
        .then((item) => {
          expect(item).to.be.a('object');
          expect(item).to.not.be.null;
          const {id} = item;
          expect(id).to.equal('0');
        });
      });
    });
  });
})();
