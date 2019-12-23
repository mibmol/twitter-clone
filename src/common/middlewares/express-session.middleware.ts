import { NestMiddleware, Injectable, Inject } from "@nestjs/common";
import { Repository } from "typeorm";
import { Session } from "src/auth/entities/session.entity";
import { InjectRepository } from "@nestjs/typeorm";

import * as expressSesion from 'express-session'
import { ConfigService } from "src/config/config.service";
import { TypeormStore } from "connect-typeorm/out";

@Injectable()
export class ExpressSessionMiddleware implements NestMiddleware{

    constructor(
        @InjectRepository(Session)
        private readonly sessionRepo: Repository<Session>,
        private  config: ConfigService
    ){}

    use(req: any, res: any, next: () => void) {
        expressSesion(
            {
                secret: this.config.get('SESSION_SECRET'),
                resave: false,
                saveUninitialized: false,
                store: new TypeormStore({
                    cleanupLimit: 2,
                    limitSubquery: false,
                    ttl: 4*60*60
                }).connect(this.sessionRepo)
            }
        )(req, res, next)
    }
}