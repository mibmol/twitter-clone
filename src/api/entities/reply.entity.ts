import { ManyToOne, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Tweet } from "./tweet.entity";

@Entity()
export class Reply{
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => Tweet, tweet => tweet.replies)
    tweet: Tweet
}