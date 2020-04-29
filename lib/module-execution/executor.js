/*!
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
*/

(() => {
  'use strict';

  const parseArgs = require('minimist');
  const args = parseArgs((process.env.argv ? JSON.parse(process.env.argv) : process.argv), {
    default: {execType: 'thread', uniform: false},
    alias: {execType: ['e']}, uniform: ['uniform'],
    boolean: ['uniform'],
  });

  function __getDefaultType() {
    const execType = args.execType.toLowerCase();
    if (true === args.uniform) return execType;
    const {env: {mod=''}={}} = process;
    if (undefined === mod) return execType;
    try {
      if (mod.length === 0) return execType;
      const {executor: {type: moduleType}={}} = JSON.parse(mod);
      if (undefined === moduleType) return execType;
      return String(moduleType).toLowerCase();
    } catch (err) {
      return execType;
    }
  }

  function __getExecutor(execType) {
    let Executor = null;
    switch (execType) {
      case 'process':
        Executor = require('./types/cluster-executor');
        break;
      default:
        Executor = require('./types/worker-thread-executor');
        break;
    }
    return new Executor();
  }

  function getExecutor(messageCenter=null, execType = 'default') {
    if (true === args.uniform) return executors.default;
    execType = String(execType).toLowerCase();
    if (!executors.hasOwnProperty(execType)) throw new Error('invalid executor');
    if (null !== executors[execType]) return executors[execType];
    if (null === messageCenter) throw new Error('invalid message center');
    const executor = __getExecutor(execType);
    messageCenter.addResource(executor);
    executors[execType] = executor;
    return executor;
  }

  function getAllExecutors() {
    return Object.entries(executors)
    .filter(([key, executor]) => ('default' !== key && null !== executor))
    .map(([key, executor]) => executor);
  }

  const defaultType = __getDefaultType();
  const executors = {
    get default() {
      return this[defaultType];
    },
    process: null,
    thread: null,
  };

  executors[defaultType] = __getExecutor(defaultType);
  if (executors.default.isMaster) {
    // if master instantiate all executors for message center
    Object.keys(executors).filter((key) => null === key).forEach((key) => {
      executor[key] = __getExecutor(key);
    });
  }

  module.exports = getExecutor();
  module.exports.getExecutor = getExecutor;
  module.exports.getAllExecutors = getAllExecutors;
})();
