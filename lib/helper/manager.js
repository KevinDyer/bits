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

  const cluster = require('cluster');
  const HelperApi = require('./api');
  const logger = require('@lgslabs/bits-logger').getLogger();
  const {Manager} = require('@lgslabs/bits-core');

  class HelperManager extends Manager {
    constructor() {
      super();
      this._helpers = null;
      this._boundAdded = null;
      this._boundRemoved = null;
      this._helperApi = null;
    }

    load({isMaster = cluster.isMaster, ...options}) {
      const {messageCenter} = options;
      this._boundAdded = this._added.bind(this);
      this._boundRemoved = this._removed.bind(this);
      this._helpers = [];

      return Promise.resolve()
      .then(() => super.load(options))
      .then(() => {
        if (isMaster) {
          return this._loadMaster();
        } else {
          return this._loadWorker(messageCenter);
        }
      });
    }

    _loadMaster() {
      return Promise.resolve();
    }

    _loadWorker(messageCenter) {
      this._helperApi = new HelperApi(messageCenter);
      return Promise.resolve()
      .then(() => this._helperApi.addAddedListener(this._boundAdded))
      .then(() => this._helperApi.addRemovedListener(this._boundRemoved))
      .then(() => this._helperApi.list())
      .then((helpers) => this._added(helpers));
    }

    unload() {
      return Promise.resolve()
      .then(() => super.unload())
      .then(() => {
        this._helpers = null;
      });
    }

    _unloadWorker() {
      return Promise.resolve()
      .then(() => this._helperApi.removeAddedListener(this._boundAdded))
      .then(() => this._helperApi.removeRemovedListener(this._boundRemoved))
      .then(() => {
        this._helperApi = null;
      });
    }

    _added(helpers) {
      helpers.map(({name, filepath}) => global.helper.add(name, filepath));
      return Promise.resolve();
    }

    _removed(helpers) {
      helpers.map(({name}) => global.helper.remove(name));
      return Promise.resolve();
    }

    add(helper) {
      try {
        require(helper.filepath);
        global.helper.add(helper.name, helper.filepath);
      } catch (err) {
        logger.silly(err.stack);
        return Promise.reject(new Error(`Unable to load helper '${helper.name}' module: ${err.message}`));
      }
      const currentHelper = this._helpers.find((currentHelper) => helper.name === currentHelper.name);
      if (currentHelper) {
        const index = this._helpers.indexOf(currentHelper);
        this._helpers.splice(index, 1, helper);
      } else {
        this._helpers.push(helper);
      }
      this.emit('added', [helper]);
      return Promise.resolve(helper);
    }

    remove(helper) {
      return Promise.resolve()
      .then(() => this._helpers.findIndex(({name}) => name === helper.name))
      .then((index) => {
        if (index === -1) {
          logger.warn(`Asked to remove ${helper.name} helper, none found. Ignoring.`);
          return Promise.resolve();
        }
        const removedItems = this._helpers.splice(index, 1);
        this.emit('removed', removedItems);

        return Promise.resolve();
      });
    }

    list() {
      return Promise.resolve(this._helpers);
    }
  }

  module.exports = HelperManager;
})();
