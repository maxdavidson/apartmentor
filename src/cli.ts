#!/usr/bin/env node

import * as yargs from 'yargs';
import fetch from 'node-fetch';
import flatCache from 'flat-cache';
import { search, Apartment } from './index';
import { wait } from './utils';

const { argv } = yargs
  .option({
    i: {
      alias: 'interval',
      describe: 'Interval in seconds between API calls',
      default: 60,
      type: 'number',
    },
    cache: {
      describe: 'Cache results between runs',
      default: false,
      type: 'boolean',
    },
  })
  .help('h')
  .alias('h', 'help');

const { cache, i: INTERVAL } = argv;
const { GOOGLE_SERVER_KEY, IFTTT_KEY } = process.env;

let cacheStorage: flatCache.Cache<Apartment> | undefined;

(async function run() {
  while (true) {
    let apartments = await search({ googleKey: GOOGLE_SERVER_KEY });

    if (cache) {
      if (cacheStorage === undefined) {
        cacheStorage = flatCache.load<Apartment>('apartmentor');
      }
      apartments = apartments.filter(apartment => {
        if (cacheStorage!.getKey(apartment.refid) == null) {
          cacheStorage!.setKey(apartment.refid, apartment);
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
        if (!(apartment.refid in (cacheStorage as any))) {
          (cacheStorage as any)[apartment.refid] = apartment;
          return true;
        }
        return false;
      });
    }

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

        await Promise.all(apartments.map(apartment => {
          const { adress, hyra, hyraEnhet, yta, typ, inflyttningDatum, kortUrl, detaljUrl, poang } = apartment;
          const message = `Bostad direkt: ${typ} ${yta} m2. ${adress}. ${poang}. ${hyra.replace(/\s+/g, '')} ${hyraEnhet}. ${inflyttningDatum}. ${kortUrl || detaljUrl}. 013-20 86 60.`;

          const payload = {
            value1: message,
            value2: adress,
            value3: kortUrl || detaljUrl,
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

    await wait(1000 * INTERVAL);
  }
}());

