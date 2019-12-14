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
import { Repository, Brackets } from 'typeorm';
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
    MAX_FEED: number = 40

    constructor(
        @InjectRepository(Tweet)
        private readonly tweetRepo: Repository<Tweet>,

        @InjectRepository(User)
        private readonly userRepo: Repository<User>,

        @InjectRepository(Follows)
        private readonly followsRepo: Repository<Follows>,
    ) { }


    @Get('feed')
    @UseGuards(AuthenticatedGuard)
    async get_feed(@Request() req, @Response() res) {
        var result = [];

        const wf = new Brackets(wf => {
            wf.where("follows.user.id = :logged_user_id", { logged_user_id: req.user.id })
            wf.orWhere("tweet.user.id = :logged_user_id", { logged_user_id: req.user.id })
        })

        if (req.query.bottom_tweet_id) {
            result = await this.tweetRepo.createQueryBuilder("tweet")
                .leftJoinAndSelect(Follows, "follows", "follows.followed = tweet.user")
                .where(wf)
                .andWhere("tweet.id < :btid", { btid: req.query.bottom_tweet_id })
                .innerJoinAndMapOne("tweet.user", User, "user", "user.id = tweet.user.id")
                .orderBy("tweet.timestamp", "DESC")
                .limit(this.MAX_FEED)
                .getMany()
        }
        else {
            result = await this.tweetRepo.createQueryBuilder("tweet")
                .leftJoinAndSelect(Follows, "follows", "follows.followed = tweet.user")
                .where(wf)
                .innerJoinAndMapOne("tweet.user", User, "user", "user.id = tweet.user.id")
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


    @Put('user/:id_tofollow/follow')
    @UseGuards(AuthenticatedGuard)
    async follow(
        @Request() req,
        @Response() res,
        @Param('id_tofollow') id_tofollow: number
    ) {

        var exist: boolean = await this.userRepo.hasId({ id: id_tofollow } as User);

        if (!exist) {
            return res.status(422).send;
        }
        await this.followsRepo.save({
            user: req.user,
            followed: { id: id_tofollow },
            date: new Date().toString()
        })

        try {
            await this.userRepo.update({ id: req.user.id }, {
                following_count: () => "\"following_count\" + 1"
            })
            await this.userRepo.update({ id: id_tofollow }, {
                followers_count: () => "\"followers_count\" + 1"
            })
        } catch (error) {
            console.log(error)
        }



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
