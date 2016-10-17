'use strict';

const fetch = require('node-fetch');
const { runInNewContext } = require('vm');
const { parse, format } = require('url');

function jsonp(url, params, callbackParam = 'callback') {
  const callbackName = 'callback';

  const urlParts = parse(url, true);
  Object.assign(urlParts.query, params, { [callbackParam]: callbackName });
  const newUrl = format(urlParts);

  return fetch(newUrl)
    .then(response => response.text())
    .then(text => new Promise(resolve => {
      runInNewContext(text, { [callbackName]: resolve });
    }));
}

module.exports = { jsonp };
