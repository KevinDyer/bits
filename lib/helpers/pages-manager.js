/**
 Copyright 2018 LGS Innovations

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

  const EventEmitter = require('events');
  const logger = global.LoggerFactory.getLogger();
  const {ResourceManager} = require('@skidder/bits-auto-discovery');

  const PRIORITY = {
    MIN: 0,
    MAX: 99
  };

  /**
   * PagesManager handles an in-memory list of html imports for populating a module's home screen through
   * base-drawer-layout.html or other iron-pages implementors. This class exposes an API for dynamically adding,
   * overriding, and sorting html resources of the module's home screen.
   * @class
   * @alias PagesManager
   */
  class PagesManager extends EventEmitter {
    /**
     * Create a new instance of PagesManager
     * @param {String} topic page resource topic to listen for
     * @param {Array} pages array of default page objects to use
     */
    constructor({topic=null}={}) {
      if (!topic) throw new Error('topic must be a non-empty string!');

      super();

      /**
       * ResourceManager for discovering pages
       * @see @link{@skidder/bits-auto-discovery}
       * @type {ResourceManager}
       * @private
       */
      this._resourceMgr = new ResourceManager({topic: topic});

      this._boundOnResourceAdded = this._onResourceAdded.bind(this);
      this._boundOnResourceRemoved = this._onResourceRemoved.bind(this);
    }

    list() {
      return Promise.resolve(this._pageList);
    }

    /**
     * Listener for when a Page resource is published
     * @param {Object} res the resource that was published
     * @private
     * @see {@link ResourceManager}
     */
    _onResourceAdded(res) {
      Promise.resolve()
      .then(() => this.validate(Object.assign({}, res.getValue(), {uuid: res.getUuid()})))
      .then((page) => {
        if (!this._pages[page.name]) this._pages[page.name] = [];

        const index = this._pages[page.name].findIndex((p) => p.priority > page.priority);
        if (index < 0) {
          this._pages[page.name].unshift(page);
        } else {
          this._pages[page.name].splice(index, 0, page);
        }

        this.emit('page-added', page);
        if (index <= 0) this._computePageList();
      })
      .catch((err) => logger.error('Error adding page resource', err));
    }

    /**
     * Listener for when a Page resource is removed
     * @param {Object} res the resource that was removed
     * @private
     * @see {@link ResourceManager}
     */
    _onResourceRemoved(res) {
      const uuid = res.getUuid();
      const index = this._pages[page.name].findIndex((p) => p.uuid === uuid);
      if (index >= 0) {
        this._pages[page.name].splice(index, 1);
        this.emit('page-removed', res.getValue());
        if (!index) this._computePageList();
      }
    }

    /* A page should look like: {
     *   name: 'foo',
     *   element: 'foo-bar-content',
     *   displayName: 'Foo',
     *   import: '/path/to/foo-bar-content.html',
     *   icon: 'icons:info-outline',
     *   priority: 99,
     *   visible: false, // optional: allows pages to be explicitly invisible
     *   scopes: <['someScope'] | null | undefined> // optional: meant to allow front-end to calculate 'isVisible',
     *   order: 6 // order of appearance in side bar.
     * }
     */
    validate(page) {
      return Promise.resolve()
      .then(() => this.__validate(page))
      .then((page) => {
        if (!page.icon) page.icon = 'icons:info-outline';
        if (!page.hasOwnProperty('priority') || PRIORITY.MIN > page.priority || PRIORITY.MAX < page.priority) page.priority = PRIORITY.MAX;

        return page;
      });
    }

    __validate(page) {
      return Promise.resolve()
      .then(() => {
        if (!page) return Promise.reject(new Error('Page is null'));
        if (!page.name) return Promise.reject(new Error('name must be non-empty string'));
        if (!page.displayName && false !== page.visible) return Promise.reject(new Error('displayName must be non-empty string'));
        if (!page.element) return Promise.reject(new Error('element must be non-empty string matching the name of the custom element'));
        if (!page.import) return Promise.reject(new Error('import must be a non-empty string'));
        if (!page.hasOwnProperty('visible') || page.visible) {
          if (!page.hasOwnProperty('order')) {
            const curPage = this._pageList.find((p) => p.name === page.name);
            if (curPage) {
              page.order = curPage.order;
            } else {
              return Promise.reject(new Error('must provide list order'));
            }
          }
        }

        return page;
      });
    }

    _computePageList() {
      this._pageList = Object.keys(this._pages).map((pageName) => {
        const pages = this._pages[pageName];
        if (pages.length) {
          const page = Object.assign({}, pages[0]);
          delete page.uuid;
          delete page.priority;
          return page;
        } else {
          delete this._pages[pageName];
          return null;
        }
      }).filter((page) => page);
      this.emit('page-list-changed', this._pageList);
    }

    /**
     * Load the PagesManager
     * @param {MessageCenter} messageCenter bits MessageCenter
     * @param {Array} pages the default pages
     * @return {Promise} A promise to load
     */
    load(messageCenter, pages=[]) {
      return Promise.resolve()
      .then(() => Promise.all(pages.map((page) => this.__validate(page))))
      .then((validatedPages) => {
        this._pageList = Array.from(validatedPages);
        this._pages = validatedPages.reduce((obj, page) => {
          obj[page.name] = [page];
          return obj;
        }, {});
      })
      .then(() => {
        this._resourceMgr.on('add', this._boundOnResourceAdded);
        this._resourceMgr.on('remove', this._boundOnResourceRemoved);
        return this._resourceMgr.load(messageCenter);
      })
      .then(() => this._computePageList());
    }

    /**
     * Unload the PagesManager
     * @return {Promise} A promise to unload
     */
    unload() {
      return Promise.resolve()
      .then(() => this._resourceMgr.unload())
      .then(() => this._resourceMgr.removeListener('add', this._boundOnResourceAdded))
      .then(() => this._resourceMgr.removeListener('remove', this._boundOnResourceRemoved));
    }
  }

  module.exports = PagesManager;
})();
