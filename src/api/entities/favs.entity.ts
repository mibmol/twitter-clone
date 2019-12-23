import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm";
import { User } from "src/auth/entities/user.entity";
import { Tweet } from "./tweet.entity";

@Entity()
export class Favs{
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User, user => user.faved_tweets)
    user: User

    @ManyToOne(() => Tweet, tweet => tweet.faved_by)
    tweet: Tweet

    @Column({type: "timestamp with time zone"})
    timestamp: string
}