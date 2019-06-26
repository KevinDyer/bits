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

  const Api = require('./api');
  const logger = require('@lgslabs/bits-logger').getLogger();
  const multer = require('multer');
  const os = require('os');
  const {CrudRouter} = require('@lgslabs/bits-memory-crud');

  class ModuleRouter extends CrudRouter {
    _addRoutes() {
      super._addRoutes();
      const storage = multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, os.tmpdir());
        },
      });

      const upload = multer({storage: storage});
      this._router.post('/module-packages', upload.any(), (...data) => this._upload(...data));
    }

    _addResources({messageCenter}) {
      this._api = new Api(messageCenter);
    }

    _upload(req, res, next) {
      if (!Array.isArray(req.files) || 0 >= req.files.length) {
        logger.error('Module Package API hit with no Module Package');
        res.status(400).json({
          success: false,
          error: {
            name: 'Error',
            message: 'Must have module package(s)',
          },
        });
        return;
      } else {
        const files = req.files;
        Promise.all(files.map((file) => this._api.installModule(file)))
        .then(() => {
          res.status(200).json({
            success: true,
          });
        })
        .catch((err) => {
          logger.error('Error handling upload of module', err);
          next(new Error('unable to process module'));
        });
      }
    }
  }

  module.exports = ModuleRouter;
})();
