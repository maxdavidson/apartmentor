const googl = require('goo.gl');
const { jsonp } = require('./utils');

function search({ googleKey } = {}) {
  return jsonp('https://marknad.studentbostader.se/widgets/', {
    egenskaper: 'SNABB',
    'widgets[]': 'objektlista@lagenheter',
  }).then(json => {
    const apartments = json.data['objektlista@lagenheter'];

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
