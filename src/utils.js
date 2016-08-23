const fetch = require('node-fetch');
const querystring = require('querystring');
const vm = require('vm');

function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

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

module.exports = { jsonp, wait };
