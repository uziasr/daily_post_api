import "reflect-metadata"
import "dotenv-safe/config"
import { __prod__, COOKIE_NAME } from "./constants"
import express from "express"
import { ApolloServer } from "apollo-server-express"
import { buildSchema } from "type-graphql"
import { HelloResolver } from "./resolvers/hello"
import { PostResolver } from "./resolvers/post"
import { UserResolver } from "./resolvers/user"
import Redis from "ioredis"
import session from "express-session"
import connectRedis from "connect-redis"
import cors from "cors"
import { createConnection } from "typeorm"
import { Post } from "./entities/Post"
import { User } from "./entities/User"
import path from "path"
import { Updoot } from "./entities/Updoot"
import { createUserLoader } from "./utils/createUserLoader"
import { createUpdootLoader } from "./utils/createUpdootLoader"

// 
const main = async () => {
    const conn = await createConnection({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        logging: true,
        // synchronize: true,
        port: 5433,
        migrations:[path.join(__dirname, "./migrations/*")],
        entities: [Post, User, Updoot],
    })

    await conn.runMigrations()   
    // await Post.delete({})

    const app = express()
    const RedisStore = connectRedis(session)
    const redis = new Redis(process.env.REDIS_URL)
    app.set("trust proxy", 1)
    app.use(cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }))
    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({
                client: redis,
                disableTouch: true
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
                httpOnly: true,
                sameSite: "lax",
                secure: __prod__, //cookie only works in https
                // domain: __prod__ ? ".codeponder.com" : undefined,
            },
            saveUninitialized: false,
            secret: process.env.SESSION_SECRET,
            resave: false,
        })
    )
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            validate: false,
            resolvers: [HelloResolver, PostResolver, UserResolver]
        }),
        context: (({ req, res }) => ({ req, res, redis, userLoader:createUserLoader(), updootLoader: createUpdootLoader() })) // a function that returns the object for the context
        // allows tables / classes to be accessed by graphql 
    })

    apolloServer.applyMiddleware({ app, cors: false }) // creates graphql endpoint on express
    app.get("/", (_, res) => {
        res.send("hello")
    })
    const port = process.env.PORT
    app.listen(port.toString(), () => {
        console.log("Hello there", port)
    })
}

main().catch(err => console.log(err))