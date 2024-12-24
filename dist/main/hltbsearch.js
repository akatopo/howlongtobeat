"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
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
                "filter": "",
                "sort": 0,
                "randomizer": 0
            }
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
    // This is a terrible hack that's bound to break, let's see how long it lasts
    getSearchToken() {
        return __awaiter(this, void 0, void 0, function* () {
            const headers = {
                'User-Agent': new UserAgent().toString(),
                'origin': 'https://howlongtobeat.com/',
                'referer': 'https://howlongtobeat.com/'
            };
            try {
                const { text: pageSource } = yield requestUrl({
                    method: 'GET',
                    headers,
                    url: HltbSearch.BASE_URL,
                });
                const [appUrl] = pageSource.match('_next/static/chunks/pages/_app-[0-9a-f]{16}.js');
                if (!appUrl) {
                    throw new Error('Error in matching the app url from the page source');
                }
                const { text: appSource } = yield requestUrl({
                    method: 'GET',
                    headers,
                    url: `${HltbSearch.BASE_URL}${appUrl}`,
                });
                const [, token1, token2] = appSource.match(/fetch\("\/api\/(?:search|find)\/"\.concat\("([0-9a-f]+)"\)\.concat\("([0-9a-f]+)"\)/);
                if (!token1 || !token2) {
                    throw new Error('Error in matching the search token from the app source');
                }
                return `${token1}${token2}`;
            }
            catch (error) {
                throw new Error(`Error in fetching the search token${error.message ? `: ${error.message}` : ''}`);
            }
        });
    }
    search(query, signal) {
        return __awaiter(this, void 0, void 0, function* () {
            const searchToken = yield this.getSearchToken();
            // Use built-in javascript URLSearchParams as a drop-in replacement to create axios.post required data param
            let search = Object.assign({}, this.payload);
            search.searchTerms = query;
            try {
                let { json: result } = yield requestUrl({
                    method: 'POST',
                    headers: {
                        'User-Agent': new UserAgent().toString(),
                        'content-type': 'application/json',
                        'origin': 'https://howlongtobeat.com/',
                        'referer': 'https://howlongtobeat.com/'
                    },
                    url: `${HltbSearch.SEARCH_URL}/${searchToken}`,
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
HltbSearch.BASE_URL = 'https://howlongtobeat.com/';
HltbSearch.DETAIL_URL = `${HltbSearch.BASE_URL}game?id=`;
HltbSearch.SEARCH_URL = `${HltbSearch.BASE_URL}api/find`; // was /search
HltbSearch.IMAGE_URL = `${HltbSearch.BASE_URL}games/`;
exports.HltbSearch = HltbSearch;
//# sourceMappingURL=hltbsearch.js.map