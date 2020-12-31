import { Resolver, Query } from "type-graphql"

@Resolver()
export class HelloResolver {
    // functions can be either be mutations or queries
    @Query(() => String)
    hello(){
        return "hello world"
    }
}