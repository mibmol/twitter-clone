import { NestMiddleware, Injectable } from "@nestjs/common";
import {session} from 'passport'

@Injectable()
export class PassportSessionMiddleware implements NestMiddleware{

    use(req: any, res: any, next: () => void) {
        session()(req, res, next)
    }
    
}