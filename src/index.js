'use strict';

const { Observable } = require('rxjs');
const { jsonp } = require('./utils');

const MAX_RESULTS = 1000;

function search() {
  return jsonp('https://marknad.studentbostader.se/widgets/', {
    'widgets[]': 'objektlista@lagenheter',
    paginationantal: MAX_RESULTS,
  })
  .then(json => json.data['objektlista@lagenheter']);
}

function searchContinuously(interval = 60 * 1000) {
  const seen = new Set();
  return Observable
    .interval(interval)
    .startWith(0)
    .mergeMap(() => Observable.fromPromise(search())
    .map(items => items.filter(item => !seen.has(item.refid) && seen.add(item.refid))));
}

module.exports = { search, searchContinuously };
