'use strict';

const {interval: rxjsInterval, from} = require('rxjs');
const {startWith, map, mergeMap} = require('rxjs/operators');
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
  return rxjsInterval(interval).pipe(startWith(0), mergeMap(() => from(search()).pipe(map(items => items.filter(item => !seen.has(item.refid) && seen.add(item.refid))))));
}

module.exports = { search, searchContinuously };
