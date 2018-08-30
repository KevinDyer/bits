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

  const PagesManager = require('./pages-manager');
  const PagesMessenger = require('./pages-messenger');

  class PagesService {
    constructor(options) {
      this._options = options;
      this._manager = null;
      this._messenger = null;
    }

    load(messageCenter, pages) {
      return Promise.resolve()
      .then(() => this.createManager(this._options))
      .then((manager) => {
        this._manager = manager;
        return this._manager.load(messageCenter, pages);
      })
      .then(() => this.createMessenger(this._manager, this._options))
      .then((messenger) => {
        this._messenger = messenger;
        return this._messenger.load(messageCenter);
      });
    }

    createManager({topic, pages}={}) {
      const manager = new PagesManager({
        topic,
        pages
      });
      return Promise.resolve(manager);
    }

    createMessenger(manager, {tag, scopes, readScopes, writeScopes}={}) {
      const messengerOptions = {
        scopes: scopes,
        readScopes: readScopes,
        writeScopes: writeScopes
      };
      const messenger = new PagesMessenger(tag, manager, messengerOptions);
      return Promise.resolve(messenger);
    }

    unload() {
      return Promise.resolve()
      .then(() => this._messenger.unload())
      .then(() => this._manager.unload())
      .then(() => {
        this._messenger = null;
        this._manager = null;
      });
    }

    getManager() {
      return this._manager;
    }
  }

  module.exports = PagesService;
})();
