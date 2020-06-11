/* istanbul ignore file */

// Not to be tested
/**
 * Override external library for crypto
 * This has to be done before any other import in order
 * to wrap references before they are imported
 */
import '@fc/override-oidc-provider/overrides';
import * as CookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { LoggerService } from '@fc/logger';
import { ConfigService } from '@fc/config';
import { SessionConfig } from '@fc/session';
import { AppModule } from './app.module';
import { renderFile } from 'ejs';
import { join } from 'path';

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
  const config = app.get(ConfigService);
  app.useLogger(logger);
  app.engine('ejs', renderFile);
  app.set('views', [join(__dirname, assetsPath, 'views')]);
  app.setViewEngine('ejs');
  app.useStaticAssets(join(__dirname, assetsPath, 'public'));

  const { cookieSecrets } = config.get<SessionConfig>('Session');
  app.use(CookieParser(cookieSecrets));

  await app.listen(3000);
}
bootstrap();
