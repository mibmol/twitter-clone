import { NestMiddleware } from "@nestjs/common";
import * as csurf from 'csurf'

export class CsurfMiddleware implements NestMiddleware{

    private static options: any
    public static configure(options: any){
        this.options = options
    }

    use(req: any, res: any, next: () => void) {
        csurf(CsurfMiddleware.options)(req, res, next)
    }
    
}