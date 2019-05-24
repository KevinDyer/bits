#!/usr/bin/env node
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

  const Environment = require('./environment');
  const ErrorLog = require('./error-logger');
  const Helper = require('./helper');
  const logger = require('./simple-logger');
  const parseArgs = require('minimist');
  const path = require('path');
  const UpgradeServer = require('./upgrade-server');
  const UpgradeScript = require('./upgrade-script');

  const args = parseArgs(process.argv, {
    default: {
      rootBaseDir: '/opt/bits/',
      rootDataDir: '/var/bits',
      target: '',
      help: false,
      logLevel: 'info', // error=0, warn=1, info=2, verbose=3, debug=4, silly=5
      outputFile: '/tmp/upgrade-output-file.log',
      noserver: false,
    },
    alias: {
      rootBaseDir: ['P', '-base'],
      rootDataDir: ['d', '-data'],
      target: ['t', '-target'],
      help: ['h', '-help'],
      logLevel: ['l', '-level'],
      outputFile: ['o', '-output'],
      noserver: ['n', '-noserver'],
    },
  });

  if (args.help) {
    printUsage();
  }
  if (!args.rootBaseDir) {
    logger.error('ERROR: no base dir specified');
    printUsage();
  } else {
    logger.info('Base dir: ' + args.rootBaseDir);
  }
  if (!args.rootDataDir) {
    logger.error('ERROR: no data dir specified');
    printUsage();
  } else {
    logger.info('Data dir: ' + args.rootDataDir);
  }
  if (!args.target) {
    logger.error('ERROR: need to supply new base ROMG');
    printUsage();
  } else {
    logger.info('Target: ' + args.target);
  }
  const validLevels = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'];
  if (validLevels.includes(args.logLevel)) {
    logger.level = args.logLevel;
  } else {
    logger.error('ERROR: invalid log level provided (' + args.logLevel + ')');
    printUsage();
  }

  // Set initial Globals
  const global = {};
  global.paths = {};
  global.paths.data = args.rootDataDir;
  global.paths.base = args.rootBaseDir;

  // Initialize our "environment"
  const logFileDate = Helper.date();
  Environment.set('BASE_DIR', args.rootBaseDir);
  Environment.set('DATA_DIR', args.rootDataDir);
  Environment.set('TARGET', args.target);
  Environment.set('LOG', args.outputFile);
  Environment.set('ERROR_LOG', '/tmp/upgrade-errors-' + logFileDate + '.log');
  Environment.set('DATE', logFileDate);
  Environment.set('YARN_INSTALL_ERROR', 0);
  Environment.setIfNotExist('BACKUP_DIR', path.join(Environment.get('BASE_DIR'), 'upgrade-' + logFileDate));
  Environment.setIfNotExist('TARGET_EXTRACT', path.join(Environment.get('BACKUP_DIR'), 'extract'));

  // default upgrade script status handlers
  this._nameHandler = function() {}; // _nameHandlerFunction;
  this._progressHandler = function() {}; // _progressHandlerFunction;
  this._statusHandler = function() {}; // _statusHandlerFunction;
  this._upgradeServer = null;

  // here is the core process
  this._upgradeScript = new UpgradeScript();
  Promise.resolve()
  .then(() => Helper.appendToLog('* Initializing BITS Upgrade (v2)'))
  .then(() => logger.debug('*** Starting the core upgrade process'))
  .then(() => Helper.whoami())
  .then(() => UpgradeScript.configureEnvironment())
  .then(() => UpgradeScript.stopBitsServer())
  .then(() => logger.debug('BITS Server Stopped'))
  .then(() => {
    if (!args.noserver) {
      // Create server instance
      return Helper.appendToLog('* Launching UpgradeServer(' + args.rootBaseDir + ', ' + args.rootDataDir + ')')
      .then(() => this._upgradeServer = new UpgradeServer(args.rootBaseDir, args.rootDataDir))
      .then(() => this._upgradeServer.load())
      .then(() => {
        this._nameHandler = this._upgradeServer.sendActionName.bind(this._upgradeServer);
        this._progressHandler = this._upgradeServer.sendActionProgress.bind(this._upgradeServer);
        this._statusHandler = this._upgradeServer.sendActionStatus.bind(this._upgradeServer);
      });
    }
  })
  .then(() => {
    return Helper.appendToLog('* Starting UpgradeScript()')
    .then(() => this._upgradeScript.performUpgrade(
      this._nameHandler,
      this._progressHandler,
      this._statusHandler
    ));
  })
  .catch((err) => {
    logger.error('Core process|' + Helper.objectToString(err));
    return ErrorLog.append('App.core start: ' + err);
  })
  .then(() => this._upgradeScript.finish())
  .then(() => {
    if (this._upgradeServer) {
      logger.debug('Send Reload Command');
      this._upgradeServer.sendActionReload();
    }
    return Promise.resolve();
  })
  .then(() => {
    if (this._upgradeServer) {
      logger.debug('Close Upgrade Server');
      this._upgradeServer.close();
    }
    return Promise.resolve();
  })
  .then(() => UpgradeScript.startBitsServer())
  .then(() => {
    logger.debug('SUCCESS in Core Process');
    process.exit(Environment.get('YARN_INSTALL_ERROR'));
  })
  .catch((err) => {
    logger.debug('FAILURE in Core Process: ', err);
    return ErrorLog.append('App.core end: ' + err)
    .then(() => {
      process.exit(-1);
    });
  });

  function printUsage() {
    /* eslint-disable no-console */
    console.log('BITS Upgrade Script - usage:');
    console.log('  node upgrade-app.js -P BASE -d DATA -t TARGET [-h] [-l LEVEL] [-n] [-o FILE]');
    console.log('where:');
    console.log('  -P,--base BASE: use BASE as the BITS base directory');
    console.log('  -d,--data DATA: use DATA as the BITS data directory');
    console.log('  -t,--target TARGET: use TARGET as the target ROMG file');
    console.log('  -o,--output FILE: use FILE as the log file for the upgrade');
    console.log('  -h,--help: show this usage text');
    console.log('  -l,--level LEVEL: set log level to LEVEL, where LEVEL is one of:');
    console.log('     error, warn, info, verbose, debug (default is info)');
    console.log('  -n,--noserver: Do not start the BITS Upgrade web server');
    /* eslint-enable no-console */
    process.exit(1);
  }
})();
