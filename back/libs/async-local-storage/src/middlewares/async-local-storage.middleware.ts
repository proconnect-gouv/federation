import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { AsyncLocalStorageService } from "../async-local-storage.service";

@Injectable()
export class AsyncLocalStorageMiddleware implements NestMiddleware {
  constructor(
    private readonly asyncLocalStorage: AsyncLocalStorageService<unknown>,
  ) {}

  use(_req: Request, _res: Response, next: NextFunction) {
    this.asyncLocalStorage.run(() => {
      next();
    });
  }
}
