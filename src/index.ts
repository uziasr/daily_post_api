import "reflect-metadata"
import { MikroORM } from "@mikro-orm/core"
import { __prod__ } from "./constants"
import microConfig from "./mikro-orm.config"
import express from "express"
import { ApolloServer } from "apollo-server-express"
import { buildSchema } from "type-graphql"
import { HelloResolver } from "./resolvers/hello"
import { PostResolver } from "./resolvers/post"
import { UserResolver } from "./resolvers/user"


const main = async () => {
    const  orm = await MikroORM.init(microConfig)
    // await orm.getMigrator().up()
    // const post = orm.em.create(Post, { title: "my first post" })
    // await orm.em.persistAndFlush(post)

    // const posts = await orm.em.find(Post, {})
    // console.log(posts)

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            validate: false,
            resolvers: [HelloResolver, PostResolver, UserResolver]
        }),
        context: (() => ({ em: orm.em })) // a function that returns the object for the context
        // allows tables / classes to be accessed by graphql 
    })

    const app = express()
    apolloServer.applyMiddleware({ app }) // creates graphql endpoint on express

    app.get("/", (_, res) => {
        res.send("hello")
    })
    app.listen("8000", () => {
        console.log("Hello there")
    })
}

main().catch(err => console.log(err))