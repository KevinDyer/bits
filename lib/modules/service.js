(() => {
  'use strict';

  const ClusterService = require('./cluster-service');
  const Manager = require('./manager');
  const MasterMessenger = require('./master-messenger');
  const Messenger = require('./messenger');
  const PackageService = require('./package-service');
  const path = require('path');
  const {TAG: tag, READ_SCOPES: readScopes, WRITE_SCOPES: writeScopes, ROUTE_PATH: routePath} = require('./constants');
  const {CrudService} = require('@lgslabs/bits-memory-crud');

  const API_DATA = {
    name: 'BaseModuleApi',
    filepath: path.join(__dirname, 'api'),
  };

  class ModuleService extends CrudService {
    constructor() {
      super();
      this._clusterService = null;
      this._infrastructureMessenger = null;
      this._packageService = null;
    }

    load({messageCenter, scopeManager, cryptoManager, userManager, loggingManager, keyManager}) {
      this._clusterService = new ClusterService();
      this._packageService = new PackageService();
      this._infrastructureMessenger = new MasterMessenger();

      const options = {
        tag,
        messageCenter,
        readScopes,
        writeScopes,
        scopeManager,
        cryptoManager,
        userManager,
        loggingManager,
        keyManager,
        routePath,
        routerFilepath: path.join(__dirname, 'router'),
        apiExport: CrudService.ApiExport.GLOBAL,
        apiData: API_DATA,
        filter: true,
        clusterService: this._clusterService,
        infrastructureMessenger: this._infrastructureMessenger,
        packageService: this._packageService,
      };
      return super.load(options)
      .then(() => this._clusterService.load({
        messageCenter,
        manager: this._manager,
      }))
      .then(() => this._infrastructureMessenger.load({
        messageCenter,
        tag,
        manager: this._manager,
      }))
      .then(() => this._packageService.load({cryptoManager, keyManager}))
      .then(() => this._manager.loadModules());
    }

    unload(options) {
      return this._packageService.unload(options)
      .then(() => this._infrastructureMessenger.unload(options))
      .then(() => this._clusterService.unload(options))
      .then(() => super.unload(options));
    }

    createManager() {
      return Promise.resolve(new Manager());
    }

    createMessenger() {
      return Promise.resolve(new Messenger());
    }
  }

  module.exports = ModuleService;
})();
