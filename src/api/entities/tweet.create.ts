import { IsNotEmpty } from "class-validator";

export class TweetCreate{
    @IsNotEmpty()
    text: string
}