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

  const os = require('os');

  const BitsId = require('../../lib/base/bits-id');

  describe('BitsId', () => {
    let bitsId = null;

    beforeEach(() => {
      bitsId = new BitsId();
    });

    describe('checkGenerateId', () => {
      it('should return the equivalent to os.hostname', () => {
        expect(bitsId._generateId()).resolves.toBe(os.hostname());
      });
    });
  });
})();
