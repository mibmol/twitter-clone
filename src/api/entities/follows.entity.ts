import { Entity, PrimaryGeneratedColumn, OneToOne, Column, JoinColumn, ManyToMany, ManyToOne } from "typeorm";
import { User } from "src/auth/entities/user.entity";

@Entity()
export class Follows{
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User, user => user.following)
    user: User

    @ManyToOne(() => User, user => user.followers)
    followed: User

    @Column({type: "datetime"})
    date: string

    constructor(partial: Partial<User>) {
		Object.assign(this, partial);
	}
}