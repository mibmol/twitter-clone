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

/**
 return {
                    type: 'sqlite',
                    database: config.get('DATABASE_NAME'),
                    entities: [User, Reply, Tweet, Session, Follows],
                    synchronize: config.get('NODE_ENV') == 'development',
                } as TypeOrmModuleOptions
 */

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (config: ConfigService) =>{
                if (config.get('NODE_ENV') == 'development'){
                    return {
                        type: 'sqlite',
                        database: config.get('DATABASE_NAME'),
                        entities: [User, Reply, Tweet, Session, Follows],
                        synchronize: true,
                    } as TypeOrmModuleOptions
                }
                else 
                    return {
                        type: 'postgres',
                        host: config.get('DATABASE_HOST'),
                        database: config.get('DATABASE_NAME'),
                        password: config.get('DATABASE_PASSWORD'),
                        entities: [User, Reply, Tweet, Session, Follows],
                        synchronize: false,
                    } as TypeOrmModuleOptions
            },
            inject: [ConfigService],
        }),
        ApiModule,
        AuthModule,
        ConfigModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export default class AppModule implements NestModule {
    constructor(
        private readonly connection: Connection,
        private readonly config: ConfigService,
    ) { }

    configure(consumer: MiddlewareConsumer) {

        if (this.config.get('NODE_ENV') == 'development') {

            CORSMiddleware.configure({
                origin: ["http://localhost:8000", "http://localhost:4200"],
                credentials: true,
            })
            MorganMiddleware.configure('tiny', {
            });

            consumer.apply(
                MorganMiddleware,
            ).forRoutes('*')
        }
        else {
            CORSMiddleware.configure({
                origin: ["https://www.mysite.com", "https://api.mysite.com"],
                credentials: true,
            })
        }

       // CsurfMiddleware.configure()

        consumer.apply(
            HelmetMiddleware,
            CORSMiddleware,
            ExpressSessionMiddleware,       //
            //CsurfMiddleware,
            PassportInitializeMiddleware,   //  ¡order matters!
            PassportSessionMiddleware,      //
        ).forRoutes('*');
    }
}
