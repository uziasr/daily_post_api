import { ObjectType, Field, Int } from "type-graphql";
import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, Entity, BaseEntity } from "typeorm";

@ObjectType()
@Entity() // tells micro orm that this is a
export class Post extends BaseEntity{
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date

    @Field()
    @Column()
    title!: string;

}