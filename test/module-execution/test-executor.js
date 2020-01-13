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

  describe('Executor', () => {
    it('should return the correct types based on process.argv', () => {
      const argvs = ['-e', 'thread'];

      const cluster = () => {
        const {type: execType} = require('../../lib/module-execution/executor');
        expect(execType).toStrictEqual('cluster');
      };

      const thread = () => {
        jest.resetModules();

        if (Array.isArray(process.argv)) {
          process.argv.push(...argvs);
        } else {
          process.argv = argvs;
        }

        const {type: execType} = require('../../lib/module-execution/executor');
        expect(execType).toStrictEqual('thread');
      };

      const threadAsWorker = () => {
        jest.resetModules();

        process.env.argv = JSON.stringify(argvs);

        const {type: execType} = require('../../lib/module-execution/executor');
        expect(execType).toStrictEqual('thread');
      };

      cluster();
      thread();
      threadAsWorker();
    });
  });
})();
