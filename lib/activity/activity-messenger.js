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

  const CrudMessenger = require('./../helpers/crud-messenger');

  class ActivityMessenger extends CrudMessenger {
    constructor(tag, manager, options) {
      super(tag, manager, options);
      this.addRequestListener(`${tag} dismissAll`, {scopes: []}, this._dismissAll.bind(this));
    }

    list(metadata, query, options) {
      query = Object.assign({}, query, {scopes: metadata.scopes});
      return this._manager.list(query, options);
    }

    _dismissAll(metadata, request) {
      return this._manager.dismissAll(request);
    }
  }

  module.exports = ActivityMessenger;
})();
