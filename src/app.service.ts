import { Injectable } from '@nestjs/common';
import { ConfigService } from './config/config.service';

@Injectable()
export class AppService {
	//constructor(private config: ConfigService){}

	count: number = -1;
	getCount(): number {
		this.count++;
		return this.count;
	}
}
