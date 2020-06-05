import { Observable } from 'rxjs';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { LoggerService } from '@fc/logger';

@Injectable()
export class CoreFcpLoggerDebugInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(this.constructor.name);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const {
      method,
      url,
      route: { path },
    } = req;

    // Log called route
    this.logger.debug(`${method} ${path}`);
    this.logger.verbose(url);

    // Log business event if needed
    return next.handle();
  }
}
