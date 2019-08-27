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

  const {Manager} = require('@lgslabs/bits-core');
  const {STATIC_SCOPES, SECRET_SCOPES} = require('./constants');

  class ScopesManager extends Manager {
    constructor() {
      super();
      this.__scopes = null;
    }

    load({messageCenter}) {
      this.__scopes = {};
      return Promise.resolve()
      .then(() => super.load({messageCenter}))
      .then(() => Promise.all(Object.keys(STATIC_SCOPES).map((scopeName) => this.create(STATIC_SCOPES[scopeName]))));
    }

    unload(options) {
      return super.unload(options)
      .then(() => {
        this.__scopes = null;
      });
    }

    create(scope) {
      return Promise.resolve()
      .then(() => {
        if ('string' !== typeof scope.name || 0 >= scope.name.length) return Promise.reject(new TypeError('scope/invalid-name'));
        if (this.__scopes.hasOwnProperty(scope.name)) return Promise.reject(new Error('scope/name-exists'));
        if ('string' !== typeof scope.displayName || 0 >= scope.displayName.length) return Promise.reject(new TypeError('scope/invalid-displayName'));

        this.__scopes[scope.name] = scope;
        this.emit('created', [scope]);
        return scope;
      });
    }

    list() {
      const scopes = this._scopes;
      return Promise.resolve(Object.keys(scopes)
      .map((scopeKey) => scopes[scopeKey]));
    }

    get(name) {
      return Promise.resolve()
      .then(() => this._scopes[name] || null);
    }

    get _scopes() {
      const scopes = Object.assign({}, this.__scopes);
      SECRET_SCOPES.forEach((scope) => delete scopes[scope]);
      return scopes;
    }

    static get SCOPE_ACCOUNT() {
      return STATIC_SCOPES.account;
    }

    static get SCOPE_BASE() {
      return STATIC_SCOPES.base;
    }

    static get SCOPE_DEVELOPMENT() {
      return STATIC_SCOPES.development;
    }

    static get STATIC_SCOPES() {
      return STATIC_SCOPES;
    }
  }

  module.exports = ScopesManager;
})();
