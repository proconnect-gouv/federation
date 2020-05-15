import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { SessionMiddleware } from './session.middleware';

@Module({})
export class SessionModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SessionMiddleware).forRoutes('*');
  }
}
