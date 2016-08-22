const fetch = require('node-fetch');
const googl = require('goo.gl');
const querystring = require('querystring');
const vm = require('vm');
const { JSONStorage } = require('node-localstorage');

// Not very fast, but reasonably safe, jsonp
function jsonp(url, params, callbackParam = 'callback') {
  const callbackName = 'callback';
  const query = Object.assign({}, params, { [callbackParam]: callbackName });
  return fetch(`${url}?${querystring.stringify(query)}`)
    .then(response => response.text())
    .then(text => new Promise(resolve => {
      vm.runInNewContext(text, { [callbackName]: resolve });
    }));
}

let cacheStorage;

function search({ cache = false, googleKey } = {}) {
  return jsonp('https://marknad.studentbostader.se/widgets/', {
    egenskaper: 'SNABB',
    'widgets[]': 'objektlista@lagenheter',
  }).then(json => {
    let apartments = json.data['objektlista@lagenheter'];

    if (cache) {
      if (cacheStorage === undefined) {
        cacheStorage = new JSONStorage('./.cache');
      }
      apartments = apartments.filter(apartment => {
        if (cacheStorage.getItem(apartment.refid) === null) {
          cacheStorage.setItem(apartment.refid, apartment);
          return true;
        }
        return false;
      });
    }

    if (googleKey && apartments.length > 0) {
      googl.setKey(googleKey);
      return Promise.all(apartments.map(apartment =>
        googl.shorten(apartment.detaljUrl)
          .then(kortUrl => Object.assign({}, apartment, { kortUrl })))
      );
    }

    return apartments;
  });
}

module.exports = { search };
