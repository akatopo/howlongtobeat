declare global {
  const requestUrl: any;
}

const UserAgent: any = require('user-agents');


/**
 * Takes care about the http connection and response handling
 */
export class HltbSearch {
  public static BASE_URL: string = 'https://howlongtobeat.com/';
  public static DETAIL_URL: string = `${HltbSearch.BASE_URL}game?id=`;
  public static SEARCH_URL: string = `${HltbSearch.BASE_URL}api/search`;
  public static IMAGE_URL: string = `${HltbSearch.BASE_URL}games/`;

  payload: any = {
    "searchType": "games",
    "searchTerms": [

    ],
    "searchPage": 1,
    "size": 20,
    "searchOptions": {
      "games": {
        "userId": 0,
        "platform": "",
        "sortCategory": "popular",
        "rangeCategory": "main",
        "rangeTime": {
          "min": 0,
          "max": 0
        },
        "gameplay": {
          "perspective": "",
          "flow": "",
          "genre": ""
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
  }

  async detailHtml(gameId: string, signal?: AbortSignal): Promise<string> {
    try {
      let { text: result } = await requestUrl({
        method: 'GET',
        headers: {
          'User-Agent': new UserAgent().toString(),
          'origin': 'https://howlongtobeat.com/',
          'referer': 'https://howlongtobeat.com/'
        },
        url: `${HltbSearch.DETAIL_URL}${gameId}`,
      });
      return result;
    } catch (error) {
      if (error) {
        throw new Error(error);
      } else if (error.response.status !== 200) {
        throw new Error(`Got non-200 status code from howlongtobeat.com [${error.response.status}]
          ${JSON.stringify(error.response)}
        `);
      }
    }
  }

  async search(query: Array<string>, signal?: AbortSignal): Promise<any> {
    // Use built-in javascript URLSearchParams as a drop-in replacement to create axios.post required data param
    let search = { ...this.payload };
    search.searchTerms = query;
    try {
      let { json: result } = await requestUrl({
        method: 'POST',
        headers: {
          'User-Agent': new UserAgent().toString(),
          'content-type': 'application/json',
          'origin': 'https://howlongtobeat.com/',
          'referer': 'https://howlongtobeat.com/'
        },
        url: HltbSearch.SEARCH_URL,
        body: JSON.stringify(search),
      });
      return result;
    } catch (error) {
      if (error) {
        throw new Error(error);
      } else if (error.response.status !== 200) {
        throw new Error(`Got non-200 status code from howlongtobeat.com [${error.response.status}]
          ${JSON.stringify(error.response)}
        `);
      }
    }
  }
}
