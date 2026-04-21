import { HttpService } from "@nestjs/axios";
import type { ModuleMetadata } from "@nestjs/common";
import {
  DynamicModule,
  InjectionToken,
  Module,
  OptionalFactoryDependency,
} from "@nestjs/common";
import { FetchHttpService } from "./fetch-http.service";
import {
  FETCH_FN,
  FETCH_REQUEST_INIT,
  FetchFn,
  FetchRequestInitFactory,
} from "./fetch-http.tokens";

export { FETCH_FN, FETCH_REQUEST_INIT };
export type { FetchFn, FetchRequestInitFactory };

export interface FetchModuleAsyncOptions {
  imports?: ModuleMetadata["imports"];
  useFactory: (...args: unknown[]) => FetchRequestInitFactory;
  inject?: (InjectionToken | OptionalFactoryDependency)[];
}

@Module({})
export class FetchHttpModule {
  static registerAsync({
    imports = [],
    useFactory,
    inject = [],
  }: FetchModuleAsyncOptions): DynamicModule {
    return {
      module: FetchHttpModule,
      imports,
      providers: [
        { provide: FETCH_FN, useValue: globalThis.fetch },
        { provide: FETCH_REQUEST_INIT, useFactory, inject },
        { provide: HttpService, useClass: FetchHttpService },
      ],
      exports: [HttpService],
    };
  }
}
