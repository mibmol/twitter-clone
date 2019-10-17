import { Module, HttpModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule} from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from 'src/config/config.module';
import { ConfigService } from 'src/config/config.service';
import { JwtStrategy } from './jwt.strategy';
import { SessionSerializer } from './session.serializer';
import { Session } from './entities/session.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            Session
        ]),
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (config: ConfigService)=>(
                {
                    secret: config.get('JWT_AUTH_SECRET'),
                    signOptions:{
                        expiresIn: "1000s",
                    } 
                }
            ),
            inject: [ConfigService],
        }),
        ConfigModule,
    ],
    providers: [
        AuthService, 
        SessionSerializer,
        LocalStrategy,
    ],
    controllers: [AuthController],
    exports: [TypeOrmModule],
})
export class AuthModule {}
