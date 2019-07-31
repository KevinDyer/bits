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

  const {SCOPES} = require('./constants');
  const {getModuleKillRequest} = require('./utils');
  const {Messenger} = require('@lgslabs/bits-core');

  class DispatchMessenger extends Messenger {
    constructor(...args) {
      super(...args);
      this._mod = null;
    }

    load({mod, ...options}) {
      this._mod = mod;
      return super.load(options);
    }

    unload(options) {
      return super.unload(options)
      .then(() => {
        this._mod = null;
      });
    }

    _addRequestListeners(options) {
      return super._addRequestListeners(options)
      .then(() => this.addRequestListener(getModuleKillRequest(this._mod.name), {scopes: SCOPES}, this._die.bind(this)));
    }

    _die() {
      return this._manager.die();
    }
  }

  module.exports = DispatchMessenger;
})();
