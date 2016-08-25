import test from 'ava';
import { search, searchContinuously } from '..';

test('it makes a request', t =>
  search()
    .then(items => {
      t.true(Array.isArray(items));
    })
);

test('it subscribes to a stream', t =>
  searchContinuously()
    .take(1)
    .toPromise()
    .then(items => {
      t.true(Array.isArray(items));
    })
);
