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

  const MODULE_PREFIX = 'base#Modules ';
  const MODULE = {
    REQUEST: {
      LOAD: MODULE_PREFIX + 'load',
      UNLOAD: MODULE_PREFIX + 'unload',
      GET_DISPLAY_NAME: MODULE_PREFIX + 'getDisplayName',
      GET_DATA_DIRECTORY: MODULE_PREFIX + 'getDataDirectory'
    },
    EVENT: {
      LOADED: MODULE_PREFIX + 'loaded'
    },
    RESTART_POLICY: {
      NEVER: 'never',
      ON_FAILURE: 'on-failure',
      ONESHOT: 'oneshot',
    },
    isOneshot: function({load} = {}) {
      return !!(load && load.restartPolicy === MODULE.RESTART_POLICY.ONESHOT);
    }
  };

  module.exports = MODULE;
})();
