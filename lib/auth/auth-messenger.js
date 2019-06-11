/**
Copyright 2017 LGS Innovations

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

  const AuthApi = require('./auth-api');
  const Messenger = require('../helpers/messenger');

  class AuthMessenger extends Messenger {
    static get SCOPES() {
      return null;
    }

    constructor(manager) {
      super();
      this._manager = manager;

      this.addRequestListener(AuthApi.REQUESTS.ADD_STRATEGY, {scopes: AuthMessenger.SCOPES}, this._addStrategy.bind(this));
      this.addRequestListener(AuthApi.REQUESTS.REMOVE_STRATEGY, {scopes: AuthMessenger.SCOPES}, this._removeStrategy.bind(this));
      this.addRequestListener(AuthApi.REQUESTS.GET_ACCESS_TOKEN_FOR_USER, {scopes: AuthMessenger.SCOPES}, this._getAccessTokenForUser.bind(this));
      this.addRequestListener(AuthApi.REQUESTS.REVOKE_ACCESS_TOKEN_FOR_USER, {scopes: AuthMessenger.SCOPES}, this._revokeAccessTokenForUser.bind(this));
      this.addRequestListener(AuthApi.REQUESTS.SIGN_IN, {scopes: AuthMessenger.SCOPES}, this._signInWithUsernameAndPassword.bind(this));
      this.addRequestListener(AuthApi.REQUESTS.SIGN_IN_ANONYMOUS, {scopes: AuthMessenger.SCOPES}, this._signInAnonymously.bind(this));
      this.addRequestListener(AuthApi.REQUESTS.VALIDATE_ACCESS_TOKEN, {scopes: AuthMessenger.SCOPES}, this._validateAccessToken.bind(this));
      this.addEmitterEventListener(this._manager, 'deleted', this._deleted.bind(this));
    }

    _addStrategy(metadata, request) {
      return this._manager.addStrategy(request);
    }

    _removeStrategy(metadata, request) {
      return this._manager.removeStrategy(request);
    }

    _getAccessTokenForUser(metadata, user) {
      return this._manager.getAccessTokenForUser(user);
    }

    _revokeAccessTokenForUser(metadata, user) {
      return this._manager.revokeAccessTokenForUser(user);
    }

    _signInWithUsernameAndPassword(metadata, ...request) {
      return this._manager.signInWithUsernameAndPassword(...request);
    }

    _signInAnonymously(metadata) {
      return this._manager.signInAnonymously();
    }

    _validateAccessToken(metadata, request) {
      const {token} = request || {};
      return this._manager.validateAccessToken(token);
    }

    _deleted(items) {
      return this.sendEvent(AuthApi.EVENTS.DELETED, {scopes: null}, items);
    }

    sendRequest(request, ...args) {
      return this._messageCenter.sendRequest(request, {scopes: null}, ...args);
    }
  }

  module.exports = AuthMessenger;
})();
