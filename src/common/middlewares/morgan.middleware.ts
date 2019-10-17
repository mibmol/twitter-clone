import { Injectable, NestMiddleware } from '@nestjs/common';
import * as morgan from 'morgan'


@Injectable()
export class MorganMiddleware implements NestMiddleware {

  private static options: morgan.Options;
  private static format: string | morgan.FormatFn;


  public static configure(format: string | morgan.FormatFn, opts?: morgan.Options) {
    this.format = format;
    this.options = opts;
}

  use(req: any, res: any, next: () => void) {
    if (MorganMiddleware.format) {
      morgan(MorganMiddleware.format as any, MorganMiddleware.options)(req, res, next);
    } else {
      throw new Error('MorganMiddleware must be configured with a logger format.');
    }
    //next();
  }
}
