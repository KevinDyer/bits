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

  const {TAG, REQUEST, EVENT} = require('./constants');
  const {Api} = require('@lgslabs/bits-core');

  class HelperApi extends Api {
    constructor(messageCenter, options = {}) {
      super(TAG, messageCenter, options);
    }

    list() {
      return this._messageCenter.sendRequest(REQUEST.LIST, {scopes: this._scopes});
    }

    add(helper) {
      return this._messageCenter.sendRequest(REQUEST.ADD, {scopes: this._scopes}, helper);
    }

    remove(helper) {
      return this._messageCenter.sendRequest(REQUEST.REMOVE, {scopes: this._scopes}, helper);
    }

    addAddedListener(listener) {
      return this._messageCenter.addEventListener(EVENT.ADDED, this._scopes, listener);
    }

    removeAddedListener(listener) {
      return this._messageCenter.removeEventListener(EVENT.ADDED, listener);
    }

    addRemovedListener(listener) {
      return this._messageCenter.addEventListener(EVENT.REMOVED, {scopes: this._scopes}, listener);
    }

    removeRemovedListener(listener) {
      return this._messageCenter.removeEventListener(EVENT.REMOVED, listener);
    }
  }

  module.exports = HelperApi;
})();
