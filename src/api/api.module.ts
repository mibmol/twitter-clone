import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tweet } from './entities/tweet.entity';
import { ApiController } from './api.controller';
import { User } from 'src/auth/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Reply } from './entities/reply.entity';
import { Follows } from './entities/follows.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Tweet,
            Reply,
            User,
            Follows
        ]),
        AuthModule
    ],
    exports: [TypeOrmModule],
    controllers: [ApiController]
})
export class ApiModule {}
