(() => {
  'use strict';

  const path = require('path');
  const LazyRequireLoader = require('../../lib/utils/lazy-require-loader');
  const TestApi = require('../mocks/test-api');

  const FILEPATH_TEST_API = path.join(__dirname, '../mocks/test-api');

  describe('LazyRequireLoader', () => {
    describe('add', () => {
      let loader = null;
      beforeEach(() => {
        loader = new LazyRequireLoader();
      });

      function createLoaderAdd(prop, filepath) {
        return function() {
          return loader.add(prop, filepath);
        };
      }

      it('should add property to loader', () => {
        loader.add('TestApi', FILEPATH_TEST_API);
        expect(loader.TestApi).toBe(TestApi);
      });

      it('should throw error if prop is not a string', () => {
        expect(createLoaderAdd()).toThrow('prop must be a non-empty string');
        expect(createLoaderAdd(false)).toThrow('prop must be a non-empty string');
        expect(createLoaderAdd(42)).toThrow('prop must be a non-empty string');
        expect(createLoaderAdd(null)).toThrow('prop must be a non-empty string');
        expect(createLoaderAdd({})).toThrow('prop must be a non-empty string');
        expect(createLoaderAdd(function() {})).toThrow('prop must be a non-empty string');
      });

      it('should throw error if filepath is not a string', () => {
        expect(createLoaderAdd('TestApi')).toThrow(/must be of type string/);
      });

      it('should throw error if filepath is not an absolute path', () => {
        expect(createLoaderAdd('TestApi', './test')).toThrow('filepath must be an absolute path');
      });
    });

    describe('remove', () => {
      let loader = null;
      beforeEach(() => {
        loader = new LazyRequireLoader();
        loader.add('TestApi', FILEPATH_TEST_API);
      });

      function createLoaderRemove(prop) {
        return function() {
          return loader.remove(prop);
        };
      }

      it('should delete property', () => {
        loader.remove('TestApi');
        expect(loader.TestApi).not.toBeDefined();
      });

      it('should throw error if prop is not a string', () => {
        expect(createLoaderRemove()).toThrow('prop must be a non-empty string');
        expect(createLoaderRemove(false)).toThrow('prop must be a non-empty string');
        expect(createLoaderRemove(42)).toThrow('prop must be a non-empty string');
        expect(createLoaderRemove(null)).toThrow('prop must be a non-empty string');
        expect(createLoaderRemove({})).toThrow('prop must be a non-empty string');
        expect(createLoaderRemove(function() {})).toThrow('prop must be a non-empty string');
      });
    });
  });
})();
