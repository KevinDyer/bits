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

  const EventEmitter = require('events');
  const level = require('level');

  class PersistentKeyValueManager extends EventEmitter {
    constructor({location}) {
      super();
      this._db = level(location, {valueEncoding: 'json'});
    }

    open() {
      if (this._db.isOpen()) {
        return Promise.resolve();
      }
      return new Promise((resolve, reject) => {
        this._db.open((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }

    close() {
      if (this._db.isClosed()) {
        return Promise.resolve();
      }
      return new Promise((resolve, reject) => {
        this._db.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }

    set({key, value}) {
      return new Promise((resolve, reject) => {
        this._db.put(key, value, (err) => {
          if (err) {
            reject(err);
          } else {
            this.emit('set', {key: key, value: value});
            resolve();
          }
        });
      });
    }

    get({key}) {
      return new Promise((resolve, reject) => {
        this._db.get(key, (err, value) => {
          if (err) {
            if (err.notFound) {
              reject(new Error('key not found'));
            } else {
              reject(err);
            }
          } else {
            resolve(value);
          }
        });
      });
    }

    has({key}) {
      return new Promise((resolve, reject) => {
        this._db.get(key, (err, value) => {
          if (err) {
            if ((/notfound/i).test(err) || err.notFound) {
              resolve(false);
            } else {
              reject(err);
            }
          } else {
            resolve(true);
          }
        });
      });
    }

    delete({key}) {
      return Promise.resolve()
      .then(() => this.has({key}))
      .then((exists) => {
        if (exists) {
          return new Promise((resolve, reject) => {
            this._db.del(key, (err) => {
              if (err) {
                reject(err);
              } else {
                this.emit('delete', {key: key});
                resolve();
              }
            });
          });
        } else {
          return Promise.reject(new Error('key-not-found'));
        }
      });
    }

    clear() {
      return Promise.resolve()
      .then(() => this.keys())
      .then((keys) => Promise.all(keys.map((key) => this.delete({key: key}))))
      .then(() => this.emit('clear'));
    }

    keys() {
      return new Promise((resolve, reject) => {
        const keys = [];
        const keyStream = this._db.createKeyStream();
        keyStream.on('error', reject);
        keyStream.on('data', (key) => keys.push(key));
        keyStream.on('end', () => resolve(keys));
      });
    }

    values() {
      return new Promise((resolve, reject) => {
        const values = [];
        const valueStream = this._db.createValueStream();
        valueStream.on('error', reject);
        valueStream.on('data', (value) => values.push(value));
        valueStream.on('end', () => resolve(values));
      });
    }
  }

  module.exports = PersistentKeyValueManager;
})();
