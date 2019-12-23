import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express'
import * as cookieParser from 'cookie-parser'

import AppModule from './app.module';

import { join, resolve } from 'path'

async function bootstrap() {

    //const app = await NestFactory.create(AppModule)
    
	const app = await NestFactory.create<NestExpressApplication>(AppModule)

	app.useStaticAssets(join(resolve(), 'public'))
	app.setBaseViewsDir(join(resolve(), 'src/views'))

	app.setViewEngine('pug')

    //app.useLogger()
    app.use(cookieParser())

	await app.listen(process.env.PORT || 8000)
}
bootstrap();
