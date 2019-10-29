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

  const {TAG, STATIC_SCOPES} = require('./constants');
  const {CrudApi} = require('@lgslabs/bits-memory-crud');

  class ScopesApi extends CrudApi {
    constructor(messageCenter, options = {}) {
      super(TAG, messageCenter, options);
    }

    static get AccountScope() {
      return STATIC_SCOPES.account;
    }

    static get AdminScope() {
      return STATIC_SCOPES.base;
    }

    static get DevelopmentScope() {
      return STATIC_SCOPES.development;
    }
  }

  module.exports = ScopesApi;
})();
