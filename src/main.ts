import { NestFactory } from '@nestjs/core';
import {NestExpressApplication} from '@nestjs/platform-express'

import AppModule from './app.module';

import {join, resolve} from 'path'
import {keys as getKeys} from 'ts-transformer-keys'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(resolve(), 'public'));
  app.setBaseViewsDir(join(resolve(), 'views'))

  app.setViewEngine('pug');

  //app.useLogger()

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
