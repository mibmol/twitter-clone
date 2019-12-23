import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany
} from 'typeorm';
import { Tweet } from '../../api/entities/tweet.entity';
import { Follows } from 'src/api/entities/follows.entity';
import { Favs } from 'src/api/entities/favs.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    first_name: string;

    @Column({ length: 100 })
    last_name: string;

    @Column({ length: 100 })
    username: string;

    @Column({ length: 300, select: false })
    password: string;

    @Column({ length: 100, select: false, unique: true })
    email: string;

    @Column({ type: 'int', select: false, nullable: true })
    phone_number: number;

    @Column({ default: false })
    is_staff: boolean;

    @Column({ default: true })
    is_active: boolean;

    @Column({ type: "timestamp with time zone" })
    last_login: string;

    @Column({ type: "timestamp with time zone" })
    date_joined: string;

    @OneToMany(() => Tweet, tweet => tweet.user)
    tweets: Tweet[];

    @Column({ type: 'int', default: 0 })
    tweets_count: number;

    @OneToMany(() => Follows, following => following.user)
    following: Follows[];

    @Column({ type: 'int', default: 0 })
    following_count: number;

    @OneToMany(() => Follows, followers => followers.followed)
    followers: Follows[];

    @Column({ type: 'int', default: 0 })
    followers_count: number;

    @OneToMany(() => Favs, fav => fav.tweet)
    faved_tweets: Favs[]

    @Column({ type: 'int', default: 0 })
    faved_tweets_count: number;

    @Column({ type: 'boolean', default: false })
    verified: boolean;

    constructor(partial: Partial<User>) {
        Object.assign(this, partial);
    }
}
