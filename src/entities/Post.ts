import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity() // tells micro orm that this is a
export class Post {

    @PrimaryKey()
    id!: number;

    @Property({ type: "date" })
    createdAt = new Date();

    @Property({ onUpdate: () => new Date() })
    updatedAt = new Date();

    @Property({ type: "text" })
    title!: string;

}