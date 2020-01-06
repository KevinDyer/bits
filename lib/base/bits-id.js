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
  const os = require('os');
  const path = require('path');
  const {spawn} = require('@lgslabs/child-process-promise');

  class BitsId {
    getBitsId() {
      return this._bitsId;
    }

    load() {
      const baseDataDir = path.join(global.paths.data, './base');
      const bitsIdJsonFilepath = path.join(baseDataDir, './bitsId.json');
      return BitsFs.mkdirp(baseDataDir).catch((err) => {})
      .then(() => this._getBitsId({filepath: bitsIdJsonFilepath}));
    }

    _getBitsId({filepath}) {
      return BitsFs.readJSON(filepath)
      .then((data) => {
        const bitsId = data.bitsId;
        this._bitsId = bitsId;
        return bitsId;
      }, (err) => {
        return this._generateId()
        .then((bitsId) => {
          this._bitsId = bitsId;
          return this._writeBitsId({bitsId, filepath});
        });
      });
    }

    _generateId() {
      let hostname = os.hostname();

      if (!hostname) {
        hostname = process.env.HOSTNAME;
      }

      if (hostname) {
        return Promise.resolve(hostname);
      } else {
        const command = 'hostname';
        const args = [];
        const options = {};

        return spawn(command, args, options)
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

    _writeBitsId({bitsId, filepath}) {
      const data = {
        bitsId: bitsId,
        timestamp: Date.now(),
      };
      return BitsFs.writeFile(filepath, JSON.stringify(data), 'utf8');
    }
  }

  module.exports = BitsId;
})();
