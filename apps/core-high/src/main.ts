import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { renderFile } from 'ejs';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.engine('ejs', renderFile);
  app.set('views', [
   join(__dirname, '../../../libs/core-fcp/src/views'),
  ]);
  app.setViewEngine('ejs');

  await app.listen(3000);
}
bootstrap();
