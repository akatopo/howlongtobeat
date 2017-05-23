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
const select = require('soupselect').select;
const htmlparser = require('htmlparser');
const levenshtein = require('fast-levenshtein');
const htmlscraper_1 = require("./htmlscraper");
class HowLongToBeatService {
    constructor() {
        this.scraper = new htmlscraper_1.HtmlScraper();
    }
    /**
     * Get HowLongToBeatEntry from game id, by fetching the detail page like https://howlongtobeat.com/game.php?id=6974 and parsing it.
     * @param gameId the hltb internal gameid
     * @return Promise<HowLongToBeatEntry> the promise that, when fullfilled, returns the game
     */
    detail(gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            let detailPage = yield this.scraper.detailHtml(`${HowLongToBeatService.DETAIL_URL}${gameId}`);
            let entry = HowLongToBeatParser.parseDetails(detailPage, gameId);
            return entry;
        });
    }
    search(query) {
        return __awaiter(this, void 0, void 0, function* () {
            let searchPage = yield this.scraper.search(query, HowLongToBeatService.SEARCH_URL);
            let result = HowLongToBeatParser.parseSearch(searchPage, query);
            return result;
        });
    }
}
HowLongToBeatService.BASE_URL = 'https://howlongtobeat.com/';
HowLongToBeatService.DETAIL_URL = `${HowLongToBeatService.BASE_URL}game.php?id=`;
HowLongToBeatService.SEARCH_URL = `${HowLongToBeatService.BASE_URL}search_main.php`;
exports.HowLongToBeatService = HowLongToBeatService;
/**
 * Encapsulates a game detail
 */
class HowLongToBeatEntry {
    constructor(id, name, imageUrl, gameplayMain, gameplayCompletionist, similarity) {
        this.id = id;
        this.name = name;
        this.imageUrl = imageUrl;
        this.gameplayMain = gameplayMain;
        this.gameplayCompletionist = gameplayCompletionist;
        this.similarity = similarity;
    }
}
exports.HowLongToBeatEntry = HowLongToBeatEntry;
/**
 * Internal helper class to parse html and create a HowLongToBeatEntry
 */
class HowLongToBeatParser {
    /**
     * Parses the passed html to generate a HowLongToBeatyEntrys.
     * All the dirty DOM parsing and element traversing is done here.
     * @param html the html as basis for the parsing. taking directly from the response of the hltb detail page
     * @param id the hltb internal id
     * @return HowLongToBeatEntry representing the page
     */
    static parseDetails(html, id) {
        let gameName = '';
        let imageUrl = '';
        let gameplayMain = 0;
        let gameplayComplete = 0;
        let handler = new htmlparser.DefaultHandler((err, dom) => {
            if (err) {
                //Error handling!
                console.error(err);
            }
            else {
                gameName = select(dom, '.profile_header')[0].children[0].raw.trim();
                imageUrl = HowLongToBeatService.BASE_URL + select(dom, '.game_image img')[0].attribs.src;
                let liElements = select(dom, '.game_times li');
                liElements.forEach((li) => {
                    let type = select(li, 'h5')[0].children[0].raw;
                    let time = HowLongToBeatParser.parseTime(select(li, 'div')[0].children[0].raw);
                    if (type.startsWith('Main Story') || type.startsWith('Single-Player') || type.startsWith('Solo')) {
                        gameplayMain = time;
                    }
                    else if (type.startsWith('Completionist')) {
                        gameplayComplete = time;
                    }
                });
            }
        });
        var parser = new htmlparser.Parser(handler);
        parser.parseComplete(html);
        return new HowLongToBeatEntry(id, gameName, imageUrl, gameplayMain, gameplayComplete, 1);
    }
    /**
     * Parses the passed html to generate an Array of HowLongToBeatyEntrys.
     * All the dirty DOM parsing and element traversing is done here.
     * @param html the html as basis for the parsing. taking directly from the response of the hltb search
     * @param searchTerm the query what was searched, only used to calculate the similarity
     * @return an Array<HowLongToBeatEntry>s
     */
    static parseSearch(html, searchTerm) {
        //console.log('html', html);
        let results = new Array();
        let handler = new htmlparser.DefaultHandler((err, dom) => {
            if (err) {
                //Error handling!
                console.error(err);
            }
            else {
                //check for result page
                if (select(dom, 'h3').length > 0) {
                    let liElements = select(dom, 'li');
                    liElements.forEach((li) => {
                        let gameTitleAnchor = select(li, 'a')[0];
                        let gameName = gameTitleAnchor.attribs.title;
                        let detailId = gameTitleAnchor.attribs.href.substring(gameTitleAnchor.attribs.href.indexOf('?id=') + 4);
                        let gameImage = HowLongToBeatService.BASE_URL + select(gameTitleAnchor, 'img')[0].attribs.src;
                        //entry.setPropability(calculateSearchHitPropability(entry.getName(), searchTerm));
                        let main;
                        let complete;
                        let times = select(li, ".search_list_details_block")[0].children[1];
                        let timeEntries = times.children.length;
                        for (let i = 0; i <= timeEntries;) {
                            let div = times.children[i];
                            if (div && div.type && div.type === 'tag') {
                                try {
                                    let type = div.children[0].raw.trim();
                                    if (type.startsWith('Main Story') || type.startsWith('Single-Player') || type.startsWith('Solo')) {
                                        let time = HowLongToBeatParser.parseTime(times.children[i + 2].children[0].raw.trim());
                                        main = time;
                                    }
                                    else if (type.startsWith('Completionist')) {
                                        let time = HowLongToBeatParser.parseTime(times.children[i + 2].children[0].raw.trim());
                                        complete = time;
                                    }
                                    i += 2;
                                }
                                catch (e) {
                                    console.log(e);
                                }
                            }
                            else {
                                i++;
                            }
                        }
                        let entry = new HowLongToBeatEntry(detailId, gameName, gameImage, main, complete, HowLongToBeatParser.calcDistancePercentage(gameName, searchTerm));
                        console.log(entry);
                        results.push(entry);
                    });
                }
                else {
                    results;
                }
            }
        });
        var parser = new htmlparser.Parser(handler);
        parser.parseComplete(html);
        return results;
    }
    /**
       * Utility method used for parsing a given input text (like
       * &quot;44&#189;&quot;) as double (like &quot;44.5&quot;). The input text
       * represents the amount of hours needed to play this game.
       *
       * @param text
       *            representing the hours
       * @return the pares time as double
       */
    static parseTime(text) {
        // '65&#189; Hours'; '--' if not known
        if (text === '--') {
            return 0;
        }
        if (text.indexOf(' - ') > -1) {
            return HowLongToBeatParser.handleRange(text);
        }
        return HowLongToBeatParser.getTime(text);
    }
    /**
     * Parses a range of numbers and creates the average.
       * @param text
       *            like '5 Hours - 12 Hours' or '2½ Hours - 33½ Hours'
       * @return he arithmetic median of the range
       */
    static handleRange(text) {
        let range = text.split(' - ');
        let d = (HowLongToBeatParser.getTime(range[0]) + HowLongToBeatParser.getTime(range[1])) / 2;
        return d;
    }
    /**
   * Parses a string to get a number
     * @param text,
     *            can be '12 Hours' or '5½ Hours'
     * @return the ttime, parsed from text
     */
    static getTime(text) {
        let time = text.substring(0, text.indexOf(" "));
        if (time.indexOf('&#189;') > -1) {
            return 0.5 + parseInt(time.substring(0, text.indexOf('&#189;')));
        }
        return parseInt(time);
    }
    /**
     * Calculates the similarty of two strings based on the levenshtein distance in relation to the string lengths.
     * It is used to see how similar the search term is to the game name. This, of course has only relevance if the search term is really specific and matches the game name as good as possible.
     * When using a proper search index, this would be the ranking/rating and much more sophisticated than this helper.
     * @param text the text to compare to
     * @param term the string of which the similarity is wanted
     */
    static calcDistancePercentage(text, term) {
        let longer = text.toLowerCase();
        let shorter = term.toLowerCase();
        if (longer.length < shorter.length) {
            // greater length
            let temp = longer;
            longer = shorter;
            shorter = temp;
        }
        let longerLength = longer.length;
        if (longerLength == 0) {
            return 1.0;
        }
        let distance = levenshtein.get(longer, shorter);
        return Math.round((longerLength - distance) / longerLength * 100) / 100;
    }
}
exports.HowLongToBeatParser = HowLongToBeatParser;