
import { ObjectType, Field, Int } from "type-graphql";
import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, Entity, BaseEntity } from "typeorm";

@ObjectType()
@Entity() // tells micro orm that this is a
export class User extends BaseEntity {
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
    @Column({ unique: true })
    username!: string;

    @Field()
    @Column({unique: true })
    email!: string;

    @Column()
    password!: string

}