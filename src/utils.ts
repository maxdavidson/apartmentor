import fetch from 'node-fetch';
import { runInNewContext } from 'vm';
import { parse, format } from 'url';

export interface JSONObject {
  [key: string]: JSONValue;
}
export interface JSONArray extends Array<JSONValue> { }
export type JSONPrimitive = string | number | boolean | null;
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;

export async function jsonp(url: string, params?: { [param: string]: string; }, callbackParam = 'callback') {
  const callbackName = 'callback';

  const urlParts = parse(url, true);
  Object.assign(urlParts.query, params, { [callbackParam]: callbackName });

  const newUrl = format(urlParts);

  const response = await fetch(newUrl);
  const text = await response.text();

  return await new Promise<JSONValue>(resolve => {
    runInNewContext(text, { [callbackName]: resolve });
  });
}

export function wait(ms: number) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });
}
