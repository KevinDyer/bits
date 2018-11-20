/**
Copyright 2017 LGS Innovations

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
  const UtilFs = require('../helpers/fs');
  const Certificate = require('../utils/certificate');
  const LoggerFactory = require('../logging/logger-factory');
  const CertificatesMessenger = require('./certificate-messenger');
  const logger = LoggerFactory.getLogger();

  let DEFAULT_BASE = '/tmp';
  let DEFAULT_CERTS_DIR = path.resolve(DEFAULT_BASE, 'base');

  if (global.paths && global.paths.data) {
    DEFAULT_BASE = path.resolve(global.paths.data, 'base');
    DEFAULT_CERTS_DIR = path.resolve(DEFAULT_BASE, 'certs');
  }

  // NOTE: In the future we could have multiple CA files so we chose the plural form
  const CA_DIR = path.resolve(DEFAULT_BASE, 'certificate-authorities');
  // TODO: In the future we could have multiple CA files so this should go away in favor of a CRUD, Settings, or KeyValue Manager
  const CA_FILE = path.resolve(CA_DIR, 'ca.crt');

  /**
   * CertManager maintains an array of TLS @see {@link Certificate} objects
   * each representing a unique TLS certificate stored on the filesystem.
   * @class
   */
  class CertManager {
    constructor(certsDir) {
      this._certs = [];
      this._certsDir = (certsDir ? certsDir : DEFAULT_CERTS_DIR);
      this._messenger = new CertificatesMessenger(this);
    }

    load(messageCenter) {
      return Promise.resolve()
      .then(() => UtilFs.ensureDirectoryExists(DEFAULT_BASE))
      .then(() => this._readCertsDir(this._certsDir))
      // TODO: probably swap _mkdir(CA_DIR) for _readCertsDir(CA_DIR) once we populate with CA's
      .then(() => UtilFs.ensureDirectoryExists(CA_DIR))
      .then(() => this._messenger.load(messageCenter));
    }

    /**
     * Makes the directory if it doesn't exist and adds all certs from that directory to
     * this instance of CertManager.
     * @param {String} dir - Path to certificate directory to create and populate
     * @return {Promise}
     */
    _readCertsDir(dir) {
      return Promise.resolve()
      .then(() => UtilFs.ensureDirectoryExists(dir))
      .then(() => this._addCertsFromCertsDirectory(dir))
      .catch((err) => logger.error('(CertManager) Unable to load certs', err));
    }

    /**
     * Recursively finds all files in a directory with .crt extension and adds them
     * to the array of certs maintained by this instance of CertManager.
     * @see {@link CertManager.addCertFromFilepath}
     * @see {@link CertManager.addCertFromFilepath}
     * @see {@link Certificate}
     * @param {String} certsDir - Path to directory containting certificates
     * @return {Promise}
     */
    _addCertsFromCertsDirectory(certsDir) { // recursively searches directory for .crt files
      return UtilFs.readdir(certsDir)
      .then((filenames) => {
        return filenames.filter((item) => !(/(^|\/)\.[^\/\.]/g).test(item)); // no hidden files/dirs
      })
      .then((filenames) => {
        return filenames.reduce((promise, filename) => {
          return promise.then(() => {
            const filepath = path.resolve(certsDir, filename);
            return UtilFs.stat(filepath)
            .then((ret) => {
              if (ret.isDirectory()) {
                return this._addCertsFromCertsDirectory(filepath);
              } else {
                const ext = filename.substr(filename.lastIndexOf('.'));
                if (ext === '.crt') {
                  return this.addCertFromFilepath(filepath);
                }
              }
            });
          })
          .then(null, (err) => {
            logger.error('Failed to add cert %s: %s', filename, err.toString());
          });
        }, Promise.resolve());
      });
    }

    getCertByHash(hash) {
      const cert = this._certs.find((cert) => cert.getHash() === hash);
      if (cert) {
        return cert;
      } else {
        return null;
      }
    }

    getCertByPath(path) {
      const matches = this._certs.filter((cert) => cert.getFilepath() === path);
      if (0 < matches.length) {
        return matches[0];
      } else {
        return null;
      }
    }

    addCertFromFilepath(filepath, {copy=false}={}) {
      return Certificate.fromFile(filepath)
      .then((cert) => {
        const dupCert = this.getCertByHash(cert.getHash());
        if (dupCert) {
          return Promise.reject(new Error('certs/duplicate-cert'));
        }
        this._certs.push(cert);
        if (copy) {
          const dst = path.resolve(this._certsDir, path.basename(filepath));
          return UtilFs.copyFile(filepath, dst)
          .then(() => cert.setFilepath(dst))
          .then(() => cert);
        }
        return cert;
      });
    }

    removeCertByHash(hash) {
      const cert = this.getCertByHash(hash);
      if (!cert) {
        return Promise.reject(new Error('certs/cert-not-found'));
      }
      const index = this._certs.indexOf(cert);
      this._certs.splice(index, 1);
      return Promise.resolve(cert);
    }

    getCertList() {
      return Promise.resolve(this._certs);
    }

    getDeviceServerCert() {
      return this.getCertList()
      .then((certs) => {
        const matches = certs.filter((cert) => {
          const keyName = path.basename(cert.path, '.crt');
          return 'device-server' === keyName;
        });

        if (0 < matches.length) {
          return matches[0];
        } else {
          return null;
        }
      });
    }

    getDeviceClientCert() {
      return this.getCertList()
      .then((certs) => {
        const matches = certs.filter((cert) => {
          const keyName = path.basename(cert.path, '.crt');
          return 'device-client' === keyName;
        });

        if (0 < matches.length) {
          return matches[0];
        } else {
          return null;
        }
      });
    }

    reloadCerts() {
      this.clearCerts();
      this._addCertsFromCertsDirectory(this._certsDir);
    }

    clearCerts() {
      this._keys = [];
    }

    create({filepath=null}={}) {
      return this.addCertFromFilepath(filepath, {copy: true});
    }

    list() {
      return this.getCertList();
    }

    delete({hash=null}={}) {
      return this.removeCertByHash(hash)
      .then((cert) => UtilFs.unlink(cert.getFilepath()));
    }

    /**
     * Finds the ca.crt file in the certificate-authorities directory
     * and extracts the text content of the cert.
     * @return {Promise<String[]>} A promise that resolves to an array containing a single entry which is the string value of ca.crt
     */
    getTrustedAuthorities() {
      // TODO: In the future we will have metadata associated with each authority and will only return the entries that have isTrusted == true
      // TODO: In the future it may be advantageous to cache the contents of the trusted authorities in memory for faster access rather than reading from disk each time however we do have limited memory on some devices
      return Promise.resolve()
      .then(() => UtilFs.readFile(CA_FILE))
      .then((certificateContents) => {
        return [certificateContents];
      });
    }

    static get Cert() {
      return Certificate;
    }

    get Cert() {
      return CertManager.Cert;
    }
  }

  module.exports = CertManager;
})();
