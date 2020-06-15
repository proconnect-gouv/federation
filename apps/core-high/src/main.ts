/* istanbul ignore file */

// Not to be tested
/**
 * Override external library for crypto
 * This has to be done before any other import in order
 * to wrap references before they are imported
 */
import '@fc/override-oidc-provider/overrides';
import * as CookieParser from 'cookie-parser';
import { urlencoded } from 'body-parser';
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

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    /**
     * We need to handle the bodyParser ourself because of prototype pollution risk with `body-parser` library.
     *
     * Track the handling of this issue on `body-parser` repositoty:
     * @see https://github.com/expressjs/body-parser/issues/347
     *
     * Description of the vulnerability:
     * @see https://gist.github.com/rgrove/3ea9421b3912235e978f55e291f19d5d/revisions
     *
     * More general explanation about prototype pollution/poising:
     * @see https://medium.com/intrinsic/javascript-prototype-poisoning-vulnerabilities-in-the-wild-7bc15347c96
     */
    bodyParser: false,
  });

  /**
   * The security concern is on bodyParser.json (see upper comment).
   * In the application, only the "urlencoded" form is necessary.
   * therefore, we only activate the "body.urlencoded" middleware
   *
   * JSON parsing exists in our app, but it is handled by `jose`.
   *
   * Desactivate extended "qs" parser to prevent prototype pollution hazard.
   * @see body-parser.md in the project doc folder for further informations.
   */
  app.use(urlencoded({ extended: false }));

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
