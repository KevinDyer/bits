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

  const PagesService = require('../helpers/pages-service');
  const WidgetManager = require('./widget-manager');
  const ToolbarItemManager = require('./toolbar-item-manager');

  const PAGES = [{
    name: 'dashboard',
    element: 'base-dashboard',
    import: '/elements/base-dashboard/base-dashboard.html',
    displayName: 'Dashboard',
    icon: 'icons:dashboard',
    order: -5
  }, {
    name: 'activity',
    element: 'base-activity',
    import: '/elements/base-activity/base-activity.html',
    displayName: 'Activity',
    icon: 'icons:list',
    order: -4
  }, {
    name: 'users',
    element: 'base-users-content',
    import: '/elements/base-users/base-users-content.html',
    displayName: 'Users',
    icon: 'social:people',
    scopes: ['account'],
    order: -4
  }, {
    name: 'omgs',
    element: 'base-omgs-content',
    import: '/elements/base-omgs/base-omgs-content.html',
    displayName: 'OMGs',
    icon: 'icons:group-work',
    order: -3
  }, {
    name: 'modules',
    element: 'base-modules-list',
    import: '/elements/base-modules/base-modules-list.html',
    displayName: 'Modules',
    icon: 'icons:view-module',
    scopes: ['base'],
    order: -2
  }, {
    name: 'logs',
    element: 'base-logs-content',
    import: '/elements/base-logs/base-logs-content.html',
    displayName: 'Logs',
    icon: 'icons:timeline',
    order: -1
  }];

  class HomeManager {
    constructor() {
      this._pageId = -1;
      this._galleryItemId = -1;
      this._widgetManager = new WidgetManager();
      this._toolbarItemManager = new ToolbarItemManager();
    }

    load(messageCenter, bitsId) {
      const homePage = {
        name: 'home',
        element: 'base-home',
        import: '/elements/base-home/base-home.html'
      };
      return Promise.resolve()
      .then(() => {
        return messageCenter.sendRequest('base#PageItems create', {scopes: null}, homePage)
        .then((page) => {
          this._pageId = page.id;
        });
      })
      .then(() => {
        this._pagesService = new PagesService({
          tag: 'base#HomePages',
          topic: `${bitsId}-home-pages`,
          scopes: []
        });

        return this._pagesService.load(messageCenter, PAGES);
      })
      .then(() => {
        const homeGalleryItem = {
          href: '/home',
          icon: 'icons:home',
          title: 'Home',
          category: 'Home',
          scopes: ['public']
        };
        return messageCenter.sendRequest('base#GalleryItems create', {scopes: null}, homeGalleryItem)
        .then((galleryItem) => {
          this._galleryItemId = galleryItem.id;
        });
      })
      .then(() => this._widgetManager.load(messageCenter))
      .then(() => this._toolbarItemManager.load(messageCenter));
    }

    unload(messageCenter) {
      return Promise.resolve()
      .then(() => this._toolbarItemManager.unload())
      .then(() => this._widgetManager.unload())
      .then(() => this._pagesService.unload())
      .then(() => messageCenter.sendRequest('base#PageItems delete', {scopes: null}, this._pageId))
      .then(() => {
        this._pageId = -1;
        return messageCenter.sendRequest('base#GalleryItems delete', {scopes: null}, this._galleryItemId);
      })
      .then(() => {
        this._galleryItemId = -1;
      });
    }

    getWidgetManager() {
      return this._widgetManager;
    }
  }

  module.exports = HomeManager;
})();
