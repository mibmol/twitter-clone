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
import { Repository, Brackets, QueryBuilder, createQueryBuilder } from 'typeorm';
import { Tweet } from './entities/tweet.entity';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TweetCreate } from './entities/tweet.create';
import { AuthenticatedGuard } from 'src/common/guards/authenticated.guard';
import { Follows } from './entities/follows.entity';
import { Favs } from './entities/favs.entity';
import { timer } from 'rxjs';


@Controller('api')
@Injectable()
@UsePipes(ValidationPipe)
export class ApiController {
    MAX_FEED: number = 15

    constructor(
        @InjectRepository(Tweet)
        private readonly tweetRepo: Repository<Tweet>,

        @InjectRepository(User)
        private readonly userRepo: Repository<User>,

        @InjectRepository(Follows)
        private readonly followsRepo: Repository<Follows>,

        @InjectRepository(Favs)
        private readonly favsRepo: Repository<Favs>
    ) { }


    @Get('feed')
    @UseGuards(AuthenticatedGuard)
    async get_feed(@Request() req, @Response() res) {
        var result: any = [];

        const wf = new Brackets(wf => {
            wf.where("follows.user.id = :logged_user_id", { logged_user_id: req.user.id })
            wf.orWhere("tweet.user.id = :logged_user_id", { logged_user_id: req.user.id })
        })

        if (req.query.bottom_tweet_id) {
            console.log(typeof req.query.bottom_tweet_id)
            result = await this.tweetRepo.createQueryBuilder("tweet")
                .leftJoinAndSelect(Follows, "follows", "follows.followed = tweet.user")
                .innerJoinAndSelect("tweet.user", "user")
                .where(wf)
                .andWhere("tweet.id < :btid", { btid: req.query.bottom_tweet_id })
                .orderBy("tweet.timestamp", "DESC")
                .limit(this.MAX_FEED)
                .getMany()

        }
        else {
            result = await this.tweetRepo.createQueryBuilder("tweet")
                .leftJoinAndSelect(Follows, "follows", "follows.followed = tweet.user")
                .innerJoinAndSelect("tweet.user", "user")
                .where(wf)
                .orderBy("tweet.timestamp", "DESC")
                .limit(this.MAX_FEED)
                .getMany()
        }

        return res.send(result);
    }


    @Get('feed/new')
    @UseGuards(AuthenticatedGuard)
    async get_feed_new(@Request() req, @Response() res) {
        var result = []

        result = await this.tweetRepo.createQueryBuilder("tweet")
            .leftJoinAndSelect(Follows, "follows", "follows.followed = tweet.user")
            .where(new Brackets(wf => {
                wf.where("follows.user.id = :logged_user_id", { logged_user_id: req.user.id })
                wf.orWhere("tweet.user.id = :logged_user_id", { logged_user_id: req.user.id })
            }))
            .andWhere("tweet.id > :btid", { btid: req.query.top_tweet_id })
            .innerJoinAndMapOne("tweet.user", User, "user", "user.id = tweet.user.id")
            .orderBy("tweet.timestamp", "DESC")
            .limit(this.MAX_FEED)
            .getMany()



        return res.send(result)
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

        await this.userRepo.update(
            { id: req.user.id }, { tweets_count: () => "\"tweets_count\" + 1" }
        )

        return res.status(201).send(saved);
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

        await this.favsRepo.save({
            user: user,
            tweet: tweet,
            timestamp: new Date().toDateString()
        })

        await this.tweetRepo.update({ id: tweet.id }, {
            favs_count: () => "\"favs_count\" + 1"
        })

        await this.userRepo.update({ id: user.id }, {
            faved_tweets_count: () => "\"faved_tweets_count\" + 1"
        })

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

        await this.favsRepo.delete({
            user: user,
            tweet: tweet
        })

        await this.tweetRepo.update({ id: tweet.id }, {
            favs_count: () => "\"favs_count\" - 1"
        })

        await this.userRepo.update({ id: user.id }, {
            faved_tweets_count: () => "\"faved_tweets_count\" - 1"
        })

        return res.status(201).send();
    }


    @Get("user/check_faved/:tweet_id")
    @UseGuards(AuthenticatedGuard)
    async user_faved(@Request() req, @Response() res, @Param('tweet_id') tweet_id: number) {


        var result = await this.favsRepo.find({
            user: req.user as User,
            tweet: { id: tweet_id } as Tweet
        })
        var data = { faved: result[0] ? true : false }

        return res.send(data)
    }


    @Get('user/:id')
    @UseGuards(AuthenticatedGuard)
    async users(@Request() req, @Response() res, @Param('id') id: number) {
        var user = await this.userRepo.findOne(id);

        return res.send(user);
    }


    @Put('user/:id/follow')
    @UseGuards(AuthenticatedGuard)
    async follow(
        @Request() req,
        @Response() res,
        @Param('id') id: number
    ) {

        var exist: boolean = await this.userRepo.hasId({ id: id } as User);

        if (!exist) {
            return res.status(422).send;
        }
        await this.followsRepo.save({
            user: req.user,
            followed: { id: id },
            date: new Date().toString()
        })

        try {
            await this.userRepo.update({ id: req.user.id }, {
                following_count: () => "\"following_count\" + 1"
            })
            await this.userRepo.update({ id: id }, {
                followers_count: () => "\"followers_count\" + 1"
            })
        } catch (error) {
            console.log(error)
        }



        return res.status(201).send();
    }


    @Get('user/:id/tweets')
    @UseGuards(AuthenticatedGuard)
    async user_tweets(@Request() req, @Response() res, @Param('id') id: number) {
        let tweets = await this.tweetRepo.find({
            where: {
                user: { id: id } as User,
                is_reply: false
            }
        })

        return res.send(tweets)

    }


    @Get('user/:id/tweets_replies')
    @UseGuards(AuthenticatedGuard)
    async user_tweets_replies(@Request() req, @Response() res, @Param('id') id: number) {
        let tweets = await this.tweetRepo.find({
            where: {
                user: { id: id } as User
            }
        })

        return res.send(tweets)

    }


    @Get('user/:id/tweets_faved')
    @UseGuards(AuthenticatedGuard)
    async user_tweets_faved(@Request() req, @Response() res, @Param('id') id: number) {
        let favs: Favs[] = await this.favsRepo.find({
            relations: ["tweet"],
            where: {
                user: { id: id } as User
            }
        })

        let tweets: Tweet[] = favs.map(item => item.tweet)

        return res.send(tweets)

    }


    @Put('user/:id/unfollow')
    async unfollow(@Request() req, @Response() res, @Param('id') id: number) {

        await this.followsRepo.delete(
            {
                user: { id: req.user.id },
                followed: { id: id }
            }
        )
        await this.userRepo.createQueryBuilder("user")
            .update()
            .set({
                following_count: () => "\"following_count\" - 1"
            })
            .where("user.id = :id", { id: req.user.id })
            .execute()
        await this.userRepo.createQueryBuilder("user")
            .update()
            .set({
                followers_count: () => "\"followers_count\" -1"
            })
            .where("user.id = :id", { id: id })

        return res.status(201).send();
    }
}
