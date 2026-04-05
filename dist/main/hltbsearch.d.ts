declare global {
    const requestUrl: any;
}
/**
 * Takes care about the http connection and response handling
 */
export declare class HltbSearch {
    static BASE_URL: string;
    static DETAIL_URL: string;
    static SEARCH_INIT_URL: string;
    static SEARCH_URL: string;
    static IMAGE_URL: string;
    payload: any;
    detailHtml(gameId: string, signal?: AbortSignal): Promise<string>;
    getSearchInit(ua: string): Promise<{
        token: any;
        hpKey: any;
        hpVal: any;
    }>;
    search(query: Array<string>, signal?: AbortSignal): Promise<any>;
}
