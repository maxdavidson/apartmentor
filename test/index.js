const test = require('ava');
const { search } = require('..');

test('it makes a request', t =>
  search()
    .then(apartments => {
      t.true(Array.isArray(apartments));
    })
);
