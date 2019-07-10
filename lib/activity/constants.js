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

  const path = require('path');

  const BASE_PATH = path.resolve(global.paths.data, 'base/store/activity');
  const TAG = 'base#Activities';

  module.exports = Object.freeze({
    TAG,
    SCOPES: Object.freeze([]),
    DEFCON: Object.freeze({
      COCKED_PISTOL: 1,
      FAST_PACE: 2,
      ROUND_HOUSE: 3,
      DOUBLE_TAKE: 4,
      FADE_OUT: 5,
    }),
    STORE_PATH: path.resolve(BASE_PATH, 'activities'),
    SETTINGS_TAG: 'base#ActivitySettings',
    SETTINGS_READ_SCOPES: Object.freeze([]),
    SETTINGS_WRITE_SCOPES: Object.freeze(['base']),
    SETTINGS_STORE_PATH: path.resolve(BASE_PATH, 'settings'),
  });
})();
