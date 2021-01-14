
import { ObjectType, Field, Int } from "type-graphql";
import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, Entity, BaseEntity, OneToMany } from "typeorm";
import { Post } from "./Post";
import { Updoot } from "./Updoot";

@ObjectType()
@Entity() // tells micro orm that this is a
export class User extends BaseEntity {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column({ unique: true })
    username!: string;

    @Field()
    @Column({unique: true })
    email!: string;

    @Column()
    password!: string

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date

    @OneToMany(()=>Post, post=>post.creator)
    posts: Post[]

    @OneToMany(()=>Updoot, updoot=>updoot.user)
    updoots: Updoot []

}