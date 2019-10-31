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

  const TAG = 'base#Modules';
  const EVENT = Object.freeze({
    LOADED: `${TAG} loaded`,
  });
  const REQUEST = Object.freeze({
    LOAD: `${TAG} load`,
    UNLOAD: `${TAG} unload`,
    INSTALL: `${TAG} install`,
    GET_DISPLAY_NAME: `${TAG} getDisplayName`,
    PROVIDE_DATA_DIRECTORY: `${TAG} provideDataDirectory`,
  });
  const RESTART_POLICY = Object.freeze({
    NEVER: 'never',
    ON_FAILURE: 'on-failure',
    ONESHOT: 'oneshot',
  });
  const ROUTE_PATH = '/api/base/modules';
  const SCOPES = Object.freeze(['base']);
  const READ_SCOPES = Object.freeze([]);
  const WRITE_SCOPES = Object.freeze([]);

  const isOneshot = ({load} = {}) => {
    return !!(load && load.restartPolicy === RESTART_POLICY.ONESHOT);
  };

  module.exports = Object.freeze({EVENT, READ_SCOPES, REQUEST, RESTART_POLICY, ROUTE_PATH, SCOPES, TAG, WRITE_SCOPES, isOneshot});
})();
