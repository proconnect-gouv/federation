export type FetchRequestInitFactory = () => RequestInit;
export type FetchFn = typeof fetch;

export const FETCH_REQUEST_INIT = Symbol("FETCH_REQUEST_INIT");
export const FETCH_FN = Symbol("FETCH_FN");
