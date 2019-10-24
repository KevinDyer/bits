/*!
Copyright 2019 LGS Innovations

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http: //www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

(() => {
  'use strict';

  // const AuthApi = require('../auth/auth-api');
  // const bodyParser = require('body-parser');
  // const EventEmitter = require('events');
  // const express = require('express');
  // const logger = global.LoggerFactory.getLogger();
  // const passport = require('passport');
  // const Router = express.Router;
  // const UserApi = require('../users/user-api');

  // const strategies = ['bearer'];

  // function getAuthMiddleware() {
  //   return {auth: true, func: passport.authenticate(strategies, {session: false})};
  // }

  class CrudRouter {
    load() {
      return Promise.resolve();
    }
    // constructor(manager, {readScopes=null, writeScopes=null, routePath}) {
    //   this._manager = manager;

    //   this._readScopes = readScopes;
    //   this._writeScopes = writeScopes;
    //   this._routePath = routePath;

    //   this._router = new Router();
    //   this._router.use(bodyParser.urlencoded({extended: false}));
    //   this._router.use(bodyParser.json());

    //   this._router.post('/create', this._create.bind(this));
    //   this._router.post('/update', this._update.bind(this));
    //   this._router.post('/delete', this._delete.bind(this));
    //   this._router.get('/count', this._count.bind(this));
    //   this._router.get('/get/:id', this._get.bind(this));
    //   this._router.get('/', this._list.bind(this));
    // }

    // _prepareResult({result, messages=[], errors=[]}={}) {
    //   return Promise.resolve({
    //     success: (result ? true : false),
    //     messages: messages,
    //     errors: errors,
    //     result: result,
    //   });
    // }

    // _create(req, res, next) {
    //   return Promise.resolve()
    //   .then(() => this.__getUserFromToken(req))
    //   .then(({user}) => {
    //     if (!user) return Promise.reject(new Error('auth/no-user'));

    //     return Promise.resolve()
    //     .then(() => this.__checkPermissions(user, 'write'))
    //     .then(() => {
    //       const items = this.__fromBody(req, 'items');
    //       return this._manager.create(items);
    //     })
    //     .then((results) => this._prepareResult({result: results}))
    //     .then((result) => res.status(200).json(result));
    //   })
    //   .catch(next);
    // }

    // _update(req, res, next) {
    //   return Promise.resolve()
    //   .then(() => this.__getUserFromToken(req))
    //   .then(({user}) => {
    //     if (!user) return Promise.reject(new Error('auth/no-user'));

    //     return Promise.resolve()
    //     .then(() => this.__checkPermissions(user, 'write'))
    //     .then(() => {
    //       const ids = this.__fromBody(req, 'ids');
    //       const update = this.__fromBody(req, 'update');
    //       return this._manager.update(ids, update);
    //     })
    //     .then((results) => this._prepareResult({result: results}))
    //     .then((result) => res.status(200).json(result));
    //   })
    //   .catch(next);
    // }

    // _delete(req, res, next) {
    //   return Promise.resolve()
    //   .then(() => this.__getUserFromToken(req))
    //   .then(({user}) => {
    //     if (!user) return Promise.reject(new Error('auth/no-user'));

    //     return Promise.resolve()
    //     .then(() => this.__checkPermissions(user, 'write'))
    //     .then(() => {
    //       const ids = this.__fromBody(req, 'ids');
    //       return this._manager.delete(ids);
    //     })
    //     .then((results) => this._prepareResult({result: results}))
    //     .then((result) => res.status(200).json(result));
    //   })
    //   .catch(next);
    // }

    // // this function is considered deprecated. Get should bind to the '/get/:id' route instead of
    // // assuming anything not a route is an id.
    // _wildcardMatch(req, res, next) {
    //   return Promise.resolve()
    //   .then(() => {
    //     logger.warn(`WARNING: use of deprecated route '/:id'. Use '/get/:id' instead.`);
    //     return this._get(req, res, next);
    //   });
    // }

    // _get(req, res, next) {
    //   return Promise.resolve()
    //   .then(() => this.__getUserFromToken(req))
    //   .then(({user}) => {
    //     if (!user) return Promise.reject(new Error('auth/no-user'));

    //     return Promise.resolve()
    //     .then(() => this.__checkPermissions(user, 'read'))
    //     .then(() => {
    //       if (!req.params) return Promise.reject(new Error('invalid request'));
    //       return this._manager.get(req.params.id);
    //     })
    //     .then((results) => this._prepareResult({result: results}))
    //     .then((result) => res.status(200).json(result));
    //   })
    //   .catch(next);
    // }

    // _list(req, res, next) {
    //   return Promise.resolve()
    //   .then(() => this.__getUserFromToken(req))
    //   .then(({user}) => {
    //     if (!user) return Promise.reject(new Error('auth/no-user'));

    //     return Promise.resolve()
    //     .then(() => this.__checkPermissions(user, 'read'))
    //     .then(() => {
    //       const query = (req.query && req.query.query ? JSON.parse(req.query.query) : {});
    //       const options = (req.query && req.query.options ? JSON.parse(req.query.options) : {});
    //       return this._manager.list(query, options);
    //     })
    //     .then((results) => this._prepareResult({result: results}))
    //     .then((result) => res.status(200).json(result));
    //   })
    //   .catch(next);
    // }

    // _count(req, res, next) {
    //   return Promise.resolve()
    //   .then(() => this.__getUserFromToken(req))
    //   .then(({user}) => {
    //     if (!user) return Promise.reject(new Error('auth/no-user'));

    //     return Promise.resolve()
    //     .then(() => this.__checkPermissions(user, 'read'))
    //     .then(() => {
    //       const query = (req.query && req.query.query ? JSON.parse(req.query.query) : {});
    //       return this._manager.count(query);
    //     })
    //     .then((count) => this._prepareResult({result: count}))
    //     .then((result) => res.status(200).json(result));
    //   })
    //   .catch(next);
    // }

    // load(messageCenter, baseServer) {
    //   // this is a deprecated call which treats the argument after '/' as a string. It only works
    //   // for get, count has its own route now. Until this call is removed from the code, a message
    //   // is printed in the warning log letting the caller know that they should use '/get/{$id}'
    //   // rather than '/${id}'
    //   // This route has to be added in the load function so that classes inheriting from this one
    //   // can add their own routes in their constructors.
    //   this._router.get('/:id', this._wildcardMatch.bind(this));
    //   this._baseServer = baseServer;

    //   this._authApi = new AuthApi(messageCenter);
    //   this._userApi = new UserApi(messageCenter);

    //   return Promise.resolve()
    //   .then(() => {
    //     // Add here so the class can be extended/routes added before error handlers
    //     this._router.use(this._logErrors.bind(this));
    //     this._router.use(this._errorHandler.bind(this));
    //   })
    //   .then(() => {
    //     if (this._baseServer instanceof EventEmitter) {
    //       this._baseServer.on('base-server-strategy-used', ({name}) => {
    //         strategies.push(name);
    //         this._baseServer.updateAuthStrategy(this._routePath, getAuthMiddleware());
    //       });

    //       this._baseServer.on('base-server-strategy-unused', ({name}) => {
    //         const index = strategies.findIndex((n) => n === name);
    //         if (0 <= index) {
    //           strategies.splice(index, 1);
    //           this._baseServer.updateAuthStrategy(this._routePath, getAuthMiddleware());
    //         } else {
    //           logger.warn('No such strategy in place', name);
    //         }
    //       });

    //       return this._baseServer.use(this._routePath, getAuthMiddleware());
    //     }
    //   })
    //   .then(() => this._baseServer.use(this._routePath, this._router));
    // }

    unload() {
      return Promise.resolve();
    //   .then(() => this._baseServer.removeMiddleware(this._routePath, this._router))
    //   .then(() => {
    //     this._authApi = null;
    //     this._baseServer = null;
    //     this._routePath = null;
    //     this._router = null;
    //   });
    }

    // _logErrors(err, req, res, next) {
    //   logger.error('Router error occured! %s', err.message, {
    //     error: err.toString(),
    //     status: err.status || 500,
    //     name: err.name,
    //     message: err.message,
    //   });
    //   logger.error(err.stack);
    //   next(err);
    // }

    // _errorHandler(err, req, res, next) {
    //   let status = 500;
    //   if (Number.isInteger(err.status)) {
    //     res.status(err.status);
    //     status = err.status;
    //   } else {
    //     res.status(500);
    //   }
    //   this._prepareResult({errors: [{code: status, message: err.message}]})
    //   .then((result) => res.json(result));
    // }

    // __fromBody(req, key) {
    //   if (!req.body.hasOwnProperty(key)) {
    //     return Promise.reject(new Error('invalid request'));
    //   }
    //   return req.body[key];
    // }

    // __checkPermissions(user, accessType) {
    //   return Promise.resolve()
    //   .then(() => {
    //     if (null === user.scopes) return true;

    //     const userScopes = user.scopes.map((scope) => scope.name);
    //     const scopes = this[`_${accessType}Scopes`];

    //     if (undefined === scopes) {
    //       return Promise.reject(new Error('invalid access-type'));
    //     }
    //     return scopes.every((scope) => userScopes.includes(scope));
    //   })
    //   .then((allowed) => {
    //     if (!allowed) {
    //       return Promise.reject(new Error('auth/unauthorized'));
    //     }
    //   });
    // }

    // __getUserFromToken(req) {
    //   if (!req.headers.authorization) return Promise.reject(new Error('router/invalid token'));

    //   const token = req.headers.authorization.split(' ').splice(1).join(' ');
    //   return this._authApi.validateAccessToken({token});
    // }
  }

  module.exports = CrudRouter;
})();
