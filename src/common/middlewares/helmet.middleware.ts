import { NestMiddleware } from "@nestjs/common";
import * as helmet from 'helmet'

export class HelmetMiddleware implements NestMiddleware{

    private static options: helmet.IHelmetConfiguration


    public static configure(options: helmet.IHelmetConfiguration | void){
        this.options = options
    }

    use(req: any, res: any, next: () => void) {
        helmet(HelmetMiddleware.options)(req, res, next)
    }
    
}