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

  const winston = require('winston');
  const FORMAT_REG_EXP = (/%[scdjifoO%]/g);

  class Logger {
    constructor(options) {
      options = options || {};

      const transports = [];

      if ('string' === typeof (options.filename)) {
        transports.push(new winston.transports.File({
          filename: options.filename,
          maxFiles: 5,
          maxsize: 10 * 1024 * 1024, // 10 MB max size
          tailable: true,
          timestamp: true,
          colorize: true,
          prettyPrint: true,
          json: false,
          stringify: false,
        }));
      }

      transports.push(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.metadata(),
          winston.format.timestamp(),
          winston.format.simple(),
          winston.format.printf(({level, message, timestamp, metadata: {meta}}) => {
            let formattedMeta = formatMeta(meta);
            if (formattedMeta.length) formattedMeta = `\n${formattedMeta}`;
            return `${level.padEnd(16, ' ')}[${timestamp}] ${message}${formattedMeta}`;
          })
        ),
      }));

      this.logger = winston.createLogger({
        level: options.level,
        transports: transports,
      });
    }

    _runOnLogger(level, args) {
      const data = Array.from(args.slice(1));
      let message = args[0];
      let splat = [];
      if (FORMAT_REG_EXP.test(message)) {
        ({message, splat} = winston.format.splat().transform({level, message, splat: args.slice(1)}));
      }

      return this.logger[level](message, {meta: data.slice(splat.length)});
    }

    log(...args) {
      return this._runOnLogger('log', args);
    }

    error(...args) {
      return this._runOnLogger('error', args);
    }

    warn(...args) {
      return this._runOnLogger('warn', args);
    }

    info(...args) {
      return this._runOnLogger('info', args);
    }

    verbose(...args) {
      return this._runOnLogger('verbose', args);
    }

    debug(...args) {
      return this._runOnLogger('debug', args);
    }

    silly(...args) {
      return this._runOnLogger('silly', args);
    }

    set level(level) {
      this.logger.level = level;
    }

    get level() {
      return this.logger.level;
    }
  }

  function formatMeta(args) {
    if (!(Array.isArray(args) && args.length > 0)) return '';
    return args.map(format).join('\n');
  }

  function format(meta) {
    const pad = '      ';
    if ('object' === typeof meta) {
      return `${JSON.stringify(meta, null, 2).replace((/^(?!\s*$)/mg), pad)}`;
    }
    return `${pad}${meta}`;
  }

  module.exports = Logger;
})();
