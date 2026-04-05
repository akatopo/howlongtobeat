"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HltbSearch = void 0;
const UserAgent = require('user-agents');
/**
 * Takes care about the http connection and response handling
 */
class HltbSearch {
    constructor() {
        this.payload = {
            "searchType": "games",
            "searchTerms": [],
            "searchPage": 1,
            "size": 20,
            "searchOptions": {
                "games": {
                    "userId": 0,
                    "platform": "",
                    "sortCategory": "popular",
                    "rangeCategory": "main",
                    "rangeTime": {
                        "min": null,
                        "max": null
                    },
                    "gameplay": {
                        "perspective": "",
                        "flow": "",
                        "genre": "",
                        "difficulty": ""
                    },
                    "rangeYear": {
                        "min": "",
                        "max": ""
                    },
                    "modifier": ""
                },
                "users": {
                    "sortCategory": "postcount"
                },
                "lists": { "sortCategory": "follows" },
                "filter": "",
                "sort": 0,
                "randomizer": 0
            },
            useCache: true,
        };
    }
    detailHtml(gameId, signal) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { text: result } = yield requestUrl({
                    method: 'GET',
                    headers: {
                        'User-Agent': new UserAgent().toString(),
                        'origin': 'https://howlongtobeat.com/',
                        'referer': 'https://howlongtobeat.com/'
                    },
                    url: `${HltbSearch.DETAIL_URL}${gameId}`,
                });
                return result;
            }
            catch (error) {
                if (error) {
                    throw new Error(error);
                }
                else if (error.response.status !== 200) {
                    throw new Error(`Got non-200 status code from howlongtobeat.com [${error.response.status}]
          ${JSON.stringify(error.response)}
        `);
                }
            }
        });
    }
    getSearchInit(ua) {
        return __awaiter(this, void 0, void 0, function* () {
            const headers = {
                'user-agent': ua,
                'origin': 'https://howlongtobeat.com/',
                'referer': 'https://howlongtobeat.com/',
            };
            try {
                const { json: tokenRes } = yield requestUrl({
                    method: 'GET',
                    headers,
                    url: `${HltbSearch.SEARCH_INIT_URL}?t=${Date.now()}`,
                });
                const { token, hpKey, hpVal, } = tokenRes;
                return {
                    token,
                    hpKey,
                    hpVal,
                };
            }
            catch (error) {
                throw new Error(`Error in fetching the search token${error.message ? `: ${error.message}` : ''}`);
            }
        });
    }
    search(query, signal) {
        return __awaiter(this, void 0, void 0, function* () {
            const ua = new UserAgent().toString();
            const { token, hpKey, hpVal } = yield this.getSearchInit(ua);
            const search = Object.assign(Object.assign({}, this.payload), { searchTerms: query, [hpKey]: hpVal });
            try {
                let { json: result } = yield requestUrl({
                    method: 'POST',
                    headers: {
                        'user-agent': ua,
                        'content-type': 'application/json',
                        'origin': 'https://howlongtobeat.com/',
                        'referer': 'https://howlongtobeat.com/',
                        'x-auth-token': token,
                        'x-hp-key': hpKey,
                        'x-hp-val': hpVal,
                    },
                    url: HltbSearch.SEARCH_URL,
                    body: JSON.stringify(search),
                });
                return result;
            }
            catch (error) {
                if (error) {
                    throw new Error(error);
                }
                else if (error.response.status !== 200) {
                    throw new Error(`Got non-200 status code from howlongtobeat.com [${error.response.status}]
          ${JSON.stringify(error.response)}
        `);
                }
            }
        });
    }
}
exports.HltbSearch = HltbSearch;
HltbSearch.BASE_URL = 'https://howlongtobeat.com/';
HltbSearch.DETAIL_URL = `${HltbSearch.BASE_URL}game?id=`;
HltbSearch.SEARCH_INIT_URL = `${HltbSearch.BASE_URL}api/find/init`;
HltbSearch.SEARCH_URL = `${HltbSearch.BASE_URL}api/find`;
HltbSearch.IMAGE_URL = `${HltbSearch.BASE_URL}games/`;
//# sourceMappingURL=hltbsearch.js.map