import { AppConfig } from "#libs/app";
import { ConfigService } from "#libs/config";
import { LoggerService } from "#libs/logger";
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { RouteInfo } from "@nestjs/common/interfaces";
import { Request } from "express";
import { Observable, tap } from "rxjs";
import { SessionConfig } from "../dto";
import { SessionService } from "../services";

@Injectable()
export class SessionCommitInterceptor implements NestInterceptor {
  constructor(
    private readonly session: SessionService,
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    return next.handle().pipe(
      tap({
        next: this.commit.bind(this, req),
        error: this.commit.bind(this, req),
      }),
    );
  }

  private async commit(req: Request) {
    const { urlPrefix } = this.config.get<AppConfig>("App");
    const { middlewareIncludedRoutes } =
      this.config.get<SessionConfig>("Session");

    const currentRoute = req.route.path.replace(urlPrefix, "");

    const routePaths = this.getRoutePaths(middlewareIncludedRoutes);

    if (routePaths.includes(currentRoute)) {
      /**
       * @todo #1429 Remove try catch block
       *
       * When we allow SSO on all instances, we will also remove the behavior that removes (detach) totally the session
       * on redirection to the service provider.
       *
       * There would then be no legit reason to enter commit without a proper session.
       * Another way of dealing with this would be to not only detach the session but by init a new empty session.
       */
      try {
        await this.session.commit();
      } catch {
        this.logger.info("Could not commit session from interceptor");
      }
    }
  }

  private getRoutePaths(routes: (string | RouteInfo)[]): string[] {
    return routes.map((route) =>
      typeof route === "string" ? route : route.path,
    );
  }
}
