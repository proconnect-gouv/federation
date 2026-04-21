import { Inject, Injectable } from "@nestjs/common";
import { from, Observable } from "rxjs";
import type { FetchFn, FetchRequestInitFactory } from "./fetch-http.tokens";
import { FETCH_FN, FETCH_REQUEST_INIT } from "./fetch-http.tokens";

type HttpOptions = { headers?: Record<string, string> };
type HttpResponse = {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: string;
  config: object;
  request: object;
};

async function toResponse(res: Response): Promise<HttpResponse> {
  return {
    status: res.status,
    statusText: res.statusText,
    headers: Object.fromEntries(res.headers.entries()),
    data: await res.text(),
    config: {},
    request: {},
  };
}

@Injectable()
export class FetchHttpService {
  constructor(
    @Inject(FETCH_REQUEST_INIT)
    private readonly getInit: FetchRequestInitFactory,
    @Inject(FETCH_FN) private readonly fetch: FetchFn,
  ) {}

  get(url: string, config?: HttpOptions): Observable<HttpResponse> {
    return from(
      this.fetch(url, {
        ...this.getInit(),
        method: "GET",
        headers: config?.headers,
      }).then(toResponse),
    );
  }

  post(
    url: string,
    data?: string,
    config?: HttpOptions,
  ): Observable<HttpResponse> {
    return from(
      this.fetch(url, {
        ...this.getInit(),
        method: "POST",
        body: data,
        headers: config?.headers,
      }).then(toResponse),
    );
  }
}
