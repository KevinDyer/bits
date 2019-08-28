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

  const SystemManager = require('../../lib/system/manager');
  const ChildProcessSpawn = require('@lgslabs/child-process-promise');

  describe('SystemManager', () => {
    let manager = null;

    beforeAll(() => {
      manager = new SystemManager();
    });

    describe('restart', () => {
      it(`should call 'spawn' with cmd='reboot'`, () => {
        jest.spyOn(ChildProcessSpawn, 'spawn').mockImplementationOnce((cmd) => {
          expect(cmd).toBe('reboot');
          return Promise.resolve();
        });
        expect(manager.restart()).resolves;
      });
    });

    describe('shutdown', () => {
      it(`should call 'spawn' with cmd='shutdown'`, () => {
        jest.spyOn(ChildProcessSpawn, 'spawn').mockImplementationOnce((cmd, args) => {
          expect(cmd).toBe('shutdown');
          expect(args).toEqual(expect.arrayContaining(['-h', 'now']));
          return Promise.resolve();
        });
        expect(manager.shutdown()).resolves;
      });
    });
  });
})();
