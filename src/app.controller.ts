import { Controller, Get, Response, Request } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) { }

    @Get()
    index(@Request() req, @Response() res) {
        return res.render('index')
    }
}
