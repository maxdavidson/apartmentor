"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const googl = require('goo.gl');
const utils_1 = require('./utils');
const omraden = {
    fjarilen: '90K',
    flamman: '90A-F',
    irrblosset: '96',
    lambohov: '94',
    ryd: '92',
    t1: '95',
};
const egenskaper = {
    moblerad: '1015',
    omoblerad: '1016',
    bostadDirekt: 'SNABB',
};
const objektType = {};
function search({ googleKey } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const json = yield utils_1.jsonp('https://marknad.studentbostader.se/widgets/', {
            egenskaper: 'SNABB',
            'widgets[]': 'objektlista@lagenheter',
        });
        // If this fails, the response interface has changed
        const apartments = json.data['objektlista@lagenheter'];
        if (googleKey && apartments.length > 0) {
            googl.setKey(googleKey);
            return yield Promise.all(apartments.map((apartment) => __awaiter(this, void 0, void 0, function* () {
                const kortUrl = yield googl.shorten(apartment.detaljUrl);
                return Object.assign({}, apartment, { kortUrl });
            })));
        }
        return apartments;
    });
}
exports.search = search;
//# sourceMappingURL=index.js.map