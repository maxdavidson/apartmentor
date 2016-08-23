#!/usr/bin/env node
/* eslint-disable max-len, consistent-return, no-console, no-param-reassign */
const yargs = require('yargs');
const fetch = require('node-fetch');
const flatCache = require('flat-cache');
const { search } = require('./index');

const { argv } = yargs
  .version()
  .help()
  .option({
    i: {
      alias: 'interval',
      describe: 'Interval in seconds between API calls',
      default: 60,
      type: 'number',
    },
    c: {
      alias: 'cache',
      describe: 'Cache results between runs',
      default: false,
      type: 'boolean',
    },
  })
  .alias('v', 'version')
  .alias('h', 'help');


const { c: CACHE, i: INTERVAL } = argv;
const { GOOGLE_SERVER_KEY, IFTTT_KEY } = process.env;

function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

let cacheStorage;

(function run() {
  return search({ googleKey: GOOGLE_SERVER_KEY })
    .then(apartments => {
      if (CACHE) {
        if (cacheStorage === undefined) {
          cacheStorage = flatCache.load('apartmentor');
        }

        apartments = apartments.filter(apartment => {
          if (cacheStorage.getKey(apartment.refid) == null) {
            cacheStorage.setKey(apartment.refid, apartment);
            return true;
          }
          return false;
        });
        cacheStorage.save();
      } else {
        // Fall back to object storage
        if (cacheStorage === undefined) {
          cacheStorage = Object.create(null);
        }

        apartments = apartments.filter(apartment => {
          if (!(apartment.refid in cacheStorage)) {
            cacheStorage[apartment.refid] = apartment;
            return true;
          }
          return false;
        });
      }

      return apartments;
    })
    .then(apartments => {
      console.log(`${new Date().toLocaleString('sv-SE')}: Hittade ${apartments.length} st nya lediga lägenheter`);

      if (apartments.length > 0) {
        for (const { refid, adress, hyra, hyraEnhet, typ, inflyttningDatum, publiceratDatum, detaljUrl, kortUrl, poang } of apartments) {
          console.log(`ID: ${refid}`);
          console.log(`Typ: ${typ}`);
          console.log(`Poäng: ${poang}`);
          console.log(`Hyra: ${hyra} ${hyraEnhet}`);
          console.log(`Adress: ${adress}`);
          console.log(`Inflyttning: ${inflyttningDatum}`);
          console.log(`Publicerat: ${publiceratDatum}`);
          console.log(`Länk: ${detaljUrl}`);
          console.log(`Kort länk: ${kortUrl}`);
          console.log();
        }

        if (IFTTT_KEY) {
          console.info('Pushar till IFTTT...');
          const event = 'apartmentor';
          const url = `https://maker.ifttt.com/trigger/${event}/with/key/${IFTTT_KEY}`;

          return Promise.all(apartments.map(apartment => {
            const { adress, hyra, hyraEnhet, yta, typ, inflyttningDatum, shortUrl, detaljUrl, poang } = apartment;
            const message = `Bostad direkt: ${typ} ${yta} m2. ${adress}. ${poang}. ${hyra.replace(/\s+/g, '')} ${hyraEnhet}. ${inflyttningDatum}. ${shortUrl || detaljUrl}. 013-20 86 60.`;

            const payload = {
              value1: message,
              value2: adress,
              value3: shortUrl || detaljUrl,
            };

            return fetch(url, {
              headers: {
                'Content-Type': 'application/json',
              },
              method: 'POST',
              body: JSON.stringify(payload),
            });
          }));
        }
      }
    })
    .catch(console.error)
    .then(() => wait(1000 * INTERVAL))
    .then(run);
}());
