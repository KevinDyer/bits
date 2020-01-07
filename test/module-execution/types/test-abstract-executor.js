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

  const AbstractExecutor = require('../../../lib/module-execution/types/abstract-executor');

  describe('AbstractExecutor', () => {
    let abstractExecutor = null;

    beforeEach(() => {
      abstractExecutor = new AbstractExecutor();
    });

    it('should extend the EventEmitter', () => {
      const EventEmitter = require('events');
      expect(EventEmitter.prototype.isPrototypeOf(abstractExecutor)).toBeTruthy();
    });

    it('should return default values', () => {
      expect(abstractExecutor.isMaster).toStrictEqual(false);
      expect(abstractExecutor.isWorker).toStrictEqual(false);
      expect(abstractExecutor.type).toStrictEqual('');
    });
  });
})();
