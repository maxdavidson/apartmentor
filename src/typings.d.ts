declare module 'goo.gl' {
  export function setKey(key: string): void;
  export function shorten(url: string): Promise<string>;
}

declare module 'flat-cache' {
  export interface Cache<T> {
    setKey(key: string, value: T): void;
    getKey(key: string): T;
    removeKey(key: string): void;
    save(): void;
  }
  export function load<T>(id: string, dirPath?: string): Cache<T>;
  export function clearCacheById(id: string): void;
  export function clearAll(): void;
}

declare module 'yargs' {
  const x: any;
  export = x;
}
