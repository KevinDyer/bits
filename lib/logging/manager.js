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

  const LoggerFactory = require('@lgslabs/bits-logger');
  const logger = LoggerFactory.getLogger();
  const os = require('os');
  const path = require('path');
  const UtilChildProcess = require('../helpers/child-process');
  const UtilFs = require('@lgslabs/bits-fs');
  const {CrudManager} = require('@lgslabs/bits-memory-crud');

  class LoggingManager extends CrudManager {
    constructor() {
      super();

      this._cryptoManager = null;
      this._logDirs = null;
      this._holdingDir = null;
    }

    load({cryptoManager, ...options}) {
      this._cryptoManager = cryptoManager;
      this._holdingDir = path.resolve(global.paths.data, 'base/logging');
      this._logDirs = [];

      return Promise.resolve()
      .then(() => UtilFs.ensureDirectoryExists(this._holdingDir))
      .then(() => super.load(options))
      .then(() => UtilFs.readdir(this._holdingDir))
      .then((filenames) => Promise.all(filenames.map((filename) => {
        return this.create({filename, filepath: path.join(this._holdingDir, filename)});
      })))
      .then(() => {
        const logFilepath = LoggerFactory.getLogFilepath();
        if (null !== logFilepath) {
          const dirpath = path.dirname(logFilepath);
          return this.addLogDirectory({dirpath: dirpath});
        }
      });
    }

    update() {
      return Promise.reject(new Error('logging/not-able-to-update'));
    }

    delete(id) {
      return super.delete(id)
      .then((item) => {
        return UtilFs.unlink(item.filepath)
        .catch((err) => logger.error('Error deleting file', err))
        .then(() => item);
      });
    }

    addLogDirectory({dirpath = null} = {}) {
      if (null !== dirpath) {
        this._logDirs.push(dirpath);
      }
      return Promise.resolve();
    }

    removeLogDirectory({dirpath = null} = {}) {
      const index = this._logDirs.indexOf(dirpath);
      if (-1 < index) {
        this._logDirs.splice(index, 1);
      }
      return Promise.resolve();
    }

    generateCrashDump({encrypt = true} = {}) {
      if (this._waiting) {
        return Promise.resolve();
      }
      return new Promise((resolve, reject) => {
        this._waiting = true;
        setTimeout(resolve, 5000);
      })
      .then(() => this._cleanTmpDirectory())
      .then(() => this._packageLog(encrypt))
      .then((data) => {
        this._waiting = false;
        return data;
      })
      .catch((e) => {
        this._waiting = false;
        return Promise.reject(e);
      });
    }

    _cleanTmpDirectory() {
      const dirpath = os.tmpdir();
      return Promise.resolve()
      .then(() => UtilFs.readdir(dirpath))
      .then((filenames) => filenames.filter((filename) => filename.startsWith('logs-') && '.tgz' === path.extname(filename)))
      .then((filenames) => filenames.map((filename) => path.resolve(dirpath, filename)))
      .then((filepaths) => Promise.all(filepaths.map((filepath) => UtilFs.unlink(filepath))));
    }

    _exportJournal({fileroot}) {
      return Promise.resolve()
      .then(() => {
        const journalFilepath = path.resolve(os.tmpdir(), `${fileroot}.journal`);
        return Promise.resolve()
        .then(() => UtilFs.open(journalFilepath, 'a'))
        .then((fd) => {
          const cmd = 'journalctl';
          const args = ['-o', 'export'];
          const options = {stdio: ['ignore', fd, 'inherit']};
          return UtilChildProcess.spawn(cmd, args, options)
          .then((results) => {
            if (results.code === 0) {
              return Promise.resolve()
              .then(() => UtilFs.close(fd))
              .then(() => journalFilepath);
            } else {
              logger.error(results.stderr.map((line) => line.toString().trim()).join(''));
              return null;
            }
          });
        });
      });
    }

    _packageLogDirectories({encrypt, fileroot}) {
      return Promise.resolve()
      .then(() => {
        const tarFilepath = path.resolve(os.tmpdir(), `${fileroot}.tgz`);
        const cmd = 'tar';
        const args = ['cvzf', tarFilepath];
        this._logDirs.forEach((logDir) => args.push(logDir));

        return this._exportJournal({fileroot})
        .then((journalFile) => {
          if (journalFile) {
            args.push(journalFile);
          }
        })
        .then(() => UtilChildProcess.spawn(cmd, args))
        .then(() => {
          if (encrypt) {
            return Promise.resolve()
            .then(() => this._cryptoManager.encryptFileWithAvailableKeys(tarFilepath, os.tmpdir()))
            .then((result) => {
              logger.info('Encrypted base log dump.', result);
              return result.filepath;
            });
          } else {
            return tarFilepath;
          }
        })
        .then((filepath) => {
          const dst = path.resolve(this._holdingDir, path.basename(filepath));
          return Promise.resolve()
          .then(() => UtilFs.rename(filepath, dst))
          .catch((err) => {
            if ('EXDEV' === err.code) {
              return Promise.resolve()
              .then(() => UtilFs.copyFile(filepath, dst))
              .then(() => UtilFs.unlink(filepath));
            } else {
              return Promise.reject(err);
            }
          })
          .then(() => dst);
        });
      })
      .then((filepath) => this.create({filepath: filepath, filename: path.basename(filepath)}));
    }

    _packageLog(encrypt) {
      const fileroot = `logs-${os.hostname()}-${(new Date()).toISOString()}`.replace(/:/g, '-');
      return Promise.resolve()
      .then(() => this._packageLogDirectories({encrypt, fileroot}));
    }
  }

  module.exports = LoggingManager;
})();
