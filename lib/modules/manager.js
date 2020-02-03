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

  const BitsFs = require('@lgslabs/bits-fs');
  const DispatchApi = require('../dispatcher/api');
  const Graph = require('graph-js');
  const logger = require('@lgslabs/bits-logger').getLogger();
  const path = require('path');
  const semver = require('semver');
  const {CrudManager} = require('@lgslabs/bits-memory-crud');
  const {KeyValueService} = require('@lgslabs/bits-memory-kv');
  const {RESTART_POLICY, isOneshot} = require('./constants');

  const ROOT_DIR = path.resolve(__dirname, '../..');
  const MODULE_LOAD_TIMEOUT = 120 * 1000;
  const PROGRESS_TAG = 'base#ModuleManager#Status';

  // This is the list of reserved names
  const reservedNames = ['base', 'bin', 'bin32', 'binarm', 'db', 'decrypted', 'encrypted'];

  const KEY = {
    LOAD_STATUS: 'loadStatus',
    IDLE: 'idle',
    LOADING: 'loading',
    UNLOADING: 'unloading',
  };

  const DEFAULT_PROGRESS_STATUS = {
    status: KEY.IDLE,
  };

  function shouldRetry({policy, attempts, maxRetries}) {
    if (policy === RESTART_POLICY.NEVER) return false;
    return (maxRetries < 0 || attempts < maxRetries);
  }

  function moduleHasCrashed({signal, code}) {
    return (signal || code !== 0);
  }

  class ModuleManager extends CrudManager {
    _nullifyProperties() {
      super._nullifyProperties();
      this._executorService = null;
      this._modResponses = null;
      this._modulesDir = null;
      this._modulesPackagesDecryptedDir = null;
      this._modulesPackagesDir = null;
      this._modulesRootDir = null;
      this._modulesUploadDir = null;
      this._progressService = null;
      this._rootDataDir = null;
      this._scopesManager = null;
      this._upgradeDir = null;
      this._userManager = null;
      this._statusPromise = null;
    }

    __initializePaths() {
      return Promise.resolve()
      .then(() => {
        this._modulesDir = global.paths.modules;
        this._rootDataDir = global.paths.data;
        this._modulesRootDir = path.resolve(this._rootDataDir, 'base/modules');
        this._modulesPackagesDir = path.resolve(this._modulesRootDir, 'modules-packages');
        this._modulesPackagesDecryptedDir = path.resolve(this._modulesPackagesDir, 'decrypted');
        this._upgradeDir = path.resolve(global.paths.data, 'upgrades');
        this._modulesUploadDir = path.resolve(this._modulesPackagesDir, 'tmp');
      });
    }

    load({messageCenter, executorService, scopeManager, userManager}) {
      this._messageCenter = messageCenter;
      this._executorService = executorService;
      this._scopesManager = scopeManager;
      this._userManager = userManager;

      this._modResponses = new Map();
      this._dispatchApi = new DispatchApi(messageCenter);
      this._progressService = new KeyValueService();

      logger.debug('Loading the module manager');
      return super.load({messageCenter})
      .then(() => this.__initializePaths())
      .then(() => this._progressService.load({tag: PROGRESS_TAG, readScopes: ['base'], messageCenter}))
      .then(() => this._progressService.manager.set({key: KEY.LOAD_STATUS, value: DEFAULT_PROGRESS_STATUS}))
      .then(() => this._initDataDir())
      .then(() => this._readInstalledBase())
      .then(() => this._readModules());
    }

    unload(options) {
      return Promise.resolve()
      .then(() => this._progressService.unload(options))
      .then(() => super.unload(options));
    }

    create() {
      return Promise.reject(new Error('operation-not-supported'));
    }

    update() {
      return Promise.reject(new Error('operation-not-supported'));
    }

    delete() {
      return Promise.reject(new Error('operation-not-supported'));
    }

    getDisplayName(moduleName) {
      return Promise.resolve()
      .then(() => [...this._items.values()].find((mod) => mod.name === moduleName))
      .then((mod) => {
        if (mod) return mod.displayName;
      });
    }

    getModuleDir() {
      return this._modulesDir;
    }

    provideDataDirectory(moduleName) {
      // If the moduleName is not provided just return the data directory path
      if ('string' !== typeof moduleName) return Promise.resolve(this._rootDataDir);

      // Get the module for this moduleName
      const mod = this._getModuleFromName(moduleName);

      // Make sure the module name is a module in the module list
      if (!mod) {
        return Promise.reject(new Error('no module with name ' + moduleName));
      }

      const modName = mod.name.toLowerCase();

      // Make sure the moduleName is not a reserved name
      if (reservedNames.some((reservedName) => reservedName === modName)) {
        return Promise.reject(new Error(modName + ' is a reserved name'));
      }

      // Create the data directory path for the module
      const dirpath = path.resolve(this._rootDataDir, mod.name);

      // Create the directory
      return BitsFs.ensureDirectoryExists(dirpath)
      .catch((err) => {
        logger.error('Error creating data directory', err);
        return Promise.reject(err);
      })
      .then(() => dirpath);
    }

    loadModules() {
      return Promise.resolve()
      .then(() => this._loadModules())
      .then(() => this.emit('modules-loaded'))
      .then(() => logger.debug('Modules have finished loading'));
    }

    _loadModules() {
      if (this._statusPromise) return this._statusPromise;

      this._statusPromise = Promise.resolve()
      .then(() => this._progressService.manager.set({key: KEY.LOAD_STATUS, value: {status: KEY.LOADING}}))
      .then(() => super.list())
      .then((mods) => {
        const graph = this._generateDependencyGraph(mods.map((mod) => mod)); // 1 level Deep Copy
        return this._loadModuleGrouping(graph);
      })
      .catch((err) => {
        logger.error('Error loading modules', err);
      })
      .then(() => this._progressService.manager.set({key: KEY.LOAD_STATUS, value: DEFAULT_PROGRESS_STATUS}))
      .catch((err) => {
        logger.error('Error setting status', err);
        return Promise.reject(new Error('internal-error'));
      })
      .then(() => {
        this._statusPromise = null;
      });
      return this._statusPromise;
    }

    _uninstallModule(modInput) {
      const mod = [...this._items.values()].find((item) => modInput.name === item.name);
      if (mod.hasOwnProperty('installedDir')) {
        if (mod.isLoaded) {
          return Promise.reject(new Error('Can not remove module that has not been unloaded'));
        } else {
          return Promise.resolve()
          .then(() => BitsFs.lstat(mod.installedDir))
          .then((lstats) => {
            if (lstats.isDirectory()) {
              return BitsFs.rmdir(mod.installedDir, {
                recursive: true,
              });
            } else {
              return BitsFs.unlink(mod.installedDir);
            }
          })
          .then(() => super.delete(mod.id));
        }
      } else {
        return Promise.reject(new Error('Unable to remove module - No install Directory'));
      }
    }

    moduleCrashed(id) {
      const mod = [...this._items.values()].find((mod) => mod.id === id);
      if (!mod) {
        logger.error('Unknown module crashed. Unable to clean up');
        return;
      }

      return this.unloadModule(mod, {uninstall: false})
      .then(() => {
        if (!mod.loadError) return super.update(mod.id, {loadError: {message: 'Module crashed without warning'}});
        return Promise.resolve();
      })
      .catch((err) => super.unload(mod.id, {loadError: {message: 'Module crashed and we could not clean it up ' + err.message}}));
    }

    unloadModule(mod, {uninstall=true} = {}) { // Options to allow unloads without removing module
      logger.debug('Request to unload module');
      return super.list()
      .then((allModules) => {
        const graph = this._generateDependencyGraph(allModules.map((mod) => mod)); // 1 level Deep Copy
        return this._unloadModuleGrouping(graph, mod);
      })
      .then(() => {
        if (uninstall) {
          return this._uninstallModule(mod);
        } else {
          return Promise.resolve();
        }
      })
      .catch((err) => {
        logger.error('Error unloading modules', err);
      });
    }

    _loadModuleGrouping(graph) {
      const mods = {};
      const loadingModules = {};
      const failedModules = {};

      return new Promise((resolve, reject) => {
        const dispatchModuleChain = () => {
          const modulesToLoad = this._computeModulesToLoadNext(graph).filter((mod) => mod.id !== 'DNE' && !mods.hasOwnProperty(mod.id) && !failedModules.hasOwnProperty(mod.id));

          // Base Case is if there are no more modules to load
          if (modulesToLoad.length === 0 && Object.keys(mods).length === 0) {
            resolve(Object.keys(loadingModules).map((key) => loadingModules[key]));
          }

          modulesToLoad.forEach((modNode) => {
            const moduleId = modNode.id;
            mods[moduleId] = Promise.resolve()
            .then(() => super.get(moduleId))
            .then((mod) => new Promise((resolve, reject) => {
              let retryAttempts = 0;

              const loadWithRetries = () => {
                this._loadModule(mod)
                .then(resolve)
                .catch((err) => {
                  const {restartPolicy = RESTART_POLICY.NEVER, retries = 1} = mod.load || {};
                  if (shouldRetry({
                    policy: restartPolicy,
                    maxRetries: retries,
                    attempts: retryAttempts,
                  })) {
                    retryAttempts++;
                    setTimeout(() => loadWithRetries(), 2000);
                  } else {
                    reject(err);
                  }
                });
              };

              loadWithRetries();
            }))
            .then((mod) => {
              loadingModules[moduleId] = mods[moduleId];
              delete mods[moduleId];
              graph.removeNode(moduleId);
              return dispatchModuleChain();
            })
            .catch((err) => {
              if (!err.message) err.message = JSON.stringify(err);
              logger.error('Error loading module', modNode.name, err);
              return super.update(moduleId, {loadError: {message: err.message}})
              .then(() => {
                failedModules[moduleId] = mods[moduleId];
                delete mods[moduleId];
                return dispatchModuleChain();
              });
            })
            .catch((err) => {
              logger.error('Unable to set the error reason for the load error', err);
            });
          });
        };
        dispatchModuleChain(); // Initial call
      })
      // Mark all unloaded modules as missing a dependency
      .then(() => super.list())
      .then((modules) => {
        return Promise.all(modules.map((module) => {
          if (module.isLoaded === false && !module.hasOwnProperty('loadError')) {
            const errorMsg = (module.hasOwnProperty('missingDependency') ? `Missing Dependency: '${module.missingDependency}'`: `Missing one or more of the following dependencies: '${Object.keys(module.dependencies).join(`', '`)}'`);
            return super.update(module.id, {loadError: {message: errorMsg}});
          } else {
            return Promise.resolve();
          }
        }));
      })
      .then(() => super.list());
    }

    _computeModulesToLoadNext(graph) {
      const allModuleNodes = graph.getNodes().reduce((acc, modNode) => {
        acc[modNode.getId()] = modNode;
        return acc;
      }, {});

      graph.getEdges().forEach((edge) => {
        delete allModuleNodes[edge.getNodeStart().getId()];
      });

      return Object.keys(allModuleNodes).map((id) => {
        return allModuleNodes[id].getContent();
      });
    }

    onModuleResponse({module, err, result}) {
      const {id} = module;
      if (this._modResponses.has(id)) {
        const {resolve, reject} = this._modResponses.get(id);
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
        this._modResponses.delete(id);
      }
    }

    _loadModule(mod) {
      logger.debug('Loading module %s with id %d', mod.name, mod.id);

      if (mod.isLoaded && !isOneshot(mod)) {
        return Promise.resolve(mod);
      }
      const start = process.hrtime();
      return Promise.resolve()
      .then(() => this._checkModuleDependenciesAreLoaded(mod))
      .then(() => this._setModuleScopes(mod))
      .then(() => {
        return new Promise((resolve, reject) => {
          const cleanUp = () => {
            clearTimeout(moduleTimeout);
            this._executorService.removeListener('module-exit', loadError);
            this._modResponses.delete(mod.id);
          };
          const timeoutFunc = () => {
            cleanUp();
            reject(new Error('Module Load Timeout'));
          };

          const loadError = ({module, code, signal}) => {
            if (module.id === mod.id && moduleHasCrashed({code, signal})) {
              cleanUp();
              reject(new Error('Module crashed during load - unknown reason'));
            }
          };

          const moduleTimeout = setTimeout(timeoutFunc, MODULE_LOAD_TIMEOUT);
          this._executorService.on('module-exit', loadError);
          this._modResponses.set(mod.id, {resolve, reject});

          this._executorService.summonTheModule(mod)
          .catch((err) => {
            logger.error('Something went wrong during load ', err);
            reject(err);
          });
        });
      })
      .then(() => {
        const diff = process.hrtime(start);
        const duration = Math.floor((diff[0] * 1e9 + diff[1]) / 1e6);
        logger.debug('Loaded module %s', mod.name, {
          name: mod.name,
          version: mod.version,
          duration: duration,
        });
      })
      .then(() => this._executorService.moduleCompletedLoad(mod))
      .then(() => super.update(mod.id, {isLoaded: true, loadError: null}))
      .catch((err) => {
        return this._executorService.destroyTheModule(mod, 'SIGKILL')
        .then(() => Promise.reject(err));
      });
    }

    _unloadModuleGrouping(graph, mod, visited={}) {
      const node = graph.getNodes().find((node) => node.getId() === mod.id);
      if (visited.hasOwnProperty(mod.id)) {
        return visited[mod.id];
      }
      visited[mod.id] = Promise.resolve()
      .then(() => {
        const dependentChildren = this._computeDependents(graph, node.getContent());
        if (dependentChildren.length !== 0) {
          return Promise.all(dependentChildren.map((child) => this._unloadModuleGrouping(graph, child, visited)));
        } else {
          return Promise.resolve();
        }
      })
      .then(() => this._unloadModule(mod));
      return visited[mod.id];
    }

    _unloadModule(modToUnload) {
      const mod = [...this._items.values()].find((item) => item.id === modToUnload.id); // Need to do this so I can get the exact state of the module
      if (!mod.isLoaded) {
        return Promise.resolve();
      }
      return Promise.resolve()
      .then(() => {
        if (isOneshot(mod)) {
          mod.shotFired = true;
          return this._loadModule(mod);
        }
      })
      .then(() => this._checkModuleDependenciesAreUnloaded(mod))
      .then(() => this._executorService.moduleUnloading(mod))
      .then(() => {
        return new Promise((resolve, reject) => {
          const cleanUp = () => {
            clearTimeout(timeout);
            this._executorService.removeListener('module-unloaded', moduleUnloadedFunc);
          };
          const timeoutFunc = () => {
            cleanUp();
            reject(new Error('Module Unload Timeout'));
          };

          const moduleUnloadedFunc = ({module, code, signal}) => {
            if (module.id === modToUnload.id) {
              cleanUp();
              resolve(module);
            }
          };
          this._executorService.on('module-unloaded', moduleUnloadedFunc);
          const timeout = setTimeout(timeoutFunc, MODULE_LOAD_TIMEOUT);

          this._dispatchApi.die(mod)
          .then((result) => {
            cleanUp();
            resolve(result);
          })
          .catch((err) => {
            logger.error(`Unable to unload module ${mod.name} note: this error is normal, if you see it once, if the module crashed. We obviously can not clean it up properly if it is already dead`, err);
            logger.error('Killing module anyway');
            cleanUp();
            resolve();
          });
        })
        .catch((err) => {
          logger.error(`Something happened during unload with ${modToUnload.name}... Continuing anyway`, err);
          return Promise.resolve();
        });
      })
      .then(() => this._executorService.destroyTheModule(mod)) // If the module is still running its dead now
      .then(() => {
        logger.debug('Module Process is dead');
      })
      .catch((err) => {
        logger.error('Whoopsies Going to kill the module anyway', err);
      })
      .then(() => super.update(mod.id, {isLoaded: false})) // If this fails nothing can unload
      .then((result) => {
        logger.info(`${mod.name} has been unloaded`);
        return result;
      });
    }

    _computeDependents(graph, mod) {
      const dependents = [];
      graph.getEdges().forEach((edge) => {
        if (edge.getNodeEnd().getId() === mod.id) {
          dependents.push(edge.getNodeStart().getContent());
        }
      });
      return dependents;
    }

    _initDataDir() {
      return BitsFs.ensureDirectoryExists(this._modulesRootDir)
      .then(() => BitsFs.ensureDirectoryExists(this._modulesPackagesDir))
      .then(() => BitsFs.ensureDirectoryExists(this._modulesPackagesDecryptedDir))
      .then(() => BitsFs.ensureDirectoryExists(this._modulesDir))
      .then(() => BitsFs.ensureDirectoryExists(this._modulesUploadDir));
    }

    _addModule(moduleDir) {
      return Promise.resolve()
      .then(() => BitsFs.stat(moduleDir))
      .then(() => this.readModuleInfo(moduleDir))
      .then((modInfo) => {
        modInfo.installedDir = moduleDir;
        return super.create(modInfo);
      })
      .catch((err) => {
        logger.warn('Error picking up module', err);
      });
    }

    _readModules() {
      return BitsFs.readdir(this._modulesDir)
      .then((modules) => {
        const moduleDirs = modules.map((mod) => {
          return path.join(this._modulesDir, mod);
        });
        return Promise.all(moduleDirs.map((moduleDir) => this._addModule(moduleDir)));
      });
    }

    _setModuleScopes(mod) {
      if (Array.isArray(mod.scopes)) {
        return Promise.all(mod.scopes.map((scope) => {
          return this._scopesManager.create(scope)
          .catch(() => {
            return Promise.resolve();
          });
        }))
        .then(() => {
          return Promise.resolve(mod);
        });
      } else {
        return mod;
      }
    }

    _checkModuleDependenciesAreLoaded(mod) {
      if ('object' === typeof mod.dependencies && null !== mod.dependencies) {
        const depNames = Object.keys(mod.dependencies);
        return depNames.reduce((promise, depName) => {
          return promise
          .then(() => {
            const dep = this._getModuleFromName(depName);
            if (!dep) {
              return Promise.reject(new Error(mod.name + ' missing dependency "' + depName + '".'));
            }
            if (!dep.isLoaded) {
              return Promise.reject(new Error(mod.name + ' dependency "' + depName + '" is not loaded.'));
            }
            const depVersion = mod.dependencies[depName];
            if (dep.version && dep.version !== '') { // ignore check for dev modules with no version
              if (!this._satisfies(dep.version, depVersion)) {
                return Promise.reject(new Error(`dependency \"${depName}\" does not satisfy requirement \"${depVersion}\"`));
              }
            }
          });
        }, Promise.resolve())
        .then(() => {
          return mod;
        });
      } else {
        return Promise.resolve(mod);
      }
    }

    _checkModuleDependenciesAreUnloaded(mod) {
      return Promise.resolve()
      .then(() => super.list())
      .then((modules) => modules.filter((mod) => mod.dependencies && mod.dependencies.hasOwnProperty(mod.name) && mod.isLoaded))
      .then((dependents) => {
        if (dependents.length !== 0) {
          logger.error('Other modules are still running and depending on this one. This should never happen');
          return Promise.reject(new Error('A module was told to unload when its dependents are still loaded.'));
        }
        return Promise.resolve();
      });
    }

    _readInstalledBase() {
      return this.readModuleInfo(ROOT_DIR)
      .then((modInfo) => this._validateModuleFields(modInfo))
      .then((modInfo) => {
        modInfo.isLoaded = true;
        return super.create(modInfo);
      });
    }

    readModuleInfo(dir) {
      const modInfoPath = path.resolve(dir, 'module.json');
      return BitsFs.readJSON(modInfoPath)
      .then((modInfo) => {
        modInfo.isInstalled = true;
        modInfo.isLoaded = false;
        return modInfo;
      });
    }

    _validateModuleFields(modInfo) {
      if (!modInfo) {
        return Promise.reject(new Error('Module Info must not be null'));
      }

      const name = modInfo.name;

      if (!isNonEmptyString(name)) {
        return Promise.reject(new TypeError('name must be a non-empty string'));
      }

      if (!modInfo.version) {
        if (modInfo.name !== 'bits-base') {
          logger.debug('Module %s does not have a version this will cause dependency calculation to ignore all version relating to this module.', modInfo.name);
        }
      } else {
        if (!semver.valid(modInfo.version)) {
          return Promise.reject(new Error('Module must have a valid semver version'));
        }
      }

      return Promise.resolve(modInfo);
    }

    _generateDependencyGraph(modules) {
      let edgeCount = 0;
      const mapping = {};
      const graph = new Graph();

      graph.addNode({id: 'DNE'}, 'DNE');

      modules.forEach((mod) => {
        mapping[mod.name] = mod.id;
        graph.addNode(mod, mod.id);
      });

      modules.forEach((mod) => {
        const dependencies = mod.dependencies;
        if (dependencies) {
          Object.keys(dependencies).forEach((dependency) => {
            if (!mapping.hasOwnProperty(dependency)) {
              logger.error(`Module '${mod.name}' is missing dependency '${dependency}'`);
              mod.missingDependency = dependency;
              graph.addEdge(mod.id, 'DNE', edgeCount);
            } else {
              graph.addEdge(mod.id, mapping[dependency], edgeCount);
            }
            edgeCount += 1;
          });
        }
      });
      return graph;
    }

    _onModuleExit({module, code, signal}) {
      if (moduleHasCrashed({code, signal})) this.moduleCrashed(module.id);
    }

    _getModuleFromName(name) {
      return [...this._items.values()].find((mod) => {
        return mod.name === name;
      });
    }

    _satisfies(version, versionCheck) {
      if (version && versionCheck) {
        // strip off the '-.*' (any pre release info) if it exists because semver does not currently handle it
        return semver.satisfies(version.split('-')[0], versionCheck);
      } else {
        return true; // Ignoring version check for modules that dont have a version
      }
    }
  }

  function isNonEmptyString(str) {
    return ('string' === typeof str) && str.trim().length;
  }

  module.exports = ModuleManager;
})();