import { ObjectType, Field, Int } from "type-graphql";
import { Column, Entity, BaseEntity, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./User";
import { Post } from "./Post";

@ObjectType()
@Entity() // tells micro orm that this is a
export class Updoot extends BaseEntity {
    @Field()
    @Column({ type: "int" })
    value: number

    @Field(() => Int)
    @PrimaryColumn()
    userId!: number;

    @Field()
    @PrimaryColumn()
    postId: number;

    @Field(()=> Post)
    @ManyToOne(() => Post, post => post.updoots)
    post: Post

    @Field(()=> User)
    @ManyToOne(() => User, user => user.updoots)
    user: User;
}