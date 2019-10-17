export class UserDTO{
    readonly id: number

    readonly first_name: string

    readonly last_name: string

    readonly username: string

    readonly email: string

    readonly is_active: boolean

    readonly last_login: string

    readonly date_joined: string

    readonly following_count: number

    readonly followers_count: number

    readonly liked_tweets_count: number

    readonly verified: boolean
}