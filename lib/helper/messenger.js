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

  const {REQUEST, SCOPES: scopes, EVENT} = require('./constants');
  const {Messenger} = require('@lgslabs/bits-core');

  class HelperMessenger extends Messenger {
    _addRequestListeners(options) {
      return super._addRequestListeners(options)
      .then(() => Promise.all([
        this.addRequestListener(REQUEST.LIST, {scopes}, this._list.bind(this)),
        this.addRequestListener(REQUEST.ADD, {scopes}, this._add.bind(this)),
        this.addRequestListener(REQUEST.REMOVE, {scopes}, this._remove.bind(this)),
      ]));
    }

    _addEmitterEventListeners(options) {
      return super._addEmitterEventListeners(options)
      .then(() => Promise.all([
        this.addEmitterEventListener(this._manager, 'added', this._added.bind(this)),
        this.addEmitterEventListener(this._manager, 'removed', this._removed.bind(this)),
      ]));
    }

    _list() {
      return this._manager.list();
    }

    _add(metadata, helper) {
      return this._manager.add(helper);
    }

    _remove(metadata, helper) {
      return this._manager.remove(helper);
    }

    _added(helper) {
      this.sendEvent(EVENT.ADDED, {scopes}, helper);
    }

    _removed(helper) {
      this.sendEvent(EVENT.REMOVED, {scopes}, helper);
    }
  }

  module.exports = HelperMessenger;
})();
