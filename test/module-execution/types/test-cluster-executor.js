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

  const ClusterExecutor = require('../../../lib/module-execution/types/cluster-executor');
  const path = require('path');
  const {settings} = require('cluster');

  const SIGNAL = 'SIGTERM';

  settings.exec = path.resolve(__dirname, '../../setup/worker.js');

  describe('ClusterExecutor', () => {
    let clusterExecutor = null;

    beforeEach(() => {
      clusterExecutor = new ClusterExecutor();
    });

    it('should extend the AbstractExecutor', () => {
      const AbstractExecutor = require('../../../lib/module-execution/types/abstract-executor');
      expect(AbstractExecutor.prototype.isPrototypeOf(clusterExecutor)).toBeTruthy();
    });

    it('should call __eventProxies from the constructor', () => {
      const eventProxiesSpy = jest.spyOn(ClusterExecutor.prototype, '__eventProxies');
      new ClusterExecutor();
      expect(eventProxiesSpy).toBeCalled();
    });

    it('should emit a created, disconnect, exit, and online events', async() => {
      const createdMockFn = jest.fn();
      const disconnectMockFn = jest.fn();
      const exitMockFn = jest.fn();
      const onlineMockFn = jest.fn();
      clusterExecutor.on('created', createdMockFn);
      clusterExecutor.on('disconnect', disconnectMockFn);

      const worker = await clusterExecutor.create();

      clusterExecutor.on('online', async() => {
        onlineMockFn();
        await worker.kill(SIGNAL);
      });

      clusterExecutor.on('exit', async() => {
        exitMockFn();

        expect(createdMockFn).toHaveBeenCalled();
        expect(disconnectMockFn).toHaveBeenCalled();
        expect(exitMockFn).toHaveBeenCalled();
        expect(onlineMockFn).toHaveBeenCalled();
      });
    });
  });
})();
