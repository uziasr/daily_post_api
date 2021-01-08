import { Resolver, Arg, Field, Mutation, Ctx, ObjectType, Query } from "type-graphql"
import { MyContext } from "../types"
import { User } from "../entities/User"
import argon2 from "argon2"
import { EntityManager } from "@mikro-orm/postgresql"
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants"
import { UsernamePasswordInput } from "./UsernamePasswordInput"
import { validateRegister } from "../utils/validateRegister"
import { sendEmail } from "../utils/sendEmail"
import { v4 } from "uuid"

@ObjectType()
class FieldError {
    @Field()
    field: string
    @Field()
    message: string
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]

    @Field(() => User, { nullable: true })
    user?: User
}

@Resolver()
export class UserResolver {
    // functions can be either be mutations or queries 
    @Mutation(() => UserResponse)
    async changePassword(
        @Arg('token') token: string,
        @Arg("newPassword") newPassword: string,
        @Ctx() { em, redis, req }: MyContext
    ): Promise<UserResponse> {
        if (newPassword.length <= 2) {
            return {
                errors: [{
                    field: "newPassword",
                    message: "length must be greater than 2"
                }]

            }
        }
        const userID = await redis.get(FORGET_PASSWORD_PREFIX + token)
        if (!userID) {
            return {
                errors: [{
                    field: "token",
                    message: "token expired"
                }]
            }
        }
        const user = await em.findOne(User, { id: parseInt(userID) })
        if (!user) {
            return {
                errors: [{
                    field: "token",
                    message: "user no longer exists"
                }]
            }
        }
        user.password = await argon2.hash(newPassword)
        em.persistAndFlush(user)
        req.session.userId = user.id
        await redis.del(FORGET_PASSWORD_PREFIX + token)
        return { user }
    }

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg("email") email: string,
        @Ctx() { em, redis }: MyContext
    ) {
        const user = await em.findOne(User, { email })
        if (!user) {
            return true
        }
        const token = v4();
        redis.set(FORGET_PASSWORD_PREFIX + token, user.id, 'ex', 1000 * 60 * 60 * 24 * 3)
        await sendEmail(email, `<a href="http://localhost:3000/change-password/${token}">reset password</a>`)
        return true
    }


    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const errors = validateRegister(options)
        if (errors) {
            return { errors }
        }
        const hashPassword = await argon2.hash(options.password)
        let user;
        try {
            const result = await (em as EntityManager).createQueryBuilder(User).getKnexQuery().insert({
                username: options.username,
                password: hashPassword,
                email: options.email,
                created_at: new Date(),
                updated_at: new Date()
            }).returning("*")
            user = result[0]
        }
        catch (e) {
            if (e.code === "2305" || e.detail.includes("already exists")) {
                return {
                    errors: [{
                        field: "username",
                        message: "username has already been taken"
                    }]
                }
            }
        }
        req.session.userId = user.id
        return {
            user,
        }
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg('password') password: string,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {

        const user = await em.findOne(User, usernameOrEmail.includes('@') ? { email: usernameOrEmail } : { username: usernameOrEmail })
        if (!user) {
            return {
                errors: [{
                    field: "usernameOrEmail",
                    message: "that username or email does not exist"
                }]
            }
        }
        const isValid = await argon2.verify(user.password, password)
        if (!isValid) {
            return {
                errors: [{
                    field: "password",
                    message: "incorrect password"
                }]
            }
        }
        req.session.userId = user.id
        return {
            user,
        }
    }

    @Query(() => User, { nullable: true })
    async me(
        @Ctx() { em, req }: MyContext
    ) {
        if (!req.session.userId) {
            return null
        }
        let myself = await em.findOne(User, { id: req.session.userId })
        return myself
    }

    @Mutation(() => Boolean)
    logout(@Ctx() { req, res }: MyContext) {
        return new Promise((resolve) =>
            req.session.destroy((err) => {
                res.clearCookie(COOKIE_NAME);
                if (err) {
                    console.log(err);
                    resolve(false);
                    return;
                }

                resolve(true);
            })
        );
    }

}
