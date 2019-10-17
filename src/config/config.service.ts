import { Injectable } from '@nestjs/common';

import * as dotenv from 'dotenv'
import * as fs from 'fs'

@Injectable()
export class ConfigService {
    private readonly envConfig: { [key: string]: string };

    constructor() {

      var NODE_ENV = process.env.NODE_ENV

      NODE_ENV = NODE_ENV ? (NODE_ENV == 'none' ? 'development' : NODE_ENV) : 'development'

      this.envConfig = dotenv.parse(fs.readFileSync( `${NODE_ENV}.env`))
      this.envConfig.NODE_ENV = NODE_ENV
    }
  
    get(key: string): string {
      return this.envConfig[key];
    }
}
