import { NestMiddleware, Injectable } from "@nestjs/common";
import {initialize} from 'passport'

@Injectable()
export class PassportInitializeMiddleware implements NestMiddleware{

    use(req: any, res: any, next: () => void) {
        initialize()(req, res, next)
    }
    
}