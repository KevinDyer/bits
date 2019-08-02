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

  const Manager = require('./manager');
  const Messenger = require('./messenger');
  const path = require('path');
  const Settings = require('./settings');
  const {TAG: tag, SCOPES: scopes, STORE_PATH} = require('./constants');
  const {PouchDbCrudService} = require('@lgslabs/bits-pouch-crud');

  const API_DATA = {
    name: 'BaseActivityApi',
    filepath: path.join(__dirname, './api'),
  };

  class ActivityService extends PouchDbCrudService {
    constructor() {
      super();
      this._settings = null;
    }

    load({messageCenter}) {
      return super.load({
        messageCenter,
        tag,
        scopes,
        path: STORE_PATH,
        apiData: API_DATA,
        apiExport: PouchDbCrudService.ApiExport.GLOBAL,
      });
    }

    unload({messageCenter}) {
      return this._settings.unload({messageCenter})
      .then(() => super.unload({messageCenter}))
      .then(() => {
        this._settings = null;
      });
    }

    preload({messageCenter}) {
      const {SETTINGS_TAG: tag, SETTINGS_STORE_PATH: location, SETTINGS_READ_SCOPES: readScopes, SETTINGS_WRITE_SCOPES: writeScopes} = require('./constants');
      this._settings = new Settings();
      return this._settings.load({
        messageCenter,
        tag,
        location,
        readScopes,
        writeScopes,
      });
    }

    createManager() {
      return Promise.resolve(new Manager());
    }

    loadManager(options) {
      return this._manager.load(Object.assign(options, {settings: this._settings}));
    }

    createMessenger() {
      return Promise.resolve(new Messenger());
    }
  }

  module.exports = ActivityService;
})();
