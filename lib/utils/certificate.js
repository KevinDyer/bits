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
  const UtilsFs = require('@lgslabs/bits-fs');
  const {UtilCrypto} = require('@lgslabs/bits-crypto');

  const CERT_EXT = '.crt';

  /**
   * Represents an SSL certificate
   * @class
   */
  class Certificate {
    /**
     * Create a new instance
     * @constructor
     * @param {String} filepath - Path to the actual certificate on disk
     * @param {String} hash - Unique hash of the actual file on disk
     */
    constructor(filepath, hash) {
      this._filepath = filepath;

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

    getHash() {
      return this._hash;
    }

    getDisplayName() {
      return path.basename(this.getFilepath(), CERT_EXT);
    }

    getFileName() {
      return path.basename(this.getFilepath());
    }

    /**
     * Get the contents of this certificate file from disk.
     * Reads the file specified by this instance of @see {@link Certificate}
     * @return {String} A string representing the contents of the certificate file
     * @example
     * // Get the cert data for use with an SSL connection
     * return Promise.resolve()
     * .then(() => this._certificateApi.getDeviceClientCert())
     * .then((certificateJson) => Certificate.fromJson(certificateJson))
     * .then((cert) => cert.getContents());
     */
    getContents() {
      return UtilsFs.readFile(this._filepath);
    }

    get path() {
      return this.getFilepath();
    }

    static fromFile(filepath) {
      return UtilCrypto.calculateHashOfFile(filepath)
      .then((hash) => {
        return new Certificate(filepath, hash);
      });
    }

    /**
     * Converts the JSON representation of this class into a an instance of this class.
     * Useful when requesting cert information with the @see {@link CertificateApi} since
     * that API returns a class represented in JSON over the @see {@link MessageCenter}.
     * @param {String} certificateJson - A JSON object that can be parsed into an instance of @see {@link Certificate}
     * @return {Certificate} A new instance of certifcate
     * @example
     * // returns a Certificate instance
     * return Promise.resolve()
     * .then(() => this._certificateApi.getDeviceClientCert())
     * .then((certificateJson) => Certificate.fromJson(certificateJson))
     */
    static fromJson(certificateJson) {
      if (!certificateJson || !certificateJson._filepath) {
        return Promise.reject(new Error('(Certificate) No JSON class definition or definition missing path'));
      }

      return Promise.resolve(Certificate.fromFile(certificateJson._filepath));
    }
  }

  module.exports = Certificate;
})();
