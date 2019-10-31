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

  const ModuleManager = require('../../lib/modules/manager');

  describe('Module Manager', () => {
    const messageCenter = require('@lgslabs/bits-message-center/test/mocks/message-center');
    let moduleManager = null;

    beforeEach(() => {
      moduleManager = new ModuleManager();
    });

    describe('loading', () => {
      it('should load', () => {
        return moduleManager.load({messageCenter});
      });

      it('should unload', () => {
        return moduleManager.load({messageCenter})
        .then(() => moduleManager.unload({messageCenter}));
      });
    });

    describe('operation', () => {
      beforeEach(() => {
        return moduleManager.load({messageCenter});
      });

      it('should load modules', () => {
        return moduleManager.loadModules();
      });
    });

    describe('graph construction', () => {
      const MODULES_MISSING_DEPENDENCY = [{
        name: 'A',
        id: 0,
      }, {
        name: 'B',
        id: 1,
        dependencies: {'C': '^1.0.0'},
      }];
      const MODULES_SUCCESS = [{
        name: 'A',
        id: 0,
      }, {
        name: 'B',
        id: 1,
        dependencies: {
          'A': '^1.0.0',
        },
      }];

      it('should fail to load module B because of missing dependency', () => {
        const graph = moduleManager._generateDependencyGraph(MODULES_MISSING_DEPENDENCY);
        const nodes = graph.getNodes();
        const nodeB = nodes.find((node) => node.getContent().name === 'B');
        expect(nodeB).toBeDefined();
        expect(nodeB.getContent().missingDependency).toBe('C');

        const edges = graph.getEdges();
        const edgeBDne = edges.find((edge) => edge.getNodeStart().getContent().name === 'B' && edge.getNodeEnd().getContent().id === 'DNE');
        expect(edgeBDne).toBeDefined();
      });

      it('should generate complete graph', () => {
        const graph = moduleManager._generateDependencyGraph(MODULES_SUCCESS);
        const nodes = graph.getNodes();
        const nodeB = nodes.find((node) => node.getContent().name === 'B');
        expect(nodeB).toBeDefined();
        expect(nodeB.getContent().missingDependency).not.toBeDefined();

        const edges = graph.getEdges();
        const edgeBDne = edges.find((edge) => edge.getNodeStart().getContent().name === 'B' && edge.getNodeEnd().getContent().name === 'A');
        expect(edgeBDne).toBeDefined();
      });
    });
  });
})();
