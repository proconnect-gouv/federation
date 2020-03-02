import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { renderFile } from 'ejs';
import { join } from 'path';

// Assets path vary in dev env
const assetsPath =
  process.env.NODE_ENV === 'developement'
    // Libs code base to take latest version
    ? '../../../libs/core-fcp/src'
    // Current, directory = dist when in production mode
    : '';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.engine('ejs', renderFile);
  app.set('views', [join(__dirname, assetsPath, 'views')]);
  app.setViewEngine('ejs');
  app.useStaticAssets(join(__dirname, assetsPath, 'public'))

  await app.listen(3000);
}
bootstrap();
