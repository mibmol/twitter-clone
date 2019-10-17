import { NestMiddleware } from "@nestjs/common";
import * as cors from 'cors'


export class CORSMiddleware implements NestMiddleware{

    private static options: cors.CorsOptions

    public static configure(options: cors.CorsOptions){
        this.options = options
    }

    use(req: any, res: any, next: () => void) {
        cors(CORSMiddleware.options)(req, res, next)
    }
    
}