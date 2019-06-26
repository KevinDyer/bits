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
  const {Router} = require('@lgslabs/bits-core');

  class LoggingRouter extends Router {
    constructor(options) {
      super(options);
      this._tag = options.tag;
    }

    _loadApi(req, res, next) {
      if (req.user) {
        req.api = new Api(this._tag, this._messageCenter, {scopes: req.user.scopes});
      }
      next();
    }

    _addRoutes() {
      super._addRoutes();
      this._router.get('/:id/export', this._export.bind(this));
    }

    _export(req, res, next) {
      Promise.resolve()
      .then(() => this._manager.get(Number(req.params.id)))
      .then((item) => {
        return new Promise(function(resolve, reject) {
          res.download(item.filepath, item.filename, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
      })
      .catch(next);
    }
  }

  module.exports = LoggingRouter;
})();
