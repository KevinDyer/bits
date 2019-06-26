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

  const {Messenger} = require('@lgslabs/bits-core');

  const LOAD_PROCESS_FINISH_EVENT = 'base#BaseModuleFinishedLoad';

  class ModuleMasterMessenger extends Messenger {
    _addEventListeners(options) {
      return super._addEventListeners(options)
      .then(() => this.addEventListener(LOAD_PROCESS_FINISH_EVENT, {scopes: null}, this._loadComplete.bind(this)));
    }

    _loadComplete(message) {
      this._manager.onModuleResponse(message);
    }
  }

  module.exports = ModuleMasterMessenger;
})();
