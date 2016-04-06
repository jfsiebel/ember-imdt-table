import Ember from 'ember';
import DS from 'ember-data';
import ImdtTableComponent from './imdt-table';

const {
  set,
  on,
  getProperties,
  computed,
  observer,
  inject,
  A
} = Ember;

export default ImdtTableComponent.extend({
  store: inject.service(),

  modelName: '',
  queryParams: {},
  meta: {},

  processedContent: new A([]),

  reloadDidChange: observer('reload', function() {
    set(this, 'currentPageNumber', 1);
  }),

  content: computed('queryParams.page.limit', 'queryParams.page.offset', 'queryParams.sort', function() {
    const {
      store,
      modelName,
      queryParams
    } = getProperties(this, 'store', 'modelName', 'queryParams');

    return DS.PromiseArray.create({
      promise: store.query(modelName, queryParams)
        .then((result) => {
          this.set('meta', result.get('meta'));
          this.set('processedContent', result);
          return result;
        })
        .catch((reason) => {

          throw reason;
        })
    });
  }),

  /**
   * Component init
   * Setup query params for each table type
   * @method setup
   * @override
   */
  setup: on('init', function() {
    this._super.call(this);

    const {
      paginable,
      sortable,
      searchable
    } = getProperties(this, 'paginable', 'sortable', 'searchable');

    if(paginable) {
      this._setupPaginationQueryParams();
    }
  }),

  /*
   * PAGINATION
   * ========================
   */

  paginationDidChange: observer('pageSize', 'currentPageNumber', function() {
    this._setupPaginationQueryParams();
  }),

  currentLength: computed('meta.count', function() {
    return this.get('meta.count') || 0;
  }),

  /**
   * Setup query params for the pagination
   * @method _setupPaginationQueryParams
   * @private
   */
  _setupPaginationQueryParams() {
    const {
      pageSize,
      currentPageNumber
    } = getProperties(this, 'modelName', 'pageSize', 'currentPageNumber');

    const startIndex = pageSize * (currentPageNumber - 1);

    this.set('queryParams.page', {
      offset: startIndex,
      limit: pageSize
    });
  },

  /**
   *
   * SORTING
   * ===============================
   */
  sortingDidChange: observer('sortProperties', function() {
    this.set('queryParams.sort', this.get('sortProperties'));
  }),
});
