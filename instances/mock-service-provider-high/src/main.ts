/* istanbul ignore file */

// Not to be tested
import * as helmet from 'helmet';
import { renderFile } from 'ejs';
import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { LoggerService } from '@fc/logger';
import { AppModule } from './app.module';

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
   * Protect app from common risks
   * @see https://helmetjs.github.io/
   */
  app.use(helmet());
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        /**
         * Allow inline CSS and JS
         * @todo remove this header once the UI is properly implemented
         * to forbid the use of inline CSS or JS
         */
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
      },
    }),
  );
  app.use(helmet.permittedCrossDomainPolicies());

  const logger = await app.resolve(LoggerService);
  app.useLogger(logger);

  // Assets path vary in dev env
  const assetsPath =
    process.env.NODE_ENV === 'development'
      ? // Libs code base to take latest version
      '../../../apps/mock-service-provider/src'
      : // Current, directory = dist when in production mode
      '';

  app.engine('ejs', renderFile);
  app.set('views', [join(__dirname, assetsPath, 'views')]);
  app.setViewEngine('ejs');
  app.useStaticAssets(join(__dirname, assetsPath, 'public'));

  await app.listen(3000);
}
bootstrap();
