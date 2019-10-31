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

  const {TAG} = require('./constants');
  const {getModuleKillRequest} = require('./utils');
  const {Api} = require('@lgslabs/bits-core');

  class DispatchApi extends Api {
    constructor(messageCenter, options) {
      super(TAG, messageCenter, options);
    }

    die(mod) {
      return this._messageCenter.sendRequest(getModuleKillRequest(mod.name), {scopes: null});
    }
  }

  module.exports = DispatchApi;
})();
