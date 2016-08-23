"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const node_fetch_1 = require('node-fetch');
const vm_1 = require('vm');
const url_1 = require('url');
function jsonp(url, params, callbackParam = 'callback') {
    return __awaiter(this, void 0, void 0, function* () {
        const callbackName = 'callback';
        const urlParts = url_1.parse(url, true);
        Object.assign(urlParts.query, params, { [callbackParam]: callbackName });
        const newUrl = url_1.format(urlParts);
        const response = yield node_fetch_1.default(newUrl);
        const text = yield response.text();
        return yield new Promise(resolve => {
            vm_1.runInNewContext(text, { [callbackName]: resolve });
        });
    });
}
exports.jsonp = jsonp;
function wait(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}
exports.wait = wait;
//# sourceMappingURL=utils.js.map