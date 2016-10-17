#!/usr/bin/env node
/* eslint-disable max-len, consistent-return, no-console, no-param-reassign, no-new-func */

'use strict';

const yargs = require('yargs');
const fetch = require('node-fetch');
const { Observable } = require('rxjs');
const { searchContinuously } = require('./index');

const { argv } = yargs
  .version()
  .help()
  .option({
    i: {
      alias: 'interval',
      describe: 'Interval between API calls (ms)',
      default: 60 * 1000,
      type: 'number',
    },
    once: {
      describe: 'Run once, then exit',
      default: false,
      type: 'boolean',
    },
    ifttt: {
      describe: 'Send results to IFTTT',
      default: false,
      type: 'boolean',
    },
    query: {
      describe: 'JavaScript expression to select which items to include',
      type: 'string',
      default: 'true',
    },
  })
  .alias('v', 'version')
  .alias('h', 'help');

const { IFTTT_KEY } = process.env;
const { interval, once, ifttt, query } = argv;

function createFilter(dslString) {
  return new Function('item', `
    with (item) {
      return ${dslString};
    }
  `);
}

const filter = createFilter(query);

searchContinuously(interval)
  .retryWhen(attempts => {
    if (once) {
      return attempts.mergeMap(Observable.throw);
    }
    return attempts.do(console.error).mergeMapTo(Observable.timer(interval));
  })
  .take(once ? 1 : Infinity)
  .map(items => items.filter(filter))
  .timestamp()
  .do(({ timestamp, value: items }) => {
    console.log(`${new Date(timestamp).toLocaleString('sv-SE')}: ${items.length} st nya lägenheter hittades`);
  })
  .mergeMap(({ value: items }) => Observable.from(items))
  .do(item => {
    const message = [
      `ID: ${item.refid}`,
      `Typ: ${item.typ}`,
      `Egenskaper: ${item.egenskaper.map(egenskap => egenskap.beskrivning).join(', ')}`,
      `Poäng: ${item.poang}`,
      `Område: ${item.omrade}`,
      `Hyra: ${item.hyra} ${item.hyraEnhet}`,
      `Adress: ${item.adress}`,
      `Våning: ${item.vaning}${(item.antalVaningar == null) ? '' : ` av ${item.antalVaningar}`}`,
      `${item.inflyttningDatumLabel}: ${item.inflyttningDatum}`,
      `Publicerades: ${item.publiceratDatum}`,
      `Länk: ${item.detaljUrl}`,
    ].join('\n');

    console.log(message);
    console.log();

    if (ifttt) {
      if (IFTTT_KEY === undefined) {
        console.error('The environment variable IFTTT_KEY was not detected');
        return;
      }

      const event = 'apartmentor';
      const url = `https://maker.ifttt.com/trigger/${event}/with/key/${IFTTT_KEY}`;

      const payload = {
        value1: message,
        value2: item.adress,
        value3: item.detaljUrl,
      };

      fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
  })
  .subscribe();
