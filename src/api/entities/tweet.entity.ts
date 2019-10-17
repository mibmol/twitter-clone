import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToMany, JoinTable, ManyToOne, OneToMany} from 'typeorm'
import { User } from '../../auth/entities/user.entity'
import { Reply } from './reply.entity'

@Entity()
export class Tweet{

    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User, user => user.tweets)
    user: User

    @Column({length: 240})
    text: string

    @Column({type: "datetime"})
    timestamp: string

    @ManyToMany(() => User)
    @JoinTable()
    liked_by: User[]  

    @Column({type: "int", default:0})
    likes_count: number

    @ManyToMany(() => User)
    @JoinTable()
    faved_by: User[]

    @Column({type: "int", default: 0})
    favs_count: number

    @Column({type: 'int', default: 0})
    replies_count: number

    @Column({default: false})
    is_reply: boolean
    
    @OneToMany(() => Reply, reply => reply.tweet)
    replies: Reply[]
    
}