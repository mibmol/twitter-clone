import { IsNumber } from 'class-validator'

export class ReplyCreate{
    @IsNumber()
    id: number
    
    @IsNumber()
    tweet: number
}