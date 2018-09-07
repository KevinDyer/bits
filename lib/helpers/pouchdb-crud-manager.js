/**
Copyright 2017 LGS Innovations

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

  const PouchDB = require('pouchdb');
  PouchDB.plugin(require('pouchdb-find'));
  const CrudManager = require('./crud-manager');

  class PouchDBCrudManager extends CrudManager {
    constructor(tag, path, options) {
      super(tag, options);
      this._path = path;
      this._db = null;
    }

    load(messageCenter, baseServer, ...args) {
      return Promise.resolve()
      .then(() => {
        this._db = new PouchDB(this._path);
      })
      .then(() => super.load(messageCenter, baseServer, ...args))
      .then(() => this._initializeId());
    }

    unload() {
      return Promise.resolve()
      .then(() => super.unload())
      .then(() => this._db.close())
      .then(() => {
        this._db = null;
      });
    }

    _initializeId() {
      return Promise.resolve()
      .then(() => this.list({}, {sort: [{_id: 'desc'}], fields: ['_id'], limit: 1}))
      .then(([{_id}={}]) => new Promise((resolve, reject) => {
        if (_id === undefined) return resolve();

        try {
          this._id = Number(_id) + 1;
        } catch (err) {
          return reject(err);
        }
        return resolve();
      }));
    }

    _createId(item) {
      return Promise.resolve()
      .then(() => super._createId(item))
      .then((id) => `${id}`);
    }

    createIndex(index) {
      return Promise.resolve()
      .then(() => this._db.createIndex(index));
    }

    create(item) {
      return Promise.resolve()
      .then(() => this.validate(item))
      .then(() => this._createId(item))
      .then((id) => this._db.put(Object.assign({_id: id}, item)))
      .then((result) => this._db.get(result.id))
      .then((doc) => this._sanitizeItem(doc))
      .then((item) => {
        this.emit('created', [item]);
        return item;
      });
    }

    count(query) {
      return Promise.resolve()
      .then(() => this.list(query))
      .then((items) => items.length);
    }

    list(query={}, options={}) {
      return Promise.resolve()
      .then(() => this._db.find({
        selector: query,
        fields: options.fields,
        sort: options.sort,
        limit: options.limit,
        skip: options.skip,
      }))
      .then((result) => result.docs)
      .then((docs) => docs.map((doc) => this._sanitizeItem(doc)));
    }

    get(id) {
      return Promise.resolve()
      .then(() => this._db.get(id))
      .then((doc) => this._sanitizeItem(doc));
    }

    update(id, update) {
      return Promise.resolve()
      .then(() => this._db.get(id))
      .then((doc) => this._db.put(Object.assign(doc, update)))
      .then((result) => this._db.get(result.id))
      .then((doc) => this._sanitizeItem(doc))
      .then((item) => {
        this.emit('updated', [item]);
        return item;
      });
    }

    delete(id) {
      return Promise.resolve()
      .then(() => this._db.get(id))
      .then((doc) => {
        doc._deleted = true;
        return this._db.put(doc)
        .then(() => doc);
      })
      .then((doc) => this._sanitizeItem(doc))
      .then((item) => {
        this.emit('deleted', [item]);
        return item;
      });
    }

    _sanitizeItem(item) {
      if ('object' === typeof (item) && null !== item) {
        const {_id} = item;
        item.id = _id;
      }
      return item;
    }
  }

  module.exports = PouchDBCrudManager;
})();
