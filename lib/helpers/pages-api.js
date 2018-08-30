(() => {
  'use strict';

  class PagesApi {
    static isValidTag(tag) {
      return 'string' === typeof (tag) && 0 < tag.length;
    }

    static get REQUEST_NAMES() {
      return {
        LIST: 'list'
      };
    }

    static get EVENT_NAMES() {
      return {
        PAGE_ADDED: 'pageAdded',
        PAGE_LIST_CHANGED: 'pageListChanged',
        PAGE_REMOVED: 'pageRemoved'
      };
    }

    constructor(tag, messageCenter) {
      if (!PagesApi.isValidTag(tag)) throw new TypeError('tag must be a non-empty string');

      this._tag = tag;
      this._messageCenter = messageCenter;
    }

    addPageAddedListener(listener) {
      return this._messageCenter.addEventListener(`${this._tag} ${PagesApi.EVENT_NAMES.PAGE_ADDED}`, listener);
    }

    removePageAddedListener(listener) {
      return this._messageCenter.removeEventListener(`${this._tag} ${PagesApi.EVENT_NAMES.PAGE_ADDED}`, listener);
    }

    addPageListChangedListener(listener) {
      return this._messageCenter.addEventListener(`${this._tag} ${PagesApi.EVENT_NAMES.PAGE_ADDED}`, listener);
    }

    removePageListChangedListener(listener) {
      return this._messageCenter.removeEventListener(`${this._tag} ${PagesApi.EVENT_NAMES.PAGE_ADDED}`, listener);
    }

    addPageRemovedListener(listener) {
      return this._messageCenter.addEventListener(`${this._tag} ${PagesApi.EVENT_NAMES.PAGE_REMOVED}`, listener);
    }

    removePageRemovedListener(listener) {
      return this._messageCenter.removeEventListener(`${this._tag} ${PagesApi.EVENT_NAMES.PAGE_REMOVED}`, listener);
    }
  }

  module.exports = PagesApi;
})();
