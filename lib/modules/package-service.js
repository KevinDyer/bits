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

  const logger = require('@lgslabs/bits-logger').getLogger();
  const os = require('os');
  const path = require('path');
  const UtilChildProcess = require('./../helpers/child-process');
  const UtilFs = require('@lgslabs/bits-fs');

  class ModulePackageService {
    constructor() {
      this._cryptoApi = null;
      this._modulesPackagesStagingDir = null;
    }

    load() {
      this._modulesPackagesStagingDir = os.tmpdir();
      return Promise.resolve();
    }

    unload() {
      return Promise.resolve();
    }

    installModule(file) {
      const modPath = path.resolve(this._modulesPackagesStagingDir, file.filename + '-mod');
      return Promise.resolve()
      .then(() => UtilFs.mkdir(modPath))
      .then(() => {
        return this._cryptoApi.decryptFile({
          filepath: file.path,
          outdir: this._modulesPackagesStagingDir,
        })
        .catch((err) => {
          return null;
        });
      })
      .then((filename) => {
        if (!filename) {
          return Promise.reject(new Error('No keys could decrypt module'));
        } else {
          logger.debug('Successfully unsigned and decrypted module');
        }
        const command = 'tar';
        const args = [
          '--warning=none',
          '-x',
          '-f', filename,
          '-C', modPath,
        ];

        return UtilChildProcess.spawn(command, args)
        .then((result) => {
          return {
            filename: filename,
            result: result,
          };
        });
      })
      .then(({filename, result}) => {
        logger.debug('Finished Untarring Module');
        if (result.code !== 0) {
          return Promise.reject(new Error('Error processing package'));
        } else {
          return UtilFs.unlink(filename)
          .then(() => filename);
        }
      })
      .then(() => modPath);
    }

    set cryptoApi(api) {
      this._cryptoApi = api;
    }
  };
  module.exports = ModulePackageService;
})();
