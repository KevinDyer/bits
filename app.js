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

  const BaseService = require('./lib/base/service');
  const logger = require('@lgslabs/bits-logger').getLogger();
  const parseArgs = require('minimist');
  const path = require('path');
  const {isMaster, isWorker, type: execType} = require('./lib/module-execution/executor');

  if ('thread' === execType && isMaster) {
    process.chdir(__dirname);
  }

  const args = parseArgs((process.env.argv ? JSON.parse(process.env.argv) : process.argv), {
    default: {rootDataDir: path.join(__dirname, 'data')},
    alias: {rootDataDir: ['d'], modulesDir: ['m']},
  });

  if (!global.hasOwnProperty('paths')) {
    global.paths = {};
  }
  global.paths.base = __dirname;
  global.paths.data = args.rootDataDir;

  if (!args.modulesDir) {
    args.modulesDir = path.join(args.rootDataDir, 'base', 'modules', 'modules');
  }
  global.paths.modules = args.modulesDir;

  const baseService = new BaseService();

  if (isMaster) {
    global.paths.moduleDataDir = path.resolve(global.paths.data, 'base');

    process.on('uncaughtException', (err) => {
      if (err instanceof Error) {
        logger.error(`Uncaught exception occurred in BITS Master: ${err.message}`, err);
      } else {
        logger.error('Uncaught exception occurred without error:', err);
      }
    });

    process.on('unhandledRejection', (err) => {
      if (err instanceof Error) {
        logger.error(`Unhandled Rejection: ${err.message}`, err);
      } else {
        logger.error('Unhandled Rejection occurred without error:', err);
      }
    });
  } else if (isWorker) {
    const {name} = JSON.parse(process.env.mod);
    process.title += ` ${name}`;
    global.paths.moduleDataDir = path.resolve(global.paths.data, name);

    process.on('uncaughtException', (err) => {
      if (err instanceof Error) {
        logger.error(`Uncaught exception in module '${name}': ${err.message}`, err);
      } else {
        logger.error(`Uncaught exception in module '${name}' without error:`, err);
      }
    });

    process.on('unhandledRejection', (err) => {
      if (err instanceof Error) {
        logger.error(`Unhandled rejection in module '${name}': ${err.message}`, err);
      } else {
        logger.error(`Unhandled Rejection in module '${name}' without error:`, err);
      }
    });
  }

  baseService.load()
  .catch((err) => {
    logger.error('Caught error loading base service', err);
    process.exit(1);
  });
})();
