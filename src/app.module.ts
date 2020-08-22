import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

import { ApiModule } from './api/api.module';
import { User } from './auth/entities/user.entity';
import { Tweet } from './api/entities/tweet.entity';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { MorganMiddleware } from './common/middlewares/morgan.middleware';
import { Reply } from './api/entities/reply.entity';
import { ExpressSessionMiddleware } from './common/middlewares/express-session.middleware';
import { Session } from './auth/entities/session.entity';
import { PassportInitializeMiddleware } from './common/middlewares/passport-initialize.middleware';
import { PassportSessionMiddleware } from './common/middlewares/passport-session.middleware';
import { Follows } from './api/entities/follows.entity';
import { HelmetMiddleware } from './common/middlewares/helmet.middleware';
import { CORSMiddleware } from './common/middlewares/cors.middleware';
import { CsurfMiddleware } from './common/middlewares/csurf.middleware';
import { Favs } from './api/entities/favs.entity';

@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: async (config: ConfigService) => {
				if (config.get('NODE_ENV') == 'development') {
					return {
						type: 'postgres',
						database: config.get('DATABASE_NAME'),
						host: config.get('DATABASE_HOST'),
						port: parseInt(config.get('DATABASE_PORT')),
						username: config.get('DATABASE_USER_NAME'),
						password: config.get('DATABASE_USER_PASSWORD'),
						entities: [User, Reply, Tweet, Session, Follows, Favs],
						synchronize: true,
					} as TypeOrmModuleOptions;
				} else
					return {
						type: 'postgres',
						database: config.get('DATABASE_NAME'),
						host: config.get('DATABASE_HOST'),
						port: parseInt(config.get('DATABASE_PORT')),
						username: config.get('DATABASE_USER_NAME'),
						password: config.get('DATABASE_USER_PASSWORD'),
						entities: [User, Reply, Tweet, Session, Follows, Favs],
						synchronize: false,
					} as TypeOrmModuleOptions;
			},
			inject: [ConfigService],
		}),
		AuthModule,
		ApiModule,
		ConfigModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export default class AppModule implements NestModule {
	constructor(
		private readonly connection: Connection,
		private readonly config: ConfigService,
	) {}

	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(
				HelmetMiddleware,
				ExpressSessionMiddleware, //
				PassportInitializeMiddleware, //  ¡order matters!
				PassportSessionMiddleware, //
			)
			.forRoutes('*');

		CsurfMiddleware.configure({ cookie: true });
		MorganMiddleware.configure('tiny', {});

		if (this.config.get('NODE_ENV') == 'development') {
			CORSMiddleware.configure({
				origin: ['http://localhost:8000', 'http://localhost:4200'],
				credentials: true,
			});

			consumer.apply(MorganMiddleware, CORSMiddleware).forRoutes('*');
			consumer.apply(CsurfMiddleware).forRoutes('/login', '/signup');
		} else {
			CORSMiddleware.configure({
				origin: ['https://www.mysite.com', 'https://api.mysite.com'],
				credentials: true,
			});
			consumer.apply(CORSMiddleware, CsurfMiddleware).forRoutes('*');
		}
	}
}
