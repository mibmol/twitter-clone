import { Controller, Get, Response, Request } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
   constructor(private readonly appService: AppService) {}

   @Get()
   home(@Request() req, @Response() res) {
      if (!req.user) {
         return res.redirect('login');
      } else {
         return res.render('home');
      }
   }

   @Get('login')
   login(@Request() req, @Response() res) {
      return res.render('login');
   }

   @Get('signup')
   signup(@Request() req, @Response() res) {
      return res.render('signup');
   }
}
