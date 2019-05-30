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

  const ScopesManager = require('../scopes/scopes-manager');

  const TAG = 'base#System';

  module.exports = {
    TAG,
    REQUEST: {
      TIME_GET: `${TAG} timeGet`,
      RESTART: `${TAG} restart`,
      SHUTDOWN: `${TAG} shutdown`,
      BITS_ID: `${TAG} bitsId`,
    },
    EVENT: {
      TIME: `${TAG} time`,
    },
    READ_SCOPES: [],
    WRITE_SCOPES: [ScopesManager.SCOPE_BASE.name],
  };
})();
