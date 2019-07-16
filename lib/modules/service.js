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
  const {ResourceManager} = require('@lgslabs/bits-auto-discovery');

  const API_DATA = {
    name: 'BaseModuleApi',
    filepath: path.join(__dirname, 'api'),
  };

  const TOPIC_CRYPTO_API = 'crypto-api';

  class ModuleService extends CrudService {
    constructor() {
      super();
      this._clusterService = null;
      this._infrastructureMessenger = null;
      this._packageService = null;
      this._cryptoApiResMgr = null;
      this._boundResourceAdded = null;
      this._boundResourceRemoved = null;
    }

    load({messageCenter, scopeManager, userManager, loggingManager}) {
      this._clusterService = new ClusterService();
      this._packageService = new PackageService();
      this._infrastructureMessenger = new MasterMessenger();

      const options = {
        tag,
        messageCenter,
        readScopes,
        writeScopes,
        scopeManager,
        userManager,
        loggingManager,
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
      .then(() => this._packageService.load())
      .then(() => this._manager.loadModules());
    }

    unload(options) {
      return this._cryptoApiResMgr.unload()
      .then(() => this._packageService.unload(options))
      .then(() => this._infrastructureMessenger.unload(options))
      .then(() => this._clusterService.unload(options))
      .then(() => super.unload(options));
    }

    postload({messageCenter}) {
      this._boundResourceAdded = this._onResourceAdded.bind(this, messageCenter);
      this._boundResourceRemoved = this._onResourceRemoved.bind(this);
      this._cryptoApiResMgr = new ResourceManager({topic: TOPIC_CRYPTO_API});
      this._cryptoApiResMgr.on('add', this._boundResourceAdded);
      this._cryptoApiResMgr.on('remove', this._boundResourceRemoved);
      return this._cryptoApiResMgr.load(messageCenter);
    }

    _onResourceAdded(messageCenter, res) {
      try {
        const CryptoApi = require(res.getValue().filepath);
        this._packageService.cryptoApi = new CryptoApi(messageCenter);
      } catch (err) {
        logger.error('Error creating the crypto-api', err);
      }
    }

    _onResourceRemoved(res) {
      this._manager.cryptoApi = null;
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
