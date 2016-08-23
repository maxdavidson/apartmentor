export interface JSONObject {
    [key: string]: JSONValue;
}
export interface JSONArray extends Array<JSONValue> {
}
export declare type JSONPrimitive = string | number | boolean | null;
export declare type JSONValue = JSONPrimitive | JSONObject | JSONArray;
export declare function jsonp(url: string, params?: {
    [param: string]: string;
}, callbackParam?: string): Promise<string | number | boolean | JSONObject | JSONArray | null>;
export declare function wait(ms: number): Promise<void>;
