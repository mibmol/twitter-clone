import { IsNotEmpty } from "class-validator";

export class UserLogin{
    @IsNotEmpty()
    username: string

    @IsNotEmpty()
    password: string
}