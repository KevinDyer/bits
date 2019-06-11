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

  const path = require('path');
  const UtilCrypto = require('./../utils/crypto');
  const UtilsFs = require('@lgslabs/bits-fs');

  const EXT_PUBLIC = '.pub';
  const EXT_PRIVATE = '.pem';

  const TYPE_PUBLIC = 'public';
  const TYPE_PRIVATE = 'private';
  const TYPE_UNKNOWN = 'unknown';

  /**
   * Represents an SSL/PKI key
   * @class
   */
  class Key {
    /**
     * Create an instance
     * @constructor
     * @param {String} filepath - Path to the key on disk
     * @param {String} type - One of the type constants: Key.TYPE_PUBLIC, Key.TYPE_PRIVATE, Key.TYPE_UNKNOWN
     * @param {String} hash - The hash of the keyfile
     */
    constructor(filepath, type, hash) {
      this._filepath = filepath;

      this._type = type;

      if (Buffer.isBuffer(hash)) {
        hash = hash.toString('hex');
      }
      if ('string' !== typeof (hash) || 0 >= hash.length) {
        throw new TypeError('hash must be a non-empty string');
      }
      this._hash = hash;
      this.name = this.getFileName(); // Because we can no longer pass references aroung :/
    }

    getFilepath() {
      return this._filepath;
    }

    setFilepath(filepath) {
      this._filepath = filepath;
    }

    getType() {
      return this._type;
    }

    getHash() {
      return this._hash;
    }

    isPublic() {
      return UtilCrypto.TYPE_PUBLIC === this.getType();
    }

    isPrivate() {
      return UtilCrypto.TYPE_PRIVATE === this.getType();
    }

    getDisplayName() {
      return path.basename(this.getFilepath(), (this.isPublic() ? EXT_PUBLIC : EXT_PRIVATE));
    }

    getFileName() {
      return path.basename(this.getFilepath());
    }

    /**
     * Get the contents of this key file from disk.
     * Reads the file specified by this instance of @see {@link Key}
     * @return {String} A string representing the contents of the key file
     * @example
     * // Get the key data for use with an SSL connection or PKI request
     * return Promise.resolve()
     * .then(() => this._keyApi.getDevicePrivateKey())
     * .then((keyJson) => KeyApi.fromJson(keyJson))
     * .then((key) => key.getContents());
     */
    getContents() {
      return UtilsFs.readFile(this._filepath);
    }

    get path() {
      return this.getFilepath();
    }

    get type() {
      const extname = path.extname(this.getFilepath());
      if (EXT_PUBLIC === extname || this.isPublic()) {
        return TYPE_PUBLIC;
      } else if (EXT_PRIVATE === extname || this.isPrivate()) {
        return TYPE_PRIVATE;
      } else {
        return TYPE_UNKNOWN;
      }
    }

    static fromFile(filepath) {
      let type = null;
      return Key._calculateType(filepath)
      .then((t) => {
        type = t;
        return UtilCrypto.calculateHashOfFile(filepath);
      })
      .then((hash) => {
        return new Key(filepath, type, hash);
      });
    }

    /**
     * Converts the JSON representation of this class into a an instance of this class.
     * Useful when requesting key information with the @see {@link KeyApi} since
     * that API returns a class represented in JSON over the @see {@link MessageCenter}.
     * @param {String} keyJson - A JSON object that can be parsed into an instance of @see {@link Key}
     * @return {key} A new instance of key
     * @example
     * // returns a key instance
     * return Promise.resolve()
      .then(() => this._keyApi.getDevicePrivateKey())
      .then((keyJson) => KeyApi.fromJson(keyJson))
     */
    static fromJson(keyJson) {
      if (!keyJson || !keyJson._filepath) {
        return Promise.reject(new Error('(key) No JSON class definition or definition missing path'));
      }

      return Promise.resolve(Key.fromFile(keyJson._filepath));
    }

    static _calculateType(filepath) {
      return UtilCrypto.getTypeFromFile(filepath);
    }

    static get TYPE_PUBLIC() {
      return TYPE_PUBLIC;
    }

    static get TYPE_PRIVATE() {
      return TYPE_PRIVATE;
    }

    static get TYPE_UNKNOWN() {
      return TYPE_UNKNOWN;
    }

    static get EXT_PUBLIC() {
      return EXT_PUBLIC;
    }

    static get EXT_PRIVATE() {
      return EXT_PRIVATE;
    }
  }

  module.exports = Key;
})();
