import { Controller, Injectable, Post, Body, UsePipes, ValidationPipe, UseGuards, Request, Response, UseInterceptors, ClassSerializerInterceptor, Redirect } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { AuthGuard } from "@nestjs/passport";

import { UserCreate } from "./entities/user.create";
import { User } from "./entities/user.entity";

import { AuthService } from "./auth.service";
import { LoginGuard } from "src/common/guards/login.guard";


@Controller('auth')
@Injectable()
export class AuthController{

    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly authService: AuthService
    ){}


    @Post('login')
    @UsePipes(ValidationPipe)
    @UseGuards(LoginGuard)
    login(@Request() req, @Response() res){

        var {password, email, phone_number, ...u} = req.user
        return res.redirect('/')
    }

    
    @Post('register')
    @UsePipes(ValidationPipe)
    async register(@Body() user_input: UserCreate, @Response() res){
        
        var user: User = await this.authService.createUser(user_input)

        if(!user){
            return res.status(409).send({
                "msg": "user already exist"
            })
        }
        var {password, email, ...data} = user
        return res.status(201).send(data)
    }
    
}