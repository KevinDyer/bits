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

  const WorkerThreadExecutor = require('../../../lib/module-execution/types/worker-thread-executor');
  const path = require('path');
  const {mkdirp, symlink} = require('@lgslabs/bits-fs');

  describe('WorkerThreadExecutor', () => {
    let workerThreadExecutor = null;

    beforeAll(async() => {
      try {
        await mkdirp(global.paths.base);
      } catch (err) {
        if ('EEXIST' !== err.code) throw err;
      }
      await symlink(path.resolve(__dirname, '../../setup/worker.js'), path.resolve(global.paths.base, './app.js'));
    });

    beforeEach(() => {
      workerThreadExecutor = new WorkerThreadExecutor();
    });

    it('should extend the AbstractExecutor', () => {
      const AbstractExecutor = require('../../../lib/module-execution/types/abstract-executor');
      expect(AbstractExecutor.prototype.isPrototypeOf(workerThreadExecutor)).toBeTruthy();
    });

    it('should emit a created, exit, and online events', async() => {
      const exitMockFn = jest.fn();
      const onlineMockFn = jest.fn();
      const worker = workerThreadExecutor.create({mod: JSON.stringify({id: 0})});

      workerThreadExecutor.on('online', async() => {
        onlineMockFn();
        await worker.kill();
      });

      workerThreadExecutor.on('exit', async() => {
        exitMockFn();

        expect(exitMockFn).toHaveBeenCalled();
        expect(onlineMockFn).toHaveBeenCalled();
      });
    });
  });
})();
