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

  const BitsFs = require('@lgslabs/bits-fs');
  const LazyRequireLoader = require('../../lib/utils/lazy-require-loader');
  const os = require('os');
  const path = require('path');

  const NOW = Date.now();

  require('@lgslabs/bits-logger').getLogger().level = 'silent';

  global.helper = global.helper || new LazyRequireLoader();

  global.paths = global.paths || {};
  global.paths = Object.assign(global.paths, {
    base: path.join(os.tmpdir(), `./${NOW}/base`),
    data: os.tmpdir(),
    modules: path.join(os.tmpdir(), `./${NOW}/modules`),
  });

  Object.keys(global.paths).forEach((key) => BitsFs.ensureDirectoryExists(global.paths[key]));
})();
