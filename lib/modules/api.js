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

  const {CrudApi} = require('@lgslabs/bits-memory-crud');
  const {TAG, REQUEST, EVENT} = require('./constants');

  class ModuleApi extends CrudApi {
    constructor(messageCenter, options) {
      super(TAG, messageCenter, options);
    }

    baseUpgrade(name, version, {scopes=this._scopes}={}) {
      return Promise.resolve()
      .then(() => this._messageCenter.sendRequest(REQUEST.BASE_UPGRADE, {scopes}, name, version));
    }

    provideDataDirectory(name, {scopes=this._scopes}={}) {
      return Promise.resolve()
      .then(() => this._messageCenter.sendRequest(REQUEST.PROVIDE_DATA_DIRECTORY, {scopes}, name));
    }

    getDisplayName(moduleName, {scopes=this._scopes}={}) {
      return Promise.resolve()
      .then(() => this._messageCenter.sendRequest(REQUEST.GET_DISPLAY_NAME, {scopes}, moduleName));
    }

    addModulesLoadedListener(listener) {
      return this._messageCenter.addEventListener(EVENT.LOADED, {scopes: this._readScopes}, listener);
    }

    removeModulesLoadedListener(listener) {
      return this._messageCenter.removeEventListener(EVENT.LOADED, {scopes: this._readScopes}, listener);
    }
  }

  module.exports = ModuleApi;
})();
