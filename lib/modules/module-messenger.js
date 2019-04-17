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

  const SCOPES = ['base'];

  const ModuleConstants = require('./module-constants');
  const CrudMessenger = require('./../helpers/crud-messenger');

  class ModuleMessenger extends CrudMessenger {
    constructor(TAG, manager, scopes) {
      super(TAG, manager, scopes, {filter: true});
      this._manager = manager;
      this.addEmitterEventListener(this._manager, 'modules-loaded', this._onModulesLoaded.bind(this));
      this.addRequestListener(ModuleConstants.REQUEST.GET_DISPLAY_NAME, {scopes: SCOPES}, this._getDisplayName.bind(this));
      this.addRequestListener(ModuleConstants.REQUEST.GET_DATA_DIRECTORY, null, this._getDataDir.bind(this));
      this.addRequestListener(ModuleConstants.REQUEST.LOAD, {scopes: SCOPES}, this._loadModules.bind(this));
      this.addRequestListener(ModuleConstants.REQUEST.UNLOAD, {scopes: SCOPES}, this._unloadModule.bind(this));
    }

    _sanitizeModule(item) {
      return Promise.resolve()
      .then(() => {
        return {name, displayName} = item;
      });
    }

    _get(metadata, id) {
      return this._manager.get(id)
      .then((result) => {
        const {scopes} = metadata;
        if (null === scopes || scopes.includes('base')) {
          return result;
        } else {
          return this._sanitizeModule(result);
        }
      });
    }

    _list(metadata, query, options) {
      return this._manager.list(query, options)
      .then((results) => {
        const {scopes} = metadata;
        if (null === scopes || scopes.includes('base')) {
          return results;
        } else {
          return this._sanitizeModule(results);
        }
      });
    }

    _onModulesLoaded() {
      return this.sendEvent(ModuleConstants.EVENT.LOADED, {scopes: this._readScopes});
    }

    _getDisplayName(metadata, moduleName) {
      return this._manager.getDisplayName(moduleName);
    }

    _getDataDir(metadata, name) {
      return this._manager.getDataDirectory(name);
    }

    _loadModules(metadata) {
      return this._manager.loadModules();
    }

    _unloadModule(metadata, mod) {
      return this._manager.unloadModule(mod);
    }
  }

  module.exports = ModuleMessenger;
})();
