import "reflect-metadata"
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


const main = async () => {
    const conn = await createConnection({
        type: 'postgres',
        database: 'lireddit2',
        username: 'postgres',
        password: '1234',
        logging: true,
        synchronize: true,
        port: 5433,
        entities: [Post, User]
    })


    const app = express()
    const RedisStore = connectRedis(session)
    const redis = new Redis()

    app.use(cors({
        origin: "http://localhost:3000",
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
                secure: __prod__ //cookie only works in https
            },
            saveUninitialized: false,
            secret: "hidethisasap",
            resave: false,
        })
    )
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            validate: false,
            resolvers: [HelloResolver, PostResolver, UserResolver]
        }),
        context: (({ req, res }) => ({ req, res, redis })) // a function that returns the object for the context
        // allows tables / classes to be accessed by graphql 
    })

    apolloServer.applyMiddleware({ app, cors: false }) // creates graphql endpoint on express
    app.get("/", (_, res) => {
        res.send("hello")
    })
    const port = 9000
    app.listen(port, () => {
        console.log("Hello there", port)
    })
}

main().catch(err => console.log(err))