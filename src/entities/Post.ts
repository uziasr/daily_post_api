import { ObjectType, Field, Int } from "type-graphql";
import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, Entity, BaseEntity, ManyToOne, OneToMany } from "typeorm";
import { User } from "./User";
import { Updoot } from "./Updoot";

@ObjectType()
@Entity() // tells micro orm that this is a
export class Post extends BaseEntity {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column()
    title!: string;

    @Field()
    @Column()
    text!: string;

    @Field()
    @Column({ type: "int", default: 0 })
    points!: number;

    @Field(()=> Int, {nullable: true})
    voteStatus: number | null

    @Field()
    @Column()
    creatorId: number;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date

    @Field()
    @ManyToOne(() => User, user => user.posts)
    creator: User;

    @OneToMany(()=>Updoot, updoot=>updoot.post)
    updoots: Updoot []
}