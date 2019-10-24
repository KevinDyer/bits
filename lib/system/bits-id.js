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

  const os = require('os');
  const path = require('path');
  const UtilFs = require('../helpers/fs');
  const UtilChildProcess = require('../helpers/child-process');

  const ROOT_DIR = global.paths.data;
  const BASE_DATA_DIR = path.join(ROOT_DIR, './base');
  const BITS_ID_DATA_JSON = path.join(BASE_DATA_DIR, './bitsId.json');

  class BitsId {
    getBitsId() {
      return this._bitsId;
    }

    load() {
      return UtilFs.mkdir(BASE_DATA_DIR).catch((err) => {}) // Mkdir if not existsthis._getBitsId();
      .then(() => this._getBitsId());
    }

    _getBitsId() {
      // Read the bits id data file
      return UtilFs.readJSON(BITS_ID_DATA_JSON)
      .then((data) => {
        const bitsId = data.bitsId;
        this._bitsId = bitsId;
        return bitsId;
      }, (err) => {
        return this._generateId()
        .then((bitsId) => {
          this._bitsId = bitsId;
          return this._writeBitsId(bitsId);
        });
      });
    }

    _generateId() {
      // try node.js os.hostname first
      let hostname = os.hostname();
      // if that doesn't work try the HOSTNAME environment variable
      if (!hostname) {
        hostname = process.env.HOSTNAME;
      }
      // if we now have a hostname return it as a resolved promise,
      // otherwise fall-back to the original behaviour that uses
      // the hostname command. The hostname command is not portable
      // and isn't guaranteed to exist on Linux.
      if (hostname) {
        return Promise.resolve(hostname);
      } else {
        const command = 'hostname';
        const args = [];
        const options = {};

        return UtilChildProcess.spawn(command, args, options)
        .then((results) => {
          if (0 === results.code) {
            const output = results.stdout.reduce((output, line) => output + line.trim(), '');
            return output;
          } else {
            return Promise.reject(new Error('Failed to get the bits id'));
          }
        }).catch((err) => {
          return Promise.reject(new Error('Failed to get the bits id'));
        });
      }
    }

    _writeBitsId(bitsId) {
      const data = {
        bitsId: bitsId,
        timestamp: Date.now(),
      };
      return UtilFs.writeFile(BITS_ID_DATA_JSON, JSON.stringify(data), 'utf8');
    }
  }

  module.exports = BitsId;
})();
