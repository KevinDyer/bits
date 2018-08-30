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

  const EventEmitter = require('events');
  const Messenger = global.helper.Messenger;
  const PagesApi = require('./pages-api');
  const ScopesUtil = require('./../scopes/scopes-util');

  class PagesMessenger extends Messenger {
    constructor(tag, manager, {scopes=null, readScopes=scopes, writeScopes=scopes}={}) {
      if (!PagesApi.isValidTag(tag)) throw new TypeError('tag must be a non-empty string');
      if (!(manager instanceof EventEmitter)) throw new TypeError('manager must be an EventEmitter');
      if (!ScopesUtil.isValidScopes(readScopes)) throw new TypeError('readScopes must be valid scopes');
      if (!ScopesUtil.isValidScopes(writeScopes)) throw new TypeError('writeScopes must be valid scopes');

      super();

      this._tag = tag;
      this._manager = manager;
      this._readScopes = readScopes;
      this._writeScopes = writeScopes;

      this.addEmitterEventListener(this._manager, 'page-added', this._pageAdded.bind(this));
      this.addEmitterEventListener(this._manager, 'page-list-changed', this._pageListChanged.bind(this));
      this.addEmitterEventListener(this._manager, 'page-removed', this._pageRemoved.bind(this));
      this.addRequestListener(`${this._tag} ${PagesApi.REQUEST_NAMES.LIST}`, {scopes: this._readScopes}, this._list.bind(this));
    }

    _pageAdded(page) {
      return this.sendEvent(`${this._tag} ${PagesApi.EVENT_NAMES.PAGE_ADDED}`, {scopes: this._readScopes}, page);
    }

    _pageListChanged(pageList) {
      return this.sendEvent(`${this._tag} ${PagesApi.EVENT_NAMES.PAGE_LIST_CHANGED}`, {scopes: this._readScopes}, pageList);
    }

    _pageRemoved(page) {
      return this.sendEvent(`${this._tag} ${PagesApi.EVENT_NAMES.PAGE_REMOVED}`, {scopes: this._readScopes}, page);
    }

    _list() {
      return this._manager.list();
    }
  }

  module.exports = PagesMessenger;
})();
