/**
 * Override external library for crypto
 * This has to be done before any other import in order
 * to wrap references before they are imported
 */
import '@fc/cryptography/overrides';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { renderFile } from 'ejs';
import { join } from 'path';
import * as session from 'express-session';
import { LoggerService } from '@fc/logger';

// Assets path vary in dev env
const assetsPath =
  process.env.NODE_ENV === 'development'
    ? // Libs code base to take latest version
      '../../../libs/core-fcp/src'
    : // Current, directory = dist when in production mode
      '';

// avoid 'certificate has expired' on local stack
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = await app.resolve(LoggerService);
  app.useLogger(logger);
  app.engine('ejs', renderFile);
  app.set('views', [join(__dirname, assetsPath, 'views')]);
  app.setViewEngine('ejs');
  app.useStaticAssets(join(__dirname, assetsPath, 'public'));

  /**
   * @TODO create session module (express?, redis?, ...)
   * with variable validation
   **/
  app.use(
    session({
      secret: 'aufooquewooleng8Thahr6quei7Ais',
      name: 'sessionId',
      resave: true,
      saveUninitialized: false,
      cookie: {
        maxAge: 20 * 60 * 1000, // 20 minutes
      },
    }),
  );

  await app.listen(3000);
}
bootstrap();
