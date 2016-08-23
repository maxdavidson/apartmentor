#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const yargs = require('yargs');
const node_fetch_1 = require('node-fetch');
const flat_cache_1 = require('flat-cache');
const index_1 = require('./index');
const utils_1 = require('./utils');
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
let cacheStorage;
(function run() {
    return __awaiter(this, void 0, void 0, function* () {
        while (true) {
            let apartments = yield index_1.search({ googleKey: GOOGLE_SERVER_KEY });
            if (cache) {
                if (cacheStorage === undefined) {
                    cacheStorage = flat_cache_1.default.load('apartmentor');
                }
                apartments = apartments.filter(apartment => {
                    if (cacheStorage.getKey(apartment.refid) == null) {
                        cacheStorage.setKey(apartment.refid, apartment);
                        return true;
                    }
                    return false;
                });
                cacheStorage.save();
            }
            else {
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
                    yield Promise.all(apartments.map(apartment => {
                        const { adress, hyra, hyraEnhet, yta, typ, inflyttningDatum, kortUrl, detaljUrl, poang } = apartment;
                        const message = `Bostad direkt: ${typ} ${yta} m2. ${adress}. ${poang}. ${hyra.replace(/\s+/g, '')} ${hyraEnhet}. ${inflyttningDatum}. ${kortUrl || detaljUrl}. 013-20 86 60.`;
                        const payload = {
                            value1: message,
                            value2: adress,
                            value3: kortUrl || detaljUrl,
                        };
                        return node_fetch_1.default(url, {
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            method: 'POST',
                            body: JSON.stringify(payload),
                        });
                    }));
                }
            }
            yield utils_1.wait(1000 * INTERVAL);
        }
    });
}());
//# sourceMappingURL=cli.js.map