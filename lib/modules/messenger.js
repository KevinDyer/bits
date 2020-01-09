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

  const {CrudMessenger} = require('@lgslabs/bits-memory-crud');
  const {REQUEST, EVENT} = require('./constants');

  class ModuleMessenger extends CrudMessenger {
    _addRequestListeners(options) {
      return super._addRequestListeners(options)
      .then(() => Promise.all([
        this.addRequestListener(REQUEST.PROVIDE_DATA_DIRECTORY, this._writeScopes, this._provideDataDir.bind(this)),
        this.addRequestListener(REQUEST.GET_DISPLAY_NAME, {scopes: this._readScopes}, this._getDisplayName.bind(this)),
        this.addRequestListener(REQUEST.LOAD, {scopes: this._scopes}, this._loadModules.bind(this)),
        this.addRequestListener(REQUEST.UNLOAD, {scopes: this._scopes}, this._unloadModule.bind(this)),
      ]));
    }

    _addEmitterEventListeners({manager}) {
      return super._addEmitterEventListeners({manager})
      .then(() => this.addEmitterEventListener(this._manager, 'modules-loaded', this._onModulesLoaded.bind(this)));
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
      return this.sendEvent(EVENT.LOADED, {scopes: this._readScopes});
    }

    _getDisplayName(metadata, moduleName) {
      return this._manager.getDisplayName(moduleName);
    }

    _provideDataDir(metadata, name) {
      return this._manager.provideDataDirectory(name);
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
