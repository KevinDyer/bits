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
  const {REQUEST} = require('./constants');

  class SystemMessenger extends Messenger {
    _addRequestListeners(options) {
      return super._addRequestListeners(options)
      .then(() => {
        this.addRequestListener(REQUEST.TIME_GET, {scopes: this._readScopes}, this._timeGet.bind(this));
        this.addRequestListener(REQUEST.RESTART, {scopes: this._writeScopes}, this._restart.bind(this));
        this.addRequestListener(REQUEST.SHUTDOWN, {scopes: this._writeScopes}, this._shutdown.bind(this));
      });
    }

    _timeGet() {
      return this._manager.getTime();
    }

    _restart() {
      return this._manager.restart();
    }

    _shutdown() {
      return this._manager.shutdown();
    }
  }

  module.exports = SystemMessenger;
})();
