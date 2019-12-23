import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToMany, JoinTable, ManyToOne, OneToMany } from 'typeorm'
import { User } from '../../auth/entities/user.entity'
import { Reply } from './reply.entity'
import { Favs } from './favs.entity'

@Entity()
export class Tweet {

    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User, user => user.tweets, { eager: true })
    user: User

    @Column({ length: 240 })
    text: string

    @Column({ type: "timestamp with time zone" })
    timestamp: string

    @OneToMany(() => Favs, fav => fav.tweet)
    faved_by: Favs[]

    @Column({ type: "int", default: 0 })
    favs_count: number

    @Column({ default: false })
    is_reply: boolean

    @OneToMany(() => Reply, reply => reply.tweet)
    replies: Reply[]

    @Column({ type: 'int', default: 0 })
    replies_count: number

}