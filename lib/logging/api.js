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

  const {TAG, REQUEST} = require('./constants');
  const {CrudApi} = require('@lgslabs/bits-memory-crud');

  class LoggingApi extends CrudApi {
    constructor(messageCenter, options) {
      super(TAG, messageCenter, options);
    }

    generateCrashDump(request, {scopes = this._scopes} = {}) {
      return this._messageCenter.sendRequest(REQUEST.GENERATE_CRASH_DUMP, {scopes}, request);
    }

    addLogDirectory(request, {scopes = this._scopes} = {}) {
      return this._messageCenter.sendRequest(REQUEST.ADD_LOG_DIRECTORY, {scopes}, request);
    }

    removeLogDirectory(request, {scopes = this._scopes} = {}) {
      return this._messageCenter.sendRequest(REQUEST.REMOVE_LOG_DIRECTORY, {scopes}, request);
    }
  }

  module.exports = LoggingApi;
})();
