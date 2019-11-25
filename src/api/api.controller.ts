import {
    Controller,
    Injectable,
    Get,
    Request,
    Response,
    UseGuards,
    Post,
    Body,
    UsePipes,
    ValidationPipe,
    Put,
    Param,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Tweet } from './entities/tweet.entity';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TweetCreate } from './entities/tweet.create';
import { AuthenticatedGuard } from 'src/common/guards/authenticated.guard';
import { Follows } from './entities/follows.entity';


@Controller('api')
@Injectable()
@UsePipes(ValidationPipe)
export class ApiController {
    constructor(
        @InjectRepository(Tweet)
        private readonly tweetRepo: Repository<Tweet>,

        @InjectRepository(User)
        private readonly userRepo: Repository<User>,

        @InjectRepository(Follows)
        private readonly followsRepo: Repository<Follows>,
    ) {}


    @Get('feed')
    @UseGuards(AuthenticatedGuard)
    async getAll(@Request() req, @Response() res) {
        var result = await this.tweetRepo.createQueryBuilder("tweet")
            .leftJoinAndSelect(Follows, "follows", "follows.followed = tweet.user")
            .where("follows.user.id = :id", { id: req.user.id })
            .orderBy("tweet.timestamp", "DESC")
            .getMany()

        console.log(this.tweetRepo.createQueryBuilder("tweet")
            .leftJoinAndSelect(Follows, "follows", "follows.followed = tweet.user")
            .where("follows.user.id = :id", { id: req.user.id }).getSql())

        return res.send(result);
    }


    @Post('feed/post')
    @UseGuards(AuthenticatedGuard)
    async post_feed(
        @Body() tweet_input: TweetCreate,
        @Request() req,
        @Response() res,
    ) {

        var saved = await this.tweetRepo.save({
            text: tweet_input.text,
            user: req.user,
            timestamp: new Date().toString()
        });

        if (!saved) {
            return res.status(422).send();
        }

        return res.status(201).send();
    }


    @Get('tweet/:id')
    async getOne(@Request() req, @Response() res, @Param('id') id: number) {
        var tweet = await this.tweetRepo.findOne(id, {
            relations: ['faved_by'],
        });

        if (!tweet) {
            res.status(404).send();
        }

        return res.status(200).send(tweet);
    }


    @Put('tweet/:id/fav')
    @UseGuards(AuthenticatedGuard)
    async tweet_fav(@Request() req, @Response() res, @Param('id') id: number) {

        var user: User = req.user as User;
        var tweet: Tweet = { id: id } as Tweet

        var tweet_exist: boolean = this.tweetRepo.hasId({ id: id } as Tweet)
        if (!tweet_exist) {
            return res.status(422).send();
        }

        await this.tweetRepo.createQueryBuilder()
            .relation("faved_by")
            .of(tweet)
            .add(user)

        await this.tweetRepo.createQueryBuilder()
            .update()
            .set({
                favs_count: () => "'favs_count' + 1"
            })
            .where("tweet.id = :id", { id: tweet.id })
            .execute()

        await this.userRepo.createQueryBuilder()
            .update()
            .set({
                liked_tweets_count: () => "'liked_tweets_count' + 1"
            })
            .where("user.id = :id", { id: user.id })
            .execute()

        return res.status(201).send();
    }


    @Put('tweet/:id/unfav')
    @UseGuards(AuthenticatedGuard)
    async tweet_unfav(@Request() req, @Response() res, @Param('id') id: number) {
        var user: User = req.user as User;
        var tweet: Tweet = { id: id } as Tweet

        var tweet_exist: boolean = this.tweetRepo.hasId({ id: id } as Tweet)
        if (!tweet_exist) {
            return res.status(422).send();
        }

        await this.tweetRepo.createQueryBuilder()
            .relation("faved_by")
            .of(tweet)
            .remove(user)

        await this.tweetRepo.createQueryBuilder()
            .update()
            .set({
                favs_count: () => "'favs_count' - 1"
            })
            .where("tweet.id = :id", { id: tweet.id })
            .execute()

        await this.userRepo.createQueryBuilder()
            .update()
            .set({
                liked_tweets_count: () => "'liked_tweets_count' - 1"
            })
            .where("user.id = :id", { id: user.id })
            .execute()

        return res.status(201).send();
    }


    @Get('user/:id')
    @UseGuards(AuthenticatedGuard)
    async users(@Request() req, @Response() res, @Param('id') id: number) {
        var user = await this.userRepo.findOne(id, {
            relations: ['following', 'following.followed'],
        });

        return res.send(user);
    }


    @Put('user/:id/follow')
    @UseGuards(AuthenticatedGuard)
    async follow(@Request() req, @Response() res, @Param('id') id: number) {

        var exist: boolean = await this.userRepo.hasId({ id: id } as User);

        if (!exist) {
            return res.status(422).send;
        }

        await this.followsRepo.save({
            user: req.user,
            followed: { id: id },
            date: new Date().toString()
        })

        await this.userRepo.createQueryBuilder()
            .update()
            .set({
                following_count: () => "'following_count' + 1"
            })
            .where("user.id = :id", { id: req.user.id })
            .execute()
        await this.userRepo.createQueryBuilder()
            .update()
            .set({
                followers_count: () => "'followers_count' + 1"
            })
            .where("user.id = :id", { id: id })

        return res.status(201).send();
    }


    @Put('user/:id/unfollow')
    async unfollow(@Request() req, @Response() res, @Param('id') id: number) {

        await this.followsRepo.delete(
            {
                user: { id: req.user.id },
                followed: { id: id }
            }
        )
        await this.userRepo.createQueryBuilder()
            .update()
            .set({
                following_count: () => "'following_count' - 1"
            })
            .where("user.id = :id", { id: req.user.id })
            .execute()
        await this.userRepo.createQueryBuilder()
            .update()
            .set({
                followers_count: () => "'followers_count' -1"
            })
            .where("user.id = :id", { id: id })

        return res.status(201).send();
    }
}
