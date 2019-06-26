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

  const TAG = 'base#Modules';
  module.exports = {
    TAG,
    REQUEST: {
      LOAD: `${TAG} load`,
      UNLOAD: `${TAG} unload`,
      INSTALL: `${TAG} install`,
      GET_DISPLAY_NAME: `${TAG} getDisplayName`,
      PROVIDE_DATA_DIRECTORY: `${TAG} provideDataDirectory`,
    },
    EVENT: {
      LOADED: `${TAG} loaded`,
    },
    RESTART_POLICY: {
      NEVER: 'never',
      ON_FAILURE: 'on-failure',
      ONESHOT: 'oneshot',
    },
    SCOPES: ['base'],
    READ_SCOPES: [],
    WRITE_SCOPES: ['base'],
    routePath: '/api/base/modules',
    isOneshot: function({load} = {}) {
      return !!(load && load.restartPolicy === MODULE.RESTART_POLICY.ONESHOT);
    },
  };
})();
