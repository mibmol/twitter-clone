import { Controller, Injectable, Post, Body, UsePipes, ValidationPipe, UseGuards, Request, Response, UseInterceptors, ClassSerializerInterceptor, Redirect, Res } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

import { UserCreate } from "./entities/user.create";
import { User } from "./entities/user.entity";

import { AuthService } from "./auth.service";
import { LoginGuard } from "src/common/guards/login.guard";
import { Observable, of } from "rxjs";


@Controller('auth')
@Injectable()
export class AuthController {

    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly authService: AuthService
    ) {}


    @Post('login')
    @UsePipes(ValidationPipe)
    @UseGuards(LoginGuard)
    async login(@Request() req, @Response() res){
        var { password, email, phone_number, ...u } = req.user
        return res.send(u)
    }



    @Post('register')
    @UsePipes(ValidationPipe)
    async register(@Body() user_input: UserCreate, @Response() res) {

        var user: User = await this.authService.createUser(user_input)

        if (!user) {
            return res.status(409).send({
                "msg": "user already exist"
            })
        }

        var { password, email, phone_number, ...data } = user
        return res.status(201).send(data)
    }

    
    @Post('mvc/login')
    @UsePipes(ValidationPipe)
    @UseGuards(LoginGuard)
    async mvc_login(@Request() req, @Response() res){
        if(req.user){
            return res.send().redirect('/')
        }
        else{
            return res.render('login', {
                msg: "Wrong data"
            })
        }
    }

    
    @Post('mvc/register')
    @UsePipes(ValidationPipe)
    async mvc_register(@Body() user_input: UserCreate, @Response() res) {

        var user: User = await this.authService.createUser(user_input)

        if (!user) {
            return res.status(409).render('signup', {
                msg: "user already exist"
            })
        }

        return res.redirect('/')
    }
}