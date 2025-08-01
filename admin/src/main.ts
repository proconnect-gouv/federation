import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import * as flash from 'express-flash';
import * as helmet from 'helmet';
import * as methodOverride from 'method-override';

import 'dotenv';
import { ConfigService } from 'nestjs-config';
import { PASSPORT } from '@pc/shared/authentication/authentication.module';
import { LocalsInterceptor } from './meta/locals.interceptor';
import { RolesGuard } from '@pc/shared/authentication/guard/roles.guard';
import { AllExceptionFilter } from '@pc/shared/exception/filter/all-exception.filter';
import { LoggerService } from '@pc/shared/logger/logger.service';
import { FormValidationErrorDto } from '@pc/shared/form/dto/form-validation-error.dto';

async function bootstrap() {
  /*
   the autoconfiguration for bodyParser is deactivated to let us control
   the size limitation of parsing in bodyParser ourself
  */
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });

  /**
   * @see https://expressjs.com/fr/api.html#app.set
   * @see https://github.com/expressjs/express/issues/3361
   */
  app.set('query parser', 'simple');

  const logger = app.get(LoggerService);
  app.useLogger(logger);

  const configService = app.get<ConfigService>(ConfigService);

  // View engine initialization
  app.engine('ejs', require('ejs').renderFile);
  app.set('views', [
    join(__dirname, '..', 'views'),
    join(__dirname, '../../shared', 'views'),
  ]);

  app.setViewEngine('ejs');

  // Trust first proxy (needed for secure cookies)
  // @see https://www.npmjs.com/package/express-session#cookiesecure
  app.set('trust proxy', 1);

  // Static files
  app.useStaticAssets('dist/client');

  // override http method
  // @see {https://www.npmjs.com/package/method-override}
  app.use(methodOverride('_method'));

  // Flash messages
  app.use(flash());

  // Helmet
  app.use(helmet());
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        'img-src': ["'self'", 'data:'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
      },
    }),
  );
  app.use(helmet.permittedCrossDomainPolicies());
  app.use(helmet.referrerPolicy({ policy: 'same-origin' }));

  // Sessions initialization
  app.use(session(configService.get('session')));

  app.use(cookieParser());

  const { port, httpMaxSize } = configService.get('http');
  app.use(json({ limit: httpMaxSize }));
  app.use(urlencoded({ limit: httpMaxSize, extended: false }));

  const passport = app.get(PASSPORT);
  app.use(passport.initialize());
  app.use(passport.session());

  app.useGlobalFilters(
    new AllExceptionFilter(configService.get('app'), logger),
  );

  // Setup locals for all the routes
  const localsInterceptor = app.get<LocalsInterceptor>(LocalsInterceptor);
  app.useGlobalInterceptors(localsInterceptor);

  // Setup roles-based security
  const rolesGuard = app.get<RolesGuard>(RolesGuard);
  app.useGlobalGuards(rolesGuard);

  // Setup global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: errors => new BadRequestException(errors),
    }),
  );

  await app.listen(port);
}

bootstrap();
