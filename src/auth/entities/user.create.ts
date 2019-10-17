import {IsNotEmpty, IsEmail} from 'class-validator'

export class UserCreate{

    @IsNotEmpty()
    first_name: string

    @IsNotEmpty()
    last_name: string

    @IsNotEmpty()
    username: string

    @IsNotEmpty()
    password: string

    @IsEmail()
    email: string

}